<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PolygonScanService
{
    private string $apiKey;
    private string $baseUrl = 'https://api.etherscan.io/v2/api'; // Unified endpoint for all chains
    private int $chainId = 137; // Polygon PoS Mainnet
    private string $usdtContractAddress;
    private string $depositWalletAddress;

    public function __construct()
    {
        $this->apiKey = config('services.polygonscan.api_key');
        $this->baseUrl = config('services.polygonscan.api_url', 'https://api.etherscan.io/v2/api');
        $this->chainId = config('services.polygonscan.chain_id', 137); // 137 = mainnet, 80002 = amoy testnet
        $this->usdtContractAddress = config('services.polygonscan.usdt_contract');
        $this->depositWalletAddress = config('services.polygonscan.deposit_wallet');
    }

    /**
     * Verify USDT transaction on Polygon network
     */
    public function verifyTransaction(string $txHash): array
    {
        try {
            // Get transaction receipt
            $receipt = $this->getTransactionReceipt($txHash);
            
            if (!$receipt['success']) {
                return [
                    'success' => false,
                    'error' => $receipt['error'] ?? 'Failed to fetch transaction receipt',
                ];
            }

            // Parse transaction logs for USDT transfer
            $transferData = $this->parseUsdtTransfer($receipt['data']);
            
            if (!$transferData['success']) {
                return [
                    'success' => false,
                    'error' => $transferData['error'] ?? 'Invalid USDT transfer',
                ];
            }

            // Validate transaction
            $validation = $this->validateTransaction($transferData['data']);
            
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'error' => $validation['error'],
                ];
            }

            return [
                'success' => true,
                'data' => [
                    'tx_hash' => $txHash,
                    'from_address' => $transferData['data']['from'],
                    'to_address' => $transferData['data']['to'],
                    'amount' => $transferData['data']['amount'],
                    'block_number' => $receipt['data']['blockNumber'],
                    'timestamp' => $receipt['data']['timeStamp'] ?? null,
                    'status' => $receipt['data']['status'],
                ],
            ];
        } catch (\Exception $e) {
            Log::error('PolygonScan verification error', [
                'tx_hash' => $txHash,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Blockchain verification failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get transaction receipt from Etherscan/PolygonScan API v2
     * 
     * Uses unified endpoint with chainid parameter
     */
    private function getTransactionReceipt(string $txHash): array
    {
        try {
            $response = Http::timeout(30)->get($this->baseUrl, [
                'chainid' => $this->chainId, // Chain selector (137 for Polygon)
                'module' => 'proxy',
                'action' => 'eth_getTransactionReceipt',
                'txhash' => $txHash,
                'apikey' => $this->apiKey,
            ]);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'error' => 'API request failed',
                ];
            }

            $data = $response->json();

            // Check for API-level errors
            if (isset($data['status']) && $data['status'] === '0') {
                $errorMessage = $data['message'] ?? $data['result'] ?? 'API error';
                
                // Provide user-friendly error messages
                if ($errorMessage === 'NOTOK' || stripos($errorMessage, 'not found') !== false) {
                    $errorMessage = 'Transaction not found. Please check your transaction hash or wait a few moments for blockchain confirmation.';
                } elseif (stripos($errorMessage, 'rate limit') !== false) {
                    $errorMessage = 'API rate limit reached. Please try again in a moment.';
                } elseif (stripos($errorMessage, 'invalid') !== false) {
                    $errorMessage = 'Invalid transaction hash format. Please check and try again.';
                }
                
                return [
                    'success' => false,
                    'error' => $errorMessage,
                ];
            }

            if (isset($data['error'])) {
                return [
                    'success' => false,
                    'error' => $data['error']['message'] ?? 'API error',
                ];
            }

            if (!isset($data['result']) || $data['result'] === null) {
                return [
                    'success' => false,
                    'error' => 'Transaction not found or still pending',
                ];
            }

            return [
                'success' => true,
                'data' => $data['result'],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Network error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Parse USDT transfer from transaction logs
    */
    private function parseUsdtTransfer(array $receipt): array
    {
        if (($receipt['status'] ?? '0x0') !== '0x1') {
            return [
                'success' => false,
                'error' => 'Transaction failed on blockchain',
            ];
        }

        $transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

        foreach ($receipt['logs'] ?? [] as $log) {
            if (
                ($log['topics'][0] ?? null) === $transferEventSignature &&
                strtolower($log['address']) === strtolower($this->usdtContractAddress)
            ) {
                $from = '0x' . substr($log['topics'][1], 26);
                $to = '0x' . substr($log['topics'][2], 26);
                $amount = $this->hexToDecimal($log['data'], 6);

                return [
                    'success' => true,
                    'data' => [
                        'from' => strtolower($from),
                        'to' => strtolower($to),
                        'amount' => $amount,
                    ],
                ];
            }
        }

        return [
            'success' => false,
            'error' => 'No USDT transfer found in transaction',
        ];
    }

    /**
     * Validate transaction matches our requirements
    */
    private function validateTransaction(array $transferData): array
    {
        if (strtolower($transferData['to']) !== strtolower($this->depositWalletAddress)) {
            return [
                'valid' => false,
                'error' => 'Transaction not sent to official deposit address',
            ];
        }

        $minAmount = (float) config('services.polygonscan.min_amount', 1.00);

        if ($transferData['amount'] < $minAmount) {
            return [
                'valid' => false,
                'error' => sprintf('Amount below minimum deposit (%.2f USDT)', $minAmount),
            ];
        }

        return ['valid' => true];
    }

    /**
     * Convert hex to decimal with decimals
     */
    private function hexToDecimal(string $hex, int $decimals = 18): float
    {
        $hex = str_replace('0x', '', $hex);
        $decimal = gmp_strval(gmp_init($hex, 16), 10);
        
        // Adjust for decimals
        $divisor = bcpow('10', (string) $decimals);
        $result = bcdiv($decimal, $divisor, 8);
        
        return (float) $result;
    }

    /**
     * Get transaction details (additional info)
    */
    public function getTransactionInfo(string $txHash): ?array
    {
        try {
            $response = Http::timeout(30)->get($this->baseUrl, [
                'module' => 'proxy',
                'action' => 'eth_getTransactionByHash',
                'txhash' => $txHash,
                'apikey' => $this->apiKey,
            ]);

            return $response->successful() ? ($response->json()['result'] ?? null) : null;
        } catch (\Exception $e) {
            Log::error('Failed to get transaction info', [
                'tx_hash' => $txHash,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
