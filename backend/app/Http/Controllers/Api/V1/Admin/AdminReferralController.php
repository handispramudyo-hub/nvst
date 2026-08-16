<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommissionResource;
use App\Http\Resources\ReferralResource;
use App\Models\Referral;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReferralController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Referral::query()->with(['referrer', 'referred']);

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('referrer', fn ($u) => $u->where('name', 'like', '%'.$request->string('search').'%')
                    ->orWhere('phone', 'like', '%'.$request->string('search').'%'))
                    ->orWhereHas('referred', fn ($u) => $u->where('name', 'like', '%'.$request->string('search').'%')
                        ->orWhere('phone', 'like', '%'.$request->string('search').'%'));
            });
        }

        $referrals = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        return $this->paginated(ReferralResource::collection($referrals), 'Daftar referral.');
    }

    public function commissions(Request $request): JsonResponse
    {
        $commissions = \App\Models\Commission::query()->with('user')
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(CommissionResource::collection($commissions), 'Daftar komisi.');
    }
}
