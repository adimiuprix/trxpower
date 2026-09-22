<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TelegramHomeController extends Controller
{
    public function index()
    {
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

        return Inertia::render('HomePage', [
            'transactions' => $transactions,
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
