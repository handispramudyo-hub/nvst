<?php

use App\Models\User;

it('allows super_admin to access the dashboard', function () {
    [, $adminHeaders] = $this->actingAsAdmin();

    $this->getJson('/api/v1/admin/dashboard', $adminHeaders)
        ->assertOk()
        ->assertJsonStructure(['data' => ['stats' => ['total_users']]]);
});

it('allows any user with the admin role to access admin routes', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $headers = $this->authHeaders($admin->createToken('test')->plainTextToken);

    $this->getJson('/api/v1/admin/dashboard', $headers)->assertOk();
});

it('forbids a regular user from admin routes', function () {
    [, $headers] = $this->actingAsUser();

    $this->getJson('/api/v1/admin/dashboard', $headers)->assertStatus(403);
    $this->getJson('/api/v1/admin/users', $headers)->assertStatus(403);
    $this->getJson('/api/v1/admin/deposits', $headers)->assertStatus(403);
});

it('forbids unauthenticated access to admin routes', function () {
    $this->getJson('/api/v1/admin/dashboard')->assertStatus(401);
});

it('grants admin-role users access to permission-gated modules', function () {
    $manager = User::factory()->create();
    $manager->assignRole('admin');
    $headers = $this->authHeaders($manager->createToken('test')->plainTextToken);

    $this->getJson('/api/v1/admin/users', $headers)->assertOk();
    $this->getJson('/api/v1/admin/deposits', $headers)->assertOk();
    $this->getJson('/api/v1/admin/withdrawals', $headers)->assertOk();
});

it('lists users for an admin with users.view', function () {
    [, $adminHeaders] = $this->actingAsAdmin();
    User::factory()->count(3)->create();

    $this->getJson('/api/v1/admin/users', $adminHeaders)
        ->assertOk()
        ->assertJsonStructure(['data' => ['items', 'pagination']]);
});

it('updates a user status as an admin', function () {
    [, $adminHeaders] = $this->actingAsAdmin();
    $user = User::factory()->create(['is_active' => true]);

    $this->putJson('/api/v1/admin/users/'.$user->id.'/status', ['is_active' => false], $adminHeaders)
        ->assertOk()
        ->assertJsonPath('data.is_active', false);

    expect($user->fresh()->is_active)->toBeFalse();
});

it('resets a user password as an admin', function () {
    [, $adminHeaders] = $this->actingAsAdmin();
    $user = User::factory()->create();

    $this->postJson('/api/v1/admin/users/'.$user->id.'/reset-password', [
        'password' => 'passwordbaru1',
        'password_confirmation' => 'passwordbaru1',
    ], $adminHeaders)->assertOk();

    expect(Hash::check('passwordbaru1', $user->fresh()->password))->toBeTrue();
});

it('lists audit logs for an admin with audit.view', function () {
    [, $adminHeaders] = $this->actingAsAdmin();

    $this->getJson('/api/v1/admin/audit-logs', $adminHeaders)->assertOk();
});

it('sends a notification to specific users as an admin', function () {
    [, $adminHeaders] = $this->actingAsAdmin();
    $users = User::factory()->count(2)->create();

    $this->postJson('/api/v1/admin/notifications', [
        'title' => 'Pemeliharaan',
        'body' => 'Sistem akan maintenance malam ini.',
        'user_ids' => $users->pluck('id')->all(),
    ], $adminHeaders)->assertCreated()
        ->assertJsonPath('data.recipients', 2);

    expect(\App\Models\Notification::count())->toBe(2);
});

it('updates payment settings as an admin', function () {
    [, $adminHeaders] = $this->actingAsAdmin();

    $this->putJson('/api/v1/admin/settings', [
        'settings' => [
            'payment' => ['min_deposit' => '50000'],
        ],
    ], $adminHeaders)->assertOk();

    expect(\App\Models\Setting::get('payment', 'min_deposit'))->toBe('50000');
});
