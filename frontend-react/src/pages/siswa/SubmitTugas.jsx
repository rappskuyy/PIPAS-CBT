import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as api from '../../services/api'
import Navbar from '../../components/Navbar.jsx'
import Card from '../../components/Card.jsx'

export function DaftarTugas() {
  const { classId } = useParams()
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    api.getAssignments(classId).then((res) => setAssignments(res.data))
  }, [classId])

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Daftar Tugas</h1>
        <div className="space-y-3">
          {assignments.map((a) => (
            <Link key={a.id} to={`/siswa/tugas/${a.id}`}>
              <Card>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-gray-500">
                  Deadline: {new Date(a.deadline).toLocaleString('id-ID')}
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

export default function SubmitTugas() {
  const { assignmentId } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [mySubmission, setMySubmission] = useState(null)
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')

  const load = async () => {
    const [a, s] = await Promise.all([
      api.getAssignmentDetail(assignmentId),
      api.getMySubmission(assignmentId),
    ])
    setAssignment(a.data)
    setMySubmission(s.data)
  }

  useEffect(() => {
    load()
  }, [assignmentId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    await api.submitAssignment(assignmentId, file)
    setMessage('Tugas berhasil dikumpulkan!')
    setFile(null)
    load()
  }

  if (!assignment) return <div className="p-6">Memuat...</div>

  const isLate = new Date() > new Date(assignment.deadline)

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">{assignment.title}</h1>
        <p className="text-gray-500 mb-1">{assignment.description}</p>
        <p className={`text-sm mb-6 ${isLate ? 'text-red-500' : 'text-gray-500'}`}>
          Deadline: {new Date(assignment.deadline).toLocaleString('id-ID')}
          {isLate && ' (sudah lewat)'}
        </p>

        <Card title={mySubmission ? 'Update Jawaban' : 'Kumpulkan Tugas'}>
          {mySubmission && (
            <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
              <p>
                Status:{' '}
                <span className={mySubmission.status === 'late' ? 'text-red-500' : 'text-green-600'}>
                  {mySubmission.status === 'late' ? 'Terlambat' : 'Tepat waktu'}
                </span>
              </p>
              {mySubmission.grade !== null && (
                <>
                  <p>Nilai: {mySubmission.grade}</p>
                  {mySubmission.feedback && <p>Feedback: {mySubmission.feedback}</p>}
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full" required />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {mySubmission ? 'Kumpulkan Ulang' : 'Kumpulkan'}
            </button>
          </form>
          {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
        </Card>
      </div>
    </div>
  )
}
