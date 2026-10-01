# PIPAS CBT — Backend (Laravel)

File di sini BUKAN project Laravel utuh, tapi file-file yang ditaruh ke project
Laravel baru (migration, model, controller, middleware, seeder, routes).

## Setup
1. composer create-project laravel/laravel nama-project
2. cd nama-project
3. composer require laravel/sanctum
4. php artisan install:api

5. Copy isi folder ini ke project Laravel (menimpa file yang namanya sama):
   - database/migrations/*.php        -> database/migrations/
   - database/seeders/GuruSeeder.php  -> database/seeders/
   - app/Models/*.php                 -> app/Models/  (User.php menimpa bawaan, memang disengaja)
   - app/Http/Controllers/Api/*.php   -> app/Http/Controllers/Api/
   - app/Http/Middleware/EnsureRole.php -> app/Http/Middleware/
   - routes/api.php                   -> routes/api.php (timpa yang bawaan)

6. Daftarkan middleware "role" di bootstrap/app.php, di dalam ->withMiddleware(function ($middleware) {...}):
   $middleware->alias(['role' => \App\Http\Middleware\EnsureRole::class]);
   (Kalau tidak didaftarkan sebagai alias, biarkan saja — routes/api.php sudah memanggil
    pakai nama class langsung: EnsureRole::class.':guru', jadi tetap jalan tanpa alias.)

7. Setting .env -> DB_CONNECTION=mysql, buat database baru, isi DB_DATABASE/DB_USERNAME/DB_PASSWORD

8. php artisan migrate
9. php artisan db:seed --class=GuruSeeder      (bikin akun guru@pipas.test / password123)
10. php artisan storage:link                    (supaya file upload bisa diakses lewat URL)

11. Atur CORS: php artisan config:publish cors -> edit config/cors.php
    'allowed_origins' => ['http://localhost:5173']

12. php artisan serve   → API jalan di http://localhost:8000/api

## Catatan penting
- Register di frontend HANYA membuat akun siswa. Akun guru harus lewat GuruSeeder
  di atas (silakan tambah baris lagi di GuruSeeder.php kalau perlu lebih dari 1 guru).
- Semua endpoint guru/siswa sudah dibatasi lewat middleware EnsureRole dan
  pengecekan "abort_unless(...)" di controller (guru cuma bisa akses rombel miliknya, dst).
- ERD (format SQL untuk drawSQL) ada di file erd-pipas-cbt.sql.
