// Halaman masuk & daftar (daftar = akun siswa)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { pesan } from '../api.js'
import Icon from '../components/Icon.jsx'

export default function Login() {
  const { login, daftar } = useAuth()
  const navigate = useNavigate()
  const [modeDaftar, setModeDaftar] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const ubah = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function kirim(e) {
    e.preventDefault()
    setError('')
    try {
      if (modeDaftar) await daftar(form)
      else await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(pesan(err))
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={kirim} className="card p-8 w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-700 text-white grid place-items-center mb-3"><Icon name="science" /></div>
          <h1 className="text-xl font-bold">PIPAS Space</h1>
          <p className="text-sm text-slate-500">{modeDaftar ? 'Daftar akun siswa' : 'Masuk ke portal belajar PIPAS'}</p>
        </div>

        {modeDaftar && <input className="input" placeholder="Nama lengkap" value={form.name} onChange={ubah('name')} required />}
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={ubah('email')} required />
        <input className="input" type="password" placeholder="Password (min. 6 karakter)" value={form.password} onChange={ubah('password')} required />

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary w-full justify-center">{modeDaftar ? 'Daftar' : 'Masuk'}</button>
        <p className="text-sm text-center text-slate-500">
          {modeDaftar ? 'Sudah punya akun?' : 'Siswa baru?'}{' '}
          <button type="button" onClick={() => { setModeDaftar(!modeDaftar); setError('') }} className="text-blue-700 font-semibold">
            {modeDaftar ? 'Masuk' : 'Daftar di sini'}
          </button>
        </p>
      </form>
    </div>
  )
}
