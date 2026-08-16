<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['phone' => '081111111111'],
            [
                'name' => 'Administrator',
                'email' => 'admin@nivest.id',
                'password' => 'password',
                'pin' => '123456',
                'phone_verified_at' => now(),
                'is_active' => true,
                'referral_code' => User::generateReferralCode(),
            ],
        );

        $admin->assignRole('super_admin');
    }
}
