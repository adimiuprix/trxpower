<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TelegramUser;
use App\Services\TelegramAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class TelegramAuthController extends Controller
{
    protected TelegramAuthService $telegramAuth;

    public function __construct(TelegramAuthService $telegramAuth)
    {
        $this->telegramAuth = $telegramAuth;
    }

    /**
     * Authenticate Telegram user with initData validation
     *
     * This is the SECURE way to authenticate Telegram users.
     * It validates the initData signature to ensure the request comes from Telegram.
     */
    public function authenticate(Request $request): JsonResponse
    {
        try {
            $initData = $request->validate([
                'initData' => 'required|string',
            ])['initData'];

            abort_unless(
                $this->telegramAuth->validateInitData($initData),
                401,
                'Invalid Telegram authentication data'
            );

            $userData = $this->telegramAuth->parseUserData($initData);

            abort_if(
                empty($userData['id']), 400, 'User ID not found in Telegram data'
            );

            // Create or update user
            $user = TelegramUser::createOrUpdateFromTelegram($userData);

            // Generate Sanctum token
            $token = $user->createToken('telegram-mini-app')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'User authenticated successfully',
                'data' => [
                    'id' => $user->id,
                    'telegram_id' => $user->telegram_id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'username' => $user->username,
                    'language_code' => $user->language_code,
                    'is_premium' => $user->is_premium,
                    'photo_url' => $user->photo_url,
                    'balance' => (float) $user->balance,
                    'wallet_balance' => (float) $user->wallet_balance,
                    'referral_code' => $user->referral_code,
                    'is_new_user' => $user->wasRecentlyCreated,
                    'token' => $token,
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Telegram authentication failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Authentication failed',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }

    /**
     * Get authenticated user data
     */
    public function me(Request $request): JsonResponse
    {
        try {
            // Get authenticated user from Sanctum
            $user = $request->user('sanctum');
            // Log::info($user);

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // Update last active
            $user->updateLastActive();

            // expire plans
            $user->expirePlans();

            // Sync balance from mining
            $user->syncBalance();

            // Reload user to get updated balance
            $user->refresh();

            // Get active mining histories with plan data for real-time calculation
            $miningHistories = $user->miningHistories()
                ->active()
                ->with('plan:id,earning_rate,daily_profit')
                ->get()
                ->map(fn ($history) => [
                    'id' => $history->id,
                    'plan_id' => $history->plan_id,
                    'status' => $history->status,
                    'last_sum' => $history->last_sum ?? time(),
                    'expire_date' => $history->expire_date,
                    'created_at' => $history->created_at ? $history->created_at->toISOString() : now()->toISOString(),
                    'plan' => [
                        'earning_rate' => (float) $history->plan->earning_rate,
                        'daily_profit' => (float) $history->plan->daily_profit,
                    ],
                ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'telegram_id' => $user->telegram_id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'username' => $user->username,
                    'language_code' => $user->language_code,
                    'is_premium' => $user->is_premium,
                    'photo_url' => $user->photo_url,
                    'balance' => (float) $user->balance,
                    'wallet_balance' => (float) $user->wallet_balance,
                    'referral_code' => $user->referral_code,
                    'payout_address' => $user->payout_address,
                    'last_active_at' => $user->last_active_at,
                    'mining_histories' => $miningHistories,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get user data', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get user data',
            ], 500);
        }
    }

    public function claim(Request $request): JsonResponse
    {
        try {
            // Get authenticated user from Sanctum
            $user = $request->user('sanctum');

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            DB::transaction(function () use ($user) {
                $user = TelegramUser::lockForUpdate()->find($user->id);
                $user->increment('wallet_balance', $user->balance);
                $user->update(['balance' => 0]);
            });

            return response()->json([
                'success' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get user data', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to claim',
            ], 500);
        }
    }

    /**
     * Logout and revoke token
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user('sanctum');

            if ($user) {
                // Revoke current token
                $request->user()->currentAccessToken()->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Logout failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
            ], 500);
        }
    }
}
