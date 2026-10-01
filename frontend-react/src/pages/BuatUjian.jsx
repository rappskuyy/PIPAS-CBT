// Guru membuat ujian online: judul, durasi, daftar soal, serta import soal dari PDF/Word/Teks
import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api, { pesan } from '../api.js'
import Icon from '../components/Icon.jsx'
import ModalImportSoal from '../components/ModalImportSoal.jsx'

const soalKosong = () => ({ question: '', type: 'mc', options: ['', '', '', ''], correct_answer: '' })

export default function BuatUjian() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [durasi, setDurasi] = useState(60)
  const [soal, setSoal] = useState([soalKosong()])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalImportBuka, setModalImportBuka] = useState(false)

  const ubahSoal = (i, patch) => setSoal(soal.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const ubahOpsi = (i, oi, val) =>
    ubahSoal(i, { options: soal[i].options.map((o, idx) => (idx === oi ? val : o)) })
  const tambahSoal = () => setSoal([...soal, soalKosong()])
  const hapusSoal = (i) => setSoal(soal.filter((_, idx) => idx !== i))

  function handleHasilImport(daftarSoalBaru) {
    if (!daftarSoalBaru || daftarSoalBaru.length === 0) return

    // Jika daftar soal saat ini hanya 1 dan masih kosong, timpa langsung
    const isSingleEmpty = soal.length === 1 && !soal[0].question.trim()
    if (isSingleEmpty) {
      setSoal(daftarSoalBaru)
    } else {
      setSoal([...soal, ...daftarSoalBaru])
    }
  }

  async function simpan(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post(`/rombel/${id}/ujian`, {
        title,
        duration_minutes: Number(durasi),
        questions: soal.map((s) => ({
          question: s.question,
          type: s.type,
          options: s.type === 'mc' ? s.options.filter(Boolean) : null,
          correct_answer: s.type === 'mc' ? s.correct_answer : null,
        })),
      })
      navigate(`/rombel/${id}?tab=ujian`)
    } catch (err) {
      setError(pesan(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={simpan} className="max-w-3xl space-y-6 pb-12">
      <div>
        <Link to={`/rombel/${id}?tab=ujian`} className="text-sm text-blue-700 font-semibold hover:underline">
          ← Kembali ke rombel
        </Link>
        <div className="flex flex-wrap justify-between items-center gap-3 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Buat Ulangan Online PIPAS</h1>
            <p className="text-xs text-slate-500">Mata Pelajaran: Projek IPAS (PIPAS)</p>
          </div>
          <button
            type="button"
            onClick={() => setModalImportBuka(true)}
            className="btn bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm"
          >
            <Icon name="upload_file" /> Import Soal (PDF / Word / Teks)
          </button>
        </div>
      </div>

      {/* Info Ujian */}
      <div className="card p-6 space-y-4 border-l-4 border-blue-600">
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Judul Ujian PIPAS</label>
          <input
            className="input"
            placeholder="mis. Penilaian Harian Bab 1: Zat dan Perubahannya"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Durasi Pengerjaan (menit)</label>
          <input
            className="input"
            type="number"
            min="1"
            max="600"
            value={durasi}
            onChange={(e) => setDurasi(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Header Daftar Soal */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">
          Daftar Butir Soal ({soal.length} Soal)
        </h2>
        <button
          type="button"
          onClick={() => setModalImportBuka(true)}
          className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
        >
          <Icon name="file_upload" /> Import Dokumen
        </button>
      </div>

      {/* Butir Soal */}
      <div className="space-y-4">
        {soal.map((s, i) => (
          <div key={i} className="card p-5 space-y-3 relative group border-t-2 border-slate-200">
            <div className="flex justify-between items-center">
              <span className="pill bg-blue-100 text-blue-800 font-bold text-xs">
                Soal #{i + 1}
              </span>
              {soal.length > 1 && (
                <button
                  type="button"
                  onClick={() => hapusSoal(i)}
                  className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1"
                >
                  <Icon name="delete" /> Hapus Soal
                </button>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Pertanyaan</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Tulis pertanyaan soal di sini..."
                value={s.question}
                onChange={(e) => ubahSoal(i, { question: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Tipe Soal</label>
              <select
                className="input"
                value={s.type}
                onChange={(e) => ubahSoal(i, { type: e.target.value })}
              >
                <option value="mc">Pilihan Ganda (Dinilai Otomatis)</option>
                <option value="essay">Esai / Uraian (Dinilai Manual)</option>
              </select>
            </div>

            {s.type === 'mc' && (
              <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-600">Pilihan Jawaban (A, B, C, D):</p>
                {s.options.map((o, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-center text-xs text-slate-500">
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    <input
                      className="input bg-white flex-1 text-sm"
                      placeholder={`Pilihan ${String.fromCharCode(65 + oi)}`}
                      value={o}
                      onChange={(e) => ubahOpsi(i, oi, e.target.value)}
                      required
                    />
                  </div>
                ))}

                <div className="pt-2">
                  <label className="text-xs font-bold text-emerald-800 block mb-1">
                    Kunci Jawaban yang Benar:
                  </label>
                  <select
                    className="input bg-white border-emerald-300 text-emerald-900 font-semibold"
                    value={s.correct_answer}
                    onChange={(e) => ubahSoal(i, { correct_answer: e.target.value })}
                    required
                  >
                    <option value="">-- Pilih Jawaban yang Benar --</option>
                    {s.options.filter(Boolean).map((o, oi) => (
                      <option key={oi} value={o}>
                        {String.fromCharCode(65 + oi)}. {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <button type="button" onClick={tambahSoal} className="btn btn-outline">
          <Icon name="add" /> Tambah Soal Manual
        </button>
        <button
          type="button"
          onClick={() => setModalImportBuka(true)}
          className="btn btn-outline text-emerald-700 border-emerald-300 hover:bg-emerald-50"
        >
          <Icon name="upload_file" /> Import Soal Dokumen
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl font-semibold">{error}</p>}

      <button
        className="btn btn-primary w-full justify-center py-3 text-base shadow-md disabled:opacity-50"
        disabled={loading}
      >
        <Icon name="save" /> {loading ? 'Menyimpan Ujian...' : 'Simpan & Publikasikan Ujian'}
      </button>

      {/* Modal Import */}
      <ModalImportSoal
        isOpen={modalImportBuka}
        onClose={() => setModalImportBuka(false)}
        onImport={handleHasilImport}
      />
    </form>
  )
}
