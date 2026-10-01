import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg text-blue-600">
        CBT Belajar
      </Link>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-gray-600">
              {user.name} <span className="text-gray-400">({user.role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
