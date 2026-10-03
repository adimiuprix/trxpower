<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\TelegramUser;
use App\Models\Deposit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

class DoubleClaimPreventionTest extends TestCase
{
    use RefreshDatabase;

    private TelegramUser $user;
    private string $validTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    protected function setUp(): void
    {
        parent::setUp();

        // Create test user
        $this->user = TelegramUser::factory()->create([
            'balance' => 0,
            'deposit_balance' => 0,
        ]);

        // Mock BscScan API response
        Http::fake([
            'api.etherscan.io/*' => Http::response([
                'status' => '1',
                'message' => 'OK',
                'result' => [
                    'blockNumber' => '0x1234567',
                    'status' => '0x1',
                    'logs' => [
                        [
                            'address' => '0x55d398326f99059fF775485246999027B3197955', // USDT
                            'topics' => [
                                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                                '0x000000000000000000000000' . substr($this->user->payout_address ?? '0x1234567890123456789012345678901234567890', 2),
                                '0x000000000000000000000000' . substr(config('services.bscscan.deposit_wallet'), 2),
                            ],
                            'data' => '0x0000000000000000000000000000000000000000000000008ac7230489e80000', // 10.05 USDT
                        ],
                    ],
                ],
            ], 200),
        ]);
    }

    /** @test */
    public function it_prevents_same_user_claiming_same_transaction_twice()
    {
        // First claim - should succeed
        $response1 = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/telegram/verify-transaction', [
                'tx_hash' => $this->validTxHash,
                'expected_amount' => 10.050,
            ]);

        $response1->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        // Verify user balance increased
        $this->user->refresh();
        $this->assertEquals(30.00, $this->user->balance);
        $this->assertEquals(30.00, $this->user->deposit_balance);

        // Second claim with same TXID - should fail
        $response2 = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/telegram/verify-transaction', [
                'tx_hash' => $this->validTxHash,
                'expected_amount' => 10.050,
            ]);

        $response2->assertStatus(409)
            ->assertJson([
                'success' => false,
                'error' => 'This transaction has already been verified and credited.',
            ]);

        // Verify balance did NOT increase again
        $this->user->refresh();
        $this->assertEquals(30.00, $this->user->balance); // Still 30, not 60
        $this->assertEquals(30.00, $this->user->deposit_balance);

        // Verify only ONE deposit record exists
        $this->assertDatabaseCount('deposits', 1);
    }

    /** @test */
    public function it_prevents_different_user_claiming_same_transaction()
    {
        // User A claims first
        $userA = $this->user;

        $response1 = $this->actingAs($userA, 'sanctum')
            ->postJson('/api/telegram/verify-transaction', [
                'tx_hash' => $this->validTxHash,
                'expected_amount' => 10.050,
            ]);

        $response1->assertStatus(200)
            ->assertJson(['success' => true]);

        // User B tries to claim same TXID
        $userB = TelegramUser::factory()->create([
            'balance' => 0,
            'deposit_balance' => 0,
        ]);

        $response2 = $this->actingAs($userB, 'sanctum')
            ->postJson('/api/telegram/verify-transaction', [
                'tx_hash' => $this->validTxHash,
                'expected_amount' => 10.050,
            ]);

        $response2->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error' => 'This transaction belongs to another user.',
            ]);

        // Verify User B balance did NOT increase
        $userB->refresh();
        $this->assertEquals(0, $userB->balance);
        $this->assertEquals(0, $userB->deposit_balance);

        // Verify only ONE deposit record exists (belongs to User A)
        $this->assertDatabaseCount('deposits', 1);
        $this->assertDatabaseHas('deposits', [
            'tx_hash' => $this->validTxHash,
            'user_id' => $userA->id,
            'status' => 'completed',
        ]);
    }

    /** @test */
    public function it_handles_race_condition_with_database_unique_constraint()
    {
        // Simulate race condition by trying to create duplicate directly
        Deposit::create([
            'user_id' => $this->user->id,
            'tx_hash' => $this->validTxHash,
            'from_address' => '0x1234567890123456789012345678901234567890',
            'to_address' => config('services.bscscan.deposit_wallet'),
            'amount_usdt' => 10.00,
            'exact_amount_sent' => 10.05,
            'amount_trx' => 30.00,
            'exchange_rate' => 3,
            'status' => 'completed',
        ]);

        // Try to create duplicate - should throw exception
        $this->expectException(\Illuminate\Database\QueryException::class);
        $this->expectExceptionMessage('Duplicate entry');

        Deposit::create([
            'user_id' => $this->user->id,
            'tx_hash' => $this->validTxHash, // Same tx_hash!
            'from_address' => '0x1234567890123456789012345678901234567890',
            'to_address' => config('services.bscscan.deposit_wallet'),
            'amount_usdt' => 10.00,
            'exact_amount_sent' => 10.05,
            'amount_trx' => 30.00,
            'exchange_rate' => 3,
            'status' => 'completed',
        ]);
    }

    /** @test */
    public function it_verifies_unique_constraint_exists_in_database()
    {
        // Check if unique index exists on tx_hash column
        $indexes = \DB::select("SHOW INDEX FROM deposits WHERE Column_name = 'tx_hash' AND Non_unique = 0");

        $this->assertNotEmpty($indexes, 'UNIQUE constraint on tx_hash does not exist!');
    }

    /** @test */
    public function it_allows_different_transactions_from_same_user()
    {
        $txHash1 = '0x1111111111111111111111111111111111111111111111111111111111111111';
        $txHash2 = '0x2222222222222222222222222222222222222222222222222222222222222222';

        // First transaction
        Http::fake([
            'api.etherscan.io/*' => Http::response([
                'status' => '1',
                'message' => 'OK',
                'result' => [
                    'blockNumber' => '0x1234567',
                    'status' => '0x1',
                    'logs' => [
                        [
                            'address' => '0x55d398326f99059fF775485246999027B3197955',
                            'topics' => [
                                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                                '0x000000000000000000000000' . substr($this->user->payout_address ?? '0x1234567890123456789012345678901234567890', 2),
                                '0x000000000000000000000000' . substr(config('services.bscscan.deposit_wallet'), 2),
                            ],
                            'data' => '0x0000000000000000000000000000000000000000000000008ac7230489e80000',
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response1 = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/telegram/verify-transaction', [
                'tx_hash' => $txHash1,
                'expected_amount' => 10.050,
            ]);

        $response1->assertStatus(200);

        // Second transaction (different TXID)
        $response2 = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/telegram/verify-transaction', [
                'tx_hash' => $txHash2,
                'expected_amount' => 10.050,
            ]);

        $response2->assertStatus(200);

        // Verify TWO deposit records exist
        $this->assertDatabaseCount('deposits', 2);

        // Verify balance is sum of both deposits
        $this->user->refresh();
        $this->assertEquals(60.00, $this->user->balance); // 30 + 30
    }
}
