<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminNotificationRequest;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Models\User;
use App\Notifications\SystemAnnouncementNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::query()
            ->orderByDesc('created_at')
            ->with('notifiable')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(NotificationResource::collection($notifications), 'Daftar notifikasi.');
    }

    public function send(StoreAdminNotificationRequest $request): JsonResponse
    {
        $data = $request->validated();

        $query = User::where('is_active', true);

        if (!empty($data['user_ids'])) {
            $query = User::whereIn('id', $data['user_ids']);
        }

        $count = $query->count();

        if ($count === 0) {
            return $this->error('Tidak ada pengguna yang menerima notifikasi.', 422);
        }

        $query->chunkById(100, function ($users) use ($data) {
            foreach ($users as $user) {
                $user->notify(new SystemAnnouncementNotification($data['title'], $data['body']));
            }
        });

        return $this->success(['recipients' => $count], "Notifikasi dikirim ke {$count} pengguna.", 201);
    }
}
