<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskSubmission extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'task_id',
        'is_claimed',
        'claimed_at'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_claimed' => 'boolean',
        'claimed_at' => 'integer', // Unix timestamp
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that submitted this task.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(TelegramUser::class, 'user_id');
    }

    /**
     * Get the task that was submitted.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Check if submission is claimed.
     */
    public function isClaimed(): bool
    {
        return $this->is_claimed;
    }

    /**
     * Mark as claimed with timestamp.
     */
    public function markAsClaimed(): void
    {
        $this->update([
            'is_claimed' => true,
            'claimed_at' => time(), // Unix timestamp
        ]);
    }

    /**
     * Scope for unclaimed submissions.
     */
    public function scopeUnclaimed($query)
    {
        return $query->where('is_claimed', false);
    }

    /**
     * Scope for claimed submissions.
     */
    public function scopeClaimed($query)
    {
        return $query->where('is_claimed', true);
    }

    /**
     * Scope for specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Check if submission can be reset (for daily tasks).
     * Returns true if claimed more than 24 hours ago.
     */
    public function canBeReset(): bool
    {
        if (!$this->isClaimed() || !$this->claimed_at) {
            return false;
        }
        
        // Check if 24 hours (86400 seconds) have passed
        $hoursSinceClaim = (time() - $this->claimed_at) / 3600;
        return $hoursSinceClaim >= 24;
    }

    /**
     * Get hours remaining until task can be reset.
     * Returns 0 if already resettable.
     */
    public function hoursUntilReset(): float
    {
        if (!$this->claimed_at) {
            return 0;
        }
        
        $secondsSinceClaim = time() - $this->claimed_at;
        $secondsRemaining = 86400 - $secondsSinceClaim; // 24 hours = 86400 seconds
        
        return max(0, $secondsRemaining / 3600);
    }

    /**
     * Get next reset timestamp (Unix timestamp).
     */
    public function getNextResetTimestamp(): ?int
    {
        if (!$this->claimed_at) {
            return null;
        }
        
        return $this->claimed_at + 86400; // +24 hours
    }

    /**
     * Reset submission for daily tasks.
     */
    public function reset(): void
    {
        $this->update([
            'is_claimed' => false,
            'claimed_at' => null,
        ]);
    }

    /**
     * Scope for submissions that can be reset.
     * Finds submissions claimed more than 24 hours ago.
     */
    public function scopeResettable($query)
    {
        $twentyFourHoursAgo = time() - 86400;
        
        return $query->where('is_claimed', true)
                     ->where('claimed_at', '<=', $twentyFourHoursAgo);
    }
}
