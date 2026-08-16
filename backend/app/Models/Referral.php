<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'referrer_id',
        'referred_id',
        'status',
        'investment_id',
        'commission_amount',
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_QUALIFIED = 'qualified';

    protected function casts(): array
    {
        return [
            'commission_amount' => 'decimal:2',
        ];
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referred(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }
}
