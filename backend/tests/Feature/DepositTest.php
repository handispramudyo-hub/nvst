<?php

use App\Models\Deposit;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('returns QRIS payment instructions', function () {
    [$user, $headers] = $this->actingAsUser();

    $this->getJson('/api/v1/deposits/instructions', $headers)
        ->assertOk()
        ->assertJsonPath('data.payment_method', 'qris')
        ->assertJsonStructure(['data' => ['merchant_name', 'qris_payload', 'min_deposit', 'max_deposit']])
        ->assertJsonPath('data.min_deposit', 10000);
});

it('requires authentication for deposit instructions', function () {
    $this->getJson('/api/v1/deposits/instructions')->assertStatus(401);
});

it('creates a pending deposit', function () {
    [, $headers] = $this->actingAsUser();

    $this->postJson('/api/v1/deposits', [
        'amount' => 100000,
        'idempotency_key' => 'dep-key-1',
    ], $headers)->assertCreated()
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.payment_method', 'qris')
        ->assertJsonStructure(['data' => ['deposit_no', 'amount', 'status']]);
});

it('rejects a deposit below the minimum amount', function () {
    [, $headers] = $this->actingAsUser();

    $this->postJson('/api/v1/deposits', ['amount' => 1000], $headers)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('amount');
});

it('is idempotent for the same idempotency key', function () {
    [, $headers] = $this->actingAsUser();

    $this->postJson('/api/v1/deposits', ['amount' => 50000, 'idempotency_key' => 'same-key'], $headers)->assertCreated();
    $this->postJson('/api/v1/deposits', ['amount' => 50000, 'idempotency_key' => 'same-key'], $headers)->assertCreated();

    expect(Deposit::where('idempotency_key', 'same-key')->count())->toBe(1);
});

it('credits the wallet after admin approval', function () {
    [, $headers] = $this->actingAsUser();

    $deposit = $this->postJson('/api/v1/deposits', ['amount' => 250000, 'idempotency_key' => 'dep-approve'], $headers)
        ->assertCreated()
        ->json('data');

    [, $adminHeaders] = $this->actingAsAdmin();

    $this->postJson('/api/v1/admin/deposits/'.$deposit['id'].'/approve', [], $adminHeaders)
        ->assertOk()
        ->assertJsonPath('data.status', 'approved');

    $this->getJson('/api/v1/wallet', $headers)->assertJsonPath('data.wallet.balance', 250000);
});

it('does not credit the wallet when rejected', function () {
    [, $headers] = $this->actingAsUser();

    $deposit = $this->postJson('/api/v1/deposits', ['amount' => 250000, 'idempotency_key' => 'dep-reject'], $headers)
        ->assertCreated()
        ->json('data');

    [, $adminHeaders] = $this->actingAsAdmin();

    $this->postJson('/api/v1/admin/deposits/'.$deposit['id'].'/reject', ['note' => 'Saldo tidak sesuai'], $adminHeaders)
        ->assertOk()
        ->assertJsonPath('data.status', 'rejected');

    $this->getJson('/api/v1/wallet', $headers)->assertJsonPath('data.wallet.balance', 0);
});

it('uploads a payment proof', function () {
    Storage::fake('public');

    [$user, $headers] = $this->actingAsUser();

    $deposit = $this->postJson('/api/v1/deposits', ['amount' => 100000, 'idempotency_key' => 'dep-proof'], $headers)
        ->json('data');

    $file = UploadedFile::fake()->image('proof.jpg');

    $this->post('/api/v1/deposits/'.$deposit['id'].'/proof', [
        'proof' => $file,
    ], $headers)->assertOk()
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.proof_path', fn (string $value) => str_contains($value, '/storage/deposits/'.$user->id.'/'));

    Storage::disk('public')->assertExists('deposits/'.$user->id);
});

it('cannot upload proof for another users deposit', function () {
    Storage::fake('public');

    [$owner] = $this->actingAsUser();
    [, $intruderHeaders] = $this->actingAsUser();

    $deposit = Deposit::create([
        'deposit_no' => 'DEP-TEST0001',
        'user_id' => $owner->id,
        'amount' => 100000,
        'payment_method' => 'qris',
        'status' => Deposit::STATUS_PENDING,
    ]);

    $this->post('/api/v1/deposits/'.$deposit->id.'/proof', [
        'proof' => UploadedFile::fake()->image('proof.jpg'),
    ], $intruderHeaders)->assertStatus(422);

    expect(Deposit::find($deposit->id)->proof_path)->toBeNull();
});
