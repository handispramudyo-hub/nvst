<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SystemAnnouncementNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $title,
        private readonly string $body,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'icon' => 'megaphone',
            'type' => 'announcement',
            'data' => [],
        ];
    }
}
