<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TelegramHomeController;
use App\Http\Controllers\TelegramMineController;
use App\Http\Controllers\TelegramProfileController;
use App\Http\Controllers\TelegramDepositController;

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
Route::get('/mine', [TelegramMineController::class, 'index'])->name('mine');
Route::inertia('/mining-active', 'MiningActivePage')->name('mining-active');
Route::inertia('/referral', 'ReferralPage')->name('referral');
Route::get('/profile', [TelegramProfileController::class, 'index'])->name('profile');
Route::get('/deposit', [TelegramDepositController::class, 'index'])->name('deposit');

// Telegram Mini App Demo & Example
Route::inertia('/telegram-demo', 'TelegramDemo')->name('telegram.demo');
Route::inertia('/telegram-example', 'TelegramExample')->name('telegram.example');