<?php

namespace App\Services;

use App\Models\Investment;
use App\Models\Project;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Notifications\InvestmentCreatedNotification;
use App\Support\ReferenceNumber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class InvestmentService
{
    public function __construct(
        private readonly WalletService $wallet,
        private readonly ReferralService $referral,
        private readonly AuditService $audit,
    ) {}

    public function calculateExpectedReturn(float $amount, Project $project): float
    {
        return round($amount * ((float) $project->estimated_return / 100), 2);
    }

    public function calculateDailyReturn(float $amount, Project $project): float
    {
        $returnAmount = $this->calculateExpectedReturn($amount, $project);

        return round($returnAmount / max(1, $project->duration_days), 6);
    }

    public function create(User $user, Project $project, float $amount, ?string $pin = null, ?string $idempotencyKey = null): Investment
    {
        if (!$project->is_investable) {
            throw new RuntimeException('Proyek ini tidak menerima investasi baru.');
        }

        if ($amount < (float) $project->min_investment) {
            throw new RuntimeException('Jumlah investasi tidak boleh kurang dari minimum.');
        }

        if ($amount > (float) $project->max_investment) {
            throw new RuntimeException('Jumlah investasi tidak boleh lebih dari maksimum.');
        }

        if ($pin !== null && (!Hash::check($pin, (string) $user->pin))) {
            throw new RuntimeException('PIN yang anda masukkan salah.');
        }

        if ($idempotencyKey) {
            $existing = Investment::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $existing;
            }
        }

        return DB::transaction(function () use ($user, $project, $amount, $pin, $idempotencyKey) {
            $wallet = $user->wallet()->lockForUpdate()->first();

            if ((float) $wallet->balance < $amount) {
                throw new RuntimeException('Saldo tidak mencukupi untuk investasi ini.');
            }

            $startDate = now();
            $maturityDate = $startDate->copy()->addDays($project->duration_days);
            $expectedReturn = $this->calculateExpectedReturn($amount, $project);
            $dailyReturn = $this->calculateDailyReturn($amount, $project);

            $investment = Investment::create([
                'investment_no' => ReferenceNumber::generate('INV'),
                'user_id' => $user->id,
                'project_id' => $project->id,
                'amount' => $amount,
                'expected_return' => $project->estimated_return,
                'expected_return_amount' => $expectedReturn,
                'daily_return_amount' => $dailyReturn,
                'duration_days' => $project->duration_days,
                'start_date' => $startDate->toDateString(),
                'maturity_date' => $maturityDate->toDateString(),
                'current_earnings' => 0,
                'status' => Investment::STATUS_ACTIVE,
                'idempotency_key' => $idempotencyKey,
            ]);

            $this->wallet->debit(
                $user,
                $amount,
                WalletTransaction::TYPE_INVESTMENT,
                "Investasi: {$project->name}",
                'Investment',
                $investment->id,
                ['project_id' => $project->id],
                $wallet,
            );

            $project->increment('current_funding', $amount);
            if ($project->funding_target && $project->current_funding >= $project->funding_target) {
                $project->update(['status' => Project::STATUS_FULLY_FUNDED]);
            }

            $this->audit->log('investment.created', 'Investment', $investment->id, null, [
                'amount' => $amount,
                'project_id' => $project->id,
            ], $user);

            $user->notify(new InvestmentCreatedNotification($investment));

            return $investment;
        });
    }

    /**
     * Must be called AFTER the investment transaction commits.
     */
    public function processReferralCommission(Investment $investment): void
    {
        $this->referral->handleFirstInvestment($investment);
    }
}
