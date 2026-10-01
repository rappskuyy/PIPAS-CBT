<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ujian extends Model
{
    protected $table = 'ujian';
    protected $fillable = ['rombel_id', 'title', 'duration_minutes'];

    public function rombel() { return $this->belongsTo(Rombel::class); }
    public function soal()   { return $this->hasMany(SoalUjian::class, 'ujian_id'); }
    public function hasil()  { return $this->hasMany(HasilUjian::class, 'ujian_id'); }
}
