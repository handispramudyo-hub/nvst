<?php

namespace Tests;

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\SettingSeeder;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Spatie\Permission\PermissionRegistrar;

abstract class ApiTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->seed([
            RolePermissionSeeder::class,
            AdminUserSeeder::class,
            SettingSeeder::class,
        ]);

        RateLimiter::for('auth', fn () => Limit::none());
        RateLimiter::for('api', fn () => Limit::none());
    }

    protected function authHeaders(string $token): array
    {
        return ['Authorization' => "Bearer {$token}"];
    }

    /**
     * Reset resolved auth guards before every request so each test request
     * re-authenticates from its token, mirroring real HTTP behaviour.
     */
    public function call($method, $uri, $parameters = [], $cookies = [], $files = [], $server = [], $content = null)
    {
        if ($this->app) {
            $this->app['auth']->forgetGuards();
        }

        return parent::call($method, $uri, $parameters, $cookies, $files, $server, $content);
    }

    protected function createTokenFor(User $user): string
    {
        return $user->createToken('pest-test')->plainTextToken;
    }

    /**
     * @return array{0: User, 1: array<string, string>}
     */
    protected function actingAsUser(): array
    {
        $user = User::factory()->create(['pin' => '123456']);

        return [$user, $this->authHeaders($this->createTokenFor($user))];
    }

    /**
     * @return array{0: User, 1: array<string, string>}
     */
    protected function actingAsAdmin(): array
    {
        $admin = User::factory()->create(['pin' => '123456']);
        $admin->assignRole('super_admin');

        return [$admin, $this->authHeaders($this->createTokenFor($admin))];
    }

    /**
     * Deposit + admin approve, returning the final wallet balance.
     */
    protected function fundWallet(array $headers, float $amount, string $key = 'dep-fund'): float
    {
        $deposit = $this->postJson('/api/v1/deposits', [
            'amount' => $amount,
            'idempotency_key' => $key,
        ], $headers);

        $deposit->assertCreated()->assertJsonPath('data.status', 'pending');

        $depositId = $deposit->json('data.id');

        [, $adminHeaders] = $this->actingAsAdmin();

        $this->postJson("/api/v1/admin/deposits/{$depositId}/approve", [], $adminHeaders)
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        return $this->getJson('/api/v1/wallet', $headers)->json('data.wallet.balance');
    }

    protected function createOpenProject(): \App\Models\Project
    {
        return \App\Models\Project::factory()->create();
    }
}
