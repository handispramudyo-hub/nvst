<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReferralCommissionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly float $amount,
        private readonly string $referredName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Komisi Referral Masuk',
            'body' => "Anda menerima komisi referral Rp ".number_format($this->amount, 0, ',', '.')." dari investasi pertama {$this->referredName}.",
            'icon' => 'users',
            'type' => 'commission',
            'data' => [],
        ];
    }
}
