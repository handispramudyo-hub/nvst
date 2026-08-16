<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notification::forUser($request->user()->id)->orderByDesc('created_at');

        $paginator = $query->paginate($request->integer('per_page', 20));
        $payload = NotificationResource::collection($paginator)->response()->getData(true);

        return $this->success([
            'notifications' => $payload['data'],
            'pagination' => $payload['meta'] ?? null,
            'unread_count' => $query->whereNull('read_at')->count(),
        ], 'Daftar notifikasi.');
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->notifiable_id !== $request->user()->id) {
            return $this->error('Anda tidak memiliki akses ke notifikasi ini.', 403);
        }

        $notification->markAsRead();

        return $this->success(null, 'Notifikasi ditandai sudah dibaca.');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::forUser($request->user()->id)->whereNull('read_at')->update(['read_at' => now()]);

        return $this->success(null, 'Semua notifikasi ditandai sudah dibaca.');
    }
}
