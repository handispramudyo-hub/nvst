<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(4)),
            'description' => fake()->paragraph(3),
            'category' => fake()->randomElement(['UMKM', 'Properti', 'Agrikultur', 'Energi', 'Teknologi']),
            'min_investment' => 100000,
            'max_investment' => 100000000,
            'estimated_return' => fake()->randomElement([1.5, 2.0, 2.5, 3.0, 4.0]),
            'duration_days' => fake()->randomElement([30, 60, 90, 180, 365]),
            'risk_level' => fake()->randomElement(['low', 'medium', 'high']),
            'start_date' => now()->subDay(),
            'end_date' => now()->addMonths(6),
            'funding_target' => 1000000000,
            'current_funding' => 0,
            'status' => 'open',
            'terms' => 'Dana investasi digunakan untuk modal usaha sesuai rencana bisnis.',
            'risk_disclosure' => 'Investasi memiliki risiko. Nilai investasi dapat turun maupun naik.',
            'is_featured' => false,
            'created_by' => User::factory(),
        ];
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => ['is_featured' => true]);
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'closed']);
    }
}
