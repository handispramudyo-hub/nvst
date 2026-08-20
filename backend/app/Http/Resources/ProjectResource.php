<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image ? url('storage/'.$this->image) : null,
            'category' => $this->category,
            'min_investment' => (float) $this->min_investment,
            'max_investment' => (float) $this->max_investment,
            'estimated_return' => (float) $this->estimated_return,
            'duration_days' => $this->duration_days,
            'risk_level' => $this->risk_level,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'funding_target' => (float) $this->funding_target,
            'current_funding' => (float) $this->current_funding,
            'funding_progress' => $this->funding_progress,
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'is_investable' => $this->is_investable,
            'terms' => $this->terms,
            'risk_disclosure' => $this->risk_disclosure,
            'created_at' => $this->created_at,
        ];
    }
}
