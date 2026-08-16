<?php

namespace App\Services;

use App\Models\OtpVerification;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class OtpService
{
    public const PURPOSE_REGISTER = 'register';
    public const PURPOSE_RESET_PASSWORD = 'reset_password';

    public const EXPIRY_MINUTES = 10;
    public const MAX_ATTEMPTS = 5;

    public function generate(string $phone, string $purpose): string
    {
        OtpVerification::where('phone', $phone)->where('purpose', $purpose)->delete();

        $code = (string) random_int(100000, 999999);

        OtpVerification::create([
            'phone' => $phone,
            'code' => Hash::make($code),
            'purpose' => $purpose,
            'expires_at' => now()->addMinutes(self::EXPIRY_MINUTES),
        ]);

        return $code;
    }

    public function verify(string $phone, string $purpose, string $code): bool
    {
        $record = OtpVerification::where('phone', $phone)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (!$record || $record->expires_at->isPast()) {
            throw new RuntimeException('Kode OTP tidak valid atau sudah kedaluwarsa.');
        }

        if ($record->attempts >= self::MAX_ATTEMPTS) {
            throw new RuntimeException('Terlalu banyak percobaan. Silakan minta kode baru.');
        }

        if (!Hash::check($code, $record->code)) {
            $record->increment('attempts');

            throw new RuntimeException('Kode OTP salah.');
        }

        $record->update(['verified_at' => now()]);

        return true;
    }
}
