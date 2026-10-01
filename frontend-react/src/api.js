// Semua komunikasi ke Laravel lewat "api" ini. Token login otomatis ikut terkirim.
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const api = axios.create({ baseURL: BASE, headers: { Accept: 'application/json' } })

api.interceptors.request.use((c) => {
  const token = localStorage.getItem('token')
  if (token) c.headers.Authorization = 'Bearer ' + token
  return c
})

// Token kadaluarsa / tidak valid -> balik ke halaman login
api.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401 && !location.pathname.startsWith('/login')) {
    localStorage.clear()
    location.href = '/login'
  }
  return Promise.reject(e)
})

// Ambil pesan error yang enak dibaca dari respon Laravel
export const pesan = (e) => {
  const errors = e.response?.data?.errors
  if (errors) return Object.values(errors)[0][0]
  return e.response?.data?.message || 'Terjadi kesalahan, coba lagi.'
}

// Alamat file yang diupload (atau link kalau materinya berupa link)
export const fileUrl = (path) => {
  if (!path) return '#'
  return path.startsWith('http') ? path : BASE.replace('/api', '') + '/storage/' + path
}

export const tgl = (d) => new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

export default api
