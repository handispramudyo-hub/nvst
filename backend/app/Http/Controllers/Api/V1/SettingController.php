<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DepositService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function __construct(private readonly DepositService $depositService) {}

    public function paymentInstructions(): JsonResponse
    {
        return $this->success($this->depositService->getPaymentInstructions(), 'Instruksi pembayaran.');
    }
}
