<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditService
{
    public function log(
        string $action,
        ?string $entity = null,
        ?int $entityId = null,
        ?array $oldValue = null,
        ?array $newValue = null,
        ?User $user = null,
        ?Request $request = null,
    ): AuditLog {
        $request ??= request();
        $user ??= $request?->user();

        return AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'entity' => $entity,
            'entity_id' => $entityId,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'ip_address' => $request?->ip(),
            'user_agent' => $request ? substr($request->userAgent() ?? '', 0, 255) : null,
            'created_at' => now(),
        ]);
    }
}
