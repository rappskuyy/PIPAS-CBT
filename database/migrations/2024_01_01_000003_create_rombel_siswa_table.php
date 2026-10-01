<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rombel_siswa', function (Blueprint $t) {
            $t->id();
            $t->foreignId('rombel_id')->constrained('rombels')->cascadeOnDelete();
            $t->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $t->unique(['rombel_id', 'student_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('rombel_siswa'); }
};
