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
            'depositAddress' => $depositAddress
        ]);
    }
}
