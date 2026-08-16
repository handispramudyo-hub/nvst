<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminActionRequest;
use App\Http\Resources\WithdrawalResource;
use App\Models\Withdrawal;
use App\Services\WithdrawalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class AdminWithdrawalController extends Controller
{
    public function __construct(private readonly WithdrawalService $withdrawalService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Withdrawal::query()->with('user');

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->has('account_type')) {
            $query->where('account_type', $request->string('account_type'));
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('withdrawal_no', 'like', '%'.$request->string('search').'%')
                    ->orWhere('account_number', 'like', '%'.$request->string('search').'%')
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', '%'.$request->string('search').'%')
                        ->orWhere('phone', 'like', '%'.$request->string('search').'%'));
            });
        }

        $withdrawals = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        return $this->paginated(WithdrawalResource::collection($withdrawals), 'Daftar penarikan.');
    }

    public function show(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        $withdrawal->load('user', 'admin');

        return $this->success(new WithdrawalResource($withdrawal), 'Detail penarikan.');
    }

    public function process(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        try {
            $withdrawal = $this->withdrawalService->process($withdrawal, $request->user());
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success(new WithdrawalResource($withdrawal), 'Penarikan diproses.');
    }

    public function approve(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        try {
            $withdrawal = $this->withdrawalService->approve($withdrawal, $request->user());
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success(new WithdrawalResource($withdrawal), 'Penarikan disetujui.');
    }

    public function complete(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        try {
            $withdrawal = $this->withdrawalService->complete($withdrawal, $request->user());
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success(new WithdrawalResource($withdrawal), 'Penarikan selesai.');
    }

    public function reject(AdminActionRequest $request, Withdrawal $withdrawal): JsonResponse
    {
        try {
            $withdrawal = $this->withdrawalService->reject($withdrawal, $request->user(), $request->validated('note'));
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success(new WithdrawalResource($withdrawal), 'Penarikan ditolak dan dana dikembalikan.');
    }
}
