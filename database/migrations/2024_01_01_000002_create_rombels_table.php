<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rombels', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('mapel')->nullable();
            $t->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $t->string('join_code')->unique();
            $t->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('rombels'); }
};
