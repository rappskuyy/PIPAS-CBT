<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rombel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RombelController extends Controller
{
    // Guru: rombel yang diajar. Siswa: rombel yang diikuti.
    public function index(Request $r)
    {
        $u = $r->user();
        $query = $u->role === 'guru' ? $u->rombelDiajar() : $u->rombelDiikuti();

        return $query->with('teacher:id,name')
            ->withCount(['students', 'materials', 'assignments', 'ujian'])
            ->orderBy('rombels.id', 'desc')
            ->get();
    }

    public function store(Request $r)   // guru
    {
        $data = $r->validate(['name' => 'required|string|max:100', 'mapel' => 'nullable|string|max:100']);
        $data['mapel'] = 'PIPAS'; // Khusus mapel PIPAS

        do { $kode = strtoupper(Str::random(6)); } while (Rombel::where('join_code', $kode)->exists());

        $rombel = Rombel::create([
            'name' => $data['name'],
            'mapel' => 'PIPAS',
            'teacher_id' => $r->user()->id,
            'join_code' => $kode,
        ]);
        return response()->json($rombel, 201);
    }

    public function gabung(Request $r)  // siswa
    {
        $data = $r->validate(['kode' => 'required|string']);
        $rombel = Rombel::where('join_code', strtoupper(trim($data['kode'])))->first();

        if (! $rombel) {
            return response()->json(['message' => 'Kode rombel tidak ditemukan'], 404);
        }

        // Satu siswa hanya memiliki 1 rombel aktif di PIPAS CBT
        $r->user()->rombelDiikuti()->sync([$rombel->id]);

        return $rombel->load('teacher:id,name');
    }

    public function show(Request $r, Rombel $rombel)
    {
        abort_unless($rombel->bisaDiakses($r->user()), 403, 'Kamu tidak punya akses ke rombel ini');
        return $rombel->load('teacher:id,name');
    }

    // Tabel rekap nilai: siswa x (tugas + ujian)
    public function nilai(Request $r, Rombel $rombel)   // guru
    {
        abort_unless($rombel->teacher_id === $r->user()->id, 403);

        $tugas = $rombel->assignments()->get(['id', 'title']);
        $ujian = $rombel->ujian()->get(['id', 'title']);

        $siswa = $rombel->students()->orderBy('name')->with([
            'submissions' => fn ($q) => $q->whereIn('assignment_id', $tugas->pluck('id')),
            'hasilUjian'  => fn ($q) => $q->whereIn('ujian_id', $ujian->pluck('id')),
        ])->get()->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'email' => $s->email,
            'tugas' => (object) $s->submissions->pluck('grade', 'assignment_id')->all(),
            'ujian' => (object) $s->hasilUjian->pluck('score', 'ujian_id')->all(),
            'pelanggaran' => (object) $s->hasilUjian->pluck('violations_count', 'ujian_id')->all(),
            'catatan' => (object) $s->hasilUjian->pluck('notes', 'ujian_id')->all(),
        ]);

        return ['tugas' => $tugas, 'ujian' => $ujian, 'siswa' => $siswa];
    }
}
