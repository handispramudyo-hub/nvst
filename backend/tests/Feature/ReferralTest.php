<?php

use App\Models\Commission;
use App\Models\Referral;

it('credits the referrer registration bonus + 3% commission on the first investment', function () {
    $referrer = \App\Models\User::factory()->create();
    $token = $referrer->createToken('test')->plainTextToken;
    $referrerHeaders = $this->authHeaders($token);

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Referral User',
        'phone' => '081298765432',
        'password' => 'rahasia123',
        'password_confirmation' => 'rahasia123',
        'pin' => '123456',
        'referral_code' => $referrer->referral_code,
    ])->assertCreated();

    $referred = \App\Models\User::where('phone', '081298765432')->firstOrFail();
    $referredHeaders = $this->authHeaders($referred->createToken('test')->plainTextToken);

    $this->fundWallet($referredHeaders, 1000000);

    $project = $this->createOpenProject();

    $this->postJson('/api/v1/investments', [
        'project_id' => $project->id,
        'amount' => 200000,
        'pin' => '123456',
    ], $referredHeaders)->assertCreated();

    // 5000 registration bonus + 6000 (3% of 200000) = 11000
    $this->getJson('/api/v1/wallet', $referrerHeaders)
        ->assertOk()
        ->assertJsonPath('data.wallet.balance', 11000)
        ->assertJsonPath('data.wallet.total_commission', 11000);

    $this->getJson('/api/v1/referral', $referrerHeaders)
        ->assertOk()
        ->assertJsonPath('data.total_invited', 1)
        ->assertJsonPath('data.total_qualified', 1);

    expect(Referral::where('referred_id', $referred->id)->first()->status)->toBe('qualified')
        ->and(Commission::where('user_id', $referrer->id)->count())->toBe(1)
        ->and((float) Commission::first()->amount)->toBe(6000.0);
});

it('does not credit a commission twice for repeat investments', function () {
    $referrer = \App\Models\User::factory()->create();
    $referrerHeaders = $this->authHeaders($referrer->createToken('test')->plainTextToken);

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Referral User',
        'phone' => '081298765432',
        'password' => 'rahasia123',
        'password_confirmation' => 'rahasia123',
        'pin' => '123456',
        'referral_code' => $referrer->referral_code,
    ])->assertCreated();

    $referred = \App\Models\User::where('phone', '081298765432')->firstOrFail();
    $referredHeaders = $this->authHeaders($referred->createToken('test')->plainTextToken);

    $this->fundWallet($referredHeaders, 2000000);

    $project = $this->createOpenProject();

    foreach ([200000, 300000] as $amount) {
        $this->postJson('/api/v1/investments', [
            'project_id' => $project->id,
            'amount' => $amount,
            'pin' => '123456',
        ], $referredHeaders)->assertCreated();
    }

    $this->getJson('/api/v1/wallet', $referrerHeaders)
        ->assertOk()
        ->assertJsonPath('data.wallet.balance', 11000);

    expect(Commission::where('user_id', $referrer->id)->count())->toBe(1);
});

it('shows the referral summary and list', function () {
    [, $headers] = $this->actingAsUser();

    $this->getJson('/api/v1/referral', $headers)
        ->assertOk()
        ->assertJsonStructure(['data' => ['referral_code', 'referral_link', 'commission_percent', 'total_invited', 'total_qualified', 'total_commission']]);

    $this->getJson('/api/v1/referral/users', $headers)->assertOk();
    $this->getJson('/api/v1/referral/commissions', $headers)->assertOk();
});
