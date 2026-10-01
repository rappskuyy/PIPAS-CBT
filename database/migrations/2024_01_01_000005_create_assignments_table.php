<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('rombel_id')->constrained('rombels')->cascadeOnDelete();
            $t->string('title');
            $t->text('description')->nullable();
            $t->string('attachment_path')->nullable();
            $t->dateTime('deadline');
            $t->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('assignments'); }
};
