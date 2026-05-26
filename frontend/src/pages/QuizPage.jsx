import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { startQuiz, submitAnswer } from '../api/client'
import { useUser } from '../hooks/useUser'
import { CheckCircle, XCircle, ArrowRight, Loader } from 'lucide-react'

const OPTION_KEYS = ['A', 'B', 'C', 'D']

export default function QuizPage() {
  const { chapterId } = useParams()
  const { user } = useUser()
  const navigate = useNavigate()

  const [state, setState] = useState('loading') // loading | question | answered | finished | error
  const [sessionId, setSessionId] = useState(null)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [question, setQuestion] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [result, setResult] = useState(null) // { is_correct, correct_option, explanation }
  const [score, setScore] = useState({ correct: 0, answered: 0 })
  const [shownAt, setShownAt] = useState(null)
  const [messages, setMessages] = useState([]) // chat history
  const chatRef = useRef(null)

  // Start quiz on mount
  useEffect(() => {
    if (!user) return
    startQuiz(user._id, chapterId)
      .then(data => {
        setSessionId(data.session_id)
        setTotalQuestions(data.total_questions)
        setCurrentIndex(data.current_index)
        setQuestion(data.question)
        setShownAt(new Date())
        setState('question')
        setMessages([{ type: 'question', data: data.question, index: 0 }])
      })
      .catch(() => setState('error'))
  }, [user, chapterId])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  async function handleSelectOption(key) {
    if (state !== 'question' || selectedOption) return
    setSelectedOption(key)
    const answeredAt = new Date()

    const payload = {
      session_id: sessionId,
      question_id: question._id,
      selected_option: key,
      shown_at: shownAt.toISOString(),
      answered_at: answeredAt.toISOString(),
    }

    try {
      const res = await submitAnswer(payload)
      setResult(res)
      setScore({ correct: res.correct_count, answered: res.answered_count })

      // Add answer bubble + feedback bubble to chat
      setMessages(prev => [
        ...prev,
        { type: 'answer', option: key, is_correct: res.is_correct },
        { type: 'feedback', is_correct: res.is_correct, correct_option: res.correct_option, explanation: res.explanation, options: question.options },
      ])

      if (res.is_last) {
        setState('finished')
      } else {
        setState('answered')
      }
    } catch {
      setState('error')
    }
  }

  function handleNext() {
    const res = result
    if (!res?.next_question) return

    const nextQ = res.next_question
    setQuestion(nextQ)
    setCurrentIndex(res.current_index)
    setShownAt(new Date())
    setSelectedOption(null)
    setResult(null)
    setState('question')

    setMessages(prev => [...prev, { type: 'question', data: nextQ, index: res.current_index }])
  }

  const progress = totalQuestions > 0 ? ((currentIndex) / totalQuestions) * 100 : 0

  if (state === 'loading') return <LoadingScreen />
  if (state === 'error') return <ErrorScreen />
  if (state === 'finished') return (
    <ResultScreen
      score={score}
      total={totalQuestions}
      onRetry={() => navigate(0)}
      onHome={() => navigate('/')}
    />
  )

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div className="container" style={styles.topInner}>
          <div style={styles.topLeft}>
            <div style={styles.avatar}>📚</div>
            <div>
              <div style={styles.topTitle}>Quiz</div>
              <div style={styles.topSub}>Question {currentIndex + 1} of {totalQuestions}</div>
            </div>
          </div>
          <div style={styles.scoreChip}>
            <span style={{ color: 'var(--green-primary)', fontWeight: 700 }}>{score.correct}</span>
            <span style={{ color: 'var(--text-muted)' }}>/{score.answered}</span>
          </div>
        </div>
        <div style={styles.progressWrap}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      </div>

      {/* Chat window */}
      <div ref={chatRef} style={styles.chat} className="container">
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            msg={msg}
            onSelect={state === 'question' && i === messages.length - 1 ? handleSelectOption : null}
            selectedOption={selectedOption}
          />
        ))}

        {/* Next button */}
        {state === 'answered' && (
          <div style={styles.nextWrap} className="animate-slide">
            <button className="btn btn-primary" onClick={handleNext} style={styles.nextBtn}>
              Next Question <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ChatMessage({ msg, onSelect, selectedOption }) {
  if (msg.type === 'question') {
    return (
      <div style={styles.qBubbleWrap} className="animate-slide">
        <div style={styles.botAvatar}>⚡</div>
        <div>
          <div style={styles.qBubble}>
            <div style={styles.qIndex}>Q{msg.index + 1}</div>
            <div style={styles.qText}>{msg.data.text}</div>
          </div>
          {onSelect && (
            <div style={styles.options}>
              {msg.data.options.map(opt => (
                <button
                  key={opt.key}
                  style={{
                    ...styles.option,
                    ...(selectedOption === opt.key ? styles.optionSelected : {}),
                  }}
                  onClick={() => onSelect(opt.key)}
                  disabled={!!selectedOption}
                >
                  <span style={styles.optKey}>{opt.key}</span>
                  <span style={styles.optText}>{opt.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (msg.type === 'answer') {
    return (
      <div style={styles.answerBubbleWrap} className="animate-fade">
        <div style={{
          ...styles.answerBubble,
          background: msg.is_correct ? 'var(--green-dim)' : 'rgba(255,92,92,0.15)',
          borderColor: msg.is_correct ? 'var(--green-muted)' : 'rgba(255,92,92,0.4)',
        }}>
          {msg.is_correct ? <CheckCircle size={14} color="var(--green-primary)" /> : <XCircle size={14} color="var(--accent-red)" />}
          <span>Option {msg.option}</span>
        </div>
      </div>
    )
  }

  if (msg.type === 'feedback') {
    const correctOpt = msg.options?.find(o => o.key === msg.correct_option)
    return (
      <div style={styles.qBubbleWrap} className="animate-slide">
        <div style={styles.botAvatar}>⚡</div>
        <div style={{
          ...styles.feedbackBubble,
          borderColor: msg.is_correct ? 'var(--green-muted)' : 'rgba(255,92,92,0.35)',
        }}>
          <div style={styles.feedbackHeader}>
            {msg.is_correct
              ? <><CheckCircle size={16} color="var(--green-primary)" /> <span style={{ color: 'var(--green-primary)', fontWeight: 700 }}>Correct!</span></>
              : <><XCircle size={16} color="var(--accent-red)" /> <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>Incorrect</span></>
            }
          </div>
          {!msg.is_correct && correctOpt && (
            <div style={styles.correctAns}>
              ✓ Correct answer: <strong>{correctOpt.key}. {correctOpt.text}</strong>
            </div>
          )}
          {msg.explanation && (
            <div style={styles.explanation}>{msg.explanation}</div>
          )}
        </div>
      </div>
    )
  }

  return null
}

function ResultScreen({ score, total, onRetry, onHome }) {
  const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0
  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '😊' : pct >= 40 ? '😐' : '😔'
  const msg = pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good job!' : pct >= 40 ? 'Keep practicing' : 'More practice needed'

  return (
    <div style={resultStyles.page}>
      <div style={resultStyles.card} className="animate-slide container">
        <div style={resultStyles.emoji}>{emoji}</div>
        <h1 style={resultStyles.title}>{msg}</h1>
        <div style={resultStyles.scoreRing}>
          <span style={resultStyles.scoreNum}>{pct}%</span>
          <span style={resultStyles.scoreSub}>Score</span>
        </div>
        <div style={resultStyles.stats}>
          <Stat label="Correct" value={score.correct} color="var(--green-primary)" />
          <Stat label="Wrong" value={total - score.correct} color="var(--accent-red)" />
          <Stat label="Total" value={total} color="var(--text-secondary)" />
        </div>
        <div style={resultStyles.actions}>
          <button className="btn btn-secondary" onClick={onRetry}>Retry Quiz</button>
          <button className="btn btn-primary" onClick={onHome}>Back to Home</button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px', color: 'var(--text-secondary)' }}>
      <Loader size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      Setting up your quiz…
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

function ErrorScreen() {
  const navigate = useNavigate()
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
      <h2>Something went wrong</h2>
      <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>Could not load the quiz. Check your connection.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
    </div>
  )
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' },
  topBar: {
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  topInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' },
  topLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.3rem', border: '1px solid var(--border)',
  },
  topTitle: { fontWeight: 700, fontSize: '0.95rem' },
  topSub: { fontSize: '0.78rem', color: 'var(--text-secondary)' },
  scoreChip: {
    fontFamily: 'var(--font-mono)', fontSize: '1.1rem',
    background: 'var(--bg-elevated)', padding: '4px 14px',
    borderRadius: '999px', border: '1px solid var(--border)',
  },
  progressWrap: { height: '3px', background: 'var(--bg-elevated)' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, var(--green-muted), var(--green-primary))', transition: 'width 0.6s ease' },

  chat: {
    flex: 1, overflowY: 'auto',
    padding: '24px 20px 32px',
    display: 'flex', flexDirection: 'column', gap: '16px',
  },

  qBubbleWrap: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  botAvatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', flexShrink: 0, marginTop: '2px',
  },
  qBubble: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '4px 16px 16px 16px',
    padding: '16px 18px',
    maxWidth: '640px',
  },
  qIndex: {
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    color: 'var(--green-primary)', fontWeight: 700,
    marginBottom: '8px', letterSpacing: '0.05em',
  },
  qText: { fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.55 },

  options: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '640px' },
  option: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)', fontSize: '0.95rem',
    transition: 'all var(--transition)',
    width: '100%',
  },
  optionSelected: {
    borderColor: 'var(--green-primary)',
    background: 'var(--green-glow)',
  },
  optKey: {
    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem',
    color: 'var(--green-primary)',
    width: '22px', flexShrink: 0,
  },
  optText: { flex: 1 },

  answerBubbleWrap: { display: 'flex', justifyContent: 'flex-end' },
  answerBubble: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px',
    borderRadius: '16px 4px 16px 16px',
    border: '1px solid',
    fontSize: '0.9rem', fontWeight: 600,
  },

  feedbackBubble: {
    background: 'var(--bg-card)',
    border: '1px solid',
    borderRadius: '4px 16px 16px 16px',
    padding: '14px 18px',
    maxWidth: '640px',
  },
  feedbackHeader: { display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' },
  correctAns: {
    color: 'var(--text-secondary)', fontSize: '0.88rem',
    padding: '8px 12px', background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-sm)', marginBottom: '8px',
  },
  explanation: { color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 },

  nextWrap: { display: 'flex', justifyContent: 'center', paddingTop: '8px' },
  nextBtn: { padding: '13px 28px', fontSize: '0.95rem' },
}

const resultStyles = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 'var(--radius-xl)',
    padding: '48px 40px',
    maxWidth: '460px', width: '100%',
    textAlign: 'center',
    boxShadow: 'var(--shadow-glow)',
  },
  emoji: { fontSize: '4rem', marginBottom: '12px' },
  title: { fontSize: '1.5rem', fontWeight: 800, marginBottom: '28px' },
  scoreRing: {
    width: '130px', height: '130px', borderRadius: '50%',
    border: '4px solid var(--green-primary)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    marginBottom: '28px',
    boxShadow: '0 0 40px rgba(37,211,102,0.25)',
  },
  scoreNum: { fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 },
  scoreSub: { fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' },
  stats: { display: 'flex', gap: '32px', marginBottom: '32px' },
  actions: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' },
}
