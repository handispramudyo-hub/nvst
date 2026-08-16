<?php

namespace App\Notifications;

use App\Models\Investment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InvestmentCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Investment $investment) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Investasi Berhasil',
            'body' => "Investasi Rp ".number_format($this->investment->amount, 0, ',', '.')." di ".($this->investment->project?->name ?? 'Proyek')." berhasil dibuat.",
            'icon' => 'trending-up',
            'type' => 'investment',
            'data' => ['investment_id' => $this->investment->id],
        ];
    }
}
