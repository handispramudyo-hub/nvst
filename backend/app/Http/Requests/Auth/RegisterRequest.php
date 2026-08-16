<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'regex:/^08[0-9]{8,12}$/', Rule::unique('users', 'phone')],
            'email' => ['nullable', 'email', 'max:100', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'pin' => ['required', 'string', 'digits:6'],
            'referral_code' => ['nullable', 'string', 'max:10', Rule::exists('users', 'referral_code')],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Format nomor HP tidak valid. Gunakan format 08xxxxxxxxxx.',
            'phone.unique' => 'Nomor HP sudah terdaftar.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.min' => 'Password minimal 8 karakter.',
            'pin.digits' => 'PIN harus 6 digit angka.',
            'referral_code.exists' => 'Kode referral tidak ditemukan.',
        ];
    }
}
