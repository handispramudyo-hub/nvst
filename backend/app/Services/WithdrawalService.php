<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\User;
use App\Models\Withdrawal;
use App\Models\WithdrawalAccount;
use App\Models\WalletTransaction;
use App\Notifications\WithdrawalRejectedNotification;
use App\Notifications\WithdrawalStatusNotification;
use App\Notifications\WithdrawalSubmittedNotification;
use App\Support\ReferenceNumber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class WithdrawalService
{
    public function __construct(
        private readonly WalletService $wallet,
        private readonly AuditService $audit,
    ) {}

    public function getRules(): array
    {
        return [
            'fee_flat' => (float) Setting::get('withdrawal', 'fee_flat', 0),
            'fee_percent' => (float) Setting::get('withdrawal', 'fee_percent', 0),
            'min_amount' => (float) Setting::get('withdrawal', 'min_amount', 50000),
            'max_amount' => (float) Setting::get('withdrawal', 'max_amount', 100000000),
        ];
    }

    public function calculateFee(float $amount): float
    {
        $rules = $this->getRules();

        return round($rules['fee_flat'] + ($amount * $rules['fee_percent'] / 100), 2);
    }

    public function create(
        User $user,
        float $amount,
        int $accountId,
        ?string $pin = null,
        ?string $idempotencyKey = null,
    ): Withdrawal {
        $rules = $this->getRules();

        if ($amount < $rules['min_amount']) {
            throw new RuntimeException('Jumlah penarikan tidak boleh kurang dari minimum.');
        }

        if ($amount > $rules['max_amount']) {
            throw new RuntimeException('Jumlah penarikan tidak boleh lebih dari maksimum.');
        }

        if ($pin !== null && (!Hash::check($pin, (string) $user->pin))) {
            throw new RuntimeException('PIN yang anda masukkan salah.');
        }

        $account = WithdrawalAccount::where('id', $accountId)->where('user_id', $user->id)->first();
        if (!$account) {
            throw new RuntimeException('Akun penarikan tidak ditemukan.');
        }

        if ($idempotencyKey) {
            $existing = Withdrawal::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $existing;
            }
        }

        $fee = $this->calculateFee($amount);
        $finalAmount = round($amount - $fee, 2);

        if ($finalAmount <= 0) {
            throw new RuntimeException('Jumlah penarikan terlalu kecil setelah dipotong biaya.');
        }

        return DB::transaction(function () use ($user, $amount, $account, $fee, $finalAmount, $pin, $idempotencyKey) {
            $wallet = $user->wallet()->lockForUpdate()->first();

            if ((float) $wallet->balance < $amount) {
                throw new RuntimeException('Saldo tidak mencukupi untuk penarikan.');
            }

            $withdrawal = Withdrawal::create([
                'withdrawal_no' => ReferenceNumber::generate('WD'),
                'user_id' => $user->id,
                'amount' => $amount,
                'fee' => $fee,
                'final_amount' => $finalAmount,
                'account_type' => $account->account_type,
                'provider' => $account->provider,
                'account_name' => $account->account_name,
                'account_number' => $account->account_number,
                'status' => Withdrawal::STATUS_PENDING,
                'idempotency_key' => $idempotencyKey,
                'submitted_at' => now(),
            ]);

            $this->wallet->debit(
                $user,
                $amount,
                WalletTransaction::TYPE_WITHDRAWAL,
                "Penarikan dana ke {$account->provider}",
                'Withdrawal',
                $withdrawal->id,
                ['fee' => $fee, 'final_amount' => $finalAmount],
                $wallet,
            );

            $this->audit->log('withdrawal.created', 'Withdrawal', $withdrawal->id, null, [
                'amount' => $amount,
                'fee' => $fee,
            ], $user);

            $user->notify(new WithdrawalSubmittedNotification($withdrawal));

            return $withdrawal;
        });
    }

    public function process(Withdrawal $withdrawal, User $admin): Withdrawal
    {
        return $this->transition($withdrawal, $admin, Withdrawal::STATUS_PROCESSING, 'withdrawal.processed', 'Penarikan sedang diproses oleh admin.');
    }

    public function approve(Withdrawal $withdrawal, User $admin): Withdrawal
    {
        return $this->transition($withdrawal, $admin, Withdrawal::STATUS_APPROVED, 'withdrawal.approved', 'Penarikan telah disetujui.');
    }

    public function complete(Withdrawal $withdrawal, User $admin): Withdrawal
    {
        return $this->transition($withdrawal, $admin, Withdrawal::STATUS_COMPLETED, 'withdrawal.completed', 'Penarikan telah selesai dan dikirim ke tujuan.');
    }

    protected function transition(Withdrawal $withdrawal, User $admin, string $status, string $auditAction, string $notificationMessage): Withdrawal
    {
        $allowed = [
            Withdrawal::STATUS_PENDING => [Withdrawal::STATUS_PROCESSING, Withdrawal::STATUS_APPROVED, Withdrawal::STATUS_REJECTED, Withdrawal::STATUS_CANCELLED],
            Withdrawal::STATUS_PROCESSING => [Withdrawal::STATUS_APPROVED, Withdrawal::STATUS_REJECTED, Withdrawal::STATUS_CANCELLED],
            Withdrawal::STATUS_APPROVED => [Withdrawal::STATUS_COMPLETED, Withdrawal::STATUS_CANCELLED],
        ];

        if (!in_array($status, $allowed[$withdrawal->status] ?? [])) {
            throw new RuntimeException('Status penarikan tidak valid untuk transisi ini.');
        }

        $timestampField = match ($status) {
            Withdrawal::STATUS_PROCESSING => 'processed_at',
            Withdrawal::STATUS_APPROVED => 'approved_at',
            Withdrawal::STATUS_COMPLETED => 'completed_at',
            default => null,
        };

        return DB::transaction(function () use ($withdrawal, $admin, $status, $auditAction, $notificationMessage, $timestampField) {
            $locked = Withdrawal::where('id', $withdrawal->id)->lockForUpdate()->first();

            $locked->status = $status;
            $locked->admin_id = $admin->id;
            if ($timestampField) {
                $locked->{$timestampField} = now();
            }
            $locked->save();

            $this->audit->log($auditAction, 'Withdrawal', $locked->id, null, ['status' => $status], $admin);

            $locked->user->notify(new WithdrawalStatusNotification($locked, $notificationMessage));

            return $locked;
        });
    }

    public function reject(Withdrawal $withdrawal, User $admin, ?string $note = null): Withdrawal
    {
        $allowed = [Withdrawal::STATUS_PENDING, Withdrawal::STATUS_PROCESSING];

        if (!in_array($withdrawal->status, $allowed)) {
            throw new RuntimeException('Penarikan ini tidak dapat ditolak.');
        }

        return DB::transaction(function () use ($withdrawal, $admin, $note) {
            $locked = Withdrawal::where('id', $withdrawal->id)->lockForUpdate()->first();

            $locked->status = Withdrawal::STATUS_REJECTED;
            $locked->admin_id = $admin->id;
            $locked->admin_note = $note;
            $locked->rejected_at = now();
            $locked->save();

            $this->wallet->credit(
                $locked->user,
                $locked->amount,
                WalletTransaction::TYPE_ADJUSTMENT,
                "Pengembalian dana penarikan ditolak ({$locked->withdrawal_no})",
                'Withdrawal',
                $locked->id,
                ['refund' => true],
            );

            $this->audit->log('withdrawal.rejected', 'Withdrawal', $locked->id, null, ['note' => $note], $admin);

            $locked->user->notify(new WithdrawalRejectedNotification($locked, $note));

            return $locked;
        });
    }
}
