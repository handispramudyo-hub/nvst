<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestmentEarning extends Model
{
    use HasFactory;

    protected $fillable = [
        'investment_id',
        'user_id',
        'amount',
        'earning_date',
        'status',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'earning_date' => 'date',
            'meta' => 'array',
        ];
    }

    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
