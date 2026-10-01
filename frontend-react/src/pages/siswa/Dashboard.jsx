import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../../services/api'
import Navbar from '../../components/Navbar.jsx'
import Card from '../../components/Card.jsx'

export default function SiswaDashboard() {
  const [classes, setClasses] = useState([])
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')

  const load = () => api.getClasses().then((res) => setClasses(res.data))

  useEffect(() => {
    load()
  }, [])

  const handleJoin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.joinClass(joinCode)
      setJoinCode('')
      load()
    } catch (err) {
      setError('Kode kelas tidak ditemukan.')
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Siswa</h1>

        <Card title="Join Kelas Baru" className="mb-6">
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Masukkan kode kelas"
              className="flex-1 border rounded px-3 py-2"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Join
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </Card>

        <h2 className="font-semibold mb-3">Kelas Saya</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {classes.map((c) => (
            <Link key={c.id} to={`/siswa/kelas/${c.id}`}>
              <Card>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-500">Guru: {c.teacher?.name}</p>
              </Card>
            </Link>
          ))}
          {classes.length === 0 && <p className="text-gray-400">Belum join kelas manapun.</p>}
        </div>
      </div>
    </div>
  )
}
