<?php

namespace App\Services;

use App\Models\Investment;
use App\Models\InvestmentEarning;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Notifications\DailyProfitNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class EarningService
{
    public function __construct(private readonly WalletService $wallet) {}

    /**
     * Accrue daily earnings for all active investments up to today.
     * Returns the number of earnings credited.
     */
    public function accrueDaily(?Carbon $date = null): int
    {
        $date ??= now();
        $credited = 0;

        Investment::with(['user.wallet'])
            ->where('status', Investment::STATUS_ACTIVE)
            ->whereDate('start_date', '<=', $date->toDateString())
            ->orderBy('id')
            ->chunk(100, function ($investments) use ($date, &$credited) {
                foreach ($investments as $investment) {
                    $credited += $this->accrueForInvestment($investment, $date);
                }
            });

        return $credited;
    }

    public function accrueForInvestment(Investment $investment, Carbon $date): int
    {
        if ($investment->status !== Investment::STATUS_ACTIVE) {
            return 0;
        }

        $credited = 0;
        $lastDate = $date->copy();
        $maturity = Carbon::parse($investment->maturity_date);

        if ($lastDate->greaterThan($maturity)) {
            $lastDate = $maturity->copy();
        }

        $cursor = Carbon::parse($investment->start_date);

        if ($cursor->greaterThan($lastDate)) {
            return 0;
        }

        $earningIds = $investment->earnings()->pluck('earning_date')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->flip();

        while ($cursor->lessThanOrEqualTo($lastDate)) {
            $key = $cursor->toDateString();

            if (!isset($earningIds[$key])) {
                $credited += $this->creditEarning($investment, $cursor) ? 1 : 0;
            }

            $cursor->addDay();
        }

        if ($date->greaterThanOrEqualTo($maturity)) {
            $this->completeInvestment($investment);
        }

        return $credited;
    }

    protected function creditEarning(Investment $investment, Carbon $earningDate): bool
    {
        return DB::transaction(function () use ($investment, $earningDate) {
            $exists = InvestmentEarning::where('investment_id', $investment->id)
                ->where('earning_date', $earningDate->toDateString())
                ->exists();

            if ($exists) {
                return false;
            }

            $amount = round((float) $investment->daily_return_amount, 2);

            if ($amount <= 0) {
                return false;
            }

            InvestmentEarning::create([
                'investment_id' => $investment->id,
                'user_id' => $investment->user_id,
                'amount' => $amount,
                'earning_date' => $earningDate->toDateString(),
                'status' => 'credited',
            ]);

            $projectName = $investment->project?->name ?? $investment->investment_no;

            $this->wallet->credit(
                $investment->user,
                $amount,
                WalletTransaction::TYPE_PROFIT,
                "Profit harian: {$projectName} ({$earningDate->format('d M Y')})",
                'Investment',
                $investment->id,
                ['investment_no' => $investment->investment_no],
            );

            $investment->increment('current_earnings', $amount);

            return true;
        });
    }

    protected function completeInvestment(Investment $investment): void
    {
        DB::transaction(function () use ($investment) {
            $locked = Investment::where('id', $investment->id)
                ->where('status', Investment::STATUS_ACTIVE)
                ->lockForUpdate()
                ->first();

            if (!$locked) {
                return;
            }

            $locked->update([
                'status' => Investment::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);
        });
    }

    public function getTodayProfit(User $user, ?Carbon $date = null): float
    {
        $date ??= now();

        return (float) $user->walletTransactions()
            ->where('type', WalletTransaction::TYPE_PROFIT)
            ->whereDate('created_at', $date->toDateString())
            ->sum('amount');
    }

    /**
     * Send a daily profit summary notification to users who earned profit today.
     */
    public function notifyDailyProfits(?Carbon $date = null): int
    {
        $date ??= now();

        $rows = InvestmentEarning::with('user')
            ->where('earning_date', $date->toDateString())
            ->where('status', 'credited')
            ->selectRaw('user_id, SUM(amount) as total')
            ->groupBy('user_id')
            ->get();

        foreach ($rows as $row) {
            $user = $row->user;
            if ($user) {
                $user->notify(new DailyProfitNotification((float) $row->total, $date->format('d M Y')));
            }
        }

        return $rows->count();
    }
}
