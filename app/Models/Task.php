<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'category',
        'image',
        'reward',
        'task_url',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'reward' => 'integer',
    ];

    /**
     * Get all submissions for this task.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(TaskSubmission::class);
    }

    /**
     * Check if user has completed this task.
     */
    public function isCompletedBy(int $userId): bool
    {
        return $this->submissions()
            ->where('user_id', $userId)
            ->where('status', 'approved')
            ->exists();
    }

    /**
     * Check if user has pending submission for this task.
     */
    public function hasPendingSubmission(int $userId): bool
    {
        return $this->submissions()
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->exists();
    }

    /**
     * Get user's submission for this task.
     */
    public function getUserSubmission(int $userId)
    {
        return $this->submissions()
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Scope for specific category.
     */
    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for tasks with minimum reward.
     */
    public function scopeMinReward($query, int $minReward)
    {
        return $query->where('reward', '>=', $minReward);
    }
}
