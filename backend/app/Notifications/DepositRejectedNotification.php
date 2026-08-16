<?php

namespace App\Notifications;

use App\Models\Deposit;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DepositRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Deposit $deposit,
        private readonly ?string $note = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Deposit Ditolak',
            'body' => "Deposit Rp ".number_format($this->deposit->amount, 0, ',', '.')." ditolak. ".($this->note ? "Alasan: {$this->note}" : 'Silakan ajukan ulang.'),
            'icon' => 'x-circle',
            'type' => 'deposit',
            'data' => ['deposit_id' => $this->deposit->id],
        ];
    }
}
