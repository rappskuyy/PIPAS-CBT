# PIPAS CBT — Frontend (React)

## Setup
1. npm install
2. copy .env.example jadi .env, sesuaikan VITE_API_URL kalau backend tidak di localhost:8000
3. npm run dev   → buka http://localhost:5173

Backend Laravel HARUS jalan bersamaan (lihat README di folder pipas-backend), karena
tidak ada data dummy sama sekali — semua diambil lewat API.

## Struktur
- api.js        semua request ke Laravel lewat sini (token login otomatis ikut terkirim)
- auth.jsx       menyimpan siapa yang sedang login (useAuth())
- useFetch.js    ambil data GET dengan sekali panggil: const {data,error,reload} = useFetch('/rombel')
- components/    Layout (sidebar), RombelCard, dan 4 Tab (Materi/Tugas/Ujian/Nilai)
- pages/         satu file per halaman/route

## Alur akun
- Daftar di halaman Login = otomatis jadi akun SISWA.
- Akun GURU dibuat lewat seeder di backend (lihat README backend), bukan lewat form.

## Yang belum ada (sengaja disederhanakan)
- Lupa password, notifikasi
- Penilaian esai di Ujian Online (baru pilihan ganda yang auto-grading)
- Upload foto profil
