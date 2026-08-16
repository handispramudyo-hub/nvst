<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalletResource;
use App\Http\Resources\WalletTransactionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success([
            'wallet' => new WalletResource($user->wallet),
            'today_profit' => (float) $user->walletTransactions()
                ->where('type', 'profit')
                ->whereDate('created_at', today())
                ->sum('amount'),
            'month_profit' => (float) $user->walletTransactions()
                ->where('type', 'profit')
                ->where('created_at', '>=', now()->startOfMonth())
                ->sum('amount'),
        ], 'Data wallet.');
    }

    public function transactions(Request $request): JsonResponse
    {
        $transactions = $request->user()->walletTransactions()
            ->with('reference')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(WalletTransactionResource::collection($transactions), 'Riwayat transaksi wallet.');
    }
}
