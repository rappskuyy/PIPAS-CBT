<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Rombel;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    public function index(Request $r, Rombel $rombel)
    {
        abort_unless($rombel->bisaDiakses($r->user()), 403);
        return $rombel->materials()->latest()->get();
    }

    public function store(Request $r, Rombel $rombel)   // guru
    {
        abort_unless($rombel->teacher_id === $r->user()->id, 403);

        $data = $r->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:pdf,link,text',
            'file' => 'required_if:type,pdf|nullable|file|max:51200|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,jpg,jpeg,png,webp,zip,rar,txt,mp4',
            'link' => 'required_if:type,link|nullable|url',
        ]);

        $path = null;
        if ($data['type'] === 'pdf')  $path = $r->file('file')->store('materi', 'public');
        if ($data['type'] === 'link') $path = $data['link'];

        $material = $rombel->materials()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'type' => $data['type'],
            'file_path' => $path,
        ]);
        return response()->json($material, 201);
    }

    public function destroy(Request $r, Material $material)   // guru
    {
        abort_unless($material->rombel->teacher_id === $r->user()->id, 403);
        $material->delete();
        return ['message' => 'Materi dihapus'];
    }
}
