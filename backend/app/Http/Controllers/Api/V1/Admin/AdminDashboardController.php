<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Investment;
use App\Models\User;
use App\Models\Withdrawal;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today();

        $depositsGrowth = Deposit::query()
            ->where('status', Deposit::STATUS_APPROVED)
            ->where('created_at', '>=', now()->subDays(29))
            ->get(['created_at', 'amount'])
            ->groupBy(fn ($d) => $d->created_at->format('d M'))
            ->map(fn ($group) => round($group->sum('amount'), 2));

        $transactionsGrowth = Investment::query()
            ->where('created_at', '>=', now()->subDays(29))
            ->get(['created_at', 'amount'])
            ->groupBy(fn ($d) => $d->created_at->format('d M'))
            ->map(fn ($group) => round($group->sum('amount'), 2));

        return $this->success([
            'stats' => [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'total_deposits' => (float) Deposit::where('status', Deposit::STATUS_APPROVED)->sum('amount'),
                'today_deposits' => (float) Deposit::where('status', Deposit::STATUS_APPROVED)->whereDate('created_at', $today)->sum('amount'),
                'pending_deposits' => (int) Deposit::where('status', Deposit::STATUS_PENDING)->count(),
                'total_withdrawals' => (float) Withdrawal::where('status', Withdrawal::STATUS_COMPLETED)->sum('amount'),
                'pending_withdrawals' => (int) Withdrawal::whereIn('status', [Withdrawal::STATUS_PENDING, Withdrawal::STATUS_PROCESSING])->count(),
                'total_investments' => (float) Investment::where('status', Investment::STATUS_ACTIVE)->sum('amount'),
                'active_investments' => (int) Investment::where('status', Investment::STATUS_ACTIVE)->count(),
                'total_profit_paid' => (float) \App\Models\WalletTransaction::where('type', 'profit')->sum('amount'),
            ],
            'charts' => [
                'deposits_growth' => $depositsGrowth,
                'investments_growth' => $transactionsGrowth,
            ],
        ], 'Data dashboard.');
    }
}
