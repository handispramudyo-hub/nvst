<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WithdrawalAccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'account_type' => $this->account_type,
            'provider' => $this->provider,
            'account_name' => $this->account_name,
            'account_number' => $this->account_number,
            'is_default' => $this->is_default,
        ];
    }
}
