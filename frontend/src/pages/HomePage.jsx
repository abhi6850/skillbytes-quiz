import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExams } from '../api/client'
import { useUser } from '../hooks/useUser'
import { ChevronRight, Zap } from 'lucide-react'

export default function HomePage() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    getExams().then(data => {
      setExams(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div style={styles.page}>
      <div className="container">
        {/* Hero */}
        <div style={styles.hero} className="animate-fade">
          <div style={styles.heroTag}>
            <Zap size={13} />
            <span>WhatsApp-style quizzes</span>
          </div>
          <h1 style={styles.heroTitle}>
            Hello, {user?.name?.split(' ')[0] ?? 'Learner'} 👋
          </h1>
          <p style={styles.heroSub}>
            Pick an exam to start. Questions appear one by one — just like a chat.
          </p>
        </div>

        {/* Exams grid */}
        <h2 className="section-title">Choose your Exam</h2>
        <p className="section-subtitle">All exams · {exams.length} available</p>

        {loading ? (
          <div style={styles.skeletonGrid}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <div style={styles.examGrid}>
            {exams.map((exam, i) => (
              <button
                key={exam._id}
                className="card"
                style={{ ...styles.examCard, animationDelay: `${i * 60}ms` }}
                onClick={() => navigate(`/exams/${exam._id}/subjects`)}
              >
                <span style={styles.examIcon}>{exam.icon}</span>
                <div style={styles.examInfo}>
                  <div style={styles.examName}>{exam.name}</div>
                  <div style={styles.examDesc}>{exam.description}</div>
                </div>
                <ChevronRight size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '40px 0 80px' },
  hero: {
    marginBottom: '48px',
    padding: '40px',
    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    position: 'relative', overflow: 'hidden',
  },
  heroTag: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '4px 12px', borderRadius: '999px',
    background: 'var(--green-glow)',
    border: '1px solid rgba(37,211,102,0.3)',
    color: 'var(--green-primary)',
    fontSize: '0.78rem', fontWeight: 600,
    marginBottom: '16px',
  },
  heroTitle: { fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, marginBottom: '10px' },
  heroSub: { color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '500px' },
  skeletonGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  skeletonCard: { height: '80px', borderRadius: 'var(--radius-lg)' },
  examGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  examCard: {
    display: 'flex', alignItems: 'center', gap: '16px',
    cursor: 'pointer', textAlign: 'left',
    background: 'none', color: 'inherit', width: '100%',
    animation: 'fadeIn 0.4s ease both',
  },
  examIcon: { fontSize: '2.2rem', flexShrink: 0 },
  examInfo: { flex: 1, minWidth: 0 },
  examName: { fontWeight: 700, fontSize: '1.05rem', marginBottom: '3px' },
  examDesc: { color: 'var(--text-secondary)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
}
