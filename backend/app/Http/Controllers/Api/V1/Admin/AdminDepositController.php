<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminActionRequest;
use App\Http\Resources\DepositResource;
use App\Models\Deposit;
use App\Services\DepositService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class AdminDepositController extends Controller
{
    public function __construct(private readonly DepositService $depositService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Deposit::query()->with('user');

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('deposit_no', 'like', '%'.$request->string('search').'%')
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', '%'.$request->string('search').'%')
                        ->orWhere('phone', 'like', '%'.$request->string('search').'%'));
            });
        }

        $deposits = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        return $this->paginated(DepositResource::collection($deposits), 'Daftar deposit.');
    }

    public function show(Request $request, Deposit $deposit): JsonResponse
    {
        $deposit->load('user', 'admin');

        return $this->success(new DepositResource($deposit), 'Detail deposit.');
    }

    public function approve(Request $request, Deposit $deposit): JsonResponse
    {
        try {
            $deposit = $this->depositService->approve($deposit, $request->user());
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success(new DepositResource($deposit), 'Deposit disetujui dan saldo telah ditambahkan.');
    }

    public function reject(AdminActionRequest $request, Deposit $deposit): JsonResponse
    {
        try {
            $deposit = $this->depositService->reject($deposit, $request->user(), $request->validated('note'));
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success(new DepositResource($deposit), 'Deposit ditolak.');
    }
}
