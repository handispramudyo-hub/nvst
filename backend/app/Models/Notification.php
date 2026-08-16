<?php

namespace App\Models;

use Illuminate\Notifications\DatabaseNotification;

class Notification extends DatabaseNotification
{
    public function scopeForUser($query, int $userId)
    {
        return $query->where('notifiable_id', $userId)
            ->where('notifiable_type', \App\Models\User::class);
    }
}
