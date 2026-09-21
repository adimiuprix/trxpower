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
        Schema::create('telegram_users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('telegram_id')->unique()->comment('Telegram user ID');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('username')->nullable()->index();
            $table->string('language_code', 10)->nullable();
            $table->boolean('is_premium')->default(false);
            $table->string('photo_url')->nullable();
            $table->decimal('balance', 20, 8)->default(0);
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();

            $table->index('telegram_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telegram_users');
    }
};
