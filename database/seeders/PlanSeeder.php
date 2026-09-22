<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::insert([
            [
                'name' => 'TRX Basic',
                'price' => 10,
                'earning_rate' => 0,
                'daily_profit' => 2.0,
                'daily_roi_percent' => 20,
                'duration' => 30,
                'hashrate' => '20 GH/s',
                'badge_text' => 'POPULAR',
                'image_url' => '/plans/cpu-miner.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'TRX Pro',
                'price' => 20,
                'earning_rate' => 0,
                'daily_profit' => 5.0,
                'daily_roi_percent' => 22,
                'duration' => 30,
                'hashrate' => '60 GH/s',
                'badge_text' => null,
                'image_url' => '/plans/turbo-gpu.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'TRX Advanced',
                'price' => 50,
                'earning_rate' => 0,
                'daily_profit' => 11.0,
                'daily_roi_percent' => 25,
                'duration' => 30,
                'hashrate' => '220 GH/s',
                'badge_text' => null,
                'image_url' => '/plans/pro-gpu.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'TRX Premium',
                'price' => 100,
                'earning_rate' => 0,
                'daily_profit' => 22.0,
                'daily_roi_percent' => 28,
                'duration' => 30,
                'hashrate' => '650 GH/s',
                'badge_text' => null,
                'image_url' => '/plans/asic-titan.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'TRX Master',
                'price' => 200,
                'earning_rate' => 0,
                'daily_profit' => 35.0,
                'daily_roi_percent' => 35,
                'duration' => 30,
                'hashrate' => '1,800 GH/s',
                'badge_text' => null,
                'image_url' => '/plans/quantum-cluster.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
