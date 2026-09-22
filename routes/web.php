<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TelegramHomeController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Inertia Pages
Route::get('/', [TelegramHomeController::class, 'index'])->name('home');
Route::inertia('/mine', 'MiningPage')->name('mine');
Route::inertia('/referral', 'ReferralPage')->name('referral');
Route::inertia('/profile', 'ProfilePage')->name('profile');
Route::inertia('/deposit', 'DepositPage')->name('deposit');

// Telegram Mini App Demo & Example
Route::inertia('/telegram-demo', 'TelegramDemo')->name('telegram.demo');
Route::inertia('/telegram-example', 'TelegramExample')->name('telegram.example');