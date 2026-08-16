<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalletTransactionResource;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WalletTransaction::query()->with('user');

        if ($request->has('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('tx_id', 'like', '%'.$request->string('search').'%')
                    ->orWhere('description', 'like', '%'.$request->string('search').'%')
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', '%'.$request->string('search').'%')
                        ->orWhere('phone', 'like', '%'.$request->string('search').'%'));
            });
        }

        $transactions = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        return $this->paginated(WalletTransactionResource::collection($transactions), 'Daftar transaksi.');
    }
}
