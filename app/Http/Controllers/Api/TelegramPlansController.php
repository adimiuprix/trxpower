<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class TelegramPlansController extends Controller
{
    public function plans(): array
    {
        return [
            [
                'name' => 'TRX Basic',
                'image' => 'cpu-miner.jpg',
                'price' => 10,
                'in_usd' => 3.5,
                'daily_income' => 20, // inpercent
                'duration' => 30,
                'point_per_day' => 2.00000000,
                'profit' => 60 // duration * point per day
            ],
            [
                'name' => 'TRX Pro',
                'image' => 'turbo-gpu.jpg',
                'price' => 20,
                'in_usd' => 6.7,
                'daily_income' => 22,
                'duration' => 30,
                'point_per_day' => 5.00000000,
                'profit' => 60 // duration * point per day
            ]

        ];
    }
}