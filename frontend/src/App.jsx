import { Routes, Route } from 'react-router-dom'
import { UserProvider, useUser } from './hooks/useUser'
import Navbar from './components/Navbar'
import NameModal from './components/NameModal'
import HomePage from './pages/HomePage'
import SubjectsPage from './pages/SubjectsPage'
import ChaptersPage from './pages/ChaptersPage'
import QuizPage from './pages/QuizPage'
import AnalyticsPage from './pages/AnalyticsPage'

function AppShell() {
  const { loading, showNamePrompt } = useUser()

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
      Loading…
    </div>
  )

  return (
    <>
      {showNamePrompt && <NameModal />}
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/exams/:examId/subjects" element={<SubjectsPage />} />
          <Route path="/subjects/:subjectId/chapters" element={<ChaptersPage />} />
          <Route path="/quiz/chapter/:chapterId" element={<QuizPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <UserProvider>
      <AppShell />
    </UserProvider>
  )
}
