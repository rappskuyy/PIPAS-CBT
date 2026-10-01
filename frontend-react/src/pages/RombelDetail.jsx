// Halaman satu rombel, isinya 3 tab (guru punya tab ke-4: Rekap Nilai)
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import useFetch from '../useFetch.js'
import Icon from '../components/Icon.jsx'
import TabMateri from '../components/TabMateri.jsx'
import TabTugas from '../components/TabTugas.jsx'
import TabUjian from '../components/TabUjian.jsx'
import TabNilai from '../components/TabNilai.jsx'

export default function RombelDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const guru = user.role === 'guru'
  const { data: rombel, error } = useFetch(`/rombel/${id}`)
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'materi'

  const daftarTab = [['materi', 'Materi', 'folder'], ['tugas', 'Tugas', 'assignment_turned_in'], ['ujian', 'Ujian Online', 'timer']]
  if (guru) daftarTab.push(['nilai', 'Rekap Nilai', 'query_stats'])

  if (error) return <p className="text-red-600">{error}</p>
  if (!rombel) return <p className="text-slate-500">Memuat...</p>

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-sm text-blue-700 font-semibold hover:underline">← Kembali ke Dashboard</Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="pill bg-blue-100 text-blue-800 text-xs font-bold">PIPAS (Projek IPAS)</span>
        </div>
        <h1 className="text-3xl font-bold mt-1 text-slate-900">{rombel.name}</h1>
        <p className="text-slate-500 text-sm mt-1">
          Guru Pengampu: <strong>{rombel.teacher?.name}</strong>
          {guru && <> · Kode Gabung Siswa: <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{rombel.join_code}</span></>}
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {daftarTab.map(([kunci, label, ikon]) => (
          <button key={kunci} onClick={() => setParams({ tab: kunci })}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap ${tab === kunci ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'}`}>
            <Icon name={ikon} /> {label}
          </button>
        ))}
      </div>

      {tab === 'materi' && <TabMateri rombelId={id} guru={guru} />}
      {tab === 'tugas' && <TabTugas rombelId={id} guru={guru} />}
      {tab === 'ujian' && <TabUjian rombelId={id} guru={guru} />}
      {tab === 'nilai' && guru && <TabNilai rombelId={id} />}
    </div>
  )
}
