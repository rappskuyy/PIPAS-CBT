<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $t->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $t->string('file_path');
            $t->dateTime('submitted_at');
            $t->enum('status', ['ontime', 'late'])->default('ontime');
            $t->unsignedTinyInteger('grade')->nullable();
            $t->text('feedback')->nullable();
            $t->timestamps();
            $t->unique(['assignment_id', 'student_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('submissions'); }
};
