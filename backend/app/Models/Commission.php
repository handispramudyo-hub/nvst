<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Commission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'referral_id',
        'investment_id',
        'amount',
        'status',
        'credited_at',
    ];

    public const STATUS_CREDITED = 'credited';

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'credited_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }
}
