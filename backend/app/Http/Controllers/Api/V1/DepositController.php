<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Deposit\StoreDepositRequest;
use App\Http\Requests\Deposit\UploadProofRequest;
use App\Http\Resources\DepositResource;
use App\Models\Deposit;
use App\Services\DepositService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class DepositController extends Controller
{
    public function __construct(private readonly DepositService $depositService) {}

    public function instructions(): JsonResponse
    {
        return $this->success($this->depositService->getPaymentInstructions(), 'Instruksi pembayaran QRIS.');
    }

    public function index(Request $request): JsonResponse
    {
        $deposits = $request->user()->deposits()
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(DepositResource::collection($deposits), 'Daftar deposit.');
    }

    public function store(StoreDepositRequest $request): JsonResponse
    {
        $deposit = $this->depositService->create(
            $request->user(),
            (float) $request->validated('amount'),
            $request->validated('idempotency_key'),
        );

        return $this->success(
            new DepositResource($deposit),
            'Deposit berhasil dibuat. Silakan lakukan pembayaran dan unggah bukti.',
            201,
        );
    }

    public function uploadProof(UploadProofRequest $request, Deposit $deposit): JsonResponse
    {
        try {
            $deposit = $this->depositService->uploadProof($deposit, $request->file('proof'), $request->user());
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success(new DepositResource($deposit), 'Bukti pembayaran berhasil diunggah.');
    }

    public function show(Request $request, Deposit $deposit): JsonResponse
    {
        if ($deposit->user_id !== $request->user()->id) {
            return $this->error('Anda tidak memiliki akses ke deposit ini.', 403);
        }

        return $this->success(new DepositResource($deposit), 'Detail deposit.');
    }
}
