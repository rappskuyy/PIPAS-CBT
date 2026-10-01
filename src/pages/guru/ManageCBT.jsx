import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../../services/api'
import Navbar from '../../components/Navbar.jsx'
import Card from '../../components/Card.jsx'

const emptyQuestion = () => ({ question: '', type: 'mc', options: ['', '', '', ''], correct_answer: '' })

export default function ManageCBT() {
  const { classId } = useParams()
  const [exams, setExams] = useState([])
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(60)
  const [questions, setQuestions] = useState([emptyQuestion()])

  const load = () => api.getCbtExams(classId).then((res) => setExams(res.data))

  useEffect(() => {
    load()
  }, [classId])

  const updateQuestion = (idx, patch) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)))
  }

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIdx) return q
        const options = [...q.options]
        options[optIdx] = value
        return { ...q, options }
      })
    )
  }

  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()])
  const removeQuestion = (idx) => setQuestions((qs) => qs.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      title,
      duration_minutes: Number(duration),
      questions: questions.map((q) => ({
        question: q.question,
        type: q.type,
        options: q.type === 'mc' ? q.options.filter(Boolean) : null,
        correct_answer: q.type === 'mc' ? q.correct_answer : null,
      })),
    }
    await api.createCbtExam(classId, payload)
    setTitle('')
    setDuration(60)
    setQuestions([emptyQuestion()])
    load()
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Kelola CBT / Ujian</h1>

        <Card title="Buat Ujian Baru" className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              placeholder="Judul ujian"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="number"
              placeholder="Durasi (menit)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />

            {questions.map((q, idx) => (
              <div key={idx} className="border rounded p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Soal {idx + 1}</p>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(idx)} className="text-red-500 text-xs">
                      Hapus
                    </button>
                  )}
                </div>
                <textarea
                  placeholder="Pertanyaan"
                  value={q.question}
                  onChange={(e) => updateQuestion(idx, { question: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(idx, { type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="mc">Pilihan Ganda</option>
                  <option value="essay">Essay</option>
                </select>

                {q.type === 'mc' && (
                  <div className="space-y-1">
                    {q.options.map((opt, optIdx) => (
                      <input
                        key={optIdx}
                        placeholder={`Opsi ${optIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                        className="w-full border rounded px-3 py-1.5 text-sm"
                      />
                    ))}
                    <input
                      placeholder="Jawaban benar (ketik sama persis dengan salah satu opsi)"
                      value={q.correct_answer}
                      onChange={(e) => updateQuestion(idx, { correct_answer: e.target.value })}
                      className="w-full border rounded px-3 py-1.5 text-sm"
                      required
                    />
                  </div>
                )}
              </div>
            ))}

            <button type="button" onClick={addQuestion} className="text-blue-600 text-sm">
              + Tambah Soal
            </button>

            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Simpan Ujian
            </button>
          </form>
        </Card>

        <h2 className="font-semibold mb-3">Daftar Ujian</h2>
        <div className="space-y-3">
          {exams.map((ex) => (
            <Card key={ex.id}>
              <p className="font-medium">{ex.title}</p>
              <p className="text-sm text-gray-500">
                {ex.duration_minutes} menit · {ex.questions_count ?? 0} soal
              </p>
            </Card>
          ))}
          {exams.length === 0 && <p className="text-gray-400">Belum ada ujian.</p>}
        </div>
      </div>
    </div>
  )
}
