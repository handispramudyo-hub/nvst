<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvestmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'investment_no' => $this->investment_no,
            'amount' => (float) $this->amount,
            'expected_return' => (float) $this->expected_return,
            'expected_return_amount' => (float) $this->expected_return_amount,
            'daily_return_amount' => (float) $this->daily_return_amount,
            'duration_days' => $this->duration_days,
            'start_date' => $this->start_date,
            'maturity_date' => $this->maturity_date,
            'current_earnings' => (float) $this->current_earnings,
            'status' => $this->status,
            'completed_at' => $this->completed_at,
            'cancelled_at' => $this->cancelled_at,
            'project' => new ProjectResource($this->whenLoaded('project')),
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
        ];
    }
}
