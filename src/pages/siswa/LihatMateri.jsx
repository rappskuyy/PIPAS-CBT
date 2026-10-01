import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../../services/api'
import Navbar from '../../components/Navbar.jsx'
import Card from '../../components/Card.jsx'

export default function LihatMateri() {
  const { classId } = useParams()
  const [materials, setMaterials] = useState([])

  useEffect(() => {
    api.getMaterials(classId).then((res) => setMaterials(res.data))
  }, [classId])

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Materi Pembelajaran</h1>
        <div className="space-y-3">
          {materials.map((m) => (
            <Card key={m.id}>
              <p className="font-medium">{m.title}</p>
              <p className="text-sm text-gray-500 mb-2">{m.description}</p>
              {m.file_path && (
                <a
                  href={m.type === 'link' || m.type === 'video' ? m.file_path : `/storage/${m.file_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-sm underline"
                >
                  Buka materi
                </a>
              )}
            </Card>
          ))}
          {materials.length === 0 && <p className="text-gray-400">Belum ada materi di kelas ini.</p>}
        </div>
      </div>
    </div>
  )
}
