// Menyimpan siapa yang sedang login. Dipakai lewat: const { user, login, logout } = useAuth()
import { createContext, useContext, useState } from 'react'
import api from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))

  function simpan(data) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }
  const login = async (email, password) => simpan((await api.post('/login', { email, password })).data)
  const daftar = async (form) => simpan((await api.post('/register', form)).data)
  const logout = async () => {
    try { await api.post('/logout') } catch {}
    localStorage.clear()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, daftar, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
