<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TelegramUser;
use App\Services\TelegramAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
            // Validate request
            $validated = $request->validate([
                'initData' => 'required|string',
            ]);

            $initData = $validated['initData'];

            // Validate initData signature from Telegram
            if (!$this->telegramAuth->validateInitData($initData)) {
                Log::warning('Telegram authentication failed: Invalid initData signature');
                
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Telegram authentication data',
                ], 401);
            }

            // Parse user data from validated initData
            $userData = $this->telegramAuth->parseUserData($initData);

            if (empty($userData['id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'User ID not found in Telegram data',
                ], 400);
            }

            // Create or update user
            $user = TelegramUser::createOrUpdateFromTelegram($userData);

            // Generate Sanctum token
            $token = $user->createToken('telegram-mini-app')->plainTextToken;

            Log::info('Telegram user authenticated successfully', [
                'telegram_id' => $user->telegram_id,
                'username' => $user->username,
                'is_new' => $user->wasRecentlyCreated,
            ]);

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
                    'is_new_user' => $user->wasRecentlyCreated,
                    'token' => $token,
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
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

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // Update last active
            $user->updateLastActive();

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
                    'last_active_at' => $user->last_active_at,
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
