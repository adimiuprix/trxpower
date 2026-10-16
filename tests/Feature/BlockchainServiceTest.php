<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\DwellirScanService;
use App\Services\PolygonScanService;
use Illuminate\Support\Facades\Http;

class BlockchainServiceTest extends TestCase
{
    /**
     * Test DwellirScanService health check
     */
    public function test_dwellir_health_check(): void
    {
        if (!config('services.dwellir.api_key')) {
            $this->markTestSkipped('DWELLIR_API_KEY not configured');
        }

        $service = new DwellirScanService();
        $health = $service->healthCheck();

        $this->assertTrue($health['healthy']);
        $this->assertArrayHasKey('block_number', $health);
        $this->assertArrayHasKey('response_time_ms', $health);
        $this->assertEquals('Dwellir RPC', $health['provider']);
    }

    /**
     * Test DwellirScanService get block number
     */
    public function test_dwellir_get_block_number(): void
    {
        if (!config('services.dwellir.api_key')) {
            $this->markTestSkipped('DWELLIR_API_KEY not configured');
        }

        $service = new DwellirScanService();
        $blockNumber = $service->getBlockNumber();

        $this->assertIsInt($blockNumber);
        $this->assertGreaterThan(0, $blockNumber);
    }

    /**
     * Test DwellirScanService transaction verification
     * 
     * Note: Replace with a real transaction hash for actual testing
     */
    public function test_dwellir_verify_transaction(): void
    {
        if (!config('services.dwellir.api_key')) {
            $this->markTestSkipped('DWELLIR_API_KEY not configured');
        }

        // Example transaction hash (replace with actual USDT transfer)
        $txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

        $service = new DwellirScanService();
        $result = $service->verifyTransaction($txHash);

        // Should fail with transaction not found (unless you provide real hash)
        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('error', $result);
    }

    /**
     * Test PolygonScanService transaction verification
     */
    public function test_polygonscan_verify_transaction(): void
    {
        if (!config('services.polygonscan.api_key')) {
            $this->markTestSkipped('POLYGONSCAN_API_KEY not configured');
        }

        // Example transaction hash (replace with actual USDT transfer)
        $txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

        $service = new PolygonScanService();
        $result = $service->verifyTransaction($txHash);

        // Should fail with transaction not found (unless you provide real hash)
        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('error', $result);
    }

    /**
     * Test both services return same structure
     */
    public function test_services_return_same_structure(): void
    {
        $dwellirService = new DwellirScanService();
        $polygonService = new PolygonScanService();

        $txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

        $dwellirResult = $dwellirService->verifyTransaction($txHash);
        $polygonResult = $polygonService->verifyTransaction($txHash);

        // Both should have same keys
        $this->assertArrayHasKey('success', $dwellirResult);
        $this->assertArrayHasKey('success', $polygonResult);

        // If failed, should have error
        if (!$dwellirResult['success']) {
            $this->assertArrayHasKey('error', $dwellirResult);
        }

        if (!$polygonResult['success']) {
            $this->assertArrayHasKey('error', $polygonResult);
        }
    }

    /**
     * Test hex to decimal conversion consistency
     */
    public function test_hex_to_decimal_conversion(): void
    {
        $service = new DwellirScanService();

        // Use reflection to test private method
        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('hexToDecimal');
        $method->setAccessible(true);

        // Test USDT amount (6 decimals): 10.005 USDT
        $hexValue = '0x' . dechex(10005000); // 10.005 * 10^6
        $result = $method->invoke($service, $hexValue, 6);

        $this->assertEquals(10.005, $result);

        // Test ETH amount (18 decimals): 1.5 ETH
        $hexValue = '0x' . gmp_strval(gmp_mul(gmp_init('1500000000000000000'), 1), 16);
        $result = $method->invoke($service, $hexValue, 18);

        $this->assertEquals(1.5, $result);
    }

    /**
     * Test invalid transaction hash format
     */
    public function test_invalid_transaction_hash_format(): void
    {
        $service = new DwellirScanService();

        // Invalid hash (not 0x prefix + 64 hex chars)
        $invalidHashes = [
            'invalid',
            '0x123', // too short
            '123456', // no 0x prefix
            '0xZZZZ', // non-hex characters
        ];

        foreach ($invalidHashes as $invalidHash) {
            $result = $service->verifyTransaction($invalidHash);
            
            // Should return error (transaction not found or invalid format)
            $this->assertFalse($result['success']);
        }
    }

    /**
     * Test service configuration
     */
    public function test_service_configuration(): void
    {
        // Test Dwellir config
        $this->assertNotNull(config('services.dwellir.rpc_url'));
        $this->assertNotNull(config('services.dwellir.usdt_contract'));
        $this->assertNotNull(config('services.dwellir.deposit_wallet'));

        // Test PolygonScan config
        $this->assertNotNull(config('services.polygonscan.api_url'));
        $this->assertNotNull(config('services.polygonscan.usdt_contract'));
        $this->assertNotNull(config('services.polygonscan.deposit_wallet'));

        // Both should use same USDT contract and deposit wallet
        $this->assertEquals(
            config('services.dwellir.usdt_contract'),
            config('services.polygonscan.usdt_contract')
        );

        $this->assertEquals(
            config('services.dwellir.deposit_wallet'),
            config('services.polygonscan.deposit_wallet')
        );
    }

    /**
     * Performance comparison test (only run manually)
     */
    public function test_performance_comparison(): void
    {
        if (!config('services.dwellir.api_key') || !config('services.polygonscan.api_key')) {
            $this->markTestSkipped('Both API keys required for performance test');
        }

        $dwellirService = new DwellirScanService();
        $polygonService = new PolygonScanService();

        // Test with real transaction hash (replace)
        $txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

        // Dwellir performance
        $startTime = microtime(true);
        $dwellirResult = $dwellirService->verifyTransaction($txHash);
        $dwellirTime = (microtime(true) - $startTime) * 1000;

        // PolygonScan performance
        $startTime = microtime(true);
        $polygonResult = $polygonService->verifyTransaction($txHash);
        $polygonTime = (microtime(true) - $startTime) * 1000;

        dump([
            'dwellir_ms' => round($dwellirTime, 2),
            'polygonscan_ms' => round($polygonTime, 2),
            'faster' => $dwellirTime < $polygonTime ? 'Dwellir' : 'PolygonScan',
            'difference_ms' => round(abs($dwellirTime - $polygonTime), 2),
        ]);

        // Just assert both completed (success or expected failure)
        $this->assertTrue(isset($dwellirResult['success']));
        $this->assertTrue(isset($polygonResult['success']));
    }
}
