<?php
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\RombelController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\UjianController;
use App\Http\Middleware\EnsureRole;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Boleh diakses guru & siswa (isi dicek di controller: hanya rombel miliknya)
    Route::get('/rombel', [RombelController::class, 'index']);
    Route::get('/rombel/{rombel}', [RombelController::class, 'show']);
    Route::get('/rombel/{rombel}/materi', [MaterialController::class, 'index']);
    Route::get('/rombel/{rombel}/tugas', [AssignmentController::class, 'index']);
    Route::get('/rombel/{rombel}/ujian', [UjianController::class, 'index']);

    // Khusus GURU
    Route::middleware(EnsureRole::class . ':guru')->group(function () {
        Route::post('/rombel', [RombelController::class, 'store']);
        Route::get('/rombel/{rombel}/nilai', [RombelController::class, 'nilai']);
        Route::post('/rombel/{rombel}/materi', [MaterialController::class, 'store']);
        Route::delete('/materi/{material}', [MaterialController::class, 'destroy']);
        Route::post('/rombel/{rombel}/tugas', [AssignmentController::class, 'store']);
        Route::get('/tugas/{assignment}', [AssignmentController::class, 'show']);
        Route::get('/guru/tugas', [AssignmentController::class, 'antrean']);
        Route::get('/guru/ujian-aktivitas', [UjianController::class, 'aktivitasTerbaru']);
        Route::put('/pengumpulan/{submission}/nilai', [SubmissionController::class, 'nilai']);
        Route::post('/rombel/{rombel}/ujian', [UjianController::class, 'store']);
    });

    // Khusus SISWA
    Route::middleware(EnsureRole::class . ':siswa')->group(function () {
        Route::post('/rombel/gabung', [RombelController::class, 'gabung']);
        Route::post('/tugas/{assignment}/kumpul', [SubmissionController::class, 'store']);
        Route::get('/ujian/{ujian}/kerjakan', [UjianController::class, 'kerjakan']);
        Route::post('/ujian/{ujian}/kumpul', [UjianController::class, 'kumpul']);
    });
});
