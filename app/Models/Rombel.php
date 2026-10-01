<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rombel extends Model
{
    protected $fillable = ['name', 'mapel', 'teacher_id', 'join_code'];

    public function teacher()     { return $this->belongsTo(User::class, 'teacher_id'); }
    public function students()    { return $this->belongsToMany(User::class, 'rombel_siswa', 'rombel_id', 'student_id'); }
    public function materials()   { return $this->hasMany(Material::class); }
    public function assignments() { return $this->hasMany(Assignment::class); }
    public function ujian()       { return $this->hasMany(Ujian::class); }

    // Boleh dilihat oleh guru pemilik atau siswa yang sudah gabung
    public function bisaDiakses(User $u): bool
    {
        return $this->teacher_id === $u->id
            || $this->students()->where('users.id', $u->id)->exists();
    }
}
