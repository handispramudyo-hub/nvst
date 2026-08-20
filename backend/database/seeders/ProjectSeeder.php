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
                'name' => 'Jalan Tol Pekanbaru-Kandis-Dumai',
                'category' => 'Jalan dan Jembatan',
                'description' => 'Pembangunan jalan tol sepanjang 131 km menghubungkan Pekanbaru, Kandis, dan Dumai di Provinsi Riau. Proyek strategis nasional untuk mendukung konektivitas kawasan industri minyak dan gas.',
                'min_investment' => 100000,
                'max_investment' => 50000000,
                'estimated_return' => 2.5,
                'duration_days' => 365,
                'risk_level' => 'medium',
                'funding_target' => 500000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => true,
                'terms' => 'Dana dialokasikan untuk konstruksi jalan tol. Investor menerima bagi hasil harian selama masa proyek.',
                'risk_disclosure' => 'Investasi infrastruktur memiliki risiko perpanjangan jadwal dan perubahan regulasi pemerintah.',
            ],
            [
                'name' => 'Jalan Tol Medan-Kualanamu-Tebing Tinggi',
                'category' => 'Jalan dan Jembatan',
                'description' => 'Pembangunan jalan tol sepanjang 62 km menghubungkan Kota Medan, Bandara Kualanamu, dan Kota Tebing Tinggi di Sumatera Utara.',
                'min_investment' => 100000,
                'max_investment' => 50000000,
                'estimated_return' => 2.5,
                'duration_days' => 300,
                'risk_level' => 'medium',
                'funding_target' => 350000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => true,
                'terms' => 'Investasi dialokasikan untuk pembangunan infrastruktur jalan tol trans-Sumatera.',
                'risk_disclosure' => 'Risiko perubahan kebijakan pemerintah daerah dan proses pembebasan lahan.',
            ],
            [
                'name' => 'Jalan Tol Binjai-Langsa',
                'category' => 'Jalan dan Jembatan',
                'description' => 'Pembangunan jalan tol sepanjang 128 km di Sumatera Utara menghubungkan Kota Binjai hingga Langsa, Aceh. Bagian dari koridor tol trans-Sumatera.',
                'min_investment' => 100000,
                'max_investment' => 50000000,
                'estimated_return' => 2.5,
                'duration_days' => 330,
                'risk_level' => 'medium',
                'funding_target' => 450000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => false,
                'terms' => 'Proyek KPBU dengan jaminan ketersediaan pelayanan dari pemerintah.',
                'risk_disclosure' => 'Risiko tingkat lalu lintas yang belum sesuai proyeksi dan perubahan tarif.',
            ],
            [
                'name' => 'Jalan Tol Palembang-Indralaya',
                'category' => 'Jalan dan Jembatan',
                'description' => 'Pembangunan jalan tol sepanjang 22 km menghubungkan Kota Palembang dengan Kabupaten Ogan Ilir di Sumatera Selatan.',
                'min_investment' => 100000,
                'max_investment' => 50000000,
                'estimated_return' => 2.5,
                'duration_days' => 240,
                'risk_level' => 'medium',
                'funding_target' => 300000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => false,
                'terms' => 'Dana digunakan untuk konstruksi dan pengelolaan jalan tol.',
                'risk_disclosure' => 'Risiko pendapatan toll road bergantung pada volume lalu lintas aktual.',
            ],
            [
                'name' => 'Jalan Tol Terbanggi Besar-Pematang Panggang-Kayu Agung',
                'category' => 'Jalan dan Jembatan',
                'description' => 'Pembangunan jalan tol sepanjang 111 km di Sumatera Selatan sebagai bagian dari ruas Lampung-Palembang.',
                'min_investment' => 100000,
                'max_investment' => 50000000,
                'estimated_return' => 2.5,
                'duration_days' => 300,
                'risk_level' => 'medium',
                'funding_target' => 400000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => true,
                'terms' => 'Investasi untuk pembangunan infrastruktur jalan tol trans-Sumatera selatan.',
                'risk_disclosure' => 'Risiko perubahan tarif tol dan volume lalu lintas yang fluktuatif.',
            ],
            [
                'name' => 'Jalan Tol Sigli-Banda Aceh',
                'category' => 'Jalan dan Jembatan',
                'description' => 'Pembangunan jalan tol sepanjang 138 km di Provinsi Aceh menghubungkan Kota Sigli hingga Banda Aceh.',
                'min_investment' => 100000,
                'max_investment' => 50000000,
                'estimated_return' => 2.5,
                'duration_days' => 365,
                'risk_level' => 'medium',
                'funding_target' => 450000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => false,
                'terms' => 'Proyek infrastruktur strategis Aceh dengan jaminanavailability payment dari pemerintah.',
                'risk_disclosure' => 'Risiko perpanjangan jadwal konstruksi dan kondisi geografis challenging.',
            ],
            [
                'name' => 'Jalan Tol Manado-Bitung',
                'category' => 'Jalan dan Jembatan',
                'description' => 'Pembangunan jalan tol sepanjang 39 km menghubungkan Kota Manado dengan Kota Bitung di Sulawesi Utara.',
                'min_investment' => 100000,
                'max_investment' => 50000000,
                'estimated_return' => 2.5,
                'duration_days' => 210,
                'risk_level' => 'medium',
                'funding_target' => 300000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => true,
                'terms' => 'Dana untuk konstruksi jalan tol Sulawesi utara yang menghubungkan kawasan industri.',
                'risk_disclosure' => 'Risiko aktivitas gunung berapi dan kondisi tanah vulkanik di sepanjang koridor.',
            ],
            [
                'name' => 'SPAM Bandar Lampung',
                'category' => 'Permukiman',
                'description' => 'Pembangunan sistem penyediaan air minum (SPAM) regional untuk memenuhi kebutuhan air bersih masyarakat Bandar Lampung dan sekitarnya.',
                'min_investment' => 100000,
                'max_investment' => 50000000,
                'estimated_return' => 2.5,
                'duration_days' => 180,
                'risk_level' => 'low',
                'funding_target' => 150000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => false,
                'terms' => 'Pendapatan dari tarif air minum yang dibayarkan oleh pelanggan PDAM.',
                'risk_disclosure' => 'Risiko perubahan tarif air oleh pemerintah dan tingkat kolektibilitas pelanggan.',
            ],
            [
                'name' => 'KPBU Estuary Dam Teluk Bintan & SPAM',
                'category' => 'Sumber Daya Air',
                'description' => 'Pembangunan bendungan multiguna di Teluk Bintan, Kepulauan Riau untuk ketahanan air baku dan pengembangan SPAM regional.',
                'min_investment' => 100000,
                'max_investment' => 50000000,
                'estimated_return' => 2.5,
                'duration_days' => 365,
                'risk_level' => 'medium',
                'funding_target' => 500000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => true,
                'terms' => 'Proyek KPBU dengan skema availability payment dari pemerintah pusat.',
                'risk_disclosure' => 'Risiko perubahan regulasi tata ruang dan dampak lingkungan.',
            ],
            [
                'name' => 'PSEL Sarbagita',
                'category' => 'Permukiman',
                'description' => 'Pembangunan pembangkit listrik tenaga sampah (waste-to-energy) di Sarbagita, Bali untuk mengolah sampah menjadi energi listrik.',
                'min_investment' => 100000,
                'max_investment' => 50000000,
                'estimated_return' => 2.5,
                'duration_days' => 200,
                'risk_level' => 'high',
                'funding_target' => 250000000,
                'status' => Project::STATUS_OPEN,
                'is_featured' => false,
                'terms' => 'Pendapatan dari penjualan listrik ke PLN dan tarif pengolahan sampah.',
                'risk_disclosure' => 'Risiko teknis pengolahan sampah dan perubahan regulasi energi terbarukan.',
            ],
        ];

        foreach ($projects as $data) {
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
