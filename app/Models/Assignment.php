<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = ['rombel_id', 'title', 'description', 'attachment_path', 'deadline'];
    protected $casts = ['deadline' => 'datetime'];

    public function rombel()      { return $this->belongsTo(Rombel::class); }
    public function submissions() { return $this->hasMany(Submission::class); }
}
