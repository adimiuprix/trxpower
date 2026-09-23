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
        'referral_code',
        'referred_by',
        'total_referrals',
        'language_code',
        'is_premium',
        'photo_url',
        'last_active_at',
        'balance',
        'wallet_balance',
        'payout_address',
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
        'wallet_balance' => 'decimal:8',
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
        $existing = static::where('telegram_id', $userData['id'])->first();

        if ($existing) {
            // Update hanya profil, JANGAN overwrite balance
            $existing->update([
                'first_name'    => $userData['firstName'],
                'last_name'     => $userData['lastName'] ?? null,
                'username'      => $userData['username'] ?? null,
                'language_code' => $userData['languageCode'] ?? null,
                'is_premium'    => $userData['isPremium'] ?? false,
                'photo_url'     => $userData['photoUrl'] ?? null,
                'last_active_at' => now(),
            ]);
            return $existing;
        }

        // User baru: buat dengan balance awal 0 dan referral code otomatis
        return static::create([
            'telegram_id'    => $userData['id'],
            'first_name'     => $userData['firstName'],
            'last_name'      => $userData['lastName'] ?? null,
            'username'       => $userData['username'] ?? null,
            'referral_code'  => static::generateReferralCode(), // Auto-generate
            'language_code'  => $userData['languageCode'] ?? null,
            'is_premium'     => $userData['isPremium'] ?? false,
            'photo_url'      => $userData['photoUrl'] ?? null,
            'last_active_at' => now(),
            'balance'        => 0,
            'wallet_balance' => 0,
        ]);
    }

    /**
     * Update last active timestamp
     */
    public function updateLastActive(): void
    {
        $this->update(['last_active_at' => now()]);
    }

    /**
     * Generate unique referral code
     */
    public static function generateReferralCode(): string
    {
        do {
            // Format: TRX + 6 random alphanumeric (uppercase)
            $code = 'TRX' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Get the user who referred this user
     */
    public function referrer()
    {
        return $this->belongsTo(TelegramUser::class, 'referred_by');
    }

    /**
     * Get all users referred by this user
     */
    public function referrals()
    {
        return $this->hasMany(TelegramUser::class, 'referred_by');
    }

    /**
     * Increment referral count
     */
    public function incrementReferralCount(): void
    {
        $this->increment('total_referrals');
    }

    public function miningHistories()
    {
        return $this->hasMany(MiningHistory::class, 'user_id');
    }

    public function syncBalance(): void
    {
        $time = time();
        $activeHistories = $this->miningHistories()->active()->with('plan')->get();
        
        $activeHistories->each(function($history) use ($time) {
            $earnings = $history->calculateEarnings();
            $this->increment('balance', $earnings);
            $history->update(['last_sum' => $time]);
        });
    }

    public function expirePlans(): void
    {
        $currentTime = time();
        
        $expiredCount = $this->miningHistories()
            ->active()
            ->where('expire_date', '<=', $currentTime)
            ->update(['status' => 'inactive']);
    }
}
