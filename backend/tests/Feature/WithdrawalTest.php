<?php

use App\Models\Withdrawal;
use App\Models\WalletTransaction;

it('returns withdrawal rules with available balance', function () {
    [, $headers] = $this->actingAsUser();

    $this->getJson('/api/v1/withdrawals/rules', $headers)
        ->assertOk()
        ->assertJsonPath('data.min_amount', 50000)
        ->assertJsonPath('data.fee_percent', 1)
        ->assertJsonPath('data.available_balance', 0);
});

it('submits a withdrawal and holds the funds', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $account = $this->postJson('/api/v1/profile/withdrawal-accounts', [
        'account_type' => 'bank',
        'provider' => 'BCA',
        'account_name' => 'Test User',
        'account_number' => '1234567890',
    ], $headers)->assertCreated()->json('data');

    $this->postJson('/api/v1/withdrawals', [
        'amount' => 100000,
        'account_id' => $account['id'],
        'pin' => '123456',
        'idempotency_key' => 'wd-key-1',
    ], $headers)->assertCreated()
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.amount', 100000);

    $this->getJson('/api/v1/wallet', $headers)->assertJsonPath('data.wallet.balance', 900000);

    expect(WalletTransaction::where('type', 'withdrawal')->sum('amount'))->toBe(-100000);
});

it('rejects withdrawal below the minimum amount', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $account = $this->postJson('/api/v1/profile/withdrawal-accounts', [
        'account_type' => 'ewallet',
        'provider' => 'OVO',
        'account_name' => 'Test User',
        'account_number' => '08123456789',
    ], $headers)->json('data');

    $this->postJson('/api/v1/withdrawals', [
        'amount' => 1000,
        'account_id' => $account['id'],
        'pin' => '123456',
    ], $headers)->assertStatus(422);
});

it('rejects a wrong PIN on withdrawal', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $account = $this->postJson('/api/v1/profile/withdrawal-accounts', [
        'account_type' => 'bank',
        'provider' => 'BCA',
        'account_name' => 'Test User',
        'account_number' => '1234567890',
    ], $headers)->json('data');

    $this->postJson('/api/v1/withdrawals', [
        'amount' => 100000,
        'account_id' => $account['id'],
        'pin' => '000000',
    ], $headers)->assertStatus(422);

    $this->getJson('/api/v1/wallet', $headers)->assertJsonPath('data.wallet.balance', 1000000);
});

it('cannot withdraw to another users account', function () {
    [$owner] = $this->actingAsUser();
    [, $headers] = $this->actingAsUser();

    $this->fundWallet($headers, 1000000);

    $ownerAccount = $this->postJson('/api/v1/profile/withdrawal-accounts', [
        'account_type' => 'bank',
        'provider' => 'BCA',
        'account_name' => 'Owner',
        'account_number' => '999',
    ], $this->authHeaders($this->createTokenFor($owner)))->json('data');

    $this->postJson('/api/v1/withdrawals', [
        'amount' => 100000,
        'account_id' => $ownerAccount['id'],
        'pin' => '123456',
    ], $headers)->assertStatus(422);

    $this->getJson('/api/v1/wallet', $headers)->assertJsonPath('data.wallet.balance', 1000000);
});

it('does not double debit when the withdrawal is approved', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $account = $this->postJson('/api/v1/profile/withdrawal-accounts', [
        'account_type' => 'bank',
        'provider' => 'BCA',
        'account_name' => 'Test User',
        'account_number' => '1234567890',
    ], $headers)->json('data');

    $withdrawal = $this->postJson('/api/v1/withdrawals', [
        'amount' => 200000,
        'account_id' => $account['id'],
        'pin' => '123456',
        'idempotency_key' => 'wd-approve',
    ], $headers)->json('data');

    [, $adminHeaders] = $this->actingAsAdmin();

    $this->postJson('/api/v1/admin/withdrawals/'.$withdrawal['id'].'/approve', [], $adminHeaders)
        ->assertOk()
        ->assertJsonPath('data.status', 'approved');

    $this->getJson('/api/v1/wallet', $headers)->assertJsonPath('data.wallet.balance', 800000);
});

it('refunds the funds when the withdrawal is rejected', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $account = $this->postJson('/api/v1/profile/withdrawal-accounts', [
        'account_type' => 'bank',
        'provider' => 'BCA',
        'account_name' => 'Test User',
        'account_number' => '1234567890',
    ], $headers)->json('data');

    $withdrawal = $this->postJson('/api/v1/withdrawals', [
        'amount' => 200000,
        'account_id' => $account['id'],
        'pin' => '123456',
        'idempotency_key' => 'wd-reject',
    ], $headers)->json('data');

    [, $adminHeaders] = $this->actingAsAdmin();

    $this->postJson('/api/v1/admin/withdrawals/'.$withdrawal['id'].'/reject', ['note' => 'Data tidak valid'], $adminHeaders)
        ->assertOk()
        ->assertJsonPath('data.status', 'rejected');

    $this->getJson('/api/v1/wallet', $headers)->assertJsonPath('data.wallet.balance', 1000000);
});

it('moves a withdrawal through processing to completion', function () {
    [, $headers] = $this->actingAsUser();
    $this->fundWallet($headers, 1000000);

    $account = $this->postJson('/api/v1/profile/withdrawal-accounts', [
        'account_type' => 'ewallet',
        'provider' => 'GoPay',
        'account_name' => 'Test User',
        'account_number' => '08123456789',
    ], $headers)->json('data');

    $withdrawal = $this->postJson('/api/v1/withdrawals', [
        'amount' => 150000,
        'account_id' => $account['id'],
        'pin' => '123456',
    ], $headers)->json('data');

    [, $adminHeaders] = $this->actingAsAdmin();

    $this->postJson('/api/v1/admin/withdrawals/'.$withdrawal['id'].'/process', [], $adminHeaders)
        ->assertOk()->assertJsonPath('data.status', 'processing');

    $this->postJson('/api/v1/admin/withdrawals/'.$withdrawal['id'].'/approve', [], $adminHeaders)
        ->assertOk()->assertJsonPath('data.status', 'approved');

    $this->postJson('/api/v1/admin/withdrawals/'.$withdrawal['id'].'/complete', [], $adminHeaders)
        ->assertOk()->assertJsonPath('data.status', 'completed');

    expect(Withdrawal::find($withdrawal['id'])->completed_at)->not->toBeNull();
});
