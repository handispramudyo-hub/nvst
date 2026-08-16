<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResetUserPasswordRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\WalletResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with('wallet')->whereDoesntHave('roles');

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->string('search').'%')
                    ->orWhere('phone', 'like', '%'.$request->string('search').'%')
                    ->orWhere('email', 'like', '%'.$request->string('search').'%')
                    ->orWhere('referral_code', 'like', '%'.$request->string('search').'%');
            });
        }

        if ($request->has('status')) {
            if ($request->string('status') === 'active') {
                $query->where('is_active', true);
            } elseif ($request->string('status') === 'suspended') {
                $query->where('is_active', false);
            }
        }

        $users = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        return $this->paginated(UserResource::collection($users), 'Daftar pengguna.');
    }

    public function show(Request $request, User $user): JsonResponse
    {
        $user->load('wallet');

        return $this->success([
            'user' => new UserResource($user),
            'wallet' => new WalletResource($user->wallet),
            'referrals_count' => $user->referralsMade()->count(),
            'investments_count' => $user->investments()->count(),
            'deposits_count' => $user->deposits()->count(),
            'withdrawals_count' => $user->withdrawals()->count(),
        ], 'Detail pengguna.');
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user): JsonResponse
    {
        $old = ['is_active' => $user->is_active];
        $user->update(['is_active' => $request->boolean('is_active')]);

        if (!$user->is_active) {
            $user->tokens()->delete();
        }

        $this->audit->log('user.status_updated', 'User', $user->id, $old, ['is_active' => $user->is_active], $request->user());

        return $this->success(new UserResource($user), $user->is_active ? 'Pengguna diaktifkan.' : 'Pengguna di-suspend.');
    }

    public function resetPassword(ResetUserPasswordRequest $request, User $user): JsonResponse
    {
        $user->password = $request->validated('password');
        $user->save();
        $user->tokens()->delete();

        $this->audit->log('user.password_reset', 'User', $user->id, null, null, $request->user());

        return $this->success(null, 'Password pengguna berhasil di-reset.');
    }

    public function wallet(User $user): JsonResponse
    {
        return $this->success(new WalletResource($user->wallet), 'Data wallet pengguna.');
    }
}
