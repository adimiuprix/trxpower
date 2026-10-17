<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VerifyDepositRequest;
use App\Models\Deposit;
use App\Models\MiningHistory;
use App\Models\Plan;
use App\Models\TelegramUser;
use App\Models\Transaction;
use App\Services\DwellirScanService;
use App\Services\PolygonScanService;
use App\Services\TelegramAuthService;
use App\Services\TronService;
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

            // Get referral code from initData (start_param)
            $referralCode = $this->telegramAuth->getStartParam($initData);

            // Create or update user with referral tracking
            $user = TelegramUser::createOrUpdateFromTelegram($userData, $referralCode);

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
                    'referred_by' => $user->referred_by ?? 0,
                    'total_referrals' => $user->total_referrals ?? 0,
                    'mined' => $user->mined,
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

            // Generate referral code jika belum ada (untuk user lama)
            $user->when(
                blank($user->referral_code),
                fn ($user) => $user->update([
                    'referral_code' => TelegramUser::generateReferralCode(),
                ])
            );

            // expire plans
            $user->expirePlans();

            // Sync balance from mining
            $user->syncBalance();

            // Reload user to get updated balance
            $user->refresh();

            // Get active mining histories with plan data for real-time calculation
            $miningHistories = $user->miningHistories()
                ->active()
                ->with('plan:id,earning_rate,daily_profit,hashrate')
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
                        'hashrate' => $history->plan->hashrate ?? '0 GH/s',
                    ],
                ]);

            // Get total hashrate from active plan
            $totalHashrate = $miningHistories->sum('plan.hashrate');

            // Format the total hashrate
            if ($totalHashrate >= 1000) {
                $formattedHashrate = number_format($totalHashrate / 1000, 1, '.', '').' TH/s';
            } elseif ($totalHashrate < 1) {
                $formattedHashrate = number_format($totalHashrate * 1000, 0, '.', '').' MH/s';
            } else {
                $formattedHashrate = number_format($totalHashrate, 1, '.', '').' GH/s';
            }

            // Get total withdraw from transactions where type "withdraw" and status completed
            $totalWithdraw = (float) $user->totalWithdraw();

            // Get latest transactions for this user
            $transactions = $user->transactions()
                ->latest()
                ->limit(20)
                ->get()
                ->map(fn ($tx) => [
                    'id' => $tx->id,
                    'type' => $tx->type,
                    'amount' => number_format((float) $tx->amount, 4, '.', ''),
                    'address' => $tx->address,
                    'tx_hash' => $tx->tx_hash,
                    'status' => $tx->status,
                    'created_at' => $tx->created_at->diffForHumans(),
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
                    'mined' => (float) $user->mined,
                    'wallet_balance' => (float) $user->wallet_balance,
                    'deposit_balance' => (float) $user->deposit_balance,
                    'referral_code' => $user->referral_code,
                    'referral_total' => $user->referrals()->count(),
                    'referrals' => $user->referrals,
                    'payout_address' => $user->payout_address,
                    'last_active_at' => $user->last_active_at,
                    'mining_histories' => $miningHistories,
                    'earning' => $user->earning,
                    'transactions' => $transactions,
                    'total_hashrate' => $formattedHashrate,
                    'total_withdraw' => $totalWithdraw,
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

            // Abort jika balance < 0.05
            abort_if(
                $user->balance < 0.05,
                400,
                'Minimum balance to claim is 0.05 TRX'
            );

            $newWalletBalance = 0;
            DB::transaction(function () use ($user, &$newWalletBalance) {
                $user = TelegramUser::lockForUpdate()->find($user->id);
                $amount = $user->balance;

                $user->increment('wallet_balance', $user->balance);
                $user->update(['balance' => 0]);
                $newWalletBalance = $user->wallet_balance;

                Transaction::create([
                    'user_id' => $user->id,
                    'type' => 'mining',
                    'amount' => $amount,
                    'address' => null,
                    'tx_hash' => null,
                    'status' => 'completed',
                    'completed_at' => time(),
                ]);
            });

            return response()->json([
                'success' => true,
                'new_wallet_balance' => (float) $newWalletBalance,
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

    public function purchase(Request $request): JsonResponse
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

            $userId = $user->id; // Save user ID for error logging

            DB::transaction(function () use ($user, &$request) {
                $buyer = TelegramUser::lockForUpdate()->find($user->id);
                $buyerId = $buyer->id;
                $plan = Plan::query()->lockForUpdate()->findOrFail($request->integer('plan_id'));

                if ($buyer->deposit_balance < $plan->price) {
                    throw ValidationException::withMessages(['balance' => 'Insufficient balance.']);
                }

                $buyer->decrement('deposit_balance', $plan->price);

                $currentUser = $buyer;
                foreach ([0.10, 0.05, 0.02] as $rate) {
                    if (!($currentUser->referred_by > 0) || !($ancestor = TelegramUser::find($currentUser->referred_by))) break;

                    $commission = $plan->price * $rate;

                    $ancestor->incrementEach([
                        'earning' => $commission,
                        'wallet_balance' => $commission,
                    ]);

                    $currentUser = $ancestor;
                }

                MiningHistory::create([
                    'user_id' => $buyerId,
                    'plan_id' => $plan->id,
                    'status' => 'active',
                    'last_sum' => time(),
                    'expire_date' => now()->addDays($plan->duration)->timestamp,
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Plan purchased successfully.',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to purchase plan', [
                'error' => $e->getMessage(),
                'user_id' => $userId ?? null,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to purchase plan',
            ], 500);
        }
    }

    /**
     * Verify deposit transaction on Polygon blockchain
     */
    public function verifyDeposit(
        DwellirScanService $dwellirScanService,
        VerifyDepositRequest $request, 
        PolygonScanService $polygonScanService
    ): JsonResponse {
        $txHash = strtolower($request->input('tx_hash'));
        $expectedAmount = (float) $request->input('expected_amount');
        $user = $request->user();

        try {
            // Check if transaction already verified
            $existingDeposit = Deposit::where('tx_hash', $txHash)->first();

            if ($existingDeposit) {
                if ($existingDeposit->isCompleted()) {
                    return response()->json([
                        'success' => false,
                        'error' => 'This transaction has already been verified and credited.',
                    ], 409);
                }

                if ($existingDeposit->user_id !== $user->id) {
                    return response()->json([
                        'success' => false,
                        'error' => 'This transaction belongs to another user.',
                    ], 403);
                }
            }

            // Select blockchain provider based on config
            $provider = config('services.blockchain.provider');
            $service = $provider === 'dwellir' ? $dwellirScanService : $polygonScanService;

            // Verify transaction on blockchain
            $verification = $service->verifyTransaction($txHash);

            if (! $verification['success']) {
                // Log failed verification
                Log::warning('Deposit verification failed', [
                    'user_id' => $user->id,
                    'tx_hash' => $txHash,
                    'error' => $verification['error'],
                ]);

                return response()->json([
                    'success' => false,
                    'error' => $verification['error'],
                ], 400);
            }

            $txData = $verification['data'];

            // Verify amount matches (with tolerance for exact amount calculation)
            $actualAmount = (float) $txData['amount'];
            $tolerance = 0.01; // 1% tolerance
            $minExpected = $expectedAmount * (1 - $tolerance);
            $maxExpected = $expectedAmount * (1 + $tolerance);

            if ($actualAmount < $minExpected || $actualAmount > $maxExpected) {
                return response()->json([
                    'success' => false,
                    'error' => sprintf(
                        'Amount mismatch. Expected: %.3f USDT, Found: %.3f USDT',
                        $expectedAmount,
                        $actualAmount
                    ),
                ], 400);
            }

            // Calculate base amount (remove the 0.5% identifier)
            $baseAmount = $actualAmount / 1.005;

            // Get exchange rate and calculate TRX amount
            $exchangeRate = (float) config('services.bscscan.exchange_rate', 3);
            $trxAmount = $baseAmount * $exchangeRate;

            // Create or update deposit record
            DB::beginTransaction();
            try {
                $deposit = Deposit::updateOrCreate(
                    ['tx_hash' => $txHash],
                    [
                        'user_id' => $user->id,
                        'from_address' => $txData['from_address'],
                        'to_address' => $txData['to_address'],
                        'amount_usdt' => $baseAmount,
                        'exact_amount_sent' => $actualAmount,
                        'amount_trx' => $trxAmount,
                        'exchange_rate' => $exchangeRate,
                        'status' => 'completed',
                        'verified_at' => now(),
                        'verification_data' => $txData,
                        'block_number' => $txData['block_number'],
                    ]
                );

                // Credit user balance - use deposit_balance field
                $user->increment('deposit_balance', $trxAmount);
                $user->increment('balance', $trxAmount); // Also update main balance

                Transaction::create([
                    'user_id' => $user->id,
                    'type' => 'deposit',
                    'amount' => $baseAmount,
                    'address' => $txData['to_address'],
                    'tx_hash' => $txHash,
                    'status' => 'completed',
                    'completed_at' => time(),
                ]);

                DB::commit();

                Log::info('Deposit verified successfully', [
                    'user_id' => $user->id,
                    'deposit_id' => $deposit->id,
                    'tx_hash' => $txHash,
                    'amount_usdt' => $baseAmount,
                    'amount_trx' => $trxAmount,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Deposit verified successfully! TRX credited to your account.',
                    'data' => [
                        'deposit_id' => $deposit->id,
                        'tx_hash' => $deposit->tx_hash,
                        'amount_usdt' => (float) $deposit->amount_usdt,
                        'amount_trx' => (float) $deposit->amount_trx,
                        'exchange_rate' => (float) $deposit->exchange_rate,
                        'verified_at' => $deposit->verified_at->toIso8601String(),
                        'new_balance' => (float) $user->fresh()->balance,
                        'new_deposit_balance' => (float) $user->fresh()->deposit_balance,
                    ],
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Deposit verification error', [
                'user_id' => $user->id,
                'tx_hash' => $txHash,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'An error occurred during verification. Please try again.',
            ], 500);
        }
    }

    /**
     * Update payout address for authenticated user
     */
    public function updatePayoutAddress(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');

        abort_unless($user, 401, 'Unauthenticated');

        $validated = $request->validate([
            'payout_address' => ['required', 'string', 'regex:/^T[A-Za-z1-9]{33}$/'],
        ]);

        $user->update([
            'payout_address' => $validated['payout_address'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payout address updated successfully',
            'data' => [
                'payout_address' => $user->payout_address,
            ],
        ]);
    }

    public function withdraw(Request $request, TronService $tronService): JsonResponse
    {
        try {
            // Get authenticated user
            $user = $request->user('sanctum');

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // Validate request
            $validated = $request->validate([
                'address' => ['required', 'string', 'regex:/^T[1-9A-HJ-NP-Za-km-z]{33}$/'],
                'amount' => ['required', 'numeric', 'min:1'],
                'provider' => ['required', 'string'],
            ]);

            $amount = (float) $validated['amount'];
            $address = $validated['address'];
            $provider = $validated['provider'];

            // Check if wallet balance is sufficient
            if ($user->wallet_balance < $amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient wallet balance',
                ], 400);
            }

            // Send TRX to receiver
            $sendResult = $tronService->sendTrx($address, $amount);
            $sendData = $sendResult->getData(true);

            // Abort if the transfer failed before even reaching the node
            if (! ($sendData['success'] ?? false)) {
                return $sendResult;
            }

            $txHash = $sendData['txhash'] ?? null;

            // Create withdrawal transaction
            $transaction = null;
            DB::transaction(function () use ($user, $amount, $address, $txHash, &$transaction) {
                // Lock user for update
                $user = TelegramUser::lockForUpdate()->find($user->id);

                // Deduct from wallet balance
                $user->decrement('wallet_balance', $amount);

                // Create transaction record
                $transaction = Transaction::create([
                    'user_id' => $user->id,
                    'type' => 'withdraw',
                    'amount' => $amount,
                    'address' => $address,
                    'tx_hash' => $txHash,
                    'status' => $txHash ? 'completed' : 'unknown',
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal submitted successfully.',
                'data' => [
                    'txhash' => $txHash,
                    'amount' => $amount,
                    'address' => $address,
                    'provider' => $provider,
                    'new_wallet_balance' => (float) $user->fresh()->wallet_balance,
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Withdrawal request failed', [
                'user_id' => $request->user('sanctum')->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process withdrawal request',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
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

    /**
     * Get task status for authenticated user
     */
    public function getTaskStatus(Request $request): JsonResponse
    {
        try {
            $user = $request->user('sanctum');

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // Fetch user submissions
            $userSubmissions = \App\Models\TaskSubmission::where('user_id', $user->id)
                ->get()
                ->keyBy('task_id');

            // Build status untuk semua tasks
            $taskStatus = [];
            $allTasks = \App\Models\Task::all();

            foreach ($allTasks as $task) {
                $taskId = $task->id;
                $submission = $userSubmissions->get($taskId);

                if ($submission) {
                    if ($submission->isClaimed()) {
                        // Task sudah claimed
                        $taskStatus[$taskId] = [
                            'completed' => true,
                            'claimed' => true,
                        ];
                    } else {
                        // Task completed tapi belum claimed
                        $taskStatus[$taskId] = [
                            'completed' => true,
                            'claimed' => false,
                        ];
                    }
                } else {
                    // Belum complete
                    $taskStatus[$taskId] = [
                        'completed' => false,
                        'claimed' => false,
                    ];
                }
            }

            // Data progress untuk task tertentu
            $referralCount = \App\Models\TelegramUser::where('referred_by', $user->id)->count();
            
            $taskProgress = [];
            foreach ($allTasks as $task) {
                if ($task->title === 'Invite 5 Friends') {
                    $taskProgress[$task->id] = [
                        'current' => $referralCount,
                        'target' => 5,
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'task_status' => $taskStatus,
                    'task_progress' => $taskProgress,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get task status', [
                'user_id' => $request->user('sanctum')->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get task status.',
            ], 500);
        }
    }

    /**
     * Submit task completion for verification (auto-approve)
     */
    public function submitTask(Request $request, string $taskId): JsonResponse
    {
        try {
            $user = $request->user('sanctum');

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // Validate task exists
            $task = \App\Models\Task::findOrFail($taskId);

            // Check if user already completed this task
            $existingSubmission = \App\Models\TaskSubmission::where('user_id', $user->id)
                ->where('task_id', $taskId)
                ->first();

            if ($existingSubmission) {
                if ($existingSubmission->isClaimed()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You have already claimed this task reward.',
                    ], 409);
                }

                // Task already completed, can claim
                return response()->json([
                    'success' => true,
                    'message' => 'Task already completed. You can claim the reward now.',
                    'data' => [
                        'submission_id' => $existingSubmission->id,
                        'task' => [
                            'id' => $task->id,
                            'title' => $task->title,
                            'reward' => $task->reward,
                        ],
                    ],
                ]);
            }

            // Create new submission (completed, not claimed yet)
            $submission = \App\Models\TaskSubmission::create([
                'user_id' => $user->id,
                'task_id' => $taskId,
                'is_claimed' => false,
            ]);

            Log::info('Task completed', [
                'user_id' => $user->id,
                'task_id' => $taskId,
                'submission_id' => $submission->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Task completed! You can claim the reward now.',
                'data' => [
                    'submission_id' => $submission->id,
                    'task' => [
                        'id' => $task->id,
                        'title' => $task->title,
                        'reward' => $task->reward,
                    ],
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Task submission failed', [
                'user_id' => $request->user('sanctum')->id ?? null,
                'task_id' => $taskId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit task. Please try again.',
            ], 500);
        }
    }

    /**
     * Claim task reward
     */
    public function claimTaskReward(Request $request, string $taskId): JsonResponse
    {
        try {
            $user = $request->user('sanctum');

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // Find unclaimed submission
            $submission = \App\Models\TaskSubmission::where('user_id', $user->id)
                ->where('task_id', $taskId)
                ->where('is_claimed', false)
                ->with('task')
                ->firstOrFail();

            $task = $submission->task;

            DB::beginTransaction();
            try {
                // Credit reward to user wallet_balance (not balance)
                $user->increment('wallet_balance', $task->reward);

                // Mark submission as claimed
                $submission->markAsClaimed();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Reward claimed successfully!',
                    'data' => [
                        'reward' => $task->reward,
                        'new_wallet_balance' => $user->fresh()->wallet_balance,
                        'task' => [
                            'id' => $task->id,
                            'title' => $task->title,
                        ],
                    ],
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'No unclaimed task found. Please complete the task first.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Task reward claim failed', [
                'user_id' => $request->user('sanctum')->id ?? null,
                'task_id' => $taskId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to claim reward. Please try again.',
            ], 500);
        }
    }
}
