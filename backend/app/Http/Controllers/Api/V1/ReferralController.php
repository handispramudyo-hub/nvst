<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommissionResource;
use App\Http\Resources\ReferralResource;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $referrals = $user->referralsMade()->with('referred')->get();

        return $this->success([
            'referral_code' => $user->referral_code,
            'referral_link' => url('/register?ref='.$user->referral_code),
            'commission_percent' => (float) Setting::get('referral', 'commission_percent', 5.0),
            'total_invited' => $referrals->count(),
            'total_qualified' => $referrals->where('status', 'qualified')->count(),
            'total_commission' => (float) $user->wallet->total_commission,
        ], 'Data referral.');
    }

    public function users(Request $request): JsonResponse
    {
        $referrals = $request->user()->referralsMade()
            ->with('referred')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(ReferralResource::collection($referrals), 'Daftar pengguna yang direferensikan.');
    }

    public function commissions(Request $request): JsonResponse
    {
        $commissions = $request->user()->commissions()
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(CommissionResource::collection($commissions), 'Daftar komisi.');
    }
}
