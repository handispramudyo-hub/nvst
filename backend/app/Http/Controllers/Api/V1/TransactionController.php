<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalletTransactionResource;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->walletTransactions();

        if ($request->has('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%'.$request->string('search').'%')
                    ->orWhere('tx_id', 'like', '%'.$request->string('search').'%');
            });
        }

        $sort = $request->string('sort', 'newest');
        if ($sort === 'oldest') {
            $query->orderBy('created_at');
        } else {
            $query->orderByDesc('created_at');
        }

        $transactions = $query->paginate($request->integer('per_page', 15));

        return $this->paginated(WalletTransactionResource::collection($transactions), 'Riwayat transaksi.');
    }

    public function show(Request $request, WalletTransaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return $this->error('Anda tidak memiliki akses ke transaksi ini.', 403);
        }

        $transaction->load('reference');

        return $this->success(new WalletTransactionResource($transaction), 'Detail transaksi.');
    }
}
