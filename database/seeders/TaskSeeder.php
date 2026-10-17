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
                'reward' => 100,
                'task_url' => null,
            ],
            [
                'title' => 'Join Telegram Channel',
                'description' => 'Join our official Telegram channel',
                'category' => 'social',
                'image' => 'MessageCircle',
                'reward' => 500,
                'task_url' => 'https://t.me/trxpower',
            ],
            [
                'title' => 'Follow Twitter',
                'description' => 'Follow us on Twitter for updates',
                'category' => 'social',
                'image' => 'Twitter',
                'reward' => 500,
                'task_url' => 'https://twitter.com/trxpower',
            ],
            [
                'title' => 'Complete Mining Session',
                'description' => 'Complete a 24-hour mining session',
                'category' => 'mining',
                'image' => 'Zap',
                'reward' => 1000,
                'task_url' => null,
            ],
            [
                'title' => 'Invite 5 Friends',
                'description' => 'Invite 5 friends to join TRX Power',
                'category' => 'referral',
                'image' => 'Users',
                'reward' => 2500,
                'task_url' => null,
            ],
            [
                'title' => 'First Deposit Bonus',
                'description' => 'Make your first USDT deposit',
                'category' => 'special',
                'image' => 'DollarSign',
                'reward' => 5000,
                'task_url' => null,
            ],
        ];

        foreach ($tasks as $task) {
            \App\Models\Task::create($task);
        }
    }
}
