import { Link, useLocation } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { BarChart2, BookOpen, Home } from 'lucide-react'

export default function Navbar() {
  const { user } = useUser()
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  ]

  return (
    <nav style={styles.nav}>
      <div style={styles.inner} className="container-wide">
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>⚡</span>
          <span style={styles.brandText}>Skill<span style={{ color: 'var(--green-primary)' }}>Bytes</span></span>
        </Link>

        <div style={styles.links}>
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                ...styles.link,
                ...(pathname === to ? styles.linkActive : {}),
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        {user && (
          <div style={styles.userChip}>
            <div style={styles.avatar}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span style={styles.userName}>{user.name}</span>
          </div>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(10,15,13,0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    display: 'flex', alignItems: 'center', gap: '24px',
    height: '60px',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '8px',
    textDecoration: 'none', marginRight: 'auto',
  },
  brandIcon: { fontSize: '1.3rem' },
  brandText: { fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' },
  links: { display: 'flex', gap: '4px' },
  link: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: 'var(--radius-sm)',
    textDecoration: 'none', color: 'var(--text-secondary)',
    fontSize: '0.88rem', fontWeight: 500,
    transition: 'all var(--transition)',
  },
  linkActive: {
    color: 'var(--green-primary)',
    background: 'var(--green-glow)',
  },
  userChip: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '5px 12px 5px 5px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '999px',
  },
  avatar: {
    width: '28px', height: '28px',
    borderRadius: '50%',
    background: 'var(--green-primary)',
    color: '#000', fontWeight: 700, fontSize: '0.85rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' },
}
