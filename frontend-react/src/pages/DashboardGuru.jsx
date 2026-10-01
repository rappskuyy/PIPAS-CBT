// Dashboard Guru: Ringkasan Lengkap PIPAS, Statistik KPI, Pantauan Ujian CBT & Pelanggaran, Antrean Tugas, dan Rombel Binaan
import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { pesan, tgl } from '../api.js'
import { useAuth } from '../auth.jsx'
import useFetch from '../useFetch.js'
import Icon from '../components/Icon.jsx'
import RombelCard from '../components/RombelCard.jsx'

export default function DashboardGuru({ rombel }) {
  const { user } = useAuth()
  const antrean = useFetch('/guru/tugas')
  const ujianAktivitas = useFetch('/guru/ujian-aktivitas')
  const [buka, setBuka] = useState(false)
  const [form, setForm] = useState({ name: '' })
  const [tabDashboard, setTabDashboard] = useState('tugas') // 'tugas', 'ujian', 'rombel'

  const list = rombel.data || []
  const tugas = antrean.data || []
  const aktivitas = ujianAktivitas.data || []

  const jam = new Date().getHours()
  const sapaan = jam < 11 ? 'Pagi' : jam < 15 ? 'Siang' : jam < 18 ? 'Sore' : 'Malam'

  const totalSiswa = list.reduce((n, r) => n + (r.students_count || 0), 0)
  const totalMateri = list.reduce((n, r) => n + (r.materials_count || 0), 0)
  const totalTugas = list.reduce((n, r) => n + (r.assignments_count || 0), 0)
  const totalUjian = list.reduce((n, r) => n + (r.ujian_count || 0), 0)
  const tugasBelumDinilai = tugas.reduce((n, t) => n + (t.belum_dinilai || 0), 0)
  const totalPelanggaran = aktivitas.reduce((n, a) => n + (a.violations_count || 0), 0)

  const statistik = [
    { label: 'Rombel PIPAS', nilai: list.length, satuan: 'Kelas', ikon: 'school', warna: 'text-blue-700 bg-blue-50' },
    { label: 'Total Siswa Aktif', nilai: totalSiswa, satuan: 'Siswa', ikon: 'groups', warna: 'text-indigo-700 bg-indigo-50' },
    { label: 'Tugas Perlu Dinilai', nilai: tugasBelumDinilai, satuan: 'Jawaban', ikon: 'rate_review', warna: 'text-amber-700 bg-amber-50' },
    { label: 'Ulangan Online', nilai: totalUjian, satuan: 'Paket', ikon: 'timer', warna: 'text-emerald-700 bg-emerald-50' },
    { label: 'Materi & Modul', nilai: totalMateri, satuan: 'File', ikon: 'library_books', warna: 'text-cyan-700 bg-cyan-50' },
    { label: 'Pelanggaran Ulangan', nilai: totalPelanggaran, satuan: 'Insiden Tab', ikon: 'gpp_bad', warna: totalPelanggaran > 0 ? 'text-red-700 bg-red-50' : 'text-slate-700 bg-slate-50' },
  ]

  async function buatRombel(e) {
    e.preventDefault()
    try {
      await api.post('/rombel', { name: form.name, mapel: 'PIPAS' })
      setForm({ name: '' })
      setBuka(false)
      rombel.reload()
    } catch (err) {
      alert(pesan(err))
    }
  }

  return (
    <div className="space-y-8">
      {/* Banner Sapaan Guru PIPAS */}
      <section className="card p-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md relative overflow-hidden flex flex-wrap gap-4 justify-between items-center">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur text-xs font-bold rounded-full mb-2">
            <Icon name="science" /> Pusat Kendali Pembelajaran Projek IPAS (PIPAS)
          </div>
          <h1 className="text-3xl font-black tracking-tight">Selamat {sapaan}, {user.name}! 🎓</h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl leading-relaxed">
            Pantau aktivitas belajar siswa, kelola modul & tugas praktikum, serta amankan pelaksanaan ulangan online dengan sistem anti-kecurangan terpadu.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2">
          <button
            onClick={() => setBuka(!buka)}
            className="btn bg-white text-blue-800 hover:bg-blue-50 font-bold shadow-sm"
          >
            <Icon name={buka ? 'close' : 'add_circle'} /> {buka ? 'Batal' : 'Buat Rombel Baru'}
          </button>
        </div>
      </section>

      {/* Form Buat Rombel Baru (Khusus PIPAS tanpa input mapel) */}
      {buka && (
        <form onSubmit={buatRombel} className="card p-6 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
            <Icon name="group_add" /> Tambah Rombel / Kelas PIPAS Baru
          </div>
          <div className="grid sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-slate-600 block mb-1">Nama Rombel / Kelas</label>
              <input
                className="input bg-white"
                placeholder="mis. X TKJ 1, X RPL 2, X TKR 1, X DKV 1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Mata pelajaran otomatis disetel sebagai <strong>Projek IPAS (PIPAS)</strong>. Kode gabung siswa akan dibuat otomatis.
              </p>
            </div>
            <button className="btn btn-primary justify-center h-10 w-full">
              <Icon name="save" /> Simpan Rombel
            </button>
          </div>
        </form>
      )}

      {/* Grid Statistik KPI Lengkap */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {statistik.map((st) => (
          <div key={st.label} className="card p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-bold uppercase text-slate-500 leading-tight">{st.label}</p>
              <div className={`w-8 h-8 rounded-lg ${st.warna} grid place-items-center shrink-0`}>
                <Icon name={st.ikon} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-800">{st.nilai}</p>
              <p className="text-[11px] font-semibold text-slate-400">{st.satuan}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Tab Navigasi Aktivitas Dashboard */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          ['tugas', `Antrean Penilaian Tugas (${tugasBelumDinilai})`, 'rate_review'],
          ['ujian', `Pantauan Ulangan & Pelanggaran (${aktivitas.length})`, 'security'],
          ['rombel', `Daftar Rombel PIPAS (${list.length})`, 'school'],
        ].map(([kunci, label, ikon]) => (
          <button
            key={kunci}
            onClick={() => setTabDashboard(kunci)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              tabDashboard === kunci
                ? 'border-blue-700 text-blue-700 bg-blue-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon name={ikon} /> {label}
          </button>
        ))}
      </div>

      {/* 1. TAB ANTREAN TUGAS */}
      {tabDashboard === 'tugas' && (
        <section className="card p-6 overflow-x-auto space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg text-slate-800">Antrean Pengumpulan Tugas Praktikum</h2>
              <p className="text-xs text-slate-500">Tugas yang baru dikumpulkan siswa dan menunggu pemeriksaan</p>
            </div>
          </div>

          {tugas.length === 0 ? (
            <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl">
              Belum ada tugas praktikum yang diterbitkan.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase font-bold text-slate-500 border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-3">Judul Tugas</th>
                  <th className="px-3">Rombel</th>
                  <th className="px-3">Terkumpul</th>
                  <th className="px-3">Batas Waktu</th>
                  <th className="px-3">Status Penilaian</th>
                  <th className="px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tugas.map((t, i) => (
                  <tr key={t.id} className={i % 2 ? 'bg-slate-50/50' : ''}>
                    <td className="py-3 px-3 font-bold text-slate-800">{t.title}</td>
                    <td className="px-3">
                      <span className="pill bg-blue-100 text-blue-800 text-xs font-semibold">{t.rombel.name}</span>
                    </td>
                    <td className="px-3 font-semibold text-slate-600">
                      {t.submissions_count} / {t.rombel.students_count} siswa
                    </td>
                    <td className="px-3 text-xs text-slate-500">{tgl(t.deadline)}</td>
                    <td className="px-3">
                      {t.belum_dinilai > 0 ? (
                        <span className="pill bg-amber-100 text-amber-800 font-bold text-xs">
                          ⏳ {t.belum_dinilai} Belum Dinilai
                        </span>
                      ) : (
                        <span className="pill bg-emerald-100 text-emerald-800 font-bold text-xs">
                          ✓ Selesai Dinilai
                        </span>
                      )}
                    </td>
                    <td className="px-3 text-right">
                      <Link to={`/tugas/${t.id}`} className="btn btn-primary !py-1.5 !px-3 text-xs">
                        <Icon name="rate_review" /> Periksa
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* 2. TAB PANTAUAN ULANGAN & PELANGGARAN PROCTORING */}
      {tabDashboard === 'ujian' && (
        <section className="card p-6 overflow-x-auto space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Icon name="security" /> Laporan Pengawasan & Pengumpulan Ulangan
              </h2>
              <p className="text-xs text-slate-500">
                Pantau riwayat pengerjaan siswa, skor pilihan ganda, dan deteksi pelanggaran pindah tab/aplikasi
              </p>
            </div>
            <button onClick={() => ujianAktivitas.reload()} className="btn btn-outline !py-1.5 !text-xs">
              <Icon name="refresh" /> Segarkan
            </button>
          </div>

          {aktivitas.length === 0 ? (
            <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl">
              Belum ada siswa yang menyelesaikan ulangan online.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase font-bold text-slate-500 border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-3">Nama Siswa</th>
                  <th className="px-3">Rombel</th>
                  <th className="px-3">Ulangan</th>
                  <th className="px-3 text-center">Skor PG</th>
                  <th className="px-3 text-center">Pelanggaran Tab</th>
                  <th className="px-3">Waktu Selesai</th>
                  <th className="px-3">Catatan Sistem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aktivitas.map((a, i) => {
                  const adaPelanggaran = (a.violations_count || 0) > 0
                  return (
                    <tr key={a.id} className={adaPelanggaran ? 'bg-red-50/50' : i % 2 ? 'bg-slate-50/50' : ''}>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {a.student?.name}
                        <span className="block text-[11px] text-slate-400 font-normal">{a.student?.email}</span>
                      </td>
                      <td className="px-3">
                        <span className="pill bg-slate-100 font-semibold text-xs">{a.ujian?.rombel?.name || '-'}</span>
                      </td>
                      <td className="px-3 font-semibold text-slate-700">{a.ujian?.title}</td>
                      <td className="px-3 text-center">
                        <span className={`font-black text-sm ${
                          a.score >= 75 ? 'text-emerald-700' : 'text-slate-800'
                        }`}>
                          {a.score !== null ? `${a.score}/100` : '-'}
                        </span>
                      </td>
                      <td className="px-3 text-center">
                        {adaPelanggaran ? (
                          <span className="pill bg-red-100 text-red-800 font-bold text-xs">
                            ⚠️ {a.violations_count}x Pindah Tab
                          </span>
                        ) : (
                          <span className="pill bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            ✓ Bersih (0)
                          </span>
                        )}
                      </td>
                      <td className="px-3 text-xs text-slate-500">{tgl(a.submitted_at)}</td>
                      <td className="px-3 text-xs text-slate-600 font-medium">
                        {a.notes || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* 3. TAB DAFTAR ROMBEL PIPAS */}
      {tabDashboard === 'rombel' && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Rombel Binaan Projek IPAS</h2>
            <button onClick={() => setBuka(true)} className="btn btn-primary !py-1.5 !text-xs">
              <Icon name="add" /> Tambah Rombel
            </button>
          </div>

          {list.length === 0 ? (
            <div className="card p-8 text-center bg-slate-50 border-dashed border-2 border-slate-200">
              <p className="text-slate-500 font-semibold">Belum ada rombel yang dibuat.</p>
              <button onClick={() => setBuka(true)} className="btn btn-primary mt-3">
                <Icon name="add_circle" /> Buat Rombel Pertama
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {list.map((r, i) => (
                <RombelCard key={r.id} r={r} index={i} guru />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
