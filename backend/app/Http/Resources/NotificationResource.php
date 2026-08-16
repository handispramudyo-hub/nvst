<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->data['title'] ?? 'Notifikasi',
            'body' => $this->data['body'] ?? '',
            'icon' => $this->data['icon'] ?? 'bell',
            'type' => $this->data['type'] ?? 'system',
            'data' => $this->data['data'] ?? [],
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
            'user' => new UserResource($this->whenLoaded('notifiable')),
        ];
    }
}
