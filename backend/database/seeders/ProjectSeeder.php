<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('phone', '081111111111')->first();

        $projects = [
            [
                'name' => 'Warung Kopi Nusantara',
                'category' => 'UMKM',
                'description' => 'Ekspansi warung kopi specialty ke 3 cabang baru di area perkotaan dengan sistem manajemen modern.',
                'min_investment' => 100000,
                'max_investment' => 50000000,
                'estimated_return' => 2.5,
                'duration_days' => 90,
                'risk_level' => 'medium',
                'funding_target' => 750000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => true,
                'terms' => 'Dana digunakan untuk ekspansi gerai, renovasi, dan modal kerja. Investor menerima bagi hasil harian.',
                'risk_disclosure' => 'Investasi pada UMKM memiliki risiko usaha. Tidak ada jaminan pengembalian modal.',
            ],
            [
                'name' => 'Sawah Hidroponik Modern',
                'category' => 'Agrikultur',
                'description' => 'Pengembangan pertanian hidroponik seluas 2 hektar dengan teknologi irigasi otomatis dan IoT.',
                'min_investment' => 250000,
                'max_investment' => 100000000,
                'estimated_return' => 3.0,
                'duration_days' => 180,
                'risk_level' => 'medium',
                'funding_target' => 1200000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => true,
                'terms' => 'Dana untuk pembangunan greenhouse dan instalasi sistem hidroponik.',
                'risk_disclosure' => 'Risiko gagal panen akibat cuaca dan hama tetap ada meskipun dengan teknologi.',
            ],
            [
                'name' => 'Properti Kos Mahasiswa',
                'category' => 'Properti',
                'description' => 'Pembangunan kos 3 lantai 30 kamar dekat kampus dengan tingkat okupansi tinggi.',
                'min_investment' => 1000000,
                'max_investment' => 250000000,
                'estimated_return' => 2.0,
                'duration_days' => 365,
                'risk_level' => 'low',
                'funding_target' => 3500000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => false,
                'terms' => 'Pendapatan berasal dari sewa kamar kos dengan proyeksi okupansi 90%.',
                'risk_disclosure' => 'Risiko penurunan okupansi dan perawatan bangunan menjadi tanggungan bersama.',
            ],
            [
                'name' => 'Panel Surya Komunitas',
                'category' => 'Energi',
                'description' => 'Pemasangan panel surya 200 kWp untuk menyuplai energi listrik komunitas desa.',
                'min_investment' => 500000,
                'max_investment' => 150000000,
                'estimated_return' => 4.0,
                'duration_days' => 60,
                'risk_level' => 'high',
                'funding_target' => 2500000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => true,
                'terms' => 'Pendapatan dari penjualan listrik dan insentif energi terbarukan.',
                'risk_disclosure' => 'Risiko teknis instalasi dan perubahan regulasi energi dapat mempengaruhi hasil.',
            ],
            [
                'name' => 'Logistik Cold Chain',
                'category' => 'Teknologi',
                'description' => 'Membangun jaringan distribusi rantai dingin dengan tracking IoT untuk produk segar.',
                'min_investment' => 100000,
                'max_investment' => 75000000,
                'estimated_return' => 1.5,
                'duration_days' => 30,
                'risk_level' => 'medium',
                'funding_target' => 800000000,
                'status' => Project::STATUS_CLOSED,
                'is_featured' => false,
                'terms' => 'Proyek telah ditutup untuk pendaftaran investor baru.',
                'risk_disclosure' => 'Investasi memiliki risiko. Baca disclosure risiko sebelum berinvestasi.',
            ],
            [
                'name' => 'Aplikasi Pembayaran UMKM',
                'category' => 'Teknologi',
                'description' => 'Pengembangan aplikasi kasir digital dan pembayaran QRIS untuk UMKM pasar tradisional.',
                'min_investment' => 200000,
                'max_investment' => 120000000,
                'estimated_return' => 2.2,
                'duration_days' => 120,
                'risk_level' => 'high',
                'funding_target' => 1500000000,
                'current_funding' => 1500000000,
                'status' => Project::STATUS_FULLY_FUNDED,
                'is_featured' => true,
                'terms' => 'Pendapatan dari fee transaksi dan subscription merchant.',
                'risk_disclosure' => 'Risiko kompetisi pasar dan adopsi pengguna sangat tinggi.',
            ],
        ];

        foreach ($projects as $index => $data) {
            $slugBase = str()->slug($data['name']);
            $existing = Project::where('slug', $slugBase)->first();

            if ($existing) {
                continue;
            }

            $startDate = now()->subDays(random_int(0, 10));

            Project::create(array_merge($data, [
                'slug' => $slugBase,
                'start_date' => $startDate,
                'end_date' => $startDate->copy()->addDays($data['duration_days'] + random_int(30, 90)),
                'created_by' => $admin?->id,
                'image' => null,
            ]));
        }
    }
}
