<?php

namespace App\Notifications;

use App\Models\Deposit;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DepositSubmittedNotification extends Notification implements ShouldQueue
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
            'title' => 'Deposit Diajukan',
            'body' => "Deposit Rp ".number_format($this->deposit->amount, 0, ',', '.')." (".$this->deposit->deposit_no.") telah diajukan. Menunggu verifikasi admin.",
            'icon' => 'arrow-down-to-line',
            'type' => 'deposit',
            'data' => ['deposit_id' => $this->deposit->id],
        ];
    }
}
