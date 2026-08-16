<?php

use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('allows admin to upload a QRIS image', function () {
    Storage::fake('public');

    [, $adminHeaders] = $this->actingAsAdmin();

    $file = UploadedFile::fake()->image('qris.png');

    $this->post('/api/v1/admin/settings/payment/qris-image', [
        'qris_image' => $file,
    ], $adminHeaders)->assertOk()
        ->assertJsonPath('data.qris_image', fn (string $value) => str_contains($value, '/storage/qris/'));

    $path = Setting::get('payment', 'qris_image');
    expect($path)->not->toBeEmpty();

    Storage::disk('public')->assertExists($path);
});

it('replaces the old QRIS image when uploading again', function () {
    Storage::fake('public');

    [, $adminHeaders] = $this->actingAsAdmin();

    $oldFile = UploadedFile::fake()->image('old.png');
    $this->post('/api/v1/admin/settings/payment/qris-image', ['qris_image' => $oldFile], $adminHeaders)->assertOk();
    $oldPath = Setting::get('payment', 'qris_image');

    $newFile = UploadedFile::fake()->image('new.png');
    $this->post('/api/v1/admin/settings/payment/qris-image', ['qris_image' => $newFile], $adminHeaders)->assertOk();

    $newPath = Setting::get('payment', 'qris_image');
    expect($newPath)->not->toBe($oldPath);

    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($newPath);
});

it('allows admin to remove the QRIS image', function () {
    Storage::fake('public');

    [, $adminHeaders] = $this->actingAsAdmin();

    $file = UploadedFile::fake()->image('qris.png');
    $this->post('/api/v1/admin/settings/payment/qris-image', ['qris_image' => $file], $adminHeaders)->assertOk();
    $path = Setting::get('payment', 'qris_image');

    $this->delete('/api/v1/admin/settings/payment/qris-image', [], $adminHeaders)->assertOk();

    expect(Setting::get('payment', 'qris_image'))->toBeEmpty();
    Storage::disk('public')->assertMissing($path);
});

it('exposes the uploaded QRIS image in payment instructions', function () {
    Storage::fake('public');

    [$user, $headers] = $this->actingAsUser();
    [, $adminHeaders] = $this->actingAsAdmin();

    $this->post('/api/v1/admin/settings/payment/qris-image', [
        'qris_image' => UploadedFile::fake()->image('qris.png'),
    ], $adminHeaders)->assertOk();

    $this->getJson('/api/v1/deposits/instructions', $headers)
        ->assertOk()
        ->assertJsonStructure(['data' => ['payment_method', 'merchant_name', 'qris_payload', 'qris_image', 'min_deposit', 'max_deposit']])
        ->assertJsonPath('data.qris_image', fn (string $value) => str_contains($value, '/storage/qris/'));
});

it('rejects non-admin users from uploading the QRIS image', function () {
    Storage::fake('public');

    [, $userHeaders] = $this->actingAsUser();

    $this->post('/api/v1/admin/settings/payment/qris-image', [
        'qris_image' => UploadedFile::fake()->image('qris.png'),
    ], $userHeaders)->assertForbidden();
});
