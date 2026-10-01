// Peta halaman: alamat URL -> halaman mana yang tampil
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RombelDetail from './pages/RombelDetail.jsx'
import TugasGuru from './pages/TugasGuru.jsx'
import BuatUjian from './pages/BuatUjian.jsx'
import KerjakanUjian from './pages/KerjakanUjian.jsx'

// Halaman yang wajib login
function Wajib({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Halaman dengan sidebar */}
      <Route element={<Wajib><Layout /></Wajib>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rombel/:id" element={<RombelDetail />} />
        <Route path="/rombel/:id/ujian-baru" element={<BuatUjian />} />
        <Route path="/tugas/:id" element={<TugasGuru />} />
      </Route>

      {/* Layar ujian: tanpa sidebar supaya siswa fokus */}
      <Route path="/ujian/:id" element={<Wajib><KerjakanUjian /></Wajib>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
