<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'password',
        'pin',
        'profile_photo',
        'phone_verified_at',
        'is_active',
        'referral_code',
        'referred_by_id',
    ];

    protected $hidden = [
        'password',
        'pin',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'phone_verified_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
            'pin' => 'hashed',
        ];
    }

    public function wallet(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function walletTransactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function deposits(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    public function withdrawals(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function investments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Investment::class);
    }

    public function withdrawalAccounts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(WithdrawalAccount::class);
    }

    public function referralsMade(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referredBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by_id');
    }

    public function referrer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by_id');
    }

    public function referralRecord(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Referral::class, 'referred_id');
    }

    public function commissions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Commission::class);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(['super_admin', 'admin']);
    }

    public static function generateReferralCode(int $length = 8): string
    {
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, $length));
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }
}
