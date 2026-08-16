<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtpVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone',
        'code',
        'purpose',
        'attempts',
        'expires_at',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'code' => 'hashed',
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }
}
