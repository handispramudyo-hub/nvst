<?php

namespace App\Http\Requests\Deposit;

use Illuminate\Foundation\Http\FormRequest;

class UploadProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'proof' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'proof.required' => 'Bukti pembayaran wajib diunggah.',
            'proof.image' => 'Bukti pembayaran harus berupa gambar.',
            'proof.max' => 'Ukuran bukti pembayaran maksimal 5MB.',
        ];
    }
}
