<?php

use App\Models\WithdrawalAccount;

it('returns wallet with zero balance', function () {
    [, $headers] = $this->actingAsUser();

    $this->getJson('/api/v1/wallet', $headers)
        ->assertOk()
        ->assertJsonPath('data.wallet.balance', 0)
        ->assertJsonPath('data.today_profit', 0);
});

it('requires authentication for wallet', function () {
    $this->getJson('/api/v1/wallet')->assertStatus(401);
});

it('lists wallet transactions', function () {
    [$user, $headers] = $this->actingAsUser();

    $this->fundWallet($headers, 100000);

    $this->getJson('/api/v1/wallet/transactions', $headers)
        ->assertOk()
        ->assertJsonPath('data.pagination.total', 1)
        ->assertJsonPath('data.items.0.type', 'deposit');
});

it('updates the profile name', function () {
    [, $headers] = $this->actingAsUser();

    $this->putJson('/api/v1/profile', ['name' => 'Nama Baru'], $headers)
        ->assertOk()
        ->assertJsonPath('data.name', 'Nama Baru');
});

it('changes password and invalidates existing tokens', function () {
    [$user, $headers] = $this->actingAsUser();

    $this->putJson('/api/v1/profile/password', [
        'current_password' => 'password',
        'password' => 'passwordbaru1',
        'password_confirmation' => 'passwordbaru1',
    ], $headers)->assertOk();

    expect(Hash::check('passwordbaru1', $user->fresh()->password))->toBeTrue();

    $this->getJson('/api/v1/auth/me', $headers)->assertStatus(401);
});

it('changes the transaction pin with a valid current password', function () {
    [$user, $headers] = $this->actingAsUser();

    $this->putJson('/api/v1/profile/pin', [
        'current_password' => 'password',
        'pin' => '654321',
    ], $headers)->assertOk();

    expect(Hash::check('654321', $user->fresh()->pin))->toBeTrue();
});

it('creates a bank withdrawal account as default', function () {
    [, $headers] = $this->actingAsUser();

    $this->postJson('/api/v1/profile/withdrawal-accounts', [
        'account_type' => 'bank',
        'provider' => 'BCA',
        'account_name' => 'Test User',
        'account_number' => '1234567890',
    ], $headers)->assertCreated()
        ->assertJsonPath('data.account_type', 'bank')
        ->assertJsonPath('data.is_default', true);
});

it('sets the latest account as default and clears the previous one', function () {
    [$user, $headers] = $this->actingAsUser();

    WithdrawalAccount::create([
        'user_id' => $user->id,
        'account_type' => 'bank',
        'provider' => 'BCA',
        'account_name' => 'Test User',
        'account_number' => '111',
        'is_default' => true,
    ]);

    $this->postJson('/api/v1/profile/withdrawal-accounts', [
        'account_type' => 'ewallet',
        'provider' => 'OVO',
        'account_name' => 'Test User',
        'account_number' => '222',
        'is_default' => true,
    ], $headers)->assertCreated();

    expect($user->withdrawalAccounts()->where('is_default', true)->count())->toBe(1)
        ->and($user->withdrawalAccounts()->where('provider', 'OVO')->first()->is_default)->toBeTrue();
});

it('cannot access another users withdrawal account', function () {
    [$user] = $this->actingAsUser();
    [, $otherHeaders] = $this->actingAsUser();

    $account = WithdrawalAccount::create([
        'user_id' => $user->id,
        'account_type' => 'bank',
        'provider' => 'BCA',
        'account_name' => 'Test User',
        'account_number' => '111',
        'is_default' => true,
    ]);

    $this->putJson('/api/v1/profile/withdrawal-accounts/'.$account->id, [
        'account_type' => 'bank',
        'provider' => 'BNI',
        'account_name' => 'Test User',
        'account_number' => '222',
    ], $otherHeaders)->assertStatus(403);
});

it('deletes a withdrawal account', function () {
    [$user, $headers] = $this->actingAsUser();

    $account = WithdrawalAccount::create([
        'user_id' => $user->id,
        'account_type' => 'bank',
        'provider' => 'BCA',
        'account_name' => 'Test User',
        'account_number' => '111',
        'is_default' => true,
    ]);

    $this->deleteJson('/api/v1/profile/withdrawal-accounts/'.$account->id, [], $headers)->assertOk();

    expect(WithdrawalAccount::find($account->id))->toBeNull();
});
