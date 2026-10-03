<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deposit extends Model
{
    protected $fillable = [
        'user_id',
        'tx_hash',
        'from_address',
        'to_address',
        'amount_usdt',
        'exact_amount_sent',
        'amount_trx',
        'exchange_rate',
        'status',
        'verified_at',
        'verification_data',
        'block_number',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'verification_data' => 'array',
        'amount_usdt' => 'decimal:8',
        'exact_amount_sent' => 'decimal:8',
        'amount_trx' => 'decimal:2',
        'exchange_rate' => 'decimal:4',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(TelegramUser::class, 'user_id');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'verified_at' => now(),
        ]);
    }

    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }
}

