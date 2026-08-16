<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\WalletResource;
use App\Models\User;
use App\Services\AuditService;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class AuthController extends Controller
{
    public function __construct(
        private readonly ReferralService $referral,
        private readonly AuditService $audit,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $referrer = null;
        if (!empty($data['referral_code'])) {
            $referrer = User::where('referral_code', $data['referral_code'])->first();
            if (!$referrer) {
                throw ValidationException::withMessages(['referral_code' => 'Kode referral tidak ditemukan.']);
            }
        }

        $user = DB::transaction(function () use ($data, $referrer) {
            $user = User::create([
                'name' => $data['name'],
                'phone' => $data['phone'],
                'email' => $data['email'] ?? null,
                'password' => $data['password'],
                'pin' => $data['pin'],
                'phone_verified_at' => now(),
                'is_active' => true,
                'referral_code' => User::generateReferralCode(),
                'referred_by_id' => $referrer?->id,
            ]);

            if ($referrer) {
                $this->referral->createReferral($referrer, $user);
            }

            return $user;
        });

        $token = $user->createToken('nivest-mobile')->plainTextToken;

        $this->audit->log('auth.register', 'User', $user->id, null, ['phone' => $user->phone], $user);

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Registrasi berhasil.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::where('phone', $data['phone'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            $this->audit->log('auth.login.failed', 'User', $user?->id, null, ['phone' => $data['phone']]);

            throw ValidationException::withMessages([
                'phone' => ['Nomor HP atau password salah.'],
            ]);
        }

        if (!$user->is_active) {
            throw new RuntimeException('Akun anda dinonaktifkan. Hubungi admin.');
        }

        $device = $data['device_name'] ?? 'nivest-device';
        $token = $user->createToken($device)->plainTextToken;

        $this->audit->log('auth.login', 'User', $user->id, null, ['device' => $device], $user);

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Login berhasil.');
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->audit->log('auth.logout', 'User', $user->id, null, null, $user);

        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logout berhasil.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('wallet');

        return $this->success([
            'user' => new UserResource($user),
            'wallet' => new WalletResource($user->wallet),
        ], 'Data pengguna.');
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('phone', $request->validated('phone'))->first();

        if (!$user) {
            return $this->success(null, 'Jika nomor HP terdaftar, instruksi reset akan dikirim.');
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['phone' => $user->phone],
            [
                'token' => Hash::make($token),
                'expires_at' => now()->addHour(),
                'created_at' => now(),
            ],
        );

        $this->audit->log('auth.forgot_password', 'User', $user->id, null, null, $user);

        return $this->success([
            'reset_token' => $token,
        ], 'Kode reset dikirim. (Dalam mode development, kode dikembalikan langsung.)');
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $data = $request->validated();

        $record = DB::table('password_reset_tokens')->where('phone', $data['phone'])->first();

        if (!$record || !Hash::check($data['token'], $record->token)) {
            throw ValidationException::withMessages(['token' => ['Token reset tidak valid.']]);
        }

        if ($record->expires_at && now()->greaterThan($record->expires_at)) {
            throw ValidationException::withMessages(['token' => ['Token reset sudah kedaluwarsa.']]);
        }

        $user = User::where('phone', $data['phone'])->first();

        if (!$user) {
            throw ValidationException::withMessages(['phone' => ['Nomor HP tidak terdaftar.']]);
        }

        $user->password = $data['password'];
        $user->save();

        $user->tokens()->delete();

        DB::table('password_reset_tokens')->where('phone', $data['phone'])->delete();

        $this->audit->log('auth.password_reset', 'User', $user->id, null, null, $user);

        return $this->success(null, 'Password berhasil direset. Silakan login.');
    }
}
