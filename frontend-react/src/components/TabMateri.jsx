// Tab Materi: guru bisa import/upload file materi PIPAS, link video, atau teks; siswa bisa membaca & mengunduh
import { useState } from 'react'
import api, { fileUrl, pesan } from '../api.js'
import useFetch from '../useFetch.js'
import Icon from './Icon.jsx'

const kosong = { title: '', description: '', type: 'pdf', link: '' }
const ikon = { pdf: 'description', link: 'play_circle', text: 'article' }

export default function TabMateri({ rombelId, guru }) {
  const { data, reload } = useFetch(`/rombel/${rombelId}/materi`)
  const [form, setForm] = useState(kosong)
  const [file, setFile] = useState(null)
  const [fileKey, setFileKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formBuka, setFormBuka] = useState(false)

  const ubah = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function handleFilePilih(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    // Otomatis isi judul jika masih kosong
    if (!form.title.trim()) {
      const namaBersih = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setForm((prev) => ({ ...prev, title: namaBersih }))
    }
  }

  async function simpan(e) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (file) fd.append('file', file)

    try {
      await api.post(`/rombel/${rombelId}/materi`, fd)
      setForm(kosong)
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

  async function hapus(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) return
    try {
      await api.delete(`/materi/${id}`)
      reload()
    } catch (err) {
      alert(pesan(err))
    }
  }

  return (
    <div className="space-y-6">
      {/* Tombol Guru untuk Tambah / Import Materi */}
      {guru && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setFormBuka(!formBuka)}
            className="btn btn-primary shadow-sm"
          >
            <Icon name={formBuka ? 'close' : 'upload_file'} />
            {formBuka ? 'Tutup Form' : 'Upload / Import Materi Baru'}
          </button>
        </div>
      )}

      {guru && formBuka && (
        <form onSubmit={simpan} className="card p-6 space-y-4 border-l-4 border-blue-600 bg-white shadow-md">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            <Icon name="library_add" /> Upload & Publikasikan Materi PIPAS
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Judul Materi Pembelajaran</label>
            <input
              className="input"
              placeholder="mis. Modul 1: Besaran, Satuan, dan Pengukuran dalam IPA"
              value={form.title}
              onChange={ubah('title')}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Deskripsi / Rangkuman Singkat (Opsional)</label>
            <textarea
              className="input min-h-[70px]"
              placeholder="Berikan ringkasan atau panduan belajar untuk siswa..."
              value={form.description}
              onChange={ubah('description')}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Tipe Materi</label>
              <select className="input" value={form.type} onChange={ubah('type')}>
                <option value="pdf">Import Dokumen File (PDF / Word / PPT / Excel / Video)</option>
                <option value="link">Tautan Luar / Video YouTube / Web</option>
                <option value="text">Artikel / Teks Bacaan Saja</option>
              </select>
            </div>

            {form.type === 'pdf' && (
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pilih File Dokumen</label>
                <input
                  key={fileKey}
                  type="file"
                  className="input py-1.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip,.rar,.txt,.mp4"
                  onChange={handleFilePilih}
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Mendukung PDF, Word, PowerPoint, Excel, Gambar, Video (Maks. 50MB)</p>
              </div>
            )}

            {form.type === 'link' && (
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">URL / Link Tautan</label>
                <input
                  className="input"
                  type="url"
                  placeholder="https://youtube.com/... atau https://drive.google.com/..."
                  value={form.link}
                  onChange={ubah('link')}
                  required
                />
              </div>
            )}
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
              <Icon name="cloud_upload" /> {loading ? 'Mengunggah...' : 'Simpan Materi'}
            </button>
          </div>
        </form>
      )}

      {/* Daftar Materi */}
      {(data || []).length === 0 && (
        <div className="card p-8 text-center bg-slate-50 border-dashed border-2 border-slate-200">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 mx-auto grid place-items-center mb-2">
            <Icon name="folder_open" />
          </div>
          <p className="font-bold text-slate-700">Belum Ada Materi Pembelajaran</p>
          <p className="text-xs text-slate-500 mt-1">
            {guru ? 'Klik "Upload / Import Materi Baru" di atas untuk menambahkan modul pelajaran PIPAS.' : 'Guru pengampu belum mengunggah materi pembelajaran untuk kelas ini.'}
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {(data || []).map((m) => (
          <div key={m.id} className="card p-5 flex items-start gap-4 hover:border-blue-300 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 grid place-items-center shrink-0">
              <Icon name={ikon[m.type]} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-base text-slate-900">{m.title}</p>
                <span className="pill bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                  {m.type === 'pdf' ? 'Dokumen / File' : m.type === 'link' ? 'Tautan Eksternal' : 'Teks'}
                </span>
              </div>
              {m.description && (
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                  {m.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {m.type !== 'text' && (
                <a
                  href={fileUrl(m.file_path)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary !py-1.5 !px-3 text-xs"
                >
                  <Icon name="visibility" /> Buka Materi
                </a>
              )}
              {guru && (
                <button
                  onClick={() => hapus(m.id)}
                  className="btn btn-outline text-red-600 hover:bg-red-50 !py-1.5 !px-2.5 text-xs"
                  title="Hapus Materi"
                >
                  <Icon name="delete" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
