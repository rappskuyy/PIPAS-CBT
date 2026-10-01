// Kerangka halaman: sidebar kiri + bar atas. Isi halaman muncul di <Outlet />
import { Link, NavLink, Outlet } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useAuth } from '../auth.jsx'
import useFetch from '../useFetch.js'

export default function Layout() {
  const { user, logout } = useAuth()
  const rombel = useFetch('/rombel')   // dipakai sidebar, dan dibagikan ke halaman lewat Outlet
  const inisial = user.name.split(' ').map((k) => k[0]).slice(0, 2).join('').toUpperCase()
  const menu = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${isActive ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 p-4 hidden lg:flex flex-col gap-1">
        <Link to="/" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-9 h-9 rounded-lg bg-blue-700 text-white grid place-items-center"><Icon name="science" /></div>
          <div>
            <p className="font-bold text-blue-700 leading-tight">PIPAS Space</p>
            <p className="text-[11px] text-slate-500">Pembelajaran Projek IPAS</p>
          </div>
        </Link>

        <p className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-1">Menu Utama</p>
        <NavLink to="/" end className={menu}><Icon name="grid_view" />Dashboard</NavLink>

        {user.role === 'guru' ? (
          <>
            <p className="text-[10px] font-bold uppercase text-slate-400 px-2 mt-4 mb-1">Daftar Rombel PIPAS</p>
            {(rombel.data || []).map((r) => (
              <NavLink key={r.id} to={`/rombel/${r.id}`} className={menu}>
                <Icon name="groups" />
                <span className="truncate">{r.name}</span>
              </NavLink>
            ))}
            {rombel.data?.length === 0 && <p className="text-xs text-slate-400 px-3">Belum ada rombel</p>}
          </>
        ) : (
          <>
            <p className="text-[10px] font-bold uppercase text-slate-400 px-2 mt-4 mb-1">Kelas PIPAS</p>
            {rombel.data?.[0] ? (
              <NavLink to="/" className={menu}>
                <Icon name="school" />
                <span className="truncate">{rombel.data[0].name}</span>
              </NavLink>
            ) : (
              <p className="text-xs text-slate-400 px-3">Belum gabung kelas</p>
            )}
          </>
        )}

        <button onClick={logout} className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50">
          <Icon name="logout" />Logout / Keluar
        </button>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-blue-700 lg:hidden flex items-center gap-1.5">
            <Icon name="science" /> PIPAS Space
          </Link>
          <div className="flex items-center gap-3 ml-auto">
            <span className="pill bg-emerald-100 text-emerald-700">{user.role === 'guru' ? 'Mode Pengajar (Guru)' : 'Mode Siswa'}</span>
            <p className="text-sm font-bold hidden sm:block">{user.name}</p>
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold grid place-items-center">{inisial}</div>
            <button onClick={logout} className="lg:hidden text-red-600"><Icon name="logout" /></button>
          </div>
        </header>
        <main className="p-6 max-w-7xl mx-auto"><Outlet context={rombel} /></main>
      </div>
    </div>
  )
}
