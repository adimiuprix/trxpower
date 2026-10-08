<?php

namespace App\Console\Commands;

use App\Services\TronService;
use Illuminate\Console\Command;

class TronWalletCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tron:wallet {action : Action to perform (balance|generate|info)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'TRON wallet management commands';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        try {
            switch ($action) {
                case 'balance':
                    $this->checkBalance();
                    break;

                case 'generate':
                    $this->generateWallet();
                    break;

                case 'info':
                    $this->showInfo();
                    break;

                default:
                    $this->error("Unknown action: {$action}");
                    $this->info('Available actions: balance, generate, info');
                    return 1;
            }

            return 0;
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Check wallet balance
     */
    protected function checkBalance(): void
    {
        $this->info('🔍 Checking TRON wallet balance...');
        $this->newLine();

        $tronService = new TronService();
        $result = $tronService->getBalance();

        if (!$result['success']) {
            $this->error('❌ Failed to get balance: ' . $result['error']);
            return;
        }

        $this->line('📍 <fg=cyan>Address:</> ' . $result['address']);
        $this->line('💰 <fg=green>Balance:</> ' . number_format($result['balance_trx'], 6) . ' TRX');
        $this->line('💰 <fg=yellow>Balance (SUN):</> ' . number_format($result['balance_sun']) . ' SUN');
        $this->newLine();

        // Show warnings
        if ($result['balance_trx'] < 10) {
            $this->warn('⚠️  Low balance warning!');
            $this->warn('   Balance is below 10 TRX. Consider topping up for withdrawals.');
        }

        if ($result['balance_trx'] < 1) {
            $this->error('🚨 Critical: Balance is below 1 TRX!');
            $this->error('   Auto-withdrawal will fail. Please top up immediately.');
        }

        // Calculate how many withdrawals possible
        $minWithdrawal = 1.0;
        $estimatedWithdrawals = floor($result['balance_trx'] / ($minWithdrawal + 0.5)); // +0.5 for fees
        $this->info("📊 Estimated withdrawals possible: ~{$estimatedWithdrawals}x (assuming 1 TRX per withdrawal)");
    }

    /**
     * Generate new wallet
     */
    protected function generateWallet(): void
    {
        $this->warn('⚠️  This will generate a NEW TRON wallet.');
        $this->warn('   Make sure to save the private key in a secure location!');
        $this->newLine();

        if (!$this->confirm('Do you want to continue?')) {
            $this->info('Cancelled.');
            return;
        }

        $this->info('🔑 Generating new TRON wallet...');
        $this->newLine();

        $tronService = new TronService();
        $result = $tronService->generateAddress();

        if (!$result['success']) {
            $this->error('❌ Failed to generate wallet: ' . $result['error']);
            return;
        }

        $this->line('✅ <fg=green>Wallet generated successfully!</>');
        $this->newLine();
        $this->line('📍 <fg=cyan>Address:</> ' . $result['address']);
        $this->line('🔐 <fg=red>Private Key:</> ' . $result['private_key']);
        $this->newLine();

        $this->warn('⚠️  IMPORTANT SECURITY NOTES:');
        $this->warn('1. Save this private key in your .env file:');
        $this->line('   TRON_PRIVATE_KEY=' . $result['private_key']);
        $this->line('   TRON_ADDRESS=' . $result['address']);
        $this->newLine();
        $this->warn('2. NEVER share your private key with anyone!');
        $this->warn('3. Transfer TRX to this address to enable withdrawals.');
        $this->warn('4. Recommended: 100-1000 TRX for auto-withdrawals.');
        $this->warn('5. Freeze TRX for Energy to reduce transaction fees.');
    }

    /**
     * Show wallet info
     */
    protected function showInfo(): void
    {
        $this->info('ℹ️  TRON Wallet Configuration');
        $this->newLine();

        $network = config('services.tron.network', 'mainnet');
        $address = config('services.tron.address', 'Not configured');
        $privateKey = config('services.tron.private_key', 'Not configured');
        $apiKey = config('services.tron.api_key', 'Not configured');

        $this->line('🌐 <fg=cyan>Network:</> ' . strtoupper($network));
        $this->line('📍 <fg=cyan>Address:</> ' . $address);
        $this->line('🔐 <fg=yellow>Private Key:</> ' . ($privateKey !== 'Not configured' ? str_repeat('•', 60) . ' (hidden)' : 'Not configured'));
        $this->line('🔑 <fg=yellow>API Key:</> ' . ($apiKey !== 'Not configured' ? str_repeat('•', 20) . ' (hidden)' : 'Optional'));
        $this->newLine();

        if ($address === 'Not configured' || $privateKey === 'Not configured') {
            $this->warn('⚠️  Wallet not configured!');
            $this->info('Run: php artisan tron:wallet generate');
            $this->info('Then update your .env file with the generated credentials.');
            return;
        }

        $this->info('✅ Wallet is configured.');
        $this->info('Run: php artisan tron:wallet balance (to check balance)');
        $this->newLine();

        // Show explorer links
        if ($network === 'testnet') {
            $this->line('🔗 <fg=cyan>Explorer:</> https://shasta.tronscan.org/#/address/' . $address);
        } else {
            $this->line('🔗 <fg=cyan>Explorer:</> https://tronscan.org/#/address/' . $address);
        }
    }
}
