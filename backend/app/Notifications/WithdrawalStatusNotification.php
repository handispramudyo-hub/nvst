<?php

namespace App\Notifications;

use App\Models\Withdrawal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WithdrawalStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Withdrawal $withdrawal,
        private readonly string $message,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Penarikan '.ucfirst($this->withdrawal->status),
            'body' => $this->message.' ('.$this->withdrawal->withdrawal_no.')',
            'icon' => 'banknote',
            'type' => 'withdrawal',
            'data' => ['withdrawal_id' => $this->withdrawal->id],
        ];
    }
}
