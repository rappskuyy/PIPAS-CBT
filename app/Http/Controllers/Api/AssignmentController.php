<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Rombel;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    // Guru: tiap tugas + jumlah pengumpul. Siswa: tiap tugas + pengumpulan miliknya.
    public function index(Request $r, Rombel $rombel)
    {
        $u = $r->user();
        abort_unless($rombel->bisaDiakses($u), 403);

        $query = $rombel->assignments()->latest();
        $query = $u->role === 'guru'
            ? $query->withCount('submissions')
            : $query->with(['submissions' => fn ($s) => $s->where('student_id', $u->id)]);

        return $query->get();
    }

    public function store(Request $r, Rombel $rombel)   // guru
    {
        abort_unless($rombel->teacher_id === $r->user()->id, 403);

        $data = $r->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'required|date',
            'file' => 'nullable|file|max:51200|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,jpg,jpeg,png,webp,zip,rar,txt',
        ]);

        $tugas = $rombel->assignments()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'deadline' => $data['deadline'],
            'attachment_path' => $r->hasFile('file') ? $r->file('file')->store('tugas', 'public') : null,
        ]);
        return response()->json($tugas, 201);
    }

    // Detail tugas + semua pengumpulan (untuk guru menilai)
    public function show(Request $r, Assignment $assignment)
    {
        abort_unless($assignment->rombel->teacher_id === $r->user()->id, 403);
        return $assignment->load('submissions.student:id,name');
    }

    // Untuk dashboard guru: 10 tugas terbaru dari semua rombelnya
    public function antrean(Request $r)
    {
        $ids = $r->user()->rombelDiajar()->pluck('id');

        return Assignment::whereIn('rombel_id', $ids)
            ->with(['rombel' => fn ($q) => $q->withCount('students')])
            ->withCount([
                'submissions',
                'submissions as belum_dinilai' => fn ($q) => $q->whereNull('grade'),
            ])
            ->latest()->limit(10)->get();
    }
}
