<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Project::query()
            ->whereNot('status', Project::STATUS_DRAFT)
            ->whereNot('status', Project::STATUS_CLOSED);

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->has('search')) {
            $query->where(fn ($q) => $q
                ->where('name', 'like', '%'.$request->string('search').'%')
                ->orWhere('description', 'like', '%'.$request->string('search').'%'));
        }

        if ($request->has('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->has('risk_level')) {
            $query->where('risk_level', $request->string('risk_level'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        $sort = $request->string('sort', 'newest');
        $order = match ($sort) {
            'return_high' => ['estimated_return', 'desc'],
            'return_low' => ['estimated_return', 'asc'],
            'duration_short' => ['duration_days', 'asc'],
            'duration_long' => ['duration_days', 'desc'],
            'min_investment' => ['min_investment', 'asc'],
            default => ['created_at', 'desc'],
        };
        $query->orderBy(...$order);

        $projects = $query->paginate($request->integer('per_page', 10));

        return $this->paginated(ProjectResource::collection($projects), 'Daftar proyek investasi.');
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        if (in_array($project->status, [Project::STATUS_DRAFT, Project::STATUS_CLOSED])) {
            return $this->error('Proyek tidak ditemukan.', 404);
        }

        return $this->success(new ProjectResource($project), 'Detail proyek.');
    }
}
