<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class TelegramPayoutController extends Controller
{
    /**
     * Update payout address for authenticated user
     */
    public function updatePayoutAddress(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validated = $request->validate([
                'payout_address' => [
                    'required',
                    'string',
                    'regex:/^T[A-Za-z1-9]{33}$/', // TRON address format: starts with T, 34 chars total
                ],
            ]);

            // Get authenticated user
            $user = $request->user('sanctum');

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // Update payout address
            $user->payout_address = $validated['payout_address'];
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Payout address updated successfully',
                'data' => [
                    'payout_address' => $user->payout_address,
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payout address',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }
}