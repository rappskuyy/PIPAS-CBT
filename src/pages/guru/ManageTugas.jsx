import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as api from '../../services/api'
import Navbar from '../../components/Navbar.jsx'
import Card from '../../components/Card.jsx'

export default function ManageTugas() {
  const { classId } = useParams()
  const [assignments, setAssignments] = useState([])
  const [form, setForm] = useState({ title: '', description: '', deadline: '' })

  const load = () => api.getAssignments(classId).then((res) => setAssignments(res.data))

  useEffect(() => {
    load()
  }, [classId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('deadline', form.deadline)

    await api.createAssignment(classId, fd)
    setForm({ title: '', description: '', deadline: '' })
    load()
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Kelola Tugas</h1>

        <Card title="Buat Tugas Baru" className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              placeholder="Judul tugas"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
            <textarea
              placeholder="Deskripsi tugas"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Buat Tugas
            </button>
          </form>
        </Card>

        <h2 className="font-semibold mb-3">Daftar Tugas</h2>
        <div className="space-y-3">
          {assignments.map((a) => (
            <Link key={a.id} to={`/guru/tugas/${a.id}`}>
              <Card>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-gray-500">
                  Deadline: {new Date(a.deadline).toLocaleString('id-ID')} · {a.submissions_count ?? 0} sudah mengumpulkan
                </p>
              </Card>
            </Link>
          ))}
          {assignments.length === 0 && <p className="text-gray-400">Belum ada tugas.</p>}
        </div>
      </div>
    </div>
  )
}
