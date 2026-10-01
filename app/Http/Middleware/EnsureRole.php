<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

// Dipakai di routes: EnsureRole::class.':guru'  atau  EnsureRole::class.':siswa'
class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        if ($request->user()?->role !== $role) {
            abort(403, 'Akses ditolak untuk peran kamu');
        }
        return $next($request);
    }
}
