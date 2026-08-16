<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Withdrawal\StoreWithdrawalRequest;
use App\Http\Resources\WithdrawalResource;
use App\Models\Withdrawal;
use App\Services\WithdrawalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class WithdrawalController extends Controller
{
    public function __construct(private readonly WithdrawalService $withdrawalService) {}

    public function rules(Request $request): JsonResponse
    {
        $rules = $this->withdrawalService->getRules();

        return $this->success([
            ...$rules,
            'available_balance' => (float) $request->user()->wallet->balance,
        ], 'Aturan penarikan.');
    }

    public function index(Request $request): JsonResponse
    {
        $withdrawals = $request->user()->withdrawals()
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(WithdrawalResource::collection($withdrawals), 'Daftar penarikan.');
    }

    public function store(StoreWithdrawalRequest $request): JsonResponse
    {
        try {
            $withdrawal = $this->withdrawalService->create(
                $request->user(),
                (float) $request->validated('amount'),
                (int) $request->validated('account_id'),
                $request->validated('pin'),
                $request->validated('idempotency_key'),
            );
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success(new WithdrawalResource($withdrawal), 'Penarikan berhasil diajukan.', 201);
    }

    public function show(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        if ($withdrawal->user_id !== $request->user()->id) {
            return $this->error('Anda tidak memiliki akses ke penarikan ini.', 403);
        }

        return $this->success(new WithdrawalResource($withdrawal), 'Detail penarikan.');
    }
}
