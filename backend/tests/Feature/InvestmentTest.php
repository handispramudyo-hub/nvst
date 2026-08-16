<?php

use App\Models\Investment;
use App\Models\WalletTransaction;

it('creates an investment and debits the wallet', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $project = $this->createOpenProject();

    $this->postJson('/api/v1/investments', [
        'project_id' => $project->id,
        'amount' => 500000,
        'pin' => '123456',
        'idempotency_key' => 'inv-key-1',
    ], $headers)->assertCreated()
        ->assertJsonPath('data.status', 'active')
        ->assertJsonPath('data.amount', 500000)
        ->assertJsonStructure(['data' => ['investment_no', 'expected_return_amount', 'maturity_date']]);

    $this->getJson('/api/v1/wallet', $headers)->assertJsonPath('data.wallet.balance', 500000);

    expect(Investment::where('idempotency_key', 'inv-key-1')->count())->toBe(1);
});

it('rejects investment with insufficient balance', function () {
    [, $headers] = $this->actingAsUser();
    $project = $this->createOpenProject();

    $this->postJson('/api/v1/investments', [
        'project_id' => $project->id,
        'amount' => 500000,
        'pin' => '123456',
    ], $headers)->assertStatus(422)
        ->assertJsonPath('success', false);

    $this->getJson('/api/v1/wallet', $headers)->assertJsonPath('data.wallet.balance', 0);
});

it('rejects investment below the project minimum', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $project = $this->createOpenProject(); // min_investment = 100000

    $this->postJson('/api/v1/investments', [
        'project_id' => $project->id,
        'amount' => 10000,
        'pin' => '123456',
    ], $headers)->assertStatus(422);
});

it('rejects a wrong PIN', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $project = $this->createOpenProject();

    $this->postJson('/api/v1/investments', [
        'project_id' => $project->id,
        'amount' => 200000,
        'pin' => '000000',
    ], $headers)->assertStatus(422);

    $this->getJson('/api/v1/wallet', $headers)->assertJsonPath('data.wallet.balance', 1000000);
});

it('is idempotent for the same investment key', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $project = $this->createOpenProject();

    $this->postJson('/api/v1/investments', [
        'project_id' => $project->id,
        'amount' => 300000,
        'pin' => '123456',
        'idempotency_key' => 'inv-same',
    ], $headers)->assertCreated();

    $this->postJson('/api/v1/investments', [
        'project_id' => $project->id,
        'amount' => 300000,
        'pin' => '123456',
        'idempotency_key' => 'inv-same',
    ], $headers)->assertCreated();

    expect(Investment::where('idempotency_key', 'inv-same')->count())->toBe(1)
        ->and(WalletTransaction::where('type', 'investment')->count())->toBe(1);
});

it('lists only the current users investments', function () {
    [$user, $headers] = $this->actingAsUser();
    [$otherUser] = $this->actingAsUser();

    $this->fundWallet($headers, 1000000);
    $project = $this->createOpenProject();

    $this->postJson('/api/v1/investments', [
        'project_id' => $project->id,
        'amount' => 200000,
        'pin' => '123456',
    ], $headers)->assertCreated();

    Investment::create([
        'investment_no' => 'INV-OTHER',
        'user_id' => $otherUser->id,
        'project_id' => $project->id,
        'amount' => 50000,
        'expected_return' => 3,
        'expected_return_amount' => 1500,
        'daily_return_amount' => 8.33,
        'duration_days' => 180,
        'start_date' => now(),
        'maturity_date' => now()->addDays(180),
        'status' => Investment::STATUS_ACTIVE,
    ]);

    $this->getJson('/api/v1/investments', $headers)
        ->assertOk()
        ->assertJsonCount(1, 'data.items');
});

it('returns the investment summary', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $project = $this->createOpenProject();

    $this->postJson('/api/v1/investments', [
        'project_id' => $project->id,
        'amount' => 500000,
        'pin' => '123456',
    ], $headers)->assertCreated();

    $this->getJson('/api/v1/investments/summary', $headers)
        ->assertOk()
        ->assertJsonPath('data.active_investments', 1)
        ->assertJsonPath('data.active_amount', 500000)
        ->assertJsonPath('data.total_invested', 500000);
});

it('accrues daily earnings via the scheduler command', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $project = $this->createOpenProject();
    $project->update(['estimated_return' => 3.0, 'duration_days' => 30]);

    $this->postJson('/api/v1/investments', [
        'project_id' => $project->id,
        'amount' => 300000,
        'pin' => '123456',
    ], $headers)->assertCreated();

    $this->artisan('earnings:accrue')->assertExitCode(0);

    $this->getJson('/api/v1/wallet', $headers)
        ->assertOk()
        ->assertJsonPath('data.wallet.total_profit', 300);
});
