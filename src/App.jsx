import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

import GuruDashboard from './pages/guru/Dashboard.jsx'
import ManageMateri from './pages/guru/ManageMateri.jsx'
import ManageTugas from './pages/guru/ManageTugas.jsx'
import AssignmentSubmissions from './pages/guru/AssignmentSubmissions.jsx'
import ManageCBT from './pages/guru/ManageCBT.jsx'
import Gradebook from './pages/guru/Gradebook.jsx'

import SiswaDashboard from './pages/siswa/Dashboard.jsx'
import LihatMateri from './pages/siswa/LihatMateri.jsx'
import SubmitTugas, { DaftarTugas } from './pages/siswa/SubmitTugas.jsx'
import KerjakanCBT from './pages/siswa/KerjakanCBT.jsx'

function Home() {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-6 text-center">Memuat...</div>
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'guru' ? '/guru' : '/siswa'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ===== Guru ===== */}
      <Route path="/guru" element={<ProtectedRoute role="guru"><GuruDashboard /></ProtectedRoute>} />
      <Route path="/guru/kelas/:classId" element={<ProtectedRoute role="guru"><ManageMateri /></ProtectedRoute>} />
      <Route path="/guru/kelas/:classId/tugas" element={<ProtectedRoute role="guru"><ManageTugas /></ProtectedRoute>} />
      <Route path="/guru/tugas/:assignmentId" element={<ProtectedRoute role="guru"><AssignmentSubmissions /></ProtectedRoute>} />
      <Route path="/guru/kelas/:classId/cbt" element={<ProtectedRoute role="guru"><ManageCBT /></ProtectedRoute>} />
      <Route path="/guru/kelas/:classId/nilai" element={<ProtectedRoute role="guru"><Gradebook /></ProtectedRoute>} />

      {/* ===== Siswa ===== */}
      <Route path="/siswa" element={<ProtectedRoute role="siswa"><SiswaDashboard /></ProtectedRoute>} />
      <Route path="/siswa/kelas/:classId" element={<ProtectedRoute role="siswa"><LihatMateri /></ProtectedRoute>} />
      <Route path="/siswa/kelas/:classId/tugas" element={<ProtectedRoute role="siswa"><DaftarTugas /></ProtectedRoute>} />
      <Route path="/siswa/tugas/:assignmentId" element={<ProtectedRoute role="siswa"><SubmitTugas /></ProtectedRoute>} />
      <Route path="/siswa/cbt/:examId" element={<ProtectedRoute role="siswa"><KerjakanCBT /></ProtectedRoute>} />

      <Route path="*" element={<div className="p-6 text-center">404 - Halaman tidak ditemukan</div>} />
    </Routes>
  )
}
