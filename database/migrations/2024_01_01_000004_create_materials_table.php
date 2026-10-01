<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('materials', function (Blueprint $t) {
            $t->id();
            $t->foreignId('rombel_id')->constrained('rombels')->cascadeOnDelete();
            $t->string('title');
            $t->text('description')->nullable();
            $t->string('file_path')->nullable();   // path file, atau URL kalau type = link
            $t->enum('type', ['pdf', 'link', 'text'])->default('text');
            $t->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('materials'); }
};
