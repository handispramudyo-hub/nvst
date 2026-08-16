<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepositResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'deposit_no' => $this->deposit_no,
            'amount' => (float) $this->amount,
            'payment_method' => $this->payment_method,
            'proof_path' => $this->proof_path ? url('storage/'.$this->proof_path) : null,
            'status' => $this->status,
            'admin_note' => $this->admin_note,
            'approved_at' => $this->approved_at,
            'rejected_at' => $this->rejected_at,
            'created_at' => $this->created_at,
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
