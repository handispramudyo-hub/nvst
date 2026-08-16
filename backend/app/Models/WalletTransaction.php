<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'tx_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'description',
        'ref_type',
        'ref_id',
        'meta',
    ];

    public const TYPE_DEPOSIT = 'deposit';
    public const TYPE_INVESTMENT = 'investment';
    public const TYPE_WITHDRAWAL = 'withdrawal';
    public const TYPE_PROFIT = 'profit';
    public const TYPE_COMMISSION = 'commission';
    public const TYPE_ADJUSTMENT = 'adjustment';

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'meta' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo('reference', 'ref_type', 'ref_id');
    }
}
