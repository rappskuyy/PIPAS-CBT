<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabel users bawaan Laravel sudah ada, jadi kita cuma menambah kolom "role".
return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->enum('role', ['guru', 'siswa'])->default('siswa');
        });
    }
    public function down(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('role'));
    }
};
