import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../../services/api'
import Navbar from '../../components/Navbar.jsx'
import Card from '../../components/Card.jsx'

export default function ManageMateri() {
  const { classId } = useParams()
  const [materials, setMaterials] = useState([])
  const [form, setForm] = useState({ title: '', description: '', type: 'text' })
  const [file, setFile] = useState(null)

  const load = () => api.getMaterials(classId).then((res) => setMaterials(res.data))

  useEffect(() => {
    load()
  }, [classId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('type', form.type)
    if (file) fd.append('file', file)

    await api.createMaterial(classId, fd)
    setForm({ title: '', description: '', type: 'text' })
    setFile(null)
    load()
  }

  const handleDelete = async (id) => {
    await api.deleteMaterial(id)
    load()
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Kelola Materi</h1>

        <Card title="Tambah Materi" className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              placeholder="Judul materi"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
            <textarea
              placeholder="Deskripsi (opsional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="text">Teks</option>
              <option value="pdf">PDF</option>
              <option value="video">Video (link)</option>
              <option value="link">Link</option>
            </select>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Simpan
            </button>
          </form>
        </Card>

        <h2 className="font-semibold mb-3">Daftar Materi</h2>
        <div className="space-y-3">
          {materials.map((m) => (
            <Card key={m.id}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{m.title}</p>
                  <p className="text-sm text-gray-500">{m.description}</p>
                </div>
                <button onClick={() => handleDelete(m.id)} className="text-red-500 text-sm">
                  Hapus
                </button>
              </div>
            </Card>
          ))}
          {materials.length === 0 && <p className="text-gray-400">Belum ada materi.</p>}
        </div>
      </div>
    </div>
  )
}
