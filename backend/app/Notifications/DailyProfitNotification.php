<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DailyProfitNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly float $amount,
        private readonly string $date,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Profit Harian',
            'body' => "Profit hari ini ({$this->date}) sebesar Rp ".number_format($this->amount, 0, ',', '.')." telah ditambahkan ke saldo anda.",
            'icon' => 'coins',
            'type' => 'profit',
            'data' => [],
        ];
    }
}
