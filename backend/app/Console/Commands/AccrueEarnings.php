<?php

namespace App\Console\Commands;

use App\Services\EarningService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AccrueEarnings extends Command
{
    protected $signature = 'earnings:accrue {--date=}';

    protected $description = 'Akrual profit harian untuk semua investasi aktif dan kirim notifikasi ringkasan';

    public function handle(EarningService $service): int
    {
        $date = $this->option('date') ? \Carbon\Carbon::parse($this->option('date')) : now();

        $this->info('Mulai akrual profit untuk '.$date->toDateString());

        $credited = $service->accrueDaily($date);

        if ($date->isToday() || $this->option('date')) {
            $notified = $service->notifyDailyProfits($date);
            $this->info("{$credited} earning di-credit, {$notified} user dinotifikasi.");
        }

        if ($credited > 0) {
            Log::channel('stack')->info('Earnings accrued', ['date' => $date->toDateString(), 'count' => $credited]);
        }

        return self::SUCCESS;
    }
}
