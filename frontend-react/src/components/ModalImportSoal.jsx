// Komponen Modal Import Soal dari PDF, Word, TXT, CSV, JSON, atau Paste Teks
import { useState } from 'react'
import Icon from './Icon.jsx'

export default function ModalImportSoal({ isOpen, onClose, onImport }) {
  const [teksInput, setTeksInput] = useState('')
  const [mode, setMode] = useState('teks') // 'teks' atau 'file'
  const [hasilParsed, setHasilParsed] = useState([])
  const [namaFile, setNamaFile] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  // Parser cerdas teks menjadi butir soal
  function parseTeksKeSoal(raw) {
    if (!raw || !raw.trim()) return []

    // 1. Cek apakah format JSON
    try {
      const parsedJson = JSON.parse(raw.trim())
      if (Array.isArray(parsedJson)) {
        return parsedJson.map((item) => ({
          question: item.question || item.pertanyaan || item.soal || '',
          type: item.type === 'essay' || item.tipe === 'esai' ? 'essay' : 'mc',
          options: item.options || item.pilihan || item.opsi || ['', '', '', ''],
          correct_answer: item.correct_answer || item.kunci || item.jawaban || '',
        }))
      }
    } catch {
      // Bukan JSON, lanjut ke parsing teks biasa
    }

    // 2. Parser Teks Berformat (Standard Soal Sekolah / Ujian PIPAS)
    const lines = raw.split(/\r?\n/)
    const daftarSoal = []
    let currentSoal = null

    // Helper untuk push soal yang selesai
    const simpanSoal = (s) => {
      if (!s || !s.question.trim()) return
      const cleanOptions = s.rawOptions.map((o) => o.trim()).filter(Boolean)
      const isMc = cleanOptions.length > 0 && s.type !== 'essay'

      // Pastikan ada 4 slot opsi jika MC
      const paddedOptions = [...cleanOptions]
      while (paddedOptions.length < 4 && isMc) {
        paddedOptions.push('')
      }

      // Tentukan correct_answer jika berupa huruf (A/B/C/D/E)
      let finalKey = s.correctKey.trim()
      if (isMc && finalKey) {
        const hurufMatch = finalKey.match(/^[A-Ea-e]$/)
        if (hurufMatch) {
          const idx = hurufMatch[0].toUpperCase().charCodeAt(0) - 65
          if (cleanOptions[idx]) {
            finalKey = cleanOptions[idx]
          }
        }
      }

      daftarSoal.push({
        question: s.question.trim(),
        type: isMc ? 'mc' : 'essay',
        options: isMc ? paddedOptions : ['', '', '', ''],
        correct_answer: finalKey,
      })
    }

    for (let line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Deteksi awal soal baru: "1.", "Soal 1:", "1)", "No. 1"
      const matchNo = trimmed.match(/^(?:Soal\s*\d+[:.]?|\d+[.)]|No\.\s*\d+[:.]?)\s*(.*)/i)
      if (matchNo) {
        if (currentSoal) simpanSoal(currentSoal)
        currentSoal = {
          question: matchNo[1] || '',
          type: 'mc',
          rawOptions: [],
          correctKey: '',
        }
        continue
      }

      if (!currentSoal) {
        // Jika belum ada nomor soal tapi ada teks pertama
        currentSoal = {
          question: trimmed,
          type: 'mc',
          rawOptions: [],
          correctKey: '',
        }
        continue
      }

      // Deteksi Kunci Jawaban: "Kunci: A", "Jawaban: B", "Key: C", "Ans: D"
      const matchKunci = trimmed.match(/^(?:Kunci(?:\s*Jawaban)?|Jawaban|Ans|Key)\s*[:=]\s*(.*)/i)
      if (matchKunci) {
        currentSoal.correctKey = matchKunci[1].trim()
        continue
      }

      // Deteksi Pilihan Opsi: "A. ...", "B) ...", "*A. ...", "[A] ..."
      const matchOpsi = trimmed.match(/^(\*?)\s*(?:\[?([A-Ea-e])\]?|[A-Ea-e])[.)]\s*(.*)/)
      if (matchOpsi) {
        const isBintang = matchOpsi[1] === '*'
        const isiOpsi = matchOpsi[3].trim()
        currentSoal.rawOptions.push(isiOpsi)
        if (isBintang) {
          currentSoal.correctKey = isiOpsi
        }
        continue
      }

      // Jika baris biasa: tambahkan ke teks pertanyaan jika belum ada opsi
      if (currentSoal.rawOptions.length === 0 && !currentSoal.correctKey) {
        currentSoal.question += ' ' + trimmed
      }
    }

    if (currentSoal) {
      simpanSoal(currentSoal)
    }

    return daftarSoal
  }

  // Handle pembacaan file (PDF, TXT, DOCX/XML, CSV, JSON)
  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setNamaFile(file.name)
    setErrorMsg('')

    const ext = file.name.split('.').pop().toLowerCase()

    try {
      if (ext === 'txt' || ext === 'csv' || ext === 'json') {
        const text = await file.text()
        setTeksInput(text)
        const parsed = parseTeksKeSoal(text)
        setHasilParsed(parsed)
      } else if (ext === 'pdf') {
        // Ekstraksi teks dari file PDF secara mandiri
        const arrayBuffer = await file.arrayBuffer()
        const text = extractTextFromPdfBuffer(arrayBuffer)
        if (text && text.trim().length > 10) {
          setTeksInput(text)
          const parsed = parseTeksKeSoal(text)
          setHasilParsed(parsed)
        } else {
          // Fallback: baca text stream
          const textDecoder = new TextDecoder('utf-8', { fatal: false })
          const decoded = textDecoder.decode(arrayBuffer)
          const cleanedText = cleanPdfRawStream(decoded)
          setTeksInput(cleanedText)
          const parsed = parseTeksKeSoal(cleanedText)
          setHasilParsed(parsed)
        }
      } else if (ext === 'docx') {
        // Ekstraksi teks dari file docx (zip archive containing word/document.xml)
        const arrayBuffer = await file.arrayBuffer()
        const textDecoder = new TextDecoder('utf-8', { fatal: false })
        const decoded = textDecoder.decode(arrayBuffer)
        // Ambil isi teks di dalam tag <w:t>...</w:t>
        const xmlTextMatches = decoded.match(/<w:t[^>]*>([^<]+)<\/w:t>/g)
        if (xmlTextMatches) {
          const plainText = xmlTextMatches
            .map((t) => t.replace(/<[^>]+>/g, ''))
            .join(' ')
            .replace(/\s+/g, ' ')
          setTeksInput(plainText)
          setHasilParsed(parseTeksKeSoal(plainText))
        } else {
          const rawText = decoded.replace(/[^\x20-\x7E\n\r]/g, ' ')
          setTeksInput(rawText)
          setHasilParsed(parseTeksKeSoal(rawText))
        }
      } else {
        setErrorMsg('Format file tidak didukung. Gunakan PDF, DOCX, TXT, CSV, atau JSON.')
      }
    } catch (err) {
      setErrorMsg('Gagal membaca file: ' + err.message)
    }
  }

  // Ekstraksi teks stream PDF sederhana
  function extractTextFromPdfBuffer(buffer) {
    const uint8 = new Uint8Array(buffer)
    let text = ''
    const str = new TextDecoder('latin1').decode(uint8)
    // Cari stream teks PDF (BT ... ET)
    const regex = /BT[\s\S]*?ET/g
    let match
    while ((match = regex.exec(str)) !== null) {
      const block = match[0]
      // Cari teks di dalam kurung (Tj / TJ)
      const tjMatches = block.match(/\((.*?)\)\s*Tj/g) || []
      tjMatches.forEach((m) => {
        const cleaned = m.replace(/^\(/, '').replace(/\)\s*Tj$/, '')
        text += cleaned + ' '
      })
      text += '\n'
    }
    return text.trim()
  }

  function cleanPdfRawStream(raw) {
    // Bersihkan karakter non-printable namun pertahankan nomor & huruf
    return raw
      .replace(/[^\x20-\x7E\n\r]/g, ' ')
      .replace(/\s{3,}/g, '\n')
      .trim()
  }

  function handleTeksChange(val) {
    setTeksInput(val)
    const parsed = parseTeksKeSoal(val)
    setHasilParsed(parsed)
  }

  function pasangContohTemplate() {
    const template = `1. Salah satu contoh perubahan fisika dalam kehidupan sehari-hari adalah...
A. Pembakaran kayu menjadi abu
B. Es batu yang mencair menjadi air
C. Besi yang berkarat karena air
D. Pembusukan buah apel
Kunci: B

2. Proses fotosintesis pada tumbuhan menghasilkan oksigen dan glukosa. Tuliskan reaksi kimia sederhana dari fotosintesis tersebut!

3. Gas rumah kaca yang paling banyak dihasilkan dari aktivitas pembakaran bahan bakar fosil adalah...
A. Karbon dioksida (CO2)
B. Nitrogen monoksida (NO)
C. Oksigen (O2)
D. Helium (He)
Kunci: A`
    handleTeksChange(template)
  }

  function terapkan() {
    if (hasilParsed.length === 0) {
      alert('Belum ada butir soal yang berhasil dideteksi. Periksa teks atau format soal Anda.')
      return
    }
    onImport(hasilParsed)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 grid place-items-center">
              <Icon name="upload_file" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Import Soal Ulangan PIPAS</h2>
              <p className="text-xs text-blue-100">Otomatis deteksi dari Dokumen PDF, Word, Teks, atau Salin-Tempel</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <Icon name="close" />
          </button>
        </div>

        {/* Tab Pemilihan Mode */}
        <div className="px-6 pt-4 flex gap-3 border-b border-slate-200">
          <button
            onClick={() => setMode('teks')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
              mode === 'teks' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'
            }`}
          >
            <Icon name="edit_note" /> Salin / Tempel Teks Soal
          </button>
          <button
            onClick={() => setMode('file')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
              mode === 'file' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500'
            }`}
          >
            <Icon name="attach_file" /> Upload File (PDF / Word / TXT)
          </button>
          <button
            type="button"
            onClick={pasangContohTemplate}
            className="ml-auto pb-3 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Icon name="lightbulb" /> Pasang Contoh Format
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {mode === 'file' && (
            <div className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 rounded-xl p-6 text-center transition-colors">
              <input
                type="file"
                id="file-soal-import"
                className="hidden"
                accept=".pdf,.docx,.txt,.csv,.json"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-soal-import" className="cursor-pointer block space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 mx-auto grid place-items-center">
                  <Icon name="cloud_upload" />
                </div>
                <p className="font-bold text-slate-800">
                  {namaFile ? `File Terpilih: ${namaFile}` : 'Klik untuk Pilih Dokumen Soal'}
                </p>
                <p className="text-xs text-slate-500">
                  Mendukung file: <strong>.PDF, .DOCX (Word), .TXT, .CSV, .JSON</strong>
                </p>
              </label>
            </div>
          )}

          {errorMsg && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg font-semibold">{errorMsg}</p>}

          {/* Area Input & Edit Teks */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Teks Naskah Soal (Bisa Diedit / Disesuaikan)
            </label>
            <textarea
              className="input font-mono text-xs h-40 leading-relaxed bg-slate-50"
              placeholder="1. Tulis pertanyaan di sini...&#10;A. Pilihan 1&#10;B. Pilihan 2&#10;C. Pilihan 3&#10;D. Pilihan 4&#10;Kunci: B"
              value={teksInput}
              onChange={(e) => handleTeksChange(e.target.value)}
            />
          </div>

          {/* Hasil Deteksi Real-time */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Icon name="visibility" /> Pratinjau Deteksi Soal ({hasilParsed.length} Soal Terdeteksi)
              </p>
              <div className="flex gap-2 text-xs">
                <span className="pill bg-blue-100 text-blue-700">
                  {hasilParsed.filter((s) => s.type === 'mc').length} Pilihan Ganda
                </span>
                <span className="pill bg-amber-100 text-amber-700">
                  {hasilParsed.filter((s) => s.type === 'essay').length} Esai
                </span>
              </div>
            </div>

            {hasilParsed.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Belum ada soal yang terdeteksi. Silakan upload file atau paste format soal di atas.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {hasilParsed.map((s, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-800">
                      {idx + 1}. {s.question}
                    </p>
                    {s.type === 'mc' ? (
                      <div className="pl-3 text-slate-600 space-y-0.5">
                        {s.options.filter(Boolean).map((o, oi) => (
                          <p
                            key={oi}
                            className={
                              o === s.correct_answer
                                ? 'font-bold text-emerald-700 bg-emerald-50 px-1 rounded inline-block'
                                : ''
                            }
                          >
                            {String.fromCharCode(65 + oi)}. {o} {o === s.correct_answer && '✓ (Kunci)'}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <span className="pill bg-amber-50 text-amber-700 text-[10px]">Tipe: Esai</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
          <button type="button" onClick={onClose} className="btn btn-outline text-slate-600">
            Batal
          </button>
          <button
            type="button"
            onClick={terapkan}
            disabled={hasilParsed.length === 0}
            className="btn btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="check_circle" /> Gunakan {hasilParsed.length} Soal Ini
          </button>
        </div>
      </div>
    </div>
  )
}
