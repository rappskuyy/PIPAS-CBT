<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HasilUjian;
use App\Models\Rombel;
use App\Models\Ujian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UjianController extends Controller
{
    // Guru: tiap ujian + jumlah yang sudah mengerjakan. Siswa: tiap ujian + hasil miliknya.
    public function index(Request $r, Rombel $rombel)
    {
        $u = $r->user();
        abort_unless($rombel->bisaDiakses($u), 403);

        $query = $rombel->ujian()->withCount('soal')->latest();
        $query = $u->role === 'guru'
            ? $query->withCount('hasil')
            : $query->with(['hasil' => fn ($h) => $h->where('student_id', $u->id)->select('id', 'ujian_id', 'score')]);

        return $query->get();
    }

    public function store(Request $r, Rombel $rombel)   // guru
    {
        abort_unless($rombel->teacher_id === $r->user()->id, 403);

        $data = $r->validate([
            'title' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1|max:600',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:mc,essay',
            'questions.*.options' => 'required_if:questions.*.type,mc|nullable|array|min:2',
            'questions.*.correct_answer' => 'required_if:questions.*.type,mc|nullable|string',
        ]);

        $ujian = DB::transaction(function () use ($data, $rombel) {
            $ujian = $rombel->ujian()->create([
                'title' => $data['title'],
                'duration_minutes' => $data['duration_minutes'],
            ]);
            foreach ($data['questions'] as $soal) {
                $ujian->soal()->create($soal);
            }
            return $ujian;
        });
        return response()->json($ujian, 201);
    }

    // Soal untuk siswa (kunci jawaban TIDAK ikut dikirim)
    public function kerjakan(Request $r, Ujian $ujian)
    {
        $this->pastikanBolehMengerjakan($r, $ujian);

        return [
            'ujian' => $ujian->only(['id', 'title', 'duration_minutes']),
            'soal' => $ujian->soal()->get(['id', 'question', 'type', 'options']),
        ];
    }

    // Siswa mengumpulkan jawaban -> pilihan ganda dinilai otomatis
    public function kumpul(Request $r, Ujian $ujian)
    {
        $this->pastikanBolehMengerjakan($r, $ujian);

        $validated = $r->validate([
            'answers' => 'nullable|array',
            'violations_count' => 'nullable|integer|min:0',
            'notes' => 'nullable|string|max:255',
        ]);

        $jawab = $validated['answers'] ?? [];
        $violations = $validated['violations_count'] ?? 0;
        $notes = $validated['notes'] ?? null;

        $pg = $ujian->soal()->where('type', 'mc')->get();
        $benar = $pg->filter(fn ($s) => trim((string) ($jawab[$s->id] ?? '')) === trim((string) $s->correct_answer))->count();
        $skor = $pg->count() > 0 ? (int) round($benar / $pg->count() * 100) : null;

        $hasil = HasilUjian::create([
            'ujian_id' => $ujian->id,
            'student_id' => $r->user()->id,
            'answers' => $jawab,
            'score' => $skor,
            'violations_count' => $violations,
            'notes' => $notes,
            'submitted_at' => now(),
        ]);
        return response()->json([
            'score' => $skor,
            'benar' => $benar,
            'jumlah_pg' => $pg->count(),
            'violations_count' => $violations,
            'notes' => $notes,
        ], 201);
    }

    // Riwayat aktivitas pengerjaan ujian terbaru untuk dashboard guru
    public function aktivitasTerbaru(Request $r)
    {
        $rombelIds = $r->user()->rombelDiajar()->pluck('id');
        $ujianIds = Ujian::whereIn('rombel_id', $rombelIds)->pluck('id');

        return HasilUjian::whereIn('ujian_id', $ujianIds)
            ->with([
                'student:id,name,email',
                'ujian:id,title,rombel_id',
                'ujian.rombel:id,name',
            ])
            ->latest('submitted_at')
            ->limit(15)
            ->get();
    }

    private function pastikanBolehMengerjakan(Request $r, Ujian $ujian): void
    {
        $id = $r->user()->id;
        abort_unless($ujian->rombel->students()->where('users.id', $id)->exists(), 403, 'Kamu belum bergabung di rombel ini');
        abort_if(HasilUjian::where('ujian_id', $ujian->id)->where('student_id', $id)->exists(), 422, 'Kamu sudah mengerjakan ujian ini');
    }
}
