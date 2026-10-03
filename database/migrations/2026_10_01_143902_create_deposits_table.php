<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('telegram_users')->onDelete('cascade');
            $table->string('tx_hash', 66)->unique(); // Transaction hash
            $table->string('from_address', 42); // Sender address
            $table->string('to_address', 42); // Deposit address (our wallet)
            $table->decimal('amount_usdt', 20, 8); // Amount in USDT
            $table->decimal('exact_amount_sent', 20, 8); // Exact amount user sent (with 0.5%)
            $table->decimal('amount_trx', 20, 2); // Converted TRX amount
            $table->decimal('exchange_rate', 10, 4); // Exchange rate used
            $table->string('status', 20)->default('pending'); // pending, completed, failed
            $table->timestamp('verified_at')->nullable();
            $table->text('verification_data')->nullable(); // JSON data from blockchain
            $table->string('block_number')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('tx_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deposits');
    }
};
