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
        'reward' => 'decimal:4',
    ];

    /**
     * Get all submissions for this task.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(TaskSubmission::class);
    }

    /**
     * Check if user has completed (submitted) this task.
     */
    public function isCompletedBy(int $userId): bool
    {
        return $this->submissions()
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Check if user has claimed reward for this task.
     */
    public function isClaimedBy(int $userId): bool
    {
        return $this->submissions()
            ->where('user_id', $userId)
            ->where('is_claimed', true)
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

    /**
     * Check if this is a daily task.
     */
    public function isDaily(): bool
    {
        return $this->category === 'daily';
    }

    /**
     * Check if task can be reset for user.
     */
    public function canBeResetFor(int $userId): bool
    {
        if (!$this->isDaily()) {
            return false;
        }
        
        $submission = $this->getUserSubmission($userId);
        
        if (!$submission || !$submission->isClaimed()) {
            return false;
        }
        
        return $submission->canBeReset();
    }
}
