<?php

namespace Database\Seeders;

use App\Models\Deposit;
use App\Models\Project;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $referrer = User::firstOrCreate(
            ['phone' => '089999999999'],
            [
                'name' => 'Referrer Demo',
                'email' => 'referrer@nivest.id',
                'password' => 'password',
                'pin' => '123456',
                'phone_verified_at' => now(),
                'is_active' => true,
                'referral_code' => User::generateReferralCode(),
            ],
        );

        $user = User::firstOrCreate(
            ['phone' => '081234567890'],
            [
                'name' => 'User Demo',
                'email' => 'user@nivest.id',
                'password' => 'password',
                'pin' => '123456',
                'phone_verified_at' => now(),
                'is_active' => true,
                'referral_code' => User::generateReferralCode(),
                'referred_by_id' => $referrer->id,
            ],
        );

        $referrer->wallet()->updateOrCreate(
            ['user_id' => $referrer->id],
            ['balance' => 500000],
        );

        $user->wallet()->updateOrCreate(
            ['user_id' => $user->id],
            ['balance' => 2500000],
        );

        $wallet = $user->wallet;

        $walletTransactions = [
            ['type' => WalletTransaction::TYPE_DEPOSIT, 'amount' => 1000000, 'desc' => 'Deposit via QRIS'],
            ['type' => WalletTransaction::TYPE_DEPOSIT, 'amount' => 1500000, 'desc' => 'Deposit via QRIS'],
            ['type' => WalletTransaction::TYPE_INVESTMENT, 'amount' => -500000, 'desc' => 'Investasi proyek'],
        ];

        $balance = 0;
        foreach ($walletTransactions as $tx) {
            $balance += $tx['amount'];
            WalletTransaction::create([
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'tx_id' => str()->uuid(),
                'type' => $tx['type'],
                'amount' => $tx['amount'],
                'balance_before' => $balance - $tx['amount'],
                'balance_after' => $balance,
                'description' => $tx['desc'],
                'created_at' => now()->subDays(random_int(1, 30)),
            ]);
        }

        Deposit::create([
            'deposit_no' => 'DEP-'.strtoupper(str()->random(8)),
            'user_id' => $user->id,
            'amount' => 1000000,
            'payment_method' => 'qris',
            'status' => Deposit::STATUS_APPROVED,
            'approved_at' => now()->subDays(5),
        ]);
    }
}
