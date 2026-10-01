import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../../services/api'
import Navbar from '../../components/Navbar.jsx'
import Card from '../../components/Card.jsx'

// Halaman guru untuk lihat & menilai semua submission dari 1 tugas
export default function AssignmentSubmissions() {
  const { assignmentId } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [grades, setGrades] = useState({})

  const load = () => api.getAssignmentDetail(assignmentId).then((res) => setAssignment(res.data))

  useEffect(() => {
    load()
  }, [assignmentId])

  const handleGrade = async (submissionId) => {
    const g = grades[submissionId]
    if (!g?.grade) return
    await api.gradeSubmission(submissionId, { grade: g.grade, feedback: g.feedback || '' })
    load()
  }

  if (!assignment) return <div className="p-6">Memuat...</div>

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">{assignment.title}</h1>
        <p className="text-gray-500 mb-6">
          Deadline: {new Date(assignment.deadline).toLocaleString('id-ID')}
        </p>

        <div className="space-y-4">
          {assignment.submissions.map((s) => (
            <Card key={s.id}>
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">{s.student.name}</p>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    s.status === 'late' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}
                >
                  {s.status === 'late' ? 'Terlambat' : 'Tepat waktu'}
                </span>
              </div>
              <a
                href={`/storage/${s.file_path}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-sm underline"
              >
                Lihat file jawaban
              </a>

              <div className="flex gap-2 mt-3">
                <input
                  type="number"
                  placeholder="Nilai (0-100)"
                  defaultValue={s.grade ?? ''}
                  onChange={(e) =>
                    setGrades({ ...grades, [s.id]: { ...grades[s.id], grade: e.target.value } })
                  }
                  className="border rounded px-2 py-1 w-32"
                />
                <input
                  placeholder="Feedback (opsional)"
                  defaultValue={s.feedback ?? ''}
                  onChange={(e) =>
                    setGrades({ ...grades, [s.id]: { ...grades[s.id], feedback: e.target.value } })
                  }
                  className="border rounded px-2 py-1 flex-1"
                />
                <button
                  onClick={() => handleGrade(s.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Simpan
                </button>
              </div>
            </Card>
          ))}
          {assignment.submissions.length === 0 && (
            <p className="text-gray-400">Belum ada yang mengumpulkan.</p>
          )}
        </div>
      </div>
    </div>
  )
}
