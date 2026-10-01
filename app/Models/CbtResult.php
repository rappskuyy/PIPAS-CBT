<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CbtResult extends Model
{
    protected $fillable = ['exam_id', 'student_id', 'answers', 'score', 'submitted_at'];

    protected $casts = [
        'answers' => 'array',
        'submitted_at' => 'datetime',
    ];

    public function exam()
    {
        return $this->belongsTo(CbtExam::class, 'exam_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
