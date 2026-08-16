<?php

namespace App\Notifications;

use App\Models\Withdrawal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WithdrawalRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Withdrawal $withdrawal,
        private readonly ?string $note = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Penarikan Ditolak',
            'body' => "Penarikan Rp ".number_format($this->withdrawal->amount, 0, ',', '.')." ditolak. Dana telah dikembalikan ke saldo. ".($this->note ? "Alasan: {$this->note}" : ''),
            'icon' => 'x-circle',
            'type' => 'withdrawal',
            'data' => ['withdrawal_id' => $this->withdrawal->id],
        ];
    }
}
