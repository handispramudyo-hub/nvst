<?php

namespace App\Services;

use App\Models\CheckIn;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class CheckInService
{
    public function __construct(
        private readonly WalletService $wallet,
        private readonly AuditService $audit,
    ) {}

    public function checkIn(User $user): array
    {
        $today = now()->toDateString();

        $existing = CheckIn::where('user_id', $user->id)
            ->where('check_in_date', $today)
            ->first();

        if ($existing) {
            return [
                'success' => false,
                'message' => 'Anda sudah check-in hari ini.',
                'streak' => $existing->streak,
                'reward' => $existing->reward_amount,
            ];
        }

        $yesterday = now()->subDay()->toDateString();
        $yesterdayCheckIn = CheckIn::where('user_id', $user->id)
            ->where('check_in_date', $yesterday)
            ->first();

        $streak = $yesterdayCheckIn ? $yesterdayCheckIn->streak + 1 : 1;
        $reward = min($streak, 7) * 1000;

        return DB::transaction(function () use ($user, $today, $streak, $reward) {
            $checkIn = CheckIn::create([
                'user_id' => $user->id,
                'check_in_date' => $today,
                'streak' => $streak,
                'reward_amount' => $reward,
            ]);

            $this->wallet->credit(
                $user,
                $reward,
                WalletTransaction::TYPE_CHECKIN_BONUS,
                "Check-in hari ke-{$streak}",
            );

            $this->audit->log('checkin', 'User', $user->id, null, [
                'streak' => $streak,
                'reward' => $reward,
            ]);

            return [
                'success' => true,
                'message' => "Check-in berhasil! Anda mendapat Rp " . number_format($reward, 0, ',', '.'),
                'streak' => $streak,
                'reward' => $reward,
            ];
        });
    }

    public function status(User $user): array
    {
        $today = now()->toDateString();

        $todayCheckIn = CheckIn::where('user_id', $user->id)
            ->where('check_in_date', $today)
            ->first();

        $totalCheckIn = CheckIn::where('user_id', $user->id)->count();

        $yesterday = now()->subDay()->toDateString();
        $yesterdayCheckIn = CheckIn::where('user_id', $user->id)
            ->where('check_in_date', $yesterday)
            ->first();

        $currentStreak = $todayCheckIn
            ? $todayCheckIn->streak
            : ($yesterdayCheckIn ? $yesterdayCheckIn->streak : 0);

        return [
            'checked_in_today' => $todayCheckIn !== null,
            'current_streak' => $currentStreak,
            'total_checkins' => $totalCheckIn,
            'today_reward' => $todayCheckIn?->reward_amount ?? min($currentStreak + 1, 7) * 1000,
        ];
    }
}
