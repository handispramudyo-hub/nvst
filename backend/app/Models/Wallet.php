<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'total_deposited',
        'total_invested',
        'total_withdrawn',
        'total_profit',
        'total_commission',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'total_deposited' => 'decimal:2',
            'total_invested' => 'decimal:2',
            'total_withdrawn' => 'decimal:2',
            'total_profit' => 'decimal:2',
            'total_commission' => 'decimal:2',
            'version' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }
}
