<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promo_owner_credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promocode_id')->constrained('promo_codes')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('credited_user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('credited_amount', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promo_owner_credits');
    }
};
