<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'balance' => (float) $this->balance,
            'total_deposited' => (float) $this->total_deposited,
            'total_invested' => (float) $this->total_invested,
            'total_withdrawn' => (float) $this->total_withdrawn,
            'total_profit' => (float) $this->total_profit,
            'total_commission' => (float) $this->total_commission,
        ];
    }
}
