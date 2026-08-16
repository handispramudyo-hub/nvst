<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\Investment;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $start = $request->date('start_date', now()->subDays(29))->startOfDay();
        $end = $request->date('end_date', now())->endOfDay();

        $depositsByDay = Deposit::where('status', Deposit::STATUS_APPROVED)
            ->whereBetween('created_at', [$start, $end])
            ->get(['created_at', 'amount'])
            ->groupBy(fn ($d) => $d->created_at->format('d M'))
            ->map(fn ($g) => round($g->sum('amount'), 2));

        $withdrawalsByDay = Withdrawal::where('status', Withdrawal::STATUS_COMPLETED)
            ->whereBetween('created_at', [$start, $end])
            ->get(['created_at', 'amount'])
            ->groupBy(fn ($d) => $d->created_at->format('d M'))
            ->map(fn ($g) => round($g->sum('amount'), 2));

        $investmentsByDay = Investment::whereBetween('created_at', [$start, $end])
            ->get(['created_at', 'amount'])
            ->groupBy(fn ($d) => $d->created_at->format('d M'))
            ->map(fn ($g) => round($g->sum('amount'), 2));

        $profitByDay = WalletTransaction::where('type', 'profit')
            ->whereBetween('created_at', [$start, $end])
            ->get(['created_at', 'amount'])
            ->groupBy(fn ($d) => $d->created_at->format('d M'))
            ->map(fn ($g) => round($g->sum('amount'), 2));

        return $this->success([
            'summary' => [
                'new_users' => User::whereBetween('created_at', [$start, $end])->count(),
                'total_deposits' => (float) Deposit::where('status', Deposit::STATUS_APPROVED)->whereBetween('created_at', [$start, $end])->sum('amount'),
                'total_withdrawals' => (float) Withdrawal::where('status', Withdrawal::STATUS_COMPLETED)->whereBetween('created_at', [$start, $end])->sum('amount'),
                'total_investments' => (float) Investment::whereBetween('created_at', [$start, $end])->sum('amount'),
                'total_profit' => (float) WalletTransaction::where('type', 'profit')->whereBetween('created_at', [$start, $end])->sum('amount'),
            ],
            'charts' => [
                'deposits' => $depositsByDay,
                'withdrawals' => $withdrawalsByDay,
                'investments' => $investmentsByDay,
                'profit' => $profitByDay,
            ],
            'category_summary' => Investment::with('project')
                ->whereBetween('created_at', [$start, $end])
                ->get()
                ->groupBy(fn ($i) => $i->project?->category ?? 'Lainnya')
                ->map(fn ($g) => round($g->sum('amount'), 2)),
        ], 'Laporan.');
    }
}
