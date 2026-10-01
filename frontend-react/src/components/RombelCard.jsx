// Kartu satu rombel (dipakai di dashboard guru & siswa)
import { useState } from 'react'
import { Link } from 'react-router-dom'

const warna = ['from-blue-700 to-blue-500', 'from-emerald-600 to-emerald-400', 'from-amber-600 to-amber-400', 'from-violet-600 to-violet-400']

export default function RombelCard({ r, index, guru }) {
  const [tersalin, setTersalin] = useState(false)

  function salin() {
    navigator.clipboard.writeText(r.join_code)
    setTersalin(true)
    setTimeout(() => setTersalin(false), 1500)
  }

  return (
    <div className="card overflow-hidden">
      <Link to={`/rombel/${r.id}`}>
        <div className={`h-24 bg-gradient-to-br ${warna[index % 4]} p-4 flex items-end text-white`}>
          <p className="text-xl font-bold">{r.name}</p>
        </div>
        <div className="px-4 pt-4">
          <p className="font-bold text-sm">{r.mapel || 'Mata pelajaran belum diisi'}</p>
          {!guru && <p className="text-xs text-slate-500">Guru: {r.teacher?.name}</p>}
        </div>
      </Link>

      <div className="p-4 space-y-3">
        {guru && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold">Kode Gabung Siswa</p>
              <p className="font-mono font-bold text-sm">{r.join_code}</p>
            </div>
            <button onClick={salin} className="pill bg-blue-100 text-blue-700">{tersalin ? 'Tersalin' : 'Salin'}</button>
          </div>
        )}
        <div className="grid grid-cols-4 text-center text-xs text-slate-500">
          {[[r.students_count, 'Siswa'], [r.materials_count, 'Materi'], [r.assignments_count, 'Tugas'], [r.ujian_count, 'Ujian']].map(([n, l]) => (
            <div key={l}><p className="text-lg font-bold text-slate-900">{n}</p>{l}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
