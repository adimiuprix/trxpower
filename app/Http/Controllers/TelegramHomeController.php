<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TelegramHomeController extends Controller
{
    public function index()
    {
        $user = auth('sanctum')->user();

        $transactions = Transaction::where('status', 'completed')
            ->latest()
            ->paginate(20)
            ->through(fn ($transaction) => [
                'id' => $transaction->id,
                'type' => $transaction->type,
                'amount' => number_format($transaction->amount, 8),
                'address' => $this->shortAddress($transaction->address),
                'tx_hash' => $this->shortAddress($transaction->tx_hash),
                'tx_hash_full' => $transaction->tx_hash,
                'status' => $transaction->status,
                'created_at' => $transaction->created_at->diffForHumans(),
            ]);

        // Get active mining histories with plan data
        $miningHistories = [];
        if ($user) {
            $miningHistories = $user->miningHistories()
                ->active()
                ->with('plan:id,earning_rate,daily_profit')
                ->get()
                ->map(fn ($history) => [
                    'id' => $history->id,
                    'plan_id' => $history->plan_id,
                    'status' => $history->status,
                    'last_sum' => $history->last_sum,
                    'expire_date' => $history->expire_date,
                    'created_at' => $history->created_at->toISOString(),
                    'plan' => [
                        'earning_rate' => (float) $history->plan->earning_rate,
                        'daily_profit' => (float) $history->plan->daily_profit,
                    ],
                ]);
        }

        return Inertia::render('HomePage', [
            'transactions' => $transactions,
            'miningHistories' => $miningHistories,
        ]);
    }

    function shortAddress(?string $value): string
    {
        return $value
            ? (string) Str::of($value)
                ->substr(0, 4)
                ->append('...')
                ->append(Str::of($value)->substr(-4))
            : '—';
    }
}
