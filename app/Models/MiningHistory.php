<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Factories\HasFactory, Model, Relations\BelongsTo, Builder};

class MiningHistory extends Model
{
    use HasFactory;

    protected $table = 'mining_histories';

    protected $fillable = ['user_id', 'plan_id', 'status', 'last_sum', 'expire_date'];

    protected $casts = ['expire_date' => 'integer', 'last_sum' => 'integer'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(TelegramUser::class, 'user_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    // Business Logic
    public function calculateEarnings(): float
    {
        // Get time elapsed in seconds
        $secondsElapsed = time() - ($this->last_sum ?? $this->created_at->timestamp);
        
        // Prevent negative earnings (shouldn't happen but safety check)
        if ($secondsElapsed < 0) {
            return 0;
        }
        
        // Convert seconds to minutes (since earning_rate is per minute)
        $minutesElapsed = $secondsElapsed / 60;
        
        // Calculate earnings: minutes * (TRX per minute)
        $earnings = $minutesElapsed * $this->plan->earning_rate;
        
        return max(0, $earnings); // Ensure non-negative
    }

}
