// Tab Rekap Nilai (guru): tabel siswa x tugas/ujian, indikator pelanggaran ujian, dan Export ke Microsoft Excel
import useFetch from '../useFetch.js'
import Icon from './Icon.jsx'

export default function TabNilai({ rombelId }) {
  const { data } = useFetch(`/rombel/${rombelId}/nilai`)
  const rombelFetch = useFetch(`/rombel/${rombelId}`)
  const rombelInfo = rombelFetch.data

  if (!data) return <p className="text-slate-500 py-4">Memuat data rekap nilai...</p>

  // Nilai tugas & ujian
  const getNilaiTugas = (s, t) => {
    if (!(t.id in s.tugas)) return { val: null, label: 'Belum' }
    if (s.tugas[t.id] === null) return { val: null, label: 'Menunggu' }
    return { val: Number(s.tugas[t.id]), label: s.tugas[t.id] }
  }

  const getNilaiUjian = (s, u) => {
    if (!(u.id in s.ujian)) return { val: null, label: 'Belum', pelanggaran: 0 }
    const skor = s.ujian[u.id]
    const pel = s.pelanggaran?.[u.id] || 0
    return { val: skor !== null ? Number(skor) : null, label: skor !== null ? skor : '-', pelanggaran: pel }
  }

  // Hitung rata-rata nilai siswa
  const hitungRataRata = (s) => {
    let total = 0
    let count = 0
    data.tugas.forEach((t) => {
      const { val } = getNilaiTugas(s, t)
      if (val !== null) { total += val; count++ }
    })
    data.ujian.forEach((u) => {
      const { val } = getNilaiUjian(s, u)
      if (val !== null) { total += val; count++ }
    })
    return count > 0 ? (total / count).toFixed(1) : '-'
  }

  // Export Excel Terformat Rapi & Berwarna
  function exportExcel() {
    const rombelNama = rombelInfo?.name || 'PIPAS'
    const tanggal = new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })
    const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Rekap Nilai PIPAS</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, Arial, sans-serif; }
          .title { font-size: 16pt; font-weight: bold; color: #1e3a8a; text-align: left; }
          .subtitle { font-size: 11pt; color: #475569; }
          .meta { font-size: 10pt; color: #64748b; }
          th { background-color: #1d4ed8; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #94a3b8; padding: 8px; font-size: 10pt; }
          th.group-tugas { background-color: #4338ca; }
          th.group-ujian { background-color: #047857; }
          td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10pt; vertical-align: middle; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .bg-alt { background-color: #f8fafc; }
          .badge-danger { color: #b91c1c; font-weight: bold; }
          .badge-success { color: #047857; font-weight: bold; }
          .rata-rata { background-color: #fef3c7; color: #92400e; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="${4 + data.tugas.length + data.ujian.length}" class="title">LEMBAR REKAPITULASI NILAI PROJEK IPAS (PIPAS)</td></tr>
          <tr><td colspan="${4 + data.tugas.length + data.ujian.length}" class="subtitle">Kelas / Rombel: <b>${rombelNama}</b> | Pengampu: <b>${rombelInfo?.teacher?.name || 'Guru PIPAS'}</b></td></tr>
          <tr><td colspan="${4 + data.tugas.length + data.ujian.length}" class="meta">Waktu Ekspor: ${tanggal}, ${waktu} WIB</td></tr>
          <tr></tr>
          <thead>
            <tr>
              <th rowspan="2" style="width: 40px;">No</th>
              <th rowspan="2" style="width: 220px;">Nama Siswa</th>
              <th rowspan="2" style="width: 180px;">Email</th>
              ${data.tugas.length > 0 ? `<th colspan="${data.tugas.length}" class="group-tugas">TUGAS & PRAKTIKUM PIPAS</th>` : ''}
              ${data.ujian.length > 0 ? `<th colspan="${data.ujian.length}" class="group-ujian">ULANGAN ONLINE PIPAS (NILAI / PELANGGARAN)</th>` : ''}
              <th rowspan="2" style="width: 90px; background-color: #d97706;">Rata-Rata</th>
            </tr>
            <tr>
              ${data.tugas.map((t) => `<th style="background-color: #6366f1;">${t.title}</th>`).join('')}
              ${data.ujian.map((u) => `<th style="background-color: #059669;">${u.title}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.siswa.map((s, idx) => {
              const bgClass = idx % 2 === 1 ? 'class="bg-alt"' : ''
              const rata = hitungRataRata(s)
              return `
                <tr ${bgClass}>
                  <td class="center">${idx + 1}</td>
                  <td class="bold">${s.name}</td>
                  <td>${s.email || '-'}</td>
                  ${data.tugas.map((t) => {
                    const nt = getNilaiTugas(s, t)
                    return `<td class="center">${nt.label}</td>`
                  }).join('')}
                  ${data.ujian.map((u) => {
                    const nu = getNilaiUjian(s, u)
                    const infoPel = nu.pelanggaran > 0 ? ` <span class="badge-danger">(${nu.pelanggaran}x Tab)</span>` : ''
                    return `<td class="center ${nu.val !== null && nu.val >= 75 ? 'badge-success' : ''}">${nu.label}${infoPel}</td>`
                  }).join('')}
                  <td class="rata-rata">${rata}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `

    const blob = new Blob(['\uFEFF' + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Rekap_Nilai_PIPAS_${rombelNama.replace(/[^a-zA-Z0-9]/g, '_')}.xls`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card p-6 overflow-x-auto space-y-4 shadow-sm border-l-4 border-blue-600">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rekapitulasi Nilai & Catatan Ulangan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar nilai tugas praktikum dan ulangan online siswa di rombel ini
          </p>
        </div>
        <button
          onClick={exportExcel}
          disabled={data.siswa.length === 0}
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2"
        >
          <Icon name="table_chart" /> Export ke Excel (.xls)
        </button>
      </div>

      {data.siswa.length === 0 ? (
        <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
          Belum ada siswa yang terdaftar di rombel ini.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <th className="py-3 px-4 text-left">Nama Siswa</th>
                {data.tugas.map((t) => (
                  <th key={'t' + t.id} className="py-3 px-3 text-center min-w-[120px]">
                    <span className="pill bg-indigo-100 text-indigo-800 text-[10px] block mb-1">Tugas</span>
                    {t.title}
                  </th>
                ))}
                {data.ujian.map((u) => (
                  <th key={'u' + u.id} className="py-3 px-3 text-center min-w-[140px]">
                    <span className="pill bg-emerald-100 text-emerald-800 text-[10px] block mb-1">Ulangan</span>
                    {u.title}
                  </th>
                ))}
                <th className="py-3 px-4 text-center bg-amber-50 text-amber-900 min-w-[90px]">Rata-Rata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.siswa.map((s, i) => (
                <tr key={s.id} className={i % 2 ? 'bg-slate-50/70 hover:bg-blue-50/50' : 'hover:bg-blue-50/50'}>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {s.name}
                    <span className="block text-[11px] text-slate-400 font-normal">{s.email}</span>
                  </td>

                  {/* Kolom Tugas */}
                  {data.tugas.map((t) => {
                    const { val, label } = getNilaiTugas(s, t)
                    return (
                      <td key={'t' + t.id} className="py-3 px-3 text-center font-semibold">
                        {val !== null ? (
                          <span className="font-bold text-slate-800">{val}</span>
                        ) : label === 'Menunggu' ? (
                          <span className="pill bg-amber-100 text-amber-800 text-xs">Menunggu</span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                    )
                  })}

                  {/* Kolom Ujian & Pelanggaran */}
                  {data.ujian.map((u) => {
                    const { val, label, pelanggaran } = getNilaiUjian(s, u)
                    return (
                      <td key={'u' + u.id} className="py-3 px-3 text-center font-semibold">
                        {val !== null ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="font-bold text-slate-800">{val}</span>
                            {pelanggaran > 0 && (
                              <span
                                className="pill bg-red-100 text-red-700 text-[10px] font-bold mt-0.5"
                                title={`Siswa berpindah tab / aplikasi sebanyak ${pelanggaran} kali saat ujian`}
                              >
                                ⚠️ {pelanggaran}x Pindah Tab
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">{label}</span>
                        )}
                      </td>
                    )
                  })}

                  {/* Rata-Rata */}
                  <td className="py-3 px-4 text-center font-black text-amber-700 bg-amber-50/60">
                    {hitungRataRata(s)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span> Kolom Tugas Praktikum
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Kolom Ulangan Online
        </span>
        <span className="flex items-center gap-1.5">
          <span className="pill bg-red-100 text-red-700 text-[10px] font-bold">⚠️ Nx Pindah Tab</span> Indikator Pelanggaran Siswa
        </span>
      </div>
    </div>
  )
}
