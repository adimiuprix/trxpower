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
        Schema::table('task_submissions', function (Blueprint $table) {
            // Add claimed_at column to track when reward was claimed
            $table->unsignedBigInteger('claimed_at')
                  ->nullable()
                  ->after('is_claimed')
                  ->comment('Unix timestamp when reward was claimed');
            
            // Add index for efficient reset queries
            $table->index(['task_id', 'claimed_at'], 'idx_task_claimed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_submissions', function (Blueprint $table) {
            $table->dropIndex('idx_task_claimed_at');
            $table->dropColumn('claimed_at');
        });
    }
};
