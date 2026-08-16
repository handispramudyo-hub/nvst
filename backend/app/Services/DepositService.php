<?php

namespace App\Services;

use App\Models\Deposit;
use App\Models\Setting;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Notifications\DepositApprovedNotification;
use App\Notifications\DepositRejectedNotification;
use App\Notifications\DepositSubmittedNotification;
use App\Support\ReferenceNumber;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class DepositService
{
    public function __construct(
        private readonly WalletService $wallet,
        private readonly AuditService $audit,
    ) {}

    public function getPaymentInstructions(): array
    {
        $qrisImage = Setting::get('payment', 'qris_image');

        return [
            'payment_method' => 'qris',
            'merchant_name' => Setting::get('payment', 'merchant_name', 'NiVEST'),
            'qris_payload' => Setting::get('payment', 'qris_payload'),
            'qris_image' => $qrisImage ? url('storage/'.$qrisImage) : null,
            'min_deposit' => (float) Setting::get('payment', 'min_deposit', 10000),
            'max_deposit' => (float) Setting::get('payment', 'max_deposit', 1000000000),
        ];
    }

    public function create(User $user, float $amount, ?string $idempotencyKey = null): Deposit
    {
        if ($idempotencyKey) {
            $existing = Deposit::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $existing;
            }
        }

        return DB::transaction(function () use ($user, $amount, $idempotencyKey) {
            $deposit = Deposit::create([
                'deposit_no' => ReferenceNumber::generate('DEP'),
                'user_id' => $user->id,
                'amount' => $amount,
                'payment_method' => 'qris',
                'status' => Deposit::STATUS_PENDING,
                'idempotency_key' => $idempotencyKey,
            ]);

            $this->audit->log('deposit.created', 'Deposit', $deposit->id, null, [
                'amount' => $amount,
                'status' => Deposit::STATUS_PENDING,
            ], $user);

            $user->notify(new DepositSubmittedNotification($deposit));

            return $deposit;
        });
    }

    public function uploadProof(Deposit $deposit, UploadedFile $proof, User $user): Deposit
    {
        if ($deposit->user_id !== $user->id) {
            throw new RuntimeException('Anda tidak memiliki akses ke deposit ini.');
        }

        if (!in_array($deposit->status, [Deposit::STATUS_PENDING])) {
            throw new RuntimeException('Deposit tidak dapat diubah lagi.');
        }

        $path = $proof->store('deposits/'.$user->id, 'public');

        $deposit->update(['proof_path' => $path]);

        $this->audit->log('deposit.proof_uploaded', 'Deposit', $deposit->id, null, ['proof_path' => $path], $user);

        return $deposit;
    }

    public function approve(Deposit $deposit, User $admin): Deposit
    {
        if ($deposit->status !== Deposit::STATUS_PENDING) {
            throw new RuntimeException('Hanya deposit dengan status pending yang dapat di-approve.');
        }

        return DB::transaction(function () use ($deposit, $admin) {
            $locked = Deposit::where('id', $deposit->id)
                ->where('status', Deposit::STATUS_PENDING)
                ->lockForUpdate()
                ->first();

            if (!$locked) {
                throw new RuntimeException('Deposit sudah diproses oleh admin lain.');
            }

            $locked->update([
                'status' => Deposit::STATUS_APPROVED,
                'admin_id' => $admin->id,
                'approved_at' => now(),
            ]);

            $this->wallet->credit(
                $locked->user,
                $locked->amount,
                WalletTransaction::TYPE_DEPOSIT,
                'Deposit via QRIS',
                'Deposit',
                $locked->id,
            );

            $this->audit->log('deposit.approved', 'Deposit', $locked->id, null, [
                'amount' => $locked->amount,
                'balance_after' => $locked->user->wallet->balance,
            ], $admin);

            $locked->user->notify(new DepositApprovedNotification($locked));

            return $locked;
        });
    }

    public function reject(Deposit $deposit, User $admin, ?string $note = null): Deposit
    {
        if ($deposit->status !== Deposit::STATUS_PENDING) {
            throw new RuntimeException('Hanya deposit dengan status pending yang dapat ditolak.');
        }

        return DB::transaction(function () use ($deposit, $admin, $note) {
            $locked = Deposit::where('id', $deposit->id)
                ->where('status', Deposit::STATUS_PENDING)
                ->lockForUpdate()
                ->first();

            if (!$locked) {
                throw new RuntimeException('Deposit sudah diproses oleh admin lain.');
            }

            $locked->update([
                'status' => Deposit::STATUS_REJECTED,
                'admin_id' => $admin->id,
                'admin_note' => $note,
                'rejected_at' => now(),
            ]);

            $this->audit->log('deposit.rejected', 'Deposit', $locked->id, null, ['note' => $note], $admin);

            $locked->user->notify(new DepositRejectedNotification($locked, $note));

            return $locked;
        });
    }
}
