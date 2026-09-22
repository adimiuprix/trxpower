<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TelegramProfileController extends Controller
{
    public function index()
    {
        return Inertia::render('ProfilePage');
    }
}