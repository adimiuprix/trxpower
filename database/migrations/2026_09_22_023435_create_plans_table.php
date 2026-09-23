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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 20, 8);
            $table->decimal('earning_rate', 20, 8);
            $table->decimal('daily_profit', 20, 8);
            $table->decimal('daily_roi_percent', 8, 2);
            $table->unsignedInteger('duration');
            $table->string('hashrate');
            $table->string('badge_text')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_free');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
