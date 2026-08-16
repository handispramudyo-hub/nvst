<?php

namespace App\Http\Requests\Investment;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvestmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'amount' => ['required', 'numeric', 'min:1000'],
            'pin' => ['required', 'string', 'digits:6'],
            'idempotency_key' => ['nullable', 'string', 'max:64'],
        ];
    }

    public function messages(): array
    {
        return [
            'project_id.required' => 'Proyek wajib dipilih.',
            'amount.required' => 'Jumlah investasi wajib diisi.',
            'pin.required' => 'PIN wajib diisi untuk konfirmasi.',
            'pin.digits' => 'PIN harus 6 digit angka.',
        ];
    }
}
