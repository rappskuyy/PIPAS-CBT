<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

// Akun guru dibuat lewat seeder (register di web hanya untuk siswa).
// Jalankan: php artisan db:seed --class=GuruSeeder
class GuruSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'guru@pipas.test'],
            ['name' => 'Guru PIPAS', 'password' => 'password123', 'role' => 'guru']
        );
    }
}
