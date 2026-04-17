<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('source_system', 64)->nullable()->after('source');
            $table->string('source_external_id', 128)->nullable()->after('source_system');
            $table->index(['source_system', 'source_external_id'], 'products_source_lookup_idx');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_source_lookup_idx');
            $table->dropColumn(['source_system', 'source_external_id']);
        });
    }
};
