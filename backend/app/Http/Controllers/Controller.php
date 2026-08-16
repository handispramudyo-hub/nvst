<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    protected function success(mixed $data = null, string $message = 'Berhasil', int $status = 200): JsonResponse
    {
        return ApiResponse::success($data, $message, $status);
    }

    protected function error(string $message = 'Terjadi kesalahan', int $status = 400, mixed $errors = null): JsonResponse
    {
        return ApiResponse::error($message, $status, $errors);
    }

    /**
     * Render a paginated resource collection inside the standard envelope
     * while preserving pagination metadata that is otherwise lost when a
     * ResourceCollection is nested under a custom data wrapper.
     */
    protected function paginated(AnonymousResourceCollection $collection, string $message = 'Berhasil', int $status = 200): JsonResponse
    {
        $payload = $collection->response()->getData(true);

        return ApiResponse::success([
            'items' => $payload['data'],
            'pagination' => $payload['meta'] ?? null,
        ], $message, $status);
    }
}
