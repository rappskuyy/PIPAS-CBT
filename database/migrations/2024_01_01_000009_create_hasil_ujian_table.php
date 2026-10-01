<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('hasil_ujian', function (Blueprint $t) {
            $t->id();
            $t->foreignId('ujian_id')->constrained('ujian')->cascadeOnDelete();
            $t->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $t->json('answers');
            $t->unsignedTinyInteger('score')->nullable();
            $t->dateTime('submitted_at');
            $t->timestamps();
            $t->unique(['ujian_id', 'student_id']);   // 1 siswa hanya boleh 1x mengerjakan
        });
    }
    public function down(): void { Schema::dropIfExists('hasil_ujian'); }
};
