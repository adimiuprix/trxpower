<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Inertia\Inertia;

class TelegramMineController extends Controller
{
    public function index()
    {
        // ✅ Fetch plans dengan data yang diperlukan frontend
        // Gunakan select() untuk performance jika table besar
        $plans = Plan::select([
                'id',
                'name',
                'price',
                'daily_profit',
                'daily_roi_percent',
                'duration',
                'badge_text',
                'image_url',
            ])
            // ->where('is_active', true) // Uncomment jika ada is_active column
            ->orderBy('price', 'asc') // Urutkan dari termurah
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'price' => number_format($plan->price, 2), // Format untuk display
                    'price_raw' => (float) $plan->price, // Keep raw value for calculations
                    'daily_profit' => number_format($plan->daily_profit, 2),
                    'daily_profit_raw' => (float) $plan->daily_profit,
                    'daily_roi_percent' => number_format($plan->daily_roi_percent, 2),
                    'duration' => $plan->duration,
                    'badge' => $plan->badge_text, // "POPULAR", etc
                    'image' => $plan->image_url ?? '/plans/default.jpg',
                    'total_return' => number_format($plan->daily_profit * $plan->duration, 2),
                ];
            });

        return Inertia::render('MiningPage', [
            'plans' => $plans,
        ]);
    }
}
