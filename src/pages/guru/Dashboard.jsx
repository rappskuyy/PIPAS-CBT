import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../services/api'
import Navbar from '../../components/Navbar.jsx'
import Card from '../../components/Card.jsx'

export default function GuruDashboard() {
  const [classes, setClasses] = useState([])
  const [name, setName] = useState('')

  const load = () => api.getClasses().then((res) => setClasses(res.data))

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await api.createClass({ name })
    setName('')
    load()
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Guru</h1>

        <Card title="Buat Kelas Baru" className="mb-6">
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kelas, mis. Kelas X IPA 1"
              className="flex-1 border rounded px-3 py-2"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Buat
            </button>
          </form>
        </Card>

        <h2 className="font-semibold mb-3">Kelas Saya</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {classes.map((c) => (
            <Link key={c.id} to={`/guru/kelas/${c.id}`}>
              <Card>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-500">
                  Kode join: <span className="font-mono">{c.join_code}</span> · {c.students_count ?? 0} siswa
                </p>
              </Card>
            </Link>
          ))}
          {classes.length === 0 && <p className="text-gray-400">Belum ada kelas.</p>}
        </div>
      </div>
    </div>
  )
}
