<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ClassRoomController extends Controller
{
    // Guru: lihat kelas yang diajar. Siswa: lihat kelas yang diikuti.
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isGuru()) {
            return $user->taughtClasses()->withCount('students')->get();
        }

        return $user->classes()->with('teacher:id,name')->get();
    }

    // Guru membuat kelas baru
    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:255']);

        $class = ClassRoom::create([
            'name' => $data['name'],
            'teacher_id' => $request->user()->id,
            'join_code' => strtoupper(Str::random(6)),
        ]);

        return response()->json($class, 201);
    }

    // Siswa join kelas pakai kode
    public function join(Request $request)
    {
        $data = $request->validate(['join_code' => 'required|string']);

        $class = ClassRoom::where('join_code', strtoupper($data['join_code']))->firstOrFail();

        $class->students()->syncWithoutDetaching([$request->user()->id]);

        return response()->json(['message' => 'Berhasil join kelas', 'class' => $class]);
    }

    public function show(ClassRoom $class)
    {
        return $class->load('teacher:id,name', 'students:id,name,email');
    }
}
