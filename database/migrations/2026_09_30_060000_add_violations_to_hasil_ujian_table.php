<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('hasil_ujian', function (Blueprint $t) {
            if (!Schema::hasColumn('hasil_ujian', 'violations_count')) {
                $t->unsignedSmallInteger('violations_count')->default(0)->after('score');
            }
            if (!Schema::hasColumn('hasil_ujian', 'notes')) {
                $t->string('notes')->nullable()->after('violations_count');
            }
        });
    }

    public function down(): void
    {
        Schema::table('hasil_ujian', function (Blueprint $t) {
            $t->dropColumn(['violations_count', 'notes']);
        });
    }
};
