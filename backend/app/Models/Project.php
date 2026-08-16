<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'category',
        'min_investment',
        'max_investment',
        'estimated_return',
        'duration_days',
        'risk_level',
        'start_date',
        'end_date',
        'funding_target',
        'current_funding',
        'status',
        'terms',
        'risk_disclosure',
        'is_featured',
        'created_by',
    ];

    public const STATUS_DRAFT = 'draft';
    public const STATUS_OPEN = 'open';
    public const STATUS_FULLY_FUNDED = 'fully_funded';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CLOSED = 'closed';

    protected function casts(): array
    {
        return [
            'min_investment' => 'decimal:2',
            'max_investment' => 'decimal:2',
            'estimated_return' => 'decimal:2',
            'funding_target' => 'decimal:2',
            'current_funding' => 'decimal:2',
            'duration_days' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
            'is_featured' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class);
    }

    public function getFundingProgressAttribute(): float
    {
        if (!$this->funding_target || $this->funding_target <= 0) {
            return 0;
        }

        return min(100, round(($this->current_funding / $this->funding_target) * 100, 2));
    }

    public function getIsInvestableAttribute(): bool
    {
        return in_array($this->status, [
            self::STATUS_OPEN,
            self::STATUS_FULLY_FUNDED,
            self::STATUS_ACTIVE,
        ]);
    }
}
