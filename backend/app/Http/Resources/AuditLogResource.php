<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'entity' => $this->entity,
            'entity_id' => $this->entity_id,
            'old_value' => $this->old_value,
            'new_value' => $this->new_value,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'created_at' => $this->created_at,
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
