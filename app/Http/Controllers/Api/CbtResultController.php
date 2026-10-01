<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CbtExam;
use App\Models\CbtResult;
use Illuminate\Http\Request;

class CbtResultController extends Controller
{
    // Siswa submit jawaban -> auto grading untuk soal pilihan ganda (mc)
    public function store(Request $request, CbtExam $exam)
    {
        $data = $request->validate([
            'answers' => 'required|array', // format: { question_id: jawaban }
        ]);

        $questions = $exam->questions;
        $mcQuestions = $questions->where('type', 'mc');

        $correctCount = 0;
        foreach ($mcQuestions as $q) {
            if (isset($data['answers'][$q->id]) && $data['answers'][$q->id] === $q->correct_answer) {
                $correctCount++;
            }
        }

        $score = $mcQuestions->count() > 0
            ? round(($correctCount / $mcQuestions->count()) * 100)
            : null; // null kalau semua soal essay, nunggu guru nilai manual

        $result = CbtResult::updateOrCreate(
            ['exam_id' => $exam->id, 'student_id' => $request->user()->id],
            [
                'answers' => $data['answers'],
                'score' => $score,
                'submitted_at' => now(),
            ]
        );

        return response()->json($result, 201);
    }

    public function index(CbtExam $exam)
    {
        return $exam->results()->with('student:id,name')->get();
    }
}
