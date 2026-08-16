<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Investment extends Model
{
    use HasFactory;

    protected $fillable = [
        'investment_no',
        'user_id',
        'project_id',
        'amount',
        'expected_return',
        'expected_return_amount',
        'daily_return_amount',
        'duration_days',
        'start_date',
        'maturity_date',
        'current_earnings',
        'status',
        'idempotency_key',
        'completed_at',
        'cancelled_at',
    ];

    public const STATUS_ACTIVE = 'active';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expected_return' => 'decimal:2',
            'expected_return_amount' => 'decimal:2',
            'daily_return_amount' => 'decimal:6',
            'current_earnings' => 'decimal:2',
            'duration_days' => 'integer',
            'start_date' => 'date',
            'maturity_date' => 'date',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(InvestmentEarning::class);
    }
}
