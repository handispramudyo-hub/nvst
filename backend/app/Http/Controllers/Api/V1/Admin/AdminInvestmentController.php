<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvestmentResource;
use App\Models\Investment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInvestmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Investment::query()->with(['user', 'project']);

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('investment_no', 'like', '%'.$request->string('search').'%')
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', '%'.$request->string('search').'%')
                        ->orWhere('phone', 'like', '%'.$request->string('search').'%'))
                    ->orWhereHas('project', fn ($p) => $p->where('name', 'like', '%'.$request->string('search').'%'));
            });
        }

        $investments = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        return $this->paginated(InvestmentResource::collection($investments), 'Daftar investasi.');
    }

    public function show(Request $request, Investment $investment): JsonResponse
    {
        $investment->load('user', 'project', 'earnings');

        return $this->success(new InvestmentResource($investment), 'Detail investasi.');
    }
}
