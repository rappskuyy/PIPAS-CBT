import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

// Selipkan token Sanctum di setiap request kalau ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Kalau token expired/invalid -> paksa logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ===== Auth =====
export const login = (data) => api.post('/login', data)
export const register = (data) => api.post('/register', data)
export const logout = () => api.post('/logout')
export const getMe = () => api.get('/me')

// ===== Kelas =====
export const getClasses = () => api.get('/classes')
export const createClass = (data) => api.post('/classes', data)
export const joinClass = (joinCode) => api.post('/classes/join', { join_code: joinCode })
export const getClassDetail = (classId) => api.get(`/classes/${classId}`)

// ===== Materi =====
export const getMaterials = (classId) => api.get(`/classes/${classId}/materials`)
export const createMaterial = (classId, formData) =>
  api.post(`/classes/${classId}/materials`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const deleteMaterial = (materialId) => api.delete(`/materials/${materialId}`)

// ===== Tugas =====
export const getAssignments = (classId) => api.get(`/classes/${classId}/assignments`)
export const createAssignment = (classId, formData) =>
  api.post(`/classes/${classId}/assignments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getAssignmentDetail = (assignmentId) => api.get(`/assignments/${assignmentId}`)

// ===== Submission (pengumpulan tugas) =====
export const submitAssignment = (assignmentId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const getMySubmission = (assignmentId) => api.get(`/assignments/${assignmentId}/my-submission`)
export const gradeSubmission = (submissionId, data) => api.put(`/submissions/${submissionId}/grade`, data)

// ===== CBT =====
export const getCbtExams = (classId) => api.get(`/classes/${classId}/cbt-exams`)
export const createCbtExam = (classId, data) => api.post(`/classes/${classId}/cbt-exams`, data)
export const getCbtForStudent = (examId) => api.get(`/cbt-exams/${examId}/for-student`)
export const submitCbtAnswers = (examId, answers) => api.post(`/cbt-exams/${examId}/submit`, { answers })
export const getCbtResults = (examId) => api.get(`/cbt-exams/${examId}/results`)

export default api
