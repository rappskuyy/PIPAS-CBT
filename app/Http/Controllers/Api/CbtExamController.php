<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CbtExam;
use App\Models\ClassRoom;
use Illuminate\Http\Request;

class CbtExamController extends Controller
{
    public function index(ClassRoom $class)
    {
        return $class->cbtExams()->withCount('questions')->get();
    }

    public function store(Request $request, ClassRoom $class)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:mc,essay',
            'questions.*.options' => 'nullable|array',
            'questions.*.correct_answer' => 'nullable|string',
        ]);

        $exam = CbtExam::create([
            'class_id' => $class->id,
            'title' => $data['title'],
            'duration_minutes' => $data['duration_minutes'],
        ]);

        foreach ($data['questions'] as $q) {
            $exam->questions()->create($q);
        }

        return response()->json($exam->load('questions'), 201);
    }

    // Soal untuk dikerjakan siswa (correct_answer disembunyikan)
    public function forStudent(CbtExam $exam)
    {
        $questions = $exam->questions()
            ->get(['id', 'exam_id', 'question', 'type', 'options']);

        return response()->json([
            'exam' => $exam->only(['id', 'title', 'duration_minutes']),
            'questions' => $questions,
        ]);
    }
}
