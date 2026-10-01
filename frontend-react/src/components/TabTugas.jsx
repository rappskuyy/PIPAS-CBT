// Tab Tugas: guru membuat & melampirkan lembar kerja/tugas praktikum PIPAS, siswa mengumpulkan dokumen jawaban
import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { fileUrl, pesan, tgl } from '../api.js'
import useFetch from '../useFetch.js'
import Icon from './Icon.jsx'

export default function TabTugas({ rombelId, guru }) {
  const { data, reload } = useFetch(`/rombel/${rombelId}/tugas`)
  const [form, setForm] = useState({ title: '', description: '', deadline: '' })
  const [file, setFile] = useState(null)
  const [fileKey, setFileKey] = useState(0)
  const [formBuka, setFormBuka] = useState(false)
  const [loading, setLoading] = useState(false)

  const ubah = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function buatTugas(e) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (file) fd.append('file', file)

    try {
      await api.post(`/rombel/${rombelId}/tugas`, fd)
      setForm({ title: '', description: '', deadline: '' })
      setFile(null)
      setFileKey(fileKey + 1)
      setFormBuka(false)
      reload()
    } catch (err) {
      alert(pesan(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {guru && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setFormBuka(!formBuka)}
            className="btn btn-primary shadow-sm"
          >
            <Icon name={formBuka ? 'close' : 'add_task'} />
            {formBuka ? 'Tutup Form' : 'Buat Tugas / Praktikum Baru'}
          </button>
        </div>
      )}

      {guru && formBuka && (
        <form onSubmit={buatTugas} className="card p-6 space-y-4 border-l-4 border-indigo-600 bg-white shadow-md">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            <Icon name="assignment" /> Buat Tugas / Lembar Kerja Praktikum PIPAS
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Judul Tugas / Praktikum</label>
            <input
              className="input"
              placeholder="mis. Laporan Praktikum Pengamatan Ekosistem Sekolah"
              value={form.title}
              onChange={ubah('title')}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Petunjuk Pengerjaan & Ketentuan</label>
            <textarea
              className="input min-h-[90px]"
              placeholder="Tuliskan instruksi langkah kerja praktikum, format laporan, dan kriteria penilaian..."
              value={form.description}
              onChange={ubah('description')}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Batas Waktu Pengumpulan (Deadline)</label>
              <input
                className="input"
                type="datetime-local"
                value={form.deadline}
                onChange={ubah('deadline')}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Lampiran Lembar Kerja / Dokumen Soal (Opsional)
              </label>
              <input
                key={fileKey}
                type="file"
                className="input py-1.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip,.rar,.txt"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <p className="text-[11px] text-slate-400 mt-1">Mendukung PDF, Word, Excel, Gambar, dll.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFormBuka(false)}
              className="btn btn-outline"
            >
              Batal
            </button>
            <button className="btn btn-primary px-6" disabled={loading}>
              <Icon name="save" /> {loading ? 'Menyimpan...' : 'Terbitkan Tugas'}
            </button>
          </div>
        </form>
      )}

      {(data || []).length === 0 && (
        <div className="card p-8 text-center bg-slate-50 border-dashed border-2 border-slate-200">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 mx-auto grid place-items-center mb-2">
            <Icon name="assignment" />
          </div>
          <p className="font-bold text-slate-700">Belum Ada Tugas / Praktikum</p>
          <p className="text-xs text-slate-500 mt-1">
            {guru
              ? 'Klik "Buat Tugas / Praktikum Baru" untuk memberikan lembar kerja kepada siswa.'
              : 'Belum ada tugas atau lembar kerja yang diberikan oleh guru.'}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {(data || []).map((t) => (
          <div key={t.id} className="card p-5 space-y-3 hover:border-indigo-300 transition-colors">
            <div className="flex justify-between gap-3 flex-wrap items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-lg text-slate-900">{t.title}</p>
                  <span className="pill bg-indigo-50 text-indigo-700 text-xs font-semibold">Tugas PIPAS</span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Icon name="schedule" /> Batas Pengumpulan: <strong>{tgl(t.deadline)}</strong>
                </p>
              </div>

              {guru && (
                <div className="flex items-center gap-2">
                  <span className="pill bg-slate-100 font-bold text-xs">
                    {t.submissions_count} Siswa Mengumpulkan
                  </span>
                  <Link to={`/tugas/${t.id}`} className="btn btn-primary !py-1.5 !px-3 text-xs">
                    <Icon name="rate_review" /> Periksa & Beri Nilai
                  </Link>
                </div>
              )}
            </div>

            {t.description && (
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg whitespace-pre-line leading-relaxed">
                {t.description}
              </p>
            )}

            {t.attachment_path && (
              <div className="flex items-center gap-2">
                <a
                  href={fileUrl(t.attachment_path)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Icon name="attachment" /> Unduh Dokumen / Lampiran Tugas
                </a>
              </div>
            )}

            {!guru && <KumpulTugas tugas={t} reload={reload} />}
          </div>
        ))}
      </div>
    </div>
  )
}

// Bagian siswa: status pengumpulan + tombol upload dokumen jawaban
function KumpulTugas({ tugas, reload }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const s = tugas.submissions?.[0]
  const lewat = new Date() > new Date(tugas.deadline)
  const sudahDinilai = s && s.grade !== null

  async function kirim() {
    if (!file) return alert('Silakan pilih file dokumen jawaban Anda terlebih dahulu.')
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)

    try {
      await api.post(`/tugas/${tugas.id}/kumpul`, fd)
      setFile(null)
      reload()
    } catch (err) {
      alert(pesan(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-t border-slate-200 pt-3 mt-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-600">Status Pengumpulan Tugas:</span>
        {!s && (
          <span
            className={`pill text-xs font-bold ${
              lewat ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {lewat ? '⚠️ Belum Mengumpulkan (Lewat Deadline)' : '⏳ Belum Mengumpulkan'}
          </span>
        )}
        {s && (
          <div className="flex items-center gap-2">
            <span
              className={`pill text-xs font-bold ${
                s.status === 'late'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {s.status === 'late' ? '✓ Dikumpulkan (Terlambat)' : '✓ Terkumpul Tepat Waktu'}
            </span>
            {sudahDinilai && (
              <span className="pill bg-blue-100 text-blue-800 font-bold text-xs">
                Nilai: {s.grade} / 100
              </span>
            )}
          </div>
        )}
      </div>

      {s && (
        <div className="bg-slate-50 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Icon name="description" />
            <span>Dokumen Terkirim:</span>
            <a
              href={fileUrl(s.file_path)}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-blue-700 hover:underline"
            >
              Lihat File Saya
            </a>
          </div>
          <span className="text-slate-400">Dikirim: {tgl(s.submitted_at)}</span>
        </div>
      )}

      {sudahDinilai && s.feedback && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
          <p className="font-bold flex items-center gap-1">
            <Icon name="feedback" /> Catatan / Umpan Balik Guru:
          </p>
          <p className="mt-1">{s.feedback}</p>
        </div>
      )}

      {!sudahDinilai && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <input
            type="file"
            className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip,.rar,.txt"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            onClick={kirim}
            disabled={loading || !file}
            className="btn btn-primary !py-1.5 !px-4 text-xs disabled:opacity-50"
          >
            <Icon name="cloud_upload" />{' '}
            {loading ? 'Mengunggah...' : s ? 'Upload Ulang Tugas' : 'Kumpulkan Dokumen Tugas'}
          </button>
        </div>
      )}
    </div>
  )
}
