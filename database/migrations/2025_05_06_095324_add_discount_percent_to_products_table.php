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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable()->unique();
            $table->decimal('price', 12, 2);
            $table->decimal('new_price', 12, 2)->nullable();
            $table->integer('in_stock')->default(0);
            $table->string('brand')->nullable();
            $table->text('image')->nullable();
            $table->boolean('visible')->default(true);
            $table->string('category')->index();
            $table->string('warranty')->nullable();
            $table->text('description')->nullable();
            $table->decimal('cost_price', 12, 2)->nullable();
            $table->decimal('markup_percent', 5, 2)->default(18);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
