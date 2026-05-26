import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getChapters } from '../api/client'
import { ChevronRight, ArrowLeft, BookOpen, HelpCircle } from 'lucide-react'

export default function ChaptersPage() {
  const { subjectId } = useParams()
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getChapters(subjectId).then(data => {
      setChapters(data)
      setLoading(false)
    })
  }, [subjectId])

  return (
    <div style={styles.page}>
      <div className="container">
        <Link to={-1} style={styles.back}>
          <ArrowLeft size={16} /> Back
        </Link>

        <div style={styles.header} className="animate-fade">
          <BookOpen size={28} color="var(--green-primary)" />
          <div>
            <h1 style={styles.title}>Choose a Chapter</h1>
            <p style={styles.sub}>Each chapter has a focused quiz set</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <div style={styles.grid}>
            {chapters.map((ch, i) => (
              <button
                key={ch._id}
                className="card"
                style={{ ...styles.card, animationDelay: `${i * 60}ms` }}
                onClick={() => navigate(`/quiz/chapter/${ch._id}`)}
              >
                <div style={styles.num}>{String(i + 1).padStart(2, '0')}</div>
                <div style={styles.info}>
                  <div style={styles.name}>{ch.name}</div>
                  <div style={styles.desc}>{ch.description}</div>
                </div>
                <div style={styles.right}>
                  <span style={styles.qCount}>
                    <HelpCircle size={13} />
                    {ch.question_count} Qs
                  </span>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
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
    fontSize: '0.88rem', fontWeight: 500, marginBottom: '28px',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '14px',
    marginBottom: '32px',
  },
  title: { fontSize: '1.5rem', fontWeight: 800 },
  sub: { color: 'var(--text-secondary)', fontSize: '0.88rem' },
  grid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: {
    display: 'flex', alignItems: 'center', gap: '16px',
    cursor: 'pointer', textAlign: 'left', width: '100%',
    background: 'none', color: 'inherit',
    animation: 'fadeIn 0.4s ease both',
  },
  num: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.2rem', fontWeight: 700,
    color: 'var(--green-primary)', opacity: 0.7,
    flexShrink: 0, width: '36px',
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontWeight: 700, fontSize: '1rem', marginBottom: '3px' },
  desc: { color: 'var(--text-secondary)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  right: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
  qCount: {
    display: 'flex', alignItems: 'center', gap: '4px',
    color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
  },
}
