<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Daftar akun baru: selalu berperan "siswa". Akun guru dibuat lewat GuruSeeder.
    public function register(Request $r)
    {
        $data = $r->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);
        $user = User::create($data + ['role' => 'siswa']);

        return response()->json(['user' => $user, 'token' => $user->createToken('web')->plainTextToken], 201);
    }

    public function login(Request $r)
    {
        $data = $r->validate(['email' => 'required|email', 'password' => 'required']);
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'Email atau password salah.']);
        }
        return ['user' => $user, 'token' => $user->createToken('web')->plainTextToken];
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()->delete();
        return ['message' => 'Logout berhasil'];
    }

    public function me(Request $r)
    {
        return $r->user();
    }
}
