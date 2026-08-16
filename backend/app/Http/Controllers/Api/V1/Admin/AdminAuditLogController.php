<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = \App\Models\AuditLog::query()->with('user');

        if ($request->has('action')) {
            $query->where('action', $request->string('action'));
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('entity', 'like', '%'.$request->string('search').'%')
                    ->orWhere('action', 'like', '%'.$request->string('search').'%')
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', '%'.$request->string('search').'%')
                        ->orWhere('phone', 'like', '%'.$request->string('search').'%'));
            });
        }

        $logs = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 20));

        return $this->paginated(AuditLogResource::collection($logs), 'Daftar audit log.');
    }
}
