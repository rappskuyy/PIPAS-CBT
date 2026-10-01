// Guru memeriksa & menilai pengumpulan tugas
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { fileUrl, pesan, tgl } from '../api.js'
import useFetch from '../useFetch.js'

export default function TugasGuru() {
  const { id } = useParams()
  const { data: tugas, error, reload } = useFetch(`/tugas/${id}`)

  if (error) return <p className="text-red-600">{error}</p>
  if (!tugas) return <p className="text-slate-500">Memuat...</p>

  return (
    <div className="space-y-4 max-w-3xl">
      <Link to={`/rombel/${tugas.rombel_id}?tab=tugas`} className="text-sm text-blue-700 font-semibold">← Kembali ke rombel</Link>
      <div>
        <h1 className="text-2xl font-bold">{tugas.title}</h1>
        <p className="text-sm text-slate-500">Deadline: {tgl(tugas.deadline)} · {tugas.submissions.length} siswa sudah mengumpulkan</p>
      </div>
      {tugas.submissions.length === 0 && <p className="text-slate-500">Belum ada yang mengumpulkan.</p>}
      {tugas.submissions.map((s) => <BarisNilai key={s.id} s={s} reload={reload} />)}
    </div>
  )
}

function BarisNilai({ s, reload }) {
  const [grade, setGrade] = useState(s.grade ?? '')
  const [feedback, setFeedback] = useState(s.feedback ?? '')

  async function simpan() {
    try {
      await api.put(`/pengumpulan/${s.id}/nilai`, { grade, feedback })
      reload()
    } catch (err) {
      alert(pesan(err))
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <p className="font-bold">{s.student.name}</p>
        <span className={`pill ${s.status === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {s.status === 'late' ? 'Terlambat' : 'Tepat waktu'} · {tgl(s.submitted_at)}
        </span>
      </div>
      <a href={fileUrl(s.file_path)} target="_blank" rel="noreferrer" className="text-sm text-blue-700 font-semibold">Buka file jawaban</a>
      <div className="flex gap-2 flex-wrap">
        <input className="input !w-28" type="number" min="0" max="100" placeholder="Nilai" value={grade} onChange={(e) => setGrade(e.target.value)} />
        <input className="input flex-1 min-w-48" placeholder="Catatan untuk siswa (opsional)" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        <button onClick={simpan} className="btn btn-primary">Simpan</button>
      </div>
    </div>
  )
}
