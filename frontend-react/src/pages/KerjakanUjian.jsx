// Siswa mengerjakan Ulangan Online PIPAS: Wajib Layar Penuh (Fullscreen), Proteksi Anti-Pindah Tab, Peringatan 3x & Auto Submit
import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api, { pesan } from '../api.js'
import Icon from '../components/Icon.jsx'

const format = (detik) => {
  const m = Math.floor(detik / 60)
  const s = detik % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function KerjakanUjian() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [soal, setSoal] = useState(null)
  const [jawaban, setJawaban] = useState({})
  const [pilihanIndex, setPilihanIndex] = useState({}) // Track index pilihan yang diklik { [soalId]: indexOpsi }
  const [sisaDetik, setSisaDetik] = useState(null)
  const [mengirim, setMengirim] = useState(false)
  const [error, setError] = useState('')

  // Fullscreen & Gate State
  const [sudahMulai, setSudahMulai] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Anti-Cheat State
  const [pelanggaran, setPelanggaran] = useState(0)
  const [modalPeringatan, setModalPeringatan] = useState(false)
  const [pesanPelanggaran, setPesanPelanggaran] = useState('')
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false)

  // Ref untuk track state saat event listener berjalan
  const pelanggaranRef = useRef(0)
  const isSubmittingRef = useRef(false)
  const answersRef = useRef({})
  const lastViolationTimeRef = useRef(0)
  const sudahMulaiRef = useRef(false)

  useEffect(() => {
    answersRef.current = jawaban
  }, [jawaban])

  useEffect(() => {
    sudahMulaiRef.current = sudahMulai
  }, [sudahMulai])

  // Suara alarm peringatan menggunakan Web Audio API
  const bunyikanAlarm = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      // Beep 1
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sawtooth'
      osc1.frequency.setValueAtTime(800, ctx.currentTime)
      osc1.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.25)
      gain1.gain.setValueAtTime(0.3, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      osc1.stop(ctx.currentTime + 0.25)

      // Beep 2
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sawtooth'
      osc2.frequency.setValueAtTime(900, ctx.currentTime + 0.3)
      osc2.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.55)
      gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.3)
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(ctx.currentTime + 0.3)
      osc2.stop(ctx.currentTime + 0.55)
    } catch {
      // Audio fallback
    }
  }, [])

  // Fungsi pengumpulan jawaban (Manual atau Auto-Submit)
  const kumpulkan = useCallback(async (forcedViolations = null, alasan = null) => {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setMengirim(true)

    const finalViolations = forcedViolations !== null ? forcedViolations : pelanggaranRef.current
    const finalAnswers = answersRef.current

    // Keluar dari Fullscreen jika masih aktif
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        // Abaikan jika gagal exit fullscreen
      }
    }

    try {
      const r = await api.post(`/ujian/${id}/kumpul`, {
        answers: finalAnswers,
        violations_count: finalViolations,
        notes: alasan || (finalViolations > 0 ? `Selesai dengan ${finalViolations}x peringatan pindah tab` : 'Selesai tanpa pelanggaran'),
      })

      if (alasan) {
        alert(`ULANGAN DIKUMPULKAN SECARA OTOMATIS!\nAlasan: ${alasan}\nNilai Pilihan Ganda: ${r.data.score ?? '-'}/100\nPelanggaran Tercatat: ${finalViolations} kali.`)
      } else {
        alert(`Ulangan berhasil dikumpulkan!\nNilai Pilihan Ganda: ${r.data.score ?? '-'}/100\nPelanggaran: ${finalViolations} kali.`)
      }

      navigate('/')
    } catch (err) {
      setError(pesan(err))
      setMengirim(false)
      isSubmittingRef.current = false
    }
  }, [id, navigate])

  // Handler pelanggaran pindah tab / blur / keluar fullscreen
  const tanganiPelanggaran = useCallback((tipe) => {
    if (!sudahMulaiRef.current || isSubmittingRef.current) return

    const now = Date.now()
    if (now - lastViolationTimeRef.current < 1500) return
    lastViolationTimeRef.current = now

    const countBaru = pelanggaranRef.current + 1
    pelanggaranRef.current = countBaru
    setPelanggaran(countBaru)

    bunyikanAlarm()

    if (countBaru >= 3) {
      setIsAutoSubmitted(true)
      setPesanPelanggaran('Batas maksimal 3 kali pelanggaran tercapai! Anda telah meninggalkan layar ulangan sebanyak 3 kali. Ulangan otomatis dihentikan dan dikumpulkan ke guru.')
      setModalPeringatan(true)
      setTimeout(() => {
        kumpulkan(countBaru, 'Selesai Otomatis karena Melanggar Aturan Ulangan (3x Pindah Tab/Layar)')
      }, 1500)
    } else {
      setPesanPelanggaran(`PERINGATAN ${countBaru} DARI 3: Anda terdeteksi ${tipe}! Dilarang berpindah tab, keluar layar penuh, atau membuka aplikasi lain. Pada pelanggaran ke-3, lembar ulangan otomatis dikumpulkan.`)
      setModalPeringatan(true)
    }
  }, [bunyikanAlarm, kumpulkan])

  // Masuk Mode Layar Penuh (Fullscreen)
  async function mintaFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
      setIsFullscreen(true)
      setSudahMulai(true)
    } catch {
      // Jika browser membatasi, tetap izinkan mulai dengan fallback
      setIsFullscreen(true)
      setSudahMulai(true)
    }
  }

  // Load data ulangan
  useEffect(() => {
    api.get(`/ujian/${id}/kerjakan`)
      .then((r) => {
        setSoal(r.data)
        setSisaDetik(r.data.ujian.duration_minutes * 60)
      })
      .catch((e) => setError(pesan(e)))
  }, [id])

  // Timer countdown (hanya berjalan saat siswa sudah klik mulai)
  useEffect(() => {
    if (!sudahMulai || sisaDetik === null || mengirim) return
    if (sisaDetik <= 0) {
      kumpulkan(null, 'Waktu Ulangan Habis')
      return
    }
    const t = setTimeout(() => setSisaDetik((d) => d - 1), 1000)
    return () => clearTimeout(t)
  }, [sudahMulai, sisaDetik, mengirim, kumpulkan])

  // Proteksi Ulangan: Cegah Close, Deteksi Tab Switch, Deteksi Exit Fullscreen
  useEffect(() => {
    if (!soal || !sudahMulai) return

    const handleBeforeUnload = (e) => {
      if (isSubmittingRef.current) return
      e.preventDefault()
      e.returnValue = 'Ulangan sedang berlangsung! Menutup atau me-refresh halaman akan tercatat sebagai pelanggaran.'
      return e.returnValue
    }

    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittingRef.current) {
        tanganiPelanggaran('berpindah tab atau meminimalkan browser')
      }
    }

    const handleWindowBlur = () => {
      if (!isSubmittingRef.current) {
        tanganiPelanggaran('membuka aplikasi lain di luar browser')
      }
    }

    const handleFullscreenChange = () => {
      const fs = Boolean(document.fullscreenElement)
      setIsFullscreen(fs)
      if (!fs && !isSubmittingRef.current) {
        tanganiPelanggaran('keluar dari mode layar penuh (Fullscreen)')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [soal, sudahMulai, tanganiPelanggaran])

  if (error) return <div className="p-6 max-w-xl mx-auto"><p className="text-red-600 bg-red-50 p-4 rounded-xl font-bold">{error}</p></div>
  if (!soal) return <div className="p-8 text-center text-slate-500 font-semibold">Memuat lembar ulangan online PIPAS...</div>

  // 1. GERBANG AWAL: WAJIB AKTIFKAN FULLSCREEN SEBELUM MENGERJAKAN
  if (!sudahMulai) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-white text-slate-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 border border-slate-100">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 grid place-items-center mx-auto text-3xl font-black">
              <Icon name="science" />
            </div>
            <span className="pill bg-blue-100 text-blue-800 text-xs font-bold">Projek IPAS (PIPAS)</span>
            <h1 className="text-2xl font-black text-slate-900">{soal.ujian.title}</h1>
            <p className="text-xs text-slate-500">
              Durasi: <strong>{soal.ujian.duration_minutes} Menit</strong> · Jumlah Soal: <strong>{soal.soal.length} Butir</strong>
            </p>
          </div>

          {/* Ketentuan Ulangan */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
            <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Icon name="verified_user" /> Tata Tertib Pelaksanaan Ulangan:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-slate-600">
              <li>Ulangan <strong>wajib dikerjakan dalam mode Layar Penuh (Fullscreen)</strong>.</li>
              <li><strong>Dilarang berpindah tab</strong>, membuka Google, WhatsApp, atau aplikasi lain.</li>
              <li>Setiap perpindahan tab/layar akan <strong>memicu alarm peringatan</strong> dan tercatat langsung ke Guru PIPAS.</li>
              <li>Jika terdeteksi <strong>3 kali keluar layar</strong>, lembar ulangan akan <strong>otomatis diselesaikan & dikumpulkan</strong>.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={mintaFullscreen}
            className="btn btn-primary w-full justify-center py-3.5 text-base font-bold shadow-lg bg-blue-700 hover:bg-blue-800"
          >
            <Icon name="fullscreen" /> Masuk Layar Penuh & Mulai Ulangan
          </button>
        </div>
      </div>
    )
  }

  const kritis = sisaDetik < 300 // Di bawah 5 menit

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none relative">
      {/* Jika siswa keluar dari fullscreen saat pengerjaan: Overlay Wajib Balik Fullscreen */}
      {!isFullscreen && (
        <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border-2 border-red-500">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto grid place-items-center text-2xl">
              <Icon name="fullscreen_exit" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Mode Layar Penuh Diperlukan</h3>
              <p className="text-xs text-slate-500 mt-1">
                Anda harus tetap berada dalam mode layar penuh (Fullscreen) selama mengerjakan ulangan PIPAS.
              </p>
            </div>
            <button
              onClick={mintaFullscreen}
              className="btn bg-blue-700 hover:bg-blue-800 text-white w-full justify-center py-2.5 font-bold shadow-md"
            >
              <Icon name="fullscreen" /> Masuk Kembali ke Layar Penuh
            </button>
          </div>
        </div>
      )}

      {/* Header Ulangan */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white grid place-items-center text-sm font-bold">
            <Icon name="science" />
          </div>
          <div>
            <p className="font-bold text-slate-800 leading-tight">{soal.ujian.title}</p>
            <p className="text-[11px] text-slate-500">Ulangan Online PIPAS · Mode Diamankan</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Indikator Pelanggaran */}
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
            pelanggaran === 0
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : pelanggaran === 1
              ? 'bg-amber-50 text-amber-800 border border-amber-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            <Icon name={pelanggaran === 0 ? 'verified_user' : 'warning'} />
            <span>Pelanggaran: {pelanggaran} / 3</span>
          </div>

          {/* Timer Mundur */}
          <span className={`pill text-sm px-4 py-2 gap-1.5 font-mono font-bold shadow-sm ${
            kritis ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
          }`}>
            <Icon name="timer" /> {format(sisaDetik)}
          </span>
        </div>
      </header>

      {/* Info Bar */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-1 font-semibold">
          <Icon name="lock" /> Mode Ulangan Diamankan: Dilarang berpindah tab atau keluar dari layar penuh.
        </span>
        <span className="text-slate-500">Total Soal: <strong>{soal.soal.length} Butir</strong></span>
      </div>

      {/* Lembar Soal Ulangan */}
      <main className="max-w-3xl mx-auto w-full p-6 space-y-6 flex-1">
        {soal.soal.map((s, i) => (
          <div key={s.id} className="card p-6 bg-white shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="pill bg-blue-100 text-blue-800 text-xs font-bold">
                Soal #{i + 1}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {s.type === 'mc' ? 'Pilihan Ganda' : 'Esai'}
              </span>
            </div>

            <p className="text-base text-slate-800 font-medium leading-relaxed whitespace-pre-line">
              {s.question}
            </p>

            {s.type === 'mc' ? (
              <div className="space-y-2.5 pt-2">
                {(s.options || []).map((o, oi) => {
                  const terpilih = pilihanIndex[s.id] === oi
                  const pilih = () => {
                    setJawaban((prev) => ({ ...prev, [s.id]: o }))
                    setPilihanIndex((prev) => ({ ...prev, [s.id]: oi }))
                  }
                  return (
                    <div
                      key={oi}
                      onClick={pilih}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                        terpilih
                          ? 'border-blue-700 bg-blue-50/80 font-semibold text-blue-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`soal-${s.id}`}
                        value={oi}
                        checked={terpilih}
                        onChange={pilih}
                        className="mt-0.5 text-blue-700 focus:ring-blue-600 pointer-events-none"
                      />
                      <span className="font-bold text-slate-500 w-5">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <span className="flex-1">{o}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="pt-2">
                <textarea
                  className="input min-h-[110px] bg-slate-50"
                  placeholder="Ketik uraian jawaban Anda di sini..."
                  value={jawaban[s.id] || ''}
                  onChange={(e) => setJawaban({ ...jawaban, [s.id]: e.target.value })}
                />
              </div>
            )}
          </div>
        ))}

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl font-bold">{error}</p>}

        <div className="card p-6 bg-white shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="font-bold text-slate-800">Sudah Selesai Mengerjakan?</p>
            <p className="text-xs text-slate-500">Periksa kembali seluruh jawaban sebelum mengumpulkan.</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin menyelesaikan dan mengumpulkan ulangan ini sekarang?')) {
                kumpulkan()
              }
            }}
            disabled={mengirim}
            className="btn btn-primary px-8 py-3 text-base shadow-md disabled:opacity-50"
          >
            <Icon name="check_circle" /> {mengirim ? 'Mengumpulkan...' : 'Selesai & Kumpulkan Ulangan'}
          </button>
        </div>
      </main>

      {/* Modal Peringatan Pelanggaran (Solid, Rapi, Tenang / Tanpa Efek Gerak-Gerak) */}
      {modalPeringatan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border-4 border-red-500">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto grid place-items-center text-3xl">
              <Icon name="gpp_bad" />
            </div>
            <div>
              <h3 className="text-xl font-black text-red-700 uppercase tracking-tight">
                Peringatan Pelanggaran
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                Pelanggaran Ke-{pelanggaran} dari Maksimal 3
              </p>
            </div>
            <p className="text-sm text-slate-700 bg-red-50 p-3.5 rounded-xl border border-red-200 leading-relaxed font-medium text-left">
              {pesanPelanggaran}
            </p>
            {!isAutoSubmitted && (
              <button
                type="button"
                onClick={() => setModalPeringatan(false)}
                className="btn bg-red-600 hover:bg-red-700 text-white w-full justify-center py-2.5 font-bold shadow-md"
              >
                Saya Mengerti & Lanjutkan Ulangan
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
