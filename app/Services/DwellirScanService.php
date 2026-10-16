<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DwellirScanService
{
    private string $apiKey;
    private string $rpcUrl;
    private string $usdtContractAddress;
    private string $depositWalletAddress;

    public function __construct()
    {
        $this->apiKey = config('services.dwellir.api_key');
        $this->rpcUrl = config('services.dwellir.rpc_url', 'https://api-polygon-mainnet-full.n.dwellir.com');
        $this->usdtContractAddress = config('services.dwellir.usdt_contract') ?? config('services.polygonscan.usdt_contract');
        $this->depositWalletAddress = config('services.dwellir.deposit_wallet') ?? config('services.polygonscan.deposit_wallet');
    }

    /**
     * Verify USDT transaction on Polygon network using Dwellir RPC
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
            Log::error('Dwellir RPC verification error', [
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
     * Get transaction receipt from Dwellir RPC endpoint
     * 
     * Uses direct JSON-RPC call to eth_getTransactionReceipt
     */
    private function getTransactionReceipt(string $txHash): array
    {
        try {
            $endpoint = $this->rpcUrl . '/' . $this->apiKey;

            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($endpoint, [
                    'jsonrpc' => '2.0',
                    'method' => 'eth_getTransactionReceipt',
                    'params' => [$txHash],
                    'id' => 1,
                ]);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'error' => 'RPC request failed with status: ' . $response->status(),
                ];
            }

            $data = $response->json();

            // Check for JSON-RPC errors
            if (isset($data['error'])) {
                $errorMessage = $data['error']['message'] ?? 'RPC error';
                
                // Provide user-friendly error messages
                if (stripos($errorMessage, 'not found') !== false) {
                    $errorMessage = 'Transaction not found. Please check your transaction hash or wait a few moments for blockchain confirmation.';
                } elseif (stripos($errorMessage, 'invalid') !== false) {
                    $errorMessage = 'Invalid transaction hash format. Please check and try again.';
                }
                
                return [
                    'success' => false,
                    'error' => $errorMessage,
                ];
            }

            // Check if result is null (transaction not found or pending)
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
            Log::error('Dwellir RPC request error', [
                'tx_hash' => $txHash,
                'error' => $e->getMessage(),
            ]);

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
        // Check transaction status (0x1 = success, 0x0 = failed)
        if (($receipt['status'] ?? '0x0') !== '0x1') {
            return [
                'success' => false,
                'error' => 'Transaction failed on blockchain',
            ];
        }

        // ERC-20 Transfer event signature
        $transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

        foreach ($receipt['logs'] ?? [] as $log) {
            // Check if this is a Transfer event from USDT contract
            if (
                ($log['topics'][0] ?? null) === $transferEventSignature &&
                strtolower($log['address']) === strtolower($this->usdtContractAddress)
            ) {
                // Decode Transfer event: Transfer(address indexed from, address indexed to, uint256 value)
                // topics[0] = event signature
                // topics[1] = from address (padded to 32 bytes)
                // topics[2] = to address (padded to 32 bytes)
                // data = value (amount)
                
                $from = '0x' . substr($log['topics'][1], 26); // Remove padding (last 40 chars = 20 bytes)
                $to = '0x' . substr($log['topics'][2], 26);
                $amount = $this->hexToDecimal($log['data'], 6); // USDT has 6 decimals

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
        // Validate recipient address
        if (strtolower($transferData['to']) !== strtolower($this->depositWalletAddress)) {
            return [
                'valid' => false,
                'error' => 'Transaction not sent to official deposit address',
            ];
        }

        // Validate minimum amount
        $minAmount = (float) config('services.dwellir.min_amount') 
            ?? (float) config('services.polygonscan.min_amount', 1.00);

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
     * 
     * @param string $hex Hexadecimal value (with or without 0x prefix)
     * @param int $decimals Number of decimal places (6 for USDT, 18 for ETH)
     * @return float Decimal value
     */
    private function hexToDecimal(string $hex, int $decimals = 18): float
    {
        // Remove 0x prefix if present
        $hex = str_replace('0x', '', $hex);
        
        // Convert hex to decimal string using GMP (handles large numbers)
        $decimal = gmp_strval(gmp_init($hex, 16), 10);
        
        // Adjust for decimals using BC Math (arbitrary precision)
        $divisor = bcpow('10', (string) $decimals);
        $result = bcdiv($decimal, $divisor, 8);
        
        return (float) $result;
    }

    /**
     * Get transaction details (additional info)
     * 
     * Uses eth_getTransactionByHash for more transaction details
     */
    public function getTransactionInfo(string $txHash): ?array
    {
        try {
            $endpoint = $this->rpcUrl . '/' . $this->apiKey;

            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($endpoint, [
                    'jsonrpc' => '2.0',
                    'method' => 'eth_getTransactionByHash',
                    'params' => [$txHash],
                    'id' => 1,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['result'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Failed to get transaction info from Dwellir', [
                'tx_hash' => $txHash,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Get current block number
     * 
     * Useful for checking RPC connectivity and sync status
     */
    public function getBlockNumber(): ?int
    {
        try {
            $endpoint = $this->rpcUrl . '/' . $this->apiKey;

            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($endpoint, [
                    'jsonrpc' => '2.0',
                    'method' => 'eth_blockNumber',
                    'params' => [],
                    'id' => 1,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $hexBlock = $data['result'] ?? null;
                
                return $hexBlock ? hexdec($hexBlock) : null;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Failed to get block number from Dwellir', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Check RPC health and connectivity
     */
    public function healthCheck(): array
    {
        $startTime = microtime(true);
        $blockNumber = $this->getBlockNumber();
        $responseTime = round((microtime(true) - $startTime) * 1000, 2); // in milliseconds

        if ($blockNumber !== null) {
            return [
                'healthy' => true,
                'block_number' => $blockNumber,
                'response_time_ms' => $responseTime,
                'provider' => 'Dwellir RPC',
            ];
        }

        return [
            'healthy' => false,
            'error' => 'Failed to connect to Dwellir RPC',
            'response_time_ms' => $responseTime,
            'provider' => 'Dwellir RPC',
        ];
    }
}
