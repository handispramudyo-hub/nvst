<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminSettingController extends Controller
{
    public function __construct(private readonly AuditService $audit) {}

    public function index(): JsonResponse
    {
        $groups = ['payment', 'withdrawal', 'referral', 'general'];
        $settings = [];

        foreach ($groups as $group) {
            $settings[$group] = Setting::where('group', $group)->get()
                ->mapWithKeys(fn ($s) => [$s->key => $s->value]);
        }

        return $this->success($settings, 'Pengaturan sistem.');
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.*' => ['nullable', 'string'],
        ]);

        foreach ($data['settings'] as $group => $values) {
            foreach ($values as $key => $value) {
                Setting::set($group, $key, $value);
            }
        }

        $this->audit->log('settings.updated', 'Setting', null, null, $data['settings'], $request->user());

        return $this->success(null, 'Pengaturan berhasil disimpan.');
    }

    public function uploadQrisImage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'qris_image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $old = Setting::get('payment', 'qris_image');
        if ($old) {
            Storage::disk('public')->delete($old);
        }

        $path = $data['qris_image']->store('qris', 'public');
        Setting::set('payment', 'qris_image', $path);

        $this->audit->log('settings.qris_image_updated', 'Setting', null, null, ['qris_image' => $path], $request->user());

        return $this->success([
            'qris_image' => url('storage/'.$path),
        ], 'Gambar QRIS berhasil diunggah.');
    }

    public function removeQrisImage(Request $request): JsonResponse
    {
        $old = Setting::get('payment', 'qris_image');
        if ($old) {
            Storage::disk('public')->delete($old);
        }

        Setting::set('payment', 'qris_image', '');

        $this->audit->log('settings.qris_image_removed', 'Setting', null, null, ['qris_image' => null], $request->user());

        return $this->success(null, 'Gambar QRIS berhasil dihapus.');
    }
}
