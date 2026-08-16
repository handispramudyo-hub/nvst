<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'commission_amount' => (float) $this->commission_amount,
            'referred' => new UserResource($this->whenLoaded('referred')),
            'created_at' => $this->created_at,
        ];
    }
}
