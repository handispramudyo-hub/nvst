<?php

use App\Models\User;

it('registers a new user and creates a wallet', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Budi Santoso',
        'phone' => '081212345678',
        'password' => 'rahasia123',
        'password_confirmation' => 'rahasia123',
        'pin' => '123456',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.name', 'Budi Santoso')
        ->assertJsonStructure(['data' => ['user' => ['id', 'phone', 'referral_code'], 'token']]);

    $user = User::where('phone', '081212345678')->first();

    expect($user)->not->toBeNull()
        ->and($user->wallet)->not->toBeNull()
        ->and((float) $user->wallet->balance)->toBe(0.0);
});

it('rejects registration with an invalid phone format', function () {
    $this->postJson('/api/v1/auth/register', [
        'name' => 'Budi',
        'phone' => '12345',
        'password' => 'rahasia123',
        'password_confirmation' => 'rahasia123',
        'pin' => '123456',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('phone');
});

it('rejects duplicate phone numbers', function () {
    User::factory()->create(['phone' => '081212345678']);

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Budi',
        'phone' => '081212345678',
        'password' => 'rahasia123',
        'password_confirmation' => 'rahasia123',
        'pin' => '123456',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('phone');
});

it('rejects an invalid referral code', function () {
    $this->postJson('/api/v1/auth/register', [
        'name' => 'Budi',
        'phone' => '081212345678',
        'password' => 'rahasia123',
        'password_confirmation' => 'rahasia123',
        'pin' => '123456',
        'referral_code' => 'TIDAKADA',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('referral_code');
});

it('registers with a valid referral code', function () {
    $referrer = User::factory()->create();

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Budi',
        'phone' => '081212345678',
        'password' => 'rahasia123',
        'password_confirmation' => 'rahasia123',
        'pin' => '123456',
        'referral_code' => $referrer->referral_code,
    ])->assertCreated();

    $referred = User::where('phone', '081212345678')->first();

    expect($referred->referred_by_id)->toBe($referrer->id)
        ->and($referrer->referralsMade()->where('referred_id', $referred->id)->exists())->toBeTrue();
});

it('logs in with valid credentials', function () {
    $user = User::factory()->create(['password' => 'rahasia123']);

    $this->postJson('/api/v1/auth/login', [
        'phone' => $user->phone,
        'password' => 'rahasia123',
    ])->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => ['user', 'token', 'token_type']]);
});

it('rejects login with wrong credentials', function () {
    $user = User::factory()->create(['password' => 'rahasia123']);

    $this->postJson('/api/v1/auth/login', [
        'phone' => $user->phone,
        'password' => 'salah1234',
    ])->assertUnprocessable();
});

it('blocks login for deactivated users', function () {
    $user = User::factory()->create(['password' => 'rahasia123', 'is_active' => false]);

    $this->postJson('/api/v1/auth/login', [
        'phone' => $user->phone,
        'password' => 'rahasia123',
    ])->assertStatus(500);
});

it('returns the current user from /me', function () {
    [$user, $headers] = $this->actingAsUser();

    $this->getJson('/api/v1/auth/me', $headers)
        ->assertOk()
        ->assertJsonPath('data.user.phone', $user->phone)
        ->assertJsonPath('data.wallet.balance', 0);
});

it('requires authentication for /me', function () {
    $this->getJson('/api/v1/auth/me')->assertStatus(401);
});

it('logs out and invalidates the token', function () {
    [$user, $headers] = $this->actingAsUser();

    $this->postJson('/api/v1/auth/logout', [], $headers)->assertOk();

    expect($user->tokens()->count())->toBe(0);

    $this->getJson('/api/v1/auth/me', $headers)->assertStatus(401);
});

it('issues a reset token via forgot-password', function () {
    $user = User::factory()->create();

    $this->postJson('/api/v1/auth/forgot-password', ['phone' => $user->phone])
        ->assertOk()
        ->assertJsonStructure(['data' => ['reset_token']]);
});

it('resets the password with a valid token', function () {
    $user = User::factory()->create(['password' => 'lama12345']);

    $forgot = $this->postJson('/api/v1/auth/forgot-password', ['phone' => $user->phone]);
    $token = $forgot->json('data.reset_token');

    $this->postJson('/api/v1/auth/reset-password', [
        'phone' => $user->phone,
        'token' => $token,
        'password' => 'baru12345',
        'password_confirmation' => 'baru12345',
    ])->assertOk();

    $this->postJson('/api/v1/auth/login', [
        'phone' => $user->phone,
        'password' => 'baru12345',
    ])->assertOk();
});

it('rejects password reset with an invalid token', function () {
    $user = User::factory()->create();

    $this->postJson('/api/v1/auth/reset-password', [
        'phone' => $user->phone,
        'token' => 'invalid-token',
        'password' => 'baru12345',
        'password_confirmation' => 'baru12345',
    ])->assertUnprocessable();
});
