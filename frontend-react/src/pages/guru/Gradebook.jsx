import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../../services/api'
import Navbar from '../../components/Navbar.jsx'
import Card from '../../components/Card.jsx'

// Rekap nilai sederhana per kelas: gabungan nilai tugas (bisa dikembangkan gabung nilai CBT juga)
export default function Gradebook() {
  const { classId } = useParams()
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    api.getAssignments(classId).then((res) => setAssignments(res.data))
  }, [classId])

  // Export sederhana ke CSV langsung dari data yang sudah di-fetch,
  // untuk laporan nilai gabungan sebaiknya buat endpoint khusus di Laravel + package maatwebsite/excel
  const exportCSV = () => {
    const rows = [['Tugas', 'Deadline', 'Jumlah Submission']]
    assignments.forEach((a) => rows.push([a.title, a.deadline, a.submissions_count ?? 0]))
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rekap-tugas.csv'
    a.click()
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Rekap Nilai</h1>
          <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
            Export CSV
          </button>
        </div>

        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Tugas</th>
                <th className="py-2">Deadline</th>
                <th className="py-2">Jumlah Mengumpulkan</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-2">{a.title}</td>
                  <td className="py-2">{new Date(a.deadline).toLocaleDateString('id-ID')}</td>
                  <td className="py-2">{a.submissions_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {assignments.length === 0 && <p className="text-gray-400 mt-2">Belum ada data.</p>}
        </Card>
        <p className="text-xs text-gray-400 mt-3">
          Catatan: untuk rekap nilai detail per siswa, buka masing-masing tugas lalu lihat halaman submission.
        </p>
      </div>
    </div>
  )
}
