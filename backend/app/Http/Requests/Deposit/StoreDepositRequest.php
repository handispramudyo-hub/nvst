<?php

namespace App\Http\Requests\Deposit;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;

class StoreDepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $min = (float) Setting::get('payment', 'min_deposit', 10000);
        $max = (float) Setting::get('payment', 'max_deposit', 1000000000);

        return [
            'amount' => ['required', 'numeric', "min:$min", "max:$max"],
            'idempotency_key' => ['nullable', 'string', 'max:64'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'Jumlah deposit wajib diisi.',
            'amount.min' => 'Jumlah deposit minimal 10.000.',
        ];
    }
}
