<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'description' => ['sometimes', 'required', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'category' => ['sometimes', 'required', 'string', 'max:60'],
            'min_investment' => ['sometimes', 'required', 'numeric', 'min:1000'],
            'max_investment' => ['sometimes', 'required', 'numeric', 'gte:min_investment'],
            'estimated_return' => ['sometimes', 'required', 'numeric', 'min:0.1', 'max:100'],
            'duration_days' => ['sometimes', 'required', 'integer', 'min:1', 'max:3650'],
            'risk_level' => ['sometimes', 'required', Rule::in(['low', 'medium', 'high'])],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after:start_date'],
            'funding_target' => ['sometimes', 'required', 'numeric', 'min:1'],
            'status' => ['sometimes', 'required', Rule::in(['draft', 'open', 'fully_funded', 'active', 'completed', 'closed'])],
            'terms' => ['nullable', 'string'],
            'risk_disclosure' => ['nullable', 'string'],
            'is_featured' => ['sometimes', 'boolean'],
        ];
    }
}
