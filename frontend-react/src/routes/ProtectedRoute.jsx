import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// role: 'guru' | 'siswa' | undefined (undefined = boleh role apa saja, asal login)
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-6 text-center">Memuat...</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />

  return children
}
