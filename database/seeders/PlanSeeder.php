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
        $plans = [
            [
                'name' => 'TRX Basic',
                'price' => 10,
                'daily_profit' => 2.0,
                'daily_roi_percent' => 20,
                'duration' => 30,
                'hashrate' => 20,
                'badge_text' => 'POPULAR',
                'image_url' => '/plans/cpu-miner.jpg',
                'is_free' => false,
            ],
            [
                'name' => 'TRX Pro',
                'price' => 20,
                'daily_profit' => 5.0,
                'daily_roi_percent' => 22,
                'duration' => 30,
                'hashrate' => 60,
                'badge_text' => null,
                'image_url' => '/plans/turbo-gpu.jpg',
                'is_free' => false,
            ],
            [
                'name' => 'TRX Advanced',
                'price' => 50,
                'daily_profit' => 11.0,
                'daily_roi_percent' => 25,
                'duration' => 30,
                'hashrate' => 220,
                'badge_text' => null,
                'image_url' => '/plans/pro-gpu.jpg',
                'is_free' => false,
            ],
            [
                'name' => 'TRX Premium',
                'price' => 100,
                'daily_profit' => 22.0,
                'daily_roi_percent' => 28,
                'duration' => 30,
                'hashrate' => 650,
                'badge_text' => null,
                'image_url' => '/plans/asic-titan.jpg',
                'is_free' => false,
            ],
            [
                'name' => 'TRX Master',
                'price' => 200,
                'daily_profit' => 35.0,
                'daily_roi_percent' => 35,
                'duration' => 30,
                'hashrate' => 1800,
                'badge_text' => null,
                'image_url' => '/plans/quantum-cluster.jpg',
                'is_free' => false,
            ],
        ];

        foreach ($plans as $planData) {
            // Calculate earning_rate from daily_profit
            // earning_rate = daily_profit / 1440 (per minute rate, 1440 = 24 hours * 60 minutes)
            $planData['earning_rate'] = $planData['daily_profit'] / 1440;
            
            Plan::create($planData);
        }
    }
}
