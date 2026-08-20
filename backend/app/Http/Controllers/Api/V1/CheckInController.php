<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CheckInService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckInController extends Controller
{
    public function __construct(
        private readonly CheckInService $checkIn,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $result = $this->checkIn->checkIn($request->user());

        return $result['success']
            ? $this->success($result, $result['message'])
            : $this->error($result['message'], 422);
    }

    public function status(Request $request): JsonResponse
    {
        return $this->success($this->checkIn->status($request->user()));
    }
}
