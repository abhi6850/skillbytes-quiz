import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// ── Catalog ───────────────────────────────────────────────────────────────────
export const getExams = () => api.get('/exams').then(r => r.data)
export const getSubjects = (examId) => api.get(`/exams/${examId}/subjects`).then(r => r.data)
export const getChapters = (subjectId) => api.get(`/subjects/${subjectId}/chapters`).then(r => r.data)

// ── User ──────────────────────────────────────────────────────────────────────
export const createOrGetUser = (name, deviceId) =>
  api.post('/users', { name, device_id: deviceId }).then(r => r.data)

export const getUserByDevice = (deviceId) =>
  api.get(`/users/${deviceId}/by-device`).then(r => r.data)

export const getUserSessions = (userId) =>
  api.get(`/users/${userId}/sessions`).then(r => r.data)

// ── Quiz ──────────────────────────────────────────────────────────────────────
export const startQuiz = (userId, chapterId) =>
  api.post('/quiz/start', { user_id: userId, chapter_id: chapterId }).then(r => r.data)

export const submitAnswer = (payload) =>
  api.post('/quiz/answer', payload).then(r => r.data)

export const getSession = (sessionId) =>
  api.get(`/quiz/session/${sessionId}`).then(r => r.data)

// ── Analytics ─────────────────────────────────────────────────────────────────
export const getAnalyticsSummary = () => api.get('/analytics/summary').then(r => r.data)
export const getDailyActiveUsers = (days = 30) => api.get(`/analytics/daily-active-users?days=${days}`).then(r => r.data)
export const getWeeklyActiveUsers = () => api.get('/analytics/weekly-active-users').then(r => r.data)
export const getQuestionsStats = () => api.get('/analytics/questions-stats').then(r => r.data)
export const getAvgResponseTime = () => api.get('/analytics/avg-response-time').then(r => r.data)
export const getCompletionRate = () => api.get('/analytics/completion-rate').then(r => r.data)
export const getDropoffAnalysis = () => api.get('/analytics/dropoff-analysis').then(r => r.data)
export const getPeakHours = () => api.get('/analytics/peak-hours').then(r => r.data)
export const getAvgQuestionsPerSession = () => api.get('/analytics/avg-questions-per-session').then(r => r.data)
export const getScoreDistribution = () => api.get('/analytics/score-distribution').then(r => r.data)

export default api
