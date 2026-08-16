<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WithdrawalAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_type' => ['required', Rule::in(['bank', 'ewallet'])],
            'provider' => ['required', 'string', 'max:40'],
            'account_name' => ['required', 'string', 'max:100'],
            'account_number' => ['required', 'string', 'max:30'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'account_type.in' => 'Jenis akun harus bank atau ewallet.',
            'provider.required' => 'Nama bank / e-wallet wajib diisi.',
            'account_name.required' => 'Nama pemilik akun wajib diisi.',
            'account_number.required' => 'Nomor akun wajib diisi.',
        ];
    }
}
