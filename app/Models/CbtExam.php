<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CbtExam extends Model
{
    protected $fillable = ['class_id', 'title', 'duration_minutes'];

    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class, 'class_id');
    }

    public function questions()
    {
        return $this->hasMany(CbtQuestion::class, 'exam_id');
    }

    public function results()
    {
        return $this->hasMany(CbtResult::class, 'exam_id');
    }
}
