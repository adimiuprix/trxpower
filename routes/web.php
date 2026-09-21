<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'HomePage')->name('home');
Route::inertia('/mine', 'MiningPage')->name('mine');
Route::inertia('/referral', 'ReferralPage')->name('referral');
Route::inertia('/profile', 'ProfilePage')->name('profile');
Route::inertia('/deposit', 'DepositPage')->name('deposit');