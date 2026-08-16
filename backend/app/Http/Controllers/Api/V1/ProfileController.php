<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdatePinRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\WithdrawalAccountRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\WalletResource;
use App\Http\Resources\WithdrawalAccountResource;
use App\Models\WithdrawalAccount;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success([
            'user' => new UserResource($user),
            'wallet' => new WalletResource($user->wallet),
            'withdrawal_accounts' => WithdrawalAccountResource::collection($user->withdrawalAccounts),
        ], 'Data profil.');
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->safe()->except(['profile_photo']);

        if ($request->hasFile('profile_photo')) {
            $data['profile_photo'] = $request->file('profile_photo')->store('profiles/'.$user->id, 'public');
        }

        $user->update($data);

        $this->audit->log('profile.updated', 'User', $user->id, null, $data, $user);

        return $this->success(new UserResource($user), 'Profil berhasil diperbarui.');
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->password = $request->validated('password');
        $user->save();

        $user->tokens()->delete();

        $this->audit->log('profile.password_changed', 'User', $user->id, null, null, $user);

        return $this->success(null, 'Password berhasil diubah. Silakan login kembali.');
    }

    public function updatePin(UpdatePinRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->pin = $request->validated('pin');
        $user->save();

        $this->audit->log('profile.pin_changed', 'User', $user->id, null, null, $user);

        return $this->success(null, 'PIN berhasil diubah.');
    }

    public function withdrawalAccounts(Request $request): JsonResponse
    {
        return $this->success(
            WithdrawalAccountResource::collection($request->user()->withdrawalAccounts),
            'Daftar akun penarikan.',
        );
    }

    public function storeWithdrawalAccount(WithdrawalAccountRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $account = DB::transaction(function () use ($user, $data) {
            if (!empty($data['is_default']) || $user->withdrawalAccounts()->count() === 0) {
                $user->withdrawalAccounts()->update(['is_default' => false]);
                $data['is_default'] = true;
            }

            return $user->withdrawalAccounts()->create($data);
        });

        $this->audit->log('withdrawal_account.created', 'WithdrawalAccount', $account->id, null, $data, $user);

        return $this->success(new WithdrawalAccountResource($account), 'Akun penarikan berhasil ditambahkan.', 201);
    }

    public function updateWithdrawalAccount(WithdrawalAccountRequest $request, WithdrawalAccount $account): JsonResponse
    {
        if ($account->user_id !== $request->user()->id) {
            return $this->error('Anda tidak memiliki akses ke akun ini.', 403);
        }

        $data = $request->validated();

        DB::transaction(function () use ($request, $data, $account) {
            if (!empty($data['is_default'])) {
                $request->user()->withdrawalAccounts()->where('id', '!=', $account->id)->update(['is_default' => false]);
            }
            $account->update($data);
        });

        $this->audit->log('withdrawal_account.updated', 'WithdrawalAccount', $account->id, null, $data, $request->user());

        return $this->success(new WithdrawalAccountResource($account), 'Akun penarikan berhasil diperbarui.');
    }

    public function destroyWithdrawalAccount(Request $request, WithdrawalAccount $account): JsonResponse
    {
        if ($account->user_id !== $request->user()->id) {
            return $this->error('Anda tidak memiliki akses ke akun ini.', 403);
        }

        $account->delete();

        $this->audit->log('withdrawal_account.deleted', 'WithdrawalAccount', $account->id, null, null, $request->user());

        return $this->success(null, 'Akun penarikan dihapus.');
    }
}
