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
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_claimed' => 'boolean',
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
     * Mark as claimed.
     */
    public function markAsClaimed(): void
    {
        $this->update(['is_claimed' => true]);
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
}
