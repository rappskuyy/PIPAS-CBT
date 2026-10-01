<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('soal_ujian', function (Blueprint $t) {
            $t->id();
            $t->foreignId('ujian_id')->constrained('ujian')->cascadeOnDelete();
            $t->text('question');
            $t->enum('type', ['mc', 'essay'])->default('mc');
            $t->json('options')->nullable();          // daftar pilihan (khusus mc)
            $t->string('correct_answer')->nullable(); // teks jawaban benar (khusus mc)
            $t->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('soal_ujian'); }
};
