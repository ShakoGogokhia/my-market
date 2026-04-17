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
        Schema::table('promo_codes', function (Blueprint $table) {
            if (!Schema::hasColumn('promo_codes', 'max_uses')) {
                $table->unsignedInteger('max_uses')->default(1)->after('owner_credit_percent');
            }

            if (!Schema::hasColumn('promo_codes', 'uses_count')) {
                $table->unsignedInteger('uses_count')->default(0)->index()->after('max_uses');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promo_codes', function (Blueprint $table) {
            if (Schema::hasColumn('promo_codes', 'uses_count')) {
                $table->dropIndex(['uses_count']);
                $table->dropColumn('uses_count');
            }

            if (Schema::hasColumn('promo_codes', 'max_uses')) {
                $table->dropColumn('max_uses');
            }
        });
    }
};
