<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Withdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'withdrawal_no',
        'user_id',
        'amount',
        'fee',
        'final_amount',
        'account_type',
        'provider',
        'account_name',
        'account_number',
        'status',
        'admin_id',
        'admin_note',
        'idempotency_key',
        'submitted_at',
        'processed_at',
        'approved_at',
        'rejected_at',
        'completed_at',
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'fee' => 'decimal:2',
            'final_amount' => 'decimal:2',
            'submitted_at' => 'datetime',
            'processed_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
