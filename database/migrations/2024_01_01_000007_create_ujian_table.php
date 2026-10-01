<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ujian', function (Blueprint $t) {
            $t->id();
            $t->foreignId('rombel_id')->constrained('rombels')->cascadeOnDelete();
            $t->string('title');
            $t->unsignedSmallInteger('duration_minutes')->default(60);
            $t->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('ujian'); }
};
