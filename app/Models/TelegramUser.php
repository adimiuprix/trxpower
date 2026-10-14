<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
        'deposit_balance',
        'mined',
        'payout_address',
        'earning',
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
     * 
     * @param array $userData User data from Telegram
     * @param string|null $referralCode Referral code from start_param
     * @return self
     */
    public static function createOrUpdateFromTelegram(array $userData, ?string $referralCode = null): self
    {
        // Find referrer if referral code provided
        $referrerId = null;
        if ($referralCode) {
            $referrer = static::where('referral_code', $referralCode)->first();
            if ($referrer && $referrer->telegram_id !== $userData['id']) {
                // Valid referrer found (and not self-referral)
                $referrerId = $referrer->id;
            }
        }

        // Use updateOrCreate untuk handle race condition dengan atomic operation
        $user = static::updateOrCreate(
            ['telegram_id' => $userData['id']], // Unique key untuk find
            [
                // Data yang akan di-update (atau diset saat create)
                'first_name'     => $userData['firstName'],
                'last_name'      => $userData['lastName'] ?? null,
                'username'       => $userData['username'] ?? null,
                'language_code'  => $userData['languageCode'] ?? null,
                'is_premium'     => $userData['isPremium'] ?? false,
                'photo_url'      => $userData['photoUrl'] ?? null,
                'referral_code'  => str()->random(8),
                'last_active_at' => now(),
            ]
        );

        // Set referred_by ONLY for NEW users
        if ($user->wasRecentlyCreated) {
            $user->update([
                'referred_by' => $referrerId ?? 0, // Default 0 if no referrer
            ]);

            // Increment referrer's total_referrals
            if ($referrerId) {
                DB::table('telegram_users')
                    ->where('id', $referrerId)
                    ->increment('total_referrals');

                Log::info('New user referred', [
                    'new_user_id' => $user->id,
                    'new_user_telegram_id' => $user->telegram_id,
                    'referred_by_id' => $referrerId,
                    'referral_code' => $referralCode,
                ]);
            }
        }

        // Generate referral code hanya untuk user baru
        if ($user->wasRecentlyCreated && empty($user->referral_code)) {
            $user->update([
                'referral_code' => static::generateReferralCode(),
            ]);
        }

        // Set default balance untuk user baru (jika belum ada)
        if ($user->wasRecentlyCreated) {
            $user->update([
                'balance' => $user->balance ?? 0,
                'wallet_balance' => $user->wallet_balance ?? 0,
            ]);
        }

        return $user->fresh(); // Refresh untuk get latest data
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

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'user_id');
    }

    public function deposits()
    {
        return $this->hasMany(Deposit::class, 'user_id');
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
        
        $this->miningHistories()
            ->active()
            ->where('expire_date', '<=', $currentTime)
            ->update(['status' => 'inactive']);
    }

    public function totalWithdraw()
    {
        return $this->transactions()
            ->withdrawals()
            ->completed()
            ->sum('amount');
    }

    /**
     * Get total deposit (completed only)
     */
    public function totalDeposit()
    {
        return $this->transactions()
            ->deposits()
            ->completed()
            ->sum('amount');
    }

    /**
     * Get total mining rewards (completed only)
     */
    public function totalMiningRewards()
    {
        return $this->transactions()
            ->mining()
            ->completed()
            ->sum('amount');
    }

    /**
     * Get pending withdraw amount
     */
    public function pendingWithdraw()
    {
        return $this->transactions()
            ->withdrawals()
            ->pending()
            ->sum('amount');
    }

    /**
     * Get all transaction statistics
     */
    public function getTransactionStats(): array
    {
        return [
            'total_withdraw' => (float) $this->totalWithdraw(),
            'total_deposit' => (float) $this->totalDeposit(),
            'total_mining' => (float) $this->totalMiningRewards(),
            'pending_withdraw' => (float) $this->pendingWithdraw(),
        ];
    }
}
