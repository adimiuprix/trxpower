<?php

namespace App\Services;

use IEXBase\TronAPI\Configuration\NodeConfiguration;
use IEXBase\TronAPI\Configuration\RetryPolicy;
use IEXBase\TronAPI\Crypto\LocalPrivateKeySigner;
use IEXBase\TronAPI\Enum\Network;
use IEXBase\TronAPI\Exception\TransportException;
use IEXBase\TronAPI\Tron;
use IEXBase\TronAPI\Value\Address;
use IEXBase\TronAPI\Value\Amount;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class TronService
{
    public function sendTrx(string $toAddress, float $amount): JsonResponse
    {
        // Validate address format before passing to the library
        $toAddress = trim($toAddress);

        if (strlen($toAddress) !== 34) {
            return response()->json([
                'success' => false,
                'message' => "Invalid TRON address: must be exactly 34 characters (got " . strlen($toAddress) . ").",
            ], 422);
        }

        if (!Address::isValid($toAddress)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid TRON address: failed Base58Check validation.',
            ], 422);
        }

        // txId is computed locally (SHA-256 of raw_data_hex) before broadcast,
        // so we always know it even if the node response stream drops afterward.
        $txId = null;

        try {
            // Create TRON client with tuned timeouts & retry policy for flaky nodes
            $config = NodeConfiguration::forNetwork(
                Network::Shasta,
                config('services.tron.api_key'),
                connectTimeoutSeconds: 10.0,
                requestTimeoutSeconds: 60.0,
                retryPolicy: new RetryPolicy(
                    maximumAttempts: 5,
                    initialDelayMilliseconds: 500,
                    maximumDelayMilliseconds: 8_000,
                    jitterPercent: 25,
                ),
            );
            $tron = Tron::create($config);

            // Create signer
            $signer = new LocalPrivateKeySigner(config('services.tron.private_key'));

            // Create transaction
            $transaction = $tron->transfers()->createTrxTransfer(
                $signer->address(),
                Address::fromBase58($toAddress),
                Amount::fromDecimal((string) $amount),
            );

            // Sign transaction — txId is now computable locally (SHA-256 of raw_data_hex)
            $signedTransaction = $tron->transactions()->appendSignature(
                $transaction,
                $signer
            );

            // Save txId BEFORE broadcast so we still have it if the response stream drops
            $txId = $signedTransaction->id();

            // Broadcast transaction
            $result = $tron->transactions()->broadcast($signedTransaction);

            return response()->json([
                'success' => true,
                'txhash'  => $result->transactionId,
                'result'  => $result,
            ]);
        } catch (TransportException $e) {
            // If txId is already set, the transaction was signed & broadcast was attempted.
            // The stream dropped AFTER the node received the tx — it likely landed on-chain.
            if ($txId !== null) {
                Log::warning('TronService::sendTrx response stream dropped after broadcast', [
                    'to_address' => $toAddress,
                    'amount'     => $amount,
                    'txhash'     => $txId,
                    'error'      => $e->getMessage(),
                ]);

                // Return 202 Accepted — tx was sent, confirmation pending
                return response()->json([
                    'success' => true,
                    'txhash'  => $txId,
                    'message' => 'Transaction broadcast. Awaiting node confirmation.',
                ], 202);
            }

            // txId is null — error happened before broadcast (e.g. during createTrxTransfer)
            Log::warning('TronService::sendTrx network error before broadcast', [
                'to_address' => $toAddress,
                'amount'     => $amount,
                'error'      => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'TRON node is temporarily unreachable. Please try again in a moment.',
            ], 503);
        } catch (\Throwable $e) {
            Log::error('TronService::sendTrx failed', [
                'to_address' => $toAddress,
                'amount'     => $amount,
                'txhash'     => $txId,
                'error'      => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'TRX transfer failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
