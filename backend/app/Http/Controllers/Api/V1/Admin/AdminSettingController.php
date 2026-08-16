<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
}
