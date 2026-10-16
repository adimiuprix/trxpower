<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TelegramTaskController extends Controller
{
    public function index()
    {
        return Inertia::render('TaskPage');
    }
}
