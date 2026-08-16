<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WithdrawalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'withdrawal_no' => $this->withdrawal_no,
            'amount' => (float) $this->amount,
            'fee' => (float) $this->fee,
            'final_amount' => (float) $this->final_amount,
            'account_type' => $this->account_type,
            'provider' => $this->provider,
            'account_name' => $this->account_name,
            'account_number' => $this->account_number,
            'status' => $this->status,
            'admin_note' => $this->admin_note,
            'submitted_at' => $this->submitted_at,
            'processed_at' => $this->processed_at,
            'approved_at' => $this->approved_at,
            'completed_at' => $this->completed_at,
            'rejected_at' => $this->rejected_at,
            'created_at' => $this->created_at,
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
