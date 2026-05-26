import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getSubjects, getExams } from '../api/client'
import { ChevronRight, ArrowLeft } from 'lucide-react'

export default function SubjectsPage() {
  const { examId } = useParams()
  const [subjects, setSubjects] = useState([])
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      getSubjects(examId),
      getExams(),
    ]).then(([subs, exams]) => {
      setSubjects(subs)
      setExam(exams.find(e => e._id === examId))
      setLoading(false)
    })
  }, [examId])

  return (
    <div style={styles.page}>
      <div className="container">
        <Link to="/" style={styles.back}>
          <ArrowLeft size={16} /> Back to Exams
        </Link>

        {exam && (
          <div style={styles.header} className="animate-fade">
            <span style={styles.icon}>{exam.icon}</span>
            <div>
              <h1 style={styles.title}>{exam.name}</h1>
              <p style={styles.desc}>{exam.description}</p>
            </div>
          </div>
        )}

        <h2 className="section-title">Select a Subject</h2>
        <p className="section-subtitle">{subjects.length} subjects available</p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <div style={styles.grid}>
            {subjects.map((s, i) => (
              <button
                key={s._id}
                className="card"
                style={{ ...styles.card, animationDelay: `${i * 60}ms` }}
                onClick={() => navigate(`/subjects/${s._id}/chapters`)}
              >
                <span style={styles.cardIcon}>{s.icon}</span>
                <div style={styles.cardInfo}>
                  <div style={styles.cardName}>{s.name}</div>
                  <div style={styles.cardDesc}>{s.description}</div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { padding: '32px 0 80px' },
  back: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    color: 'var(--text-secondary)', textDecoration: 'none',
    fontSize: '0.88rem', fontWeight: 500,
    marginBottom: '28px',
    transition: 'color var(--transition)',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '16px',
    marginBottom: '36px',
    padding: '24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
  },
  icon: { fontSize: '3rem', flexShrink: 0 },
  title: { fontSize: '1.6rem', fontWeight: 800 },
  desc: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' },
  grid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    display: 'flex', alignItems: 'center', gap: '14px',
    cursor: 'pointer', textAlign: 'left', width: '100%',
    background: 'none', color: 'inherit',
    animation: 'fadeIn 0.4s ease both',
  },
  cardIcon: { fontSize: '1.8rem', flexShrink: 0 },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: { fontWeight: 700, fontSize: '1rem', marginBottom: '3px' },
  cardDesc: { color: 'var(--text-secondary)', fontSize: '0.83rem' },
}
