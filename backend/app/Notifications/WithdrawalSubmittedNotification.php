<?php

namespace App\Notifications;

use App\Models\Withdrawal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WithdrawalSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Withdrawal $withdrawal) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Penarikan Diajukan',
            'body' => "Penarikan Rp ".number_format($this->withdrawal->final_amount, 0, ',', '.')." ke {$this->withdrawal->provider} telah diajukan dan menunggu proses admin.",
            'icon' => 'arrow-up-from-line',
            'type' => 'withdrawal',
            'data' => ['withdrawal_id' => $this->withdrawal->id],
        ];
    }
}
