<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TelegramDepositController extends Controller
{
    public function index()
    {
        $depositAddress = "0x65CD568D7068F20de91547E80A1A7212226AFGGG";

        return Inertia::render('DepositPage', [
            'exchangeRate' => 3,
            'depositAddress' => $depositAddress,
            'depositPreset' => [
                ['value' => 3, 'label' => '$3', 'subLabel' => '3 USDT'],
                ['value' => 5, 'label' => '$5', 'subLabel' => '5 USDT'],
                ['value' => 10, 'label' => '$10', 'subLabel' => '10 USDT'],
            ],
        ]);
    }
}
