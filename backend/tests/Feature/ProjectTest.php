<?php

use App\Models\Project;

it('lists only open projects for users', function () {
    [, $headers] = $this->actingAsUser();

    $this->createOpenProject();
    $this->createOpenProject();
    Project::factory()->create(['status' => 'draft']);
    Project::factory()->create(['status' => 'closed']);

    $this->getJson('/api/v1/projects', $headers)
        ->assertOk()
        ->assertJsonCount(2, 'data.items');
});

it('shows a single open project', function () {
    [, $headers] = $this->actingAsUser();

    $project = $this->createOpenProject();

    $this->getJson('/api/v1/projects/'.$project->id, $headers)
        ->assertOk()
        ->assertJsonPath('data.id', $project->id);
});

it('creates a project as an admin', function () {
    [, $adminHeaders] = $this->actingAsAdmin();

    $this->postJson('/api/v1/admin/projects', [
        'name' => 'Kebun Alpukat',
        'description' => 'Pengembangan kebun alpukat di lereng gunung.',
        'category' => 'Agrikultur',
        'min_investment' => 100000,
        'max_investment' => 500000000,
        'estimated_return' => 2.5,
        'duration_days' => 120,
        'risk_level' => 'medium',
        'funding_target' => 1000000000,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addMonths(6)->toDateString(),
        'status' => 'open',
    ], $adminHeaders)->assertCreated()
        ->assertJsonPath('data.name', 'Kebun Alpukat')
        ->assertJsonPath('data.status', 'open');
});
