<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tasks = [
            [
                'title' => 'Daily Check-in',
                'description' => 'Check in daily to earn rewards',
                'category' => 'daily',
                'image' => 'Gift',
                'reward' => 1,
                'task_url' => null,
            ],
            [
                'title' => 'Watch Ads',
                'description' => 'Watch ads for earn more rewards',
                'category' => 'ads',
                'image' => 'Television',
                'reward' => 1,
                'task_url' => null,
            ],
            [
                'title' => 'Join Telegram Channel',
                'description' => 'Join our official Telegram channel',
                'category' => 'social',
                'image' => 'MessageCircle',
                'reward' => 1,
                'task_url' => 'https://t.me/trongram_channel',
            ],
            [
                'title' => 'Invite 5 Friends',
                'description' => 'Invite 5 friends to join TRX Power',
                'category' => 'referral',
                'image' => 'Users',
                'reward' => 2,
                'task_url' => null,
            ],
            [
                'title' => 'First Deposit Bonus',
                'description' => 'Make your first USDT deposit',
                'category' => 'special',
                'image' => 'DollarSign',
                'reward' => 3,
                'task_url' => null,
            ],
        ];

        foreach ($tasks as $task) {
            \App\Models\Task::create($task);
        }
    }
}
