<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class TelegramUser extends Model
{
    use HasApiTokens, HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'telegram_id',
        'first_name',
        'last_name',
        'username',
        'language_code',
        'is_premium',
        'photo_url',
        'last_active_at',
        'balance',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'telegram_id' => 'integer',
        'is_premium' => 'boolean',
        'last_active_at' => 'datetime',
        'balance' => 'decimal:8',
    ];

    /**
     * Find user by Telegram ID
     */
    public static function findByTelegramId(int $telegramId): ?self
    {
        return static::where('telegram_id', $telegramId)->first();
    }

    /**
     * Create or update user from Telegram data
     */
    public static function createOrUpdateFromTelegram(array $userData): self
    {
        return static::updateOrCreate(
            ['telegram_id' => $userData['id']],
            [
                'first_name' => $userData['firstName'],
                'last_name' => $userData['lastName'] ?? null,
                'username' => $userData['username'] ?? null,
                'language_code' => $userData['languageCode'] ?? null,
                'is_premium' => $userData['isPremium'] ?? false,
                'photo_url' => $userData['photoUrl'] ?? null,
                'last_active_at' => now(),
                'balance' => 0,
            ]
        );
    }

    /**
     * Update last active timestamp
     */
    public function updateLastActive(): void
    {
        $this->update(['last_active_at' => now()]);
    }
}
