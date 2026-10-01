<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HasilUjian extends Model
{
    protected $table = 'hasil_ujian';
    protected $fillable = ['ujian_id', 'student_id', 'answers', 'score', 'violations_count', 'notes', 'submitted_at'];
    protected $casts = ['answers' => 'array', 'submitted_at' => 'datetime', 'violations_count' => 'integer'];

    public function ujian()   { return $this->belongsTo(Ujian::class, 'ujian_id'); }
    public function student() { return $this->belongsTo(User::class, 'student_id'); }
}
