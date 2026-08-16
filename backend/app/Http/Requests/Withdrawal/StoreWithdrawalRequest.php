<?php

namespace App\Http\Requests\Withdrawal;

use Illuminate\Foundation\Http\FormRequest;

class StoreWithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1000'],
            'account_id' => ['required', 'integer', 'exists:withdrawal_accounts,id'],
            'pin' => ['required', 'string', 'digits:6'],
            'idempotency_key' => ['nullable', 'string', 'max:64'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'Jumlah penarikan wajib diisi.',
            'account_id.required' => 'Pilih akun tujuan penarikan.',
            'pin.required' => 'PIN wajib diisi untuk konfirmasi.',
            'pin.digits' => 'PIN harus 6 digit angka.',
        ];
    }
}
