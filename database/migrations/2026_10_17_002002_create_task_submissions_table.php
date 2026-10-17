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
        Schema::create('task_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('telegram_users')->onDelete('cascade');
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->boolean('is_claimed')->default(false);
            $table->unsignedBigInteger('claimed_at')->nullable()->comment('Unix timestamp when reward was claimed');

            $table->timestamps();
            
            // Unique constraint: one submission per user per task
            $table->unique(['user_id', 'task_id']);

            $table->index(['task_id', 'claimed_at'], 'idx_task_claimed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_submissions');
    }
};
