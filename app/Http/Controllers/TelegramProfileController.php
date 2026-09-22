<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TelegramProfileController extends Controller
{
    /**
     * Update payout address for authenticated user
     */
    public function index(Request $request)
    {
        $finance = [
            'deposit' => 350.00056000,
            'withdrawable' => 12.00000000,
            'withdrawn' => 4.00000000,
            'mined' => 378.00000000
        ];

        return Inertia::render('ProfilePage', [
            'finance' => $finance
        ]);
    }
}