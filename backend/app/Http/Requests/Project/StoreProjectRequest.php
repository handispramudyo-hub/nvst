<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'category' => ['required', 'string', 'max:60'],
            'min_investment' => ['required', 'numeric', 'min:1000'],
            'max_investment' => ['required', 'numeric', 'gte:min_investment'],
            'estimated_return' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'duration_days' => ['required', 'integer', 'min:1', 'max:3650'],
            'risk_level' => ['required', Rule::in(['low', 'medium', 'high'])],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'funding_target' => ['required', 'numeric', 'min:1'],
            'status' => ['required', Rule::in(['draft', 'open', 'fully_funded', 'active', 'completed', 'closed'])],
            'terms' => ['nullable', 'string'],
            'risk_disclosure' => ['nullable', 'string'],
            'is_featured' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama proyek wajib diisi.',
            'max_investment.gte' => 'Maksimum investasi harus lebih besar dari minimum.',
            'end_date.after' => 'Tanggal berakhir harus setelah tanggal mulai.',
            'risk_level.in' => 'Level risiko tidak valid.',
        ];
    }
}
