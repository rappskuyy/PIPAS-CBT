// Dashboard Siswa: khusus 1 rombel, hide form kode jika sudah bergabung, dan langsung tampilkan materi/tugas/ujian
import { useState } from 'react'
import api, { pesan } from '../api.js'
import { useAuth } from '../auth.jsx'
import Icon from '../components/Icon.jsx'
import TabMateri from '../components/TabMateri.jsx'
import TabTugas from '../components/TabTugas.jsx'
import TabUjian from '../components/TabUjian.jsx'

export default function DashboardSiswa({ rombel }) {
  const { user } = useAuth()
  const [kode, setKode] = useState('')
  const [loading, setLoading] = useState(false)
  const [tabAktif, setTabAktif] = useState('materi') // 'materi', 'tugas', 'ujian'

  const list = rombel.data || []
  const rombelAktif = list.length > 0 ? list[0] : null
  const sudahGabung = Boolean(rombelAktif)

  async function gabung(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/rombel/gabung', { kode })
      setKode('')
      rombel.reload()
    } catch (err) {
      alert(pesan(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Jika BELUM bergabung ke rombel: Tampilkan form input kode */}
      {!sudahGabung && (
        <section className="card p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
            <Icon name="science" /> Portal Belajar PIPAS Siswa
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Halo, {user.name}! 👋</h1>
          <p className="text-slate-600 max-w-xl leading-relaxed">
            Selamat datang di <strong>PIPAS Space</strong>. Untuk mengakses materi, pengumpulan tugas praktikum, dan ujian online, silakan masukkan kode rombel yang diberikan oleh Guru PIPAS Anda.
          </p>
          <form onSubmit={gabung} className="flex flex-wrap gap-2 max-w-md pt-2">
            <input
              className="input font-mono uppercase font-bold tracking-wider bg-white flex-1"
              placeholder="Masukkan 6 Digit Kode Rombel"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              maxLength={10}
              required
            />
            <button className="btn btn-primary px-6" disabled={loading}>
              <Icon name="login" /> {loading ? 'Memproses...' : 'Gabung Kelas'}
            </button>
          </form>
        </section>
      )}

      {/* 2. Jika SUDAH bergabung ke rombel: Form kode di-HIDE, tampilkan kelas PIPAS langsung */}
      {sudahGabung && (
        <>
          {/* Header Rombel Siswa */}
          <section className="card p-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-wrap justify-between items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur text-xs font-semibold rounded-full mb-3">
                  <Icon name="science" /> Mata Pelajaran: Projek IPAS (PIPAS)
                </div>
                <h1 className="text-3xl font-black tracking-tight">{rombelAktif.name}</h1>
                <p className="text-blue-100 mt-1 text-sm flex items-center gap-2">
                  <span>Guru Pengampu: <strong>{rombelAktif.teacher?.name || 'Guru PIPAS'}</strong></span>
                  <span>•</span>
                  <span>Kode Kelas: <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{rombelAktif.join_code}</span></span>
                </p>
              </div>

              {/* Status Rangkuman */}
              <div className="flex gap-3 text-slate-900">
                <div className="bg-white/95 rounded-xl px-4 py-2.5 text-center min-w-[80px] shadow-sm">
                  <p className="text-xl font-bold text-blue-700">{rombelAktif.materials_count ?? '-'}</p>
                  <p className="text-[11px] font-semibold text-slate-500">Materi</p>
                </div>
                <div className="bg-white/95 rounded-xl px-4 py-2.5 text-center min-w-[80px] shadow-sm">
                  <p className="text-xl font-bold text-indigo-700">{rombelAktif.assignments_count ?? '-'}</p>
                  <p className="text-[11px] font-semibold text-slate-500">Tugas</p>
                </div>
                <div className="bg-white/95 rounded-xl px-4 py-2.5 text-center min-w-[80px] shadow-sm">
                  <p className="text-xl font-bold text-emerald-700">{rombelAktif.ujian_count ?? '-'}</p>
                  <p className="text-[11px] font-semibold text-slate-500">Ulangan</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tab Navigasi Langsung di Dashboard Siswa */}
          <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
            {[
              ['materi', 'Materi & Modul PIPAS', 'folder'],
              ['tugas', 'Tugas & Praktikum', 'assignment_turned_in'],
              ['ujian', 'Ulangan Online', 'timer'],
            ].map(([kunci, label, ikon]) => (
              <button
                key={kunci}
                onClick={() => setTabAktif(kunci)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  tabAktif === kunci
                    ? 'border-blue-700 text-blue-700 bg-blue-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon name={ikon} /> {label}
              </button>
            ))}
          </div>

          {/* Konten Tab Aktif */}
          <div>
            {tabAktif === 'materi' && <TabMateri rombelId={rombelAktif.id} guru={false} />}
            {tabAktif === 'tugas' && <TabTugas rombelId={rombelAktif.id} guru={false} />}
            {tabAktif === 'ujian' && <TabUjian rombelId={rombelAktif.id} guru={false} />}
          </div>
        </>
      )}
    </div>
  )
}
