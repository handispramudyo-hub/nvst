<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tx_id' => $this->tx_id,
            'type' => $this->type,
            'amount' => (float) $this->amount,
            'balance_before' => (float) $this->balance_before,
            'balance_after' => (float) $this->balance_after,
            'description' => $this->description,
            'ref_type' => $this->ref_type,
            'ref_id' => $this->ref_id,
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
