<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CbtQuestion extends Model
{
    protected $fillable = ['exam_id', 'question', 'type', 'options', 'correct_answer'];

    protected $casts = ['options' => 'array'];

    // correct_answer disembunyikan otomatis saat dikirim ke siswa lewat Resource, bukan di sini
    public function exam()
    {
        return $this->belongsTo(CbtExam::class, 'exam_id');
    }
}
