import { useState } from 'react'
import { useUser } from '../hooks/useUser'

export default function NameModal() {
  const { registerUser } = useUser()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed.length < 2) {
      setError('Please enter at least 2 characters')
      return
    }
    setLoading(true)
    try {
      await registerUser(trimmed)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="animate-slide">
        <div style={styles.logo}>⚡</div>
        <h1 style={styles.title}>Welcome to SkillBytes</h1>
        <p style={styles.subtitle}>Enter your name to get started. No sign-up required.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Your name…"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            autoFocus
            maxLength={40}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Setting up…' : 'Start Learning →'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px',
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 'var(--radius-xl)',
    padding: '40px 36px',
    maxWidth: '420px', width: '100%',
    textAlign: 'center',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6), var(--shadow-glow)',
  },
  logo: { fontSize: '3rem', marginBottom: '16px' },
  title: { fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-bright)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 18px',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  error: { color: 'var(--accent-red)', fontSize: '0.85rem', textAlign: 'left' },
}
