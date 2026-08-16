<?php

namespace App\Notifications;

use App\Models\Deposit;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DepositApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Deposit $deposit) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Deposit Disetujui',
            'body' => "Deposit Rp ".number_format($this->deposit->amount, 0, ',', '.')." telah disetujui dan masuk ke saldo anda.",
            'icon' => 'check-circle',
            'type' => 'deposit',
            'data' => ['deposit_id' => $this->deposit->id],
        ];
    }
}
