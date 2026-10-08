<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TelegramAuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
| All routes here are automatically prefixed with /api
|
*/

// Telegram Authentication API
Route::prefix('telegram')->name('telegram.')->group(function () {
    // Public endpoint - authentication with initData validation
    Route::post('/auth', [TelegramAuthController::class, 'authenticate'])->name('auth');
    
    // Protected endpoints - require Sanctum token
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [TelegramAuthController::class, 'me'])->name('me');
        Route::post('/claim', [TelegramAuthController::class, 'claim'])->name('claim');
        Route::post('/payout-address', [TelegramAuthController::class, 'updatePayoutAddress'])->name('payout-address.update');
        Route::post('/mining-purchase', [TelegramAuthController::class, 'puchase'])->name('puchase');
        Route::post('/verify-transaction', [TelegramAuthController::class, 'verifyDeposit'])->name('verify');
        Route::post('/withdraw', [TelegramAuthController::class, 'withdraw'])->name('withdraw');
        Route::post('/process-withdrawal/{transaction}', [TelegramAuthController::class, 'processWithdrawal'])->name('process-withdrawal');
        Route::post('/logout', [TelegramAuthController::class, 'logout'])->name('logout');
    });
});

// Example protected route
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
