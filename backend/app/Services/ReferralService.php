<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\Investment;
use App\Models\Referral;
use App\Models\Setting;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Notifications\ReferralCommissionNotification;
use Illuminate\Support\Facades\DB;

class ReferralService
{
    public function __construct(
        private readonly WalletService $wallet,
        private readonly AuditService $audit,
    ) {}

    public function createReferral(User $referrer, User $referred): ?Referral
    {
        if ($referrer->id === $referred->id) {
            return null;
        }

        return Referral::firstOrCreate([
            'referrer_id' => $referrer->id,
            'referred_id' => $referred->id,
        ], [
            'status' => Referral::STATUS_PENDING,
            'commission_amount' => 0,
        ]);
    }

    /**
     * Credit referral commission when the referred user makes their
     * first successful investment. Safe to call multiple times; only
     * acts once when the referral transitions from pending to qualified.
     */
    public function handleFirstInvestment(Investment $investment): void
    {
        $referral = Referral::where('referred_id', $investment->user_id)
            ->where('status', Referral::STATUS_PENDING)
            ->first();

        if (!$referral) {
            return;
        }

        $percent = (float) Setting::get('referral', 'commission_percent', 5.0);
        $amount = round(((float) $investment->amount * $percent) / 100, 2);

        if ($amount <= 0) {
            return;
        }

        DB::transaction(function () use ($referral, $investment, $amount) {
            $locked = Referral::where('id', $referral->id)
                ->where('status', Referral::STATUS_PENDING)
                ->lockForUpdate()
                ->first();

            if (!$locked) {
                return;
            }

            $locked->update([
                'status' => Referral::STATUS_QUALIFIED,
                'investment_id' => $investment->id,
                'commission_amount' => $amount,
            ]);

            $this->wallet->credit(
                $locked->referrer,
                $amount,
                WalletTransaction::TYPE_COMMISSION,
                "Komisi referral dari {$locked->referred->name}",
                'Investment',
                $investment->id,
                ['referral_id' => $locked->id],
            );

            Commission::create([
                'user_id' => $locked->referrer_id,
                'referral_id' => $locked->id,
                'investment_id' => $investment->id,
                'amount' => $amount,
                'status' => Commission::STATUS_CREDITED,
                'credited_at' => now(),
            ]);

            $this->audit->log('referral.commission', 'Referral', $locked->id, null, [
                'amount' => $amount,
                'investment_id' => $investment->id,
            ]);

            $locked->referrer->notify(new ReferralCommissionNotification($amount, $locked->referred->name));
        });
    }
}
