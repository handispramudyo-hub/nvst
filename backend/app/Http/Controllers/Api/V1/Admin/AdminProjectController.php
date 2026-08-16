<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProjectController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    public function index(Request $request): JsonResponse
    {
        $query = Project::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->string('search').'%');
        }

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->has('category')) {
            $query->where('category', $request->string('category'));
        }

        $projects = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 10));

        return $this->paginated(ProjectResource::collection($projects), 'Daftar proyek.');
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('projects', 'public');
        }

        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['created_by'] = $request->user()->id;

        $project = Project::create($data);

        $this->audit->log('project.created', 'Project', $project->id, null, ['name' => $project->name], $request->user());

        return $this->success(new ProjectResource($project), 'Proyek berhasil dibuat.', 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        return $this->success(new ProjectResource($project), 'Detail proyek.');
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('projects', 'public');
        }

        if (isset($data['name']) && $data['name'] !== $project->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $project->id);
        }

        $old = $project->only(['name', 'status', 'min_investment', 'max_investment', 'estimated_return']);
        $project->update($data);

        $this->audit->log('project.updated', 'Project', $project->id, $old, $data, $request->user());

        return $this->success(new ProjectResource($project), 'Proyek berhasil diperbarui.');
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        if ($project->investments()->where('status', 'active')->exists()) {
            return $this->error('Proyek dengan investasi aktif tidak dapat dihapus.', 422);
        }

        $project->delete();

        $this->audit->log('project.deleted', 'Project', $project->id, null, ['name' => $project->name], $request->user());

        return $this->success(null, 'Proyek berhasil dihapus.');
    }

    protected function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;

        while (Project::where('slug', $slug)->where('id', '!=', $ignoreId)->exists()) {
            $slug = $base.'-'.($i++);
        }

        return $slug;
    }
}
