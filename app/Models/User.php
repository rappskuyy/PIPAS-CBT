<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role'];
    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'password' => 'hashed'];
    }

    public function rombelDiajar()   { return $this->hasMany(Rombel::class, 'teacher_id'); }
    public function rombelDiikuti()  { return $this->belongsToMany(Rombel::class, 'rombel_siswa', 'student_id', 'rombel_id'); }
    public function submissions()    { return $this->hasMany(Submission::class, 'student_id'); }
    public function hasilUjian()     { return $this->hasMany(HasilUjian::class, 'student_id'); }
}
