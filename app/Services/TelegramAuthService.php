<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class TelegramAuthService
{
    /**
     * Validate Telegram WebApp initData
     * 
     * @param string $initData Raw initData string from Telegram WebApp
     * @return bool True if valid, false otherwise
     */
    public function validateInitData(string $initData): bool
    {
        // 1. Bypass untuk local developer mock data
        if (app()->environment('local') && str_contains($initData, 'mock_hash_developer')) {
            Log::info('Telegram auth: Bypassing signature validation for local mock data');
            return true;
        }

        $botToken = config('services.telegram.token');

        if (empty($botToken)) {
            if (app()->environment('local')) {
                Log::warning('Telegram bot token not configured in .env (TELEGRAM_BOT_TOKEN). Allowing local dev auth.');
                return true;
            }

            Log::error('Telegram bot token not configured');
            return false;
        }

        // Parse initData string
        parse_str($initData, $data);

        if (!isset($data['hash'])) {
            Log::warning('Telegram initData missing hash');
            return false;
        }

        // Extract and remove hash
        $receivedHash = $data['hash'];
        unset($data['hash']);

        // Check auth_date (prevent replay attacks)
        if (isset($data['auth_date'])) {
            $authDate = (int) $data['auth_date'];
            $maxAge = config('telegram.init_data_max_age', 86400);
            
            if (time() - $authDate > $maxAge) {
                Log::warning('Telegram initData expired', [
                    'auth_date' => $authDate,
                    'current_time' => time(),
                ]);
                return false;
            }
        }

        // Sort data by key
        ksort($data);

        // Create data-check-string
        $dataCheckArray = [];
        foreach ($data as $key => $value) {
            $dataCheckArray[] = $key . '=' . $value;
        }
        $dataCheckString = implode("\n", $dataCheckArray);

        // Calculate secret key
        $secretKey = hash_hmac('sha256', $botToken, 'WebAppData', true);

        // Calculate hash
        $calculatedHash = hash_hmac('sha256', $dataCheckString, $secretKey);

        // Compare hashes (timing-safe comparison)
        $isValid = hash_equals($calculatedHash, $receivedHash);

        if (!$isValid) {
            Log::warning('Telegram initData validation failed', [
                'received_hash' => $receivedHash,
                'calculated_hash' => $calculatedHash,
            ]);
        }

        return $isValid;
    }

    /**
     * Parse user data from initData
     * 
     * @param string $initData Raw initData string from Telegram WebApp
     * @return array User data array
     */
    public function parseUserData(string $initData): array
    {
        parse_str($initData, $data);

        $userJson = $data['user'] ?? '{}';
        $user = json_decode($userJson, true);

        return [
            'id' => $user['id'] ?? null,
            'firstName' => $user['first_name'] ?? '',
            'lastName' => $user['last_name'] ?? null,
            'username' => $user['username'] ?? null,
            'languageCode' => $user['language_code'] ?? null,
            'isPremium' => $user['is_premium'] ?? false,
            'photoUrl' => $user['photo_url'] ?? null,
        ];
    }

    /**
     * Get start parameter from initData
     * Handles both 'start_param' (regular bots) and 'start_app' (Mini Apps)
     * Also strips common prefixes like 'ref_', 'referral_', etc.
     * 
     * Example:
     * - Regular bot: start_param=TRXABC123
     * - Mini App: start_app=ref_TRXABC123 → extracts TRXABC123
     * 
     * @param string $initData Raw initData string
     * @return string|null Start parameter if exists (cleaned)
     */
    public function getStartParam(string $initData): ?string
    {
        parse_str($initData, $data);
        
        // Try Mini App parameter first (start_app with underscore)
        $param = $data['start_app'] ?? null;
        
        // Fallback to regular bot parameter (start_param)
        if (empty($param)) {
            $param = $data['start_param'] ?? null;
        }
        
        // Strip common prefixes: ref_, referral_, code_
        if ($param) {
            $param = preg_replace('/^(ref_|referral_|code_)/i', '', $param);
            
            Log::info('Extracted referral code from initData', [
                'original_param' => $data['start_app'] ?? $data['start_param'] ?? null,
                'cleaned_code' => $param,
            ]);
        }
        
        return $param;
    }

    /**
     * Get query ID from initData
     * 
     * @param string $initData Raw initData string
     * @return string|null Query ID if exists
     */
    public function getQueryId(string $initData): ?string
    {
        parse_str($initData, $data);
        return $data['query_id'] ?? null;
    }
}
