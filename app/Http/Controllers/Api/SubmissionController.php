<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SubmissionController extends Controller
{
    // Siswa mengumpulkan tugas. Status tepat waktu / terlambat dihitung di sini, bukan di frontend.
    public function store(Request $r, Assignment $assignment)
    {
        $u = $r->user();
        abort_unless($assignment->rombel->students()->where('users.id', $u->id)->exists(), 403, 'Kamu belum bergabung di rombel ini');

        $r->validate(['file' => 'required|file|max:51200|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,jpg,jpeg,png,webp,zip,rar,txt']);

        $lama = Submission::where('assignment_id', $assignment->id)->where('student_id', $u->id)->first();
        if ($lama && $lama->grade !== null) {
            return response()->json(['message' => 'Tugas sudah dinilai, tidak bisa dikumpulkan ulang'], 422);
        }

        $path = $r->file('file')->store('pengumpulan', 'public');
        if ($lama) Storage::disk('public')->delete($lama->file_path);

        $now = now();
        $sub = Submission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'student_id' => $u->id],
            ['file_path' => $path, 'submitted_at' => $now, 'status' => $now->gt($assignment->deadline) ? 'late' : 'ontime']
        );
        return response()->json($sub, 201);
    }

    // Guru memberi nilai
    public function nilai(Request $r, Submission $submission)
    {
        abort_unless($submission->assignment->rombel->teacher_id === $r->user()->id, 403);

        $data = $r->validate(['grade' => 'required|integer|min:0|max:100', 'feedback' => 'nullable|string']);
        $submission->update($data);
        return $submission;
    }
}
