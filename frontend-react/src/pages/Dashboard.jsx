// Dashboard: tampilan guru & siswa dipisah supaya masing-masing mudah dibaca
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import DashboardGuru from './DashboardGuru.jsx'
import DashboardSiswa from './DashboardSiswa.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const rombel = useOutletContext()   // { data, error, reload } dari Layout
  return user.role === 'guru' ? <DashboardGuru rombel={rombel} /> : <DashboardSiswa rombel={rombel} />
}
