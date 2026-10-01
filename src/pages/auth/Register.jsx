import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'siswa' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await register(form)
      navigate(user.role === 'guru' ? '/guru' : '/siswa')
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6 text-center">Daftar Akun</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <label className="block text-sm mb-1">Nama</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />

        <label className="block text-sm mb-1">Daftar sebagai</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-6"
        >
          <option value="siswa">Siswa</option>
          <option value="guru">Guru</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Daftar'}
        </button>

        <p className="text-sm text-center mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Masuk
          </Link>
        </p>
      </form>
    </div>
  )
}
