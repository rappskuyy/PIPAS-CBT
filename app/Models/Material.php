<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $fillable = ['rombel_id', 'title', 'description', 'file_path', 'type'];

    public function rombel() { return $this->belongsTo(Rombel::class); }
}
