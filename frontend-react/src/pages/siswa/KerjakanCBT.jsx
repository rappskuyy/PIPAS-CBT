import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as api from '../../services/api'
import Navbar from '../../components/Navbar.jsx'
import Card from '../../components/Card.jsx'

export default function KerjakanCBT() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    api.getCbtForStudent(examId).then((res) => {
      setExam(res.data.exam)
      setQuestions(res.data.questions)
      setSecondsLeft(res.data.exam.duration_minutes * 60)
    })
  }, [examId])

  useEffect(() => {
    if (secondsLeft === null || submitted) return
    if (secondsLeft <= 0) {
      handleSubmit()
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, submitted])

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleSubmit = async () => {
    if (submitted) return
    setSubmitted(true)
    await api.submitCbtAnswers(examId, answers)
    navigate('/siswa')
  }

  if (!exam) return <div className="p-6">Memuat soal...</div>

  const minutes = Math.floor((secondsLeft ?? 0) / 60)
  const seconds = (secondsLeft ?? 0) % 60

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <span className="font-mono text-lg bg-gray-100 px-3 py-1 rounded">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id} title={`${idx + 1}. ${q.question}`}>
              {q.type === 'mc' ? (
                <div className="space-y-2">
                  {(q.options || []).map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleAnswer(q.id, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full border rounded px-3 py-2"
                  placeholder="Tulis jawaban esai kamu..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                />
              )}
            </Card>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitted}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitted ? 'Mengirim...' : 'Selesai & Kumpulkan'}
        </button>
      </div>
    </div>
  )
}
