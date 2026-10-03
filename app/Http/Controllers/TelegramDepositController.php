<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TelegramDepositController extends Controller
{
    public function index()
    {
        return Inertia::render('DepositPage', [
            'exchangeRate' => config('services.polygonscan.exchange_rate', 3),
            'depositAddress' => config('services.polygonscan.deposit_wallet'),
            'depositPreset' => [
                ['value' => 1, 'label' => '$1', 'subLabel' => '1 USDT'],
                ['value' => 3, 'label' => '$3', 'subLabel' => '3 USDT'],
                ['value' => 5, 'label' => '$5', 'subLabel' => '5 USDT'],
                ['value' => 10, 'label' => '$10', 'subLabel' => '10 USDT'],
            ],
        ]);
    }
}
