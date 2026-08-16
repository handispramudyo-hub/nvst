<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::set('payment', 'qris_payload', env('QRIS_STATIC_PAYLOAD', '00020101021126620014COM.NIVEST.WWW01189360000000000803010210NIVEST5204729953033605404535802ID5914NIVEST INDONESIA6011JAKARTA6304ABCD'));
        Setting::set('payment', 'merchant_name', 'NiVEST Indonesia');
        Setting::set('payment', 'min_deposit', '10000');
        Setting::set('payment', 'max_deposit', '1000000000');
        Setting::set('withdrawal', 'fee_flat', '0');
        Setting::set('withdrawal', 'fee_percent', '1.0');
        Setting::set('withdrawal', 'min_amount', '50000');
        Setting::set('withdrawal', 'max_amount', '100000000');
        Setting::set('referral', 'commission_percent', '5.0');
        Setting::set('general', 'app_name', 'NiVEST');
        Setting::set('general', 'currency', 'IDR');
        Setting::set('general', 'help_phone', '081234567890');
        Setting::set('general', 'help_email', 'support@nivest.id');
    }
}
