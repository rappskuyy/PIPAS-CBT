<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoalUjian extends Model
{
    protected $table = 'soal_ujian';
    protected $fillable = ['ujian_id', 'question', 'type', 'options', 'correct_answer'];
    protected $casts = ['options' => 'array'];

    public function ujian() { return $this->belongsTo(Ujian::class, 'ujian_id'); }
}
