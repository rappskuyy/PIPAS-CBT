// Tab Ujian Online: guru lihat/buat ujian, siswa mengerjakan
import { Link } from 'react-router-dom'
import useFetch from '../useFetch.js'
import Icon from './Icon.jsx'

export default function TabUjian({ rombelId, guru }) {
  const { data } = useFetch(`/rombel/${rombelId}/ujian`)

  return (
    <div className="space-y-4">
      {guru && <Link to={`/rombel/${rombelId}/ujian-baru`} className="btn btn-primary"><Icon name="add_circle" />Buat Ulangan Baru</Link>}
      {(data || []).length === 0 && <p className="text-slate-500">Belum ada ulangan online.</p>}

      {(data || []).map((u) => {
        const hasil = u.hasil?.[0]   // hasil siswa ini (kalau sudah mengerjakan)
        return (
          <div key={u.id} className="card p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-lg">{u.title}</p>
              <div className="flex gap-2 mt-1 text-xs">
                <span className="pill bg-slate-100">{u.soal_count} soal</span>
                <span className="pill bg-slate-100">{u.duration_minutes} menit</span>
                {guru && <span className="pill bg-emerald-100 text-emerald-700">{u.hasil_count} siswa sudah mengerjakan</span>}
              </div>
            </div>
            {!guru && (hasil
              ? <span className="pill bg-emerald-100 text-emerald-700">Selesai · Nilai PG: {hasil.score ?? '-'}</span>
              : <Link to={`/ujian/${u.id}`} className="btn btn-primary"><Icon name="play_arrow" />Kerjakan</Link>)}
          </div>
        )
      })}
    </div>
  )
}
