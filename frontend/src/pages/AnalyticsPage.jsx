import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  getAnalyticsSummary, getDailyActiveUsers, getWeeklyActiveUsers,
  getQuestionsStats, getAvgResponseTime, getCompletionRate,
  getDropoffAnalysis, getPeakHours, getAvgQuestionsPerSession,
  getScoreDistribution,
} from '../api/client'
import { Users, Zap, CheckCircle, Clock, TrendingUp, BarChart2, Activity, Target } from 'lucide-react'

const GREEN = '#25d366'
const GREEN2 = '#128c4b'
const GOLD = '#f0c040'
const RED = '#ff5c5c'
const BLUE = '#60b4ff'
const PURPLE = '#b06aff'

const CHART_COLORS = [GREEN, GOLD, BLUE, RED, PURPLE, '#ff9f40']

const tooltipStyle = {
  background: '#162019',
  border: '1px solid rgba(37,211,102,0.2)',
  borderRadius: '10px',
  color: '#e8f5ed',
  fontFamily: "'Sora', sans-serif",
  fontSize: '0.82rem',
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null)
  const [dau, setDau] = useState([])
  const [wau, setWau] = useState([])
  const [peakHours, setPeakHours] = useState([])
  const [dropoff, setDropoff] = useState([])
  const [scoreDistrib, setScoreDistrib] = useState([])
  const [avgRt, setAvgRt] = useState(null)
  const [avgQps, setAvgQps] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAnalyticsSummary(),
      getDailyActiveUsers(30),
      getWeeklyActiveUsers(),
      getPeakHours(),
      getDropoffAnalysis(),
      getScoreDistribution(),
      getAvgResponseTime(),
      getAvgQuestionsPerSession(),
    ]).then(([sum, dauData, wauData, ph, drop, sd, art, aqps]) => {
      setSummary(sum)
      setDau(dauData.map(d => ({ ...d, date: d.date.slice(5) }))) // MM-DD
      setWau(wauData.map(d => ({ ...d, week: d.week_start.slice(5) })))
      setPeakHours(ph)
      setDropoff(drop)
      setScoreDistrib(sd)
      setAvgRt(art)
      setAvgQps(aqps)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)', gap: '10px' }}>
      <Activity size={20} style={{ animation: 'spin 1.2s linear infinite' }} />
      Loading analytics…
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={styles.page}>
      <div className="container-wide">
        {/* Header */}
        <div style={styles.header} className="animate-fade">
          <div>
            <h1 style={styles.title}>Analytics Dashboard</h1>
            <p style={styles.subtitle}>Real-time insights on quiz activity and learner behaviour</p>
          </div>
          <span className="badge badge-green">
            <Activity size={11} /> Live
          </span>
        </div>

        {/* KPI Cards */}
        {summary && (
          <div style={styles.kpiGrid}>
            <KPICard icon={<Users size={20} />} label="Daily Active Users" value={summary.daily_active_users} color={GREEN} />
            <KPICard icon={<TrendingUp size={20} />} label="Weekly Active Users" value={summary.weekly_active_users} color={BLUE} />
            <KPICard icon={<Zap size={20} />} label="Questions Served" value={summary.total_questions_served.toLocaleString()} color={GOLD} />
            <KPICard icon={<CheckCircle size={20} />} label="Completion Rate" value={`${summary.completion_rate_percent}%`} color={GREEN} />
            <KPICard icon={<Clock size={20} />} label="Avg Response Time" value={`${summary.avg_response_time_seconds}s`} color={PURPLE} />
            <KPICard icon={<Target size={20} />} label="Total Sessions" value={summary.total_sessions.toLocaleString()} color={RED} />
            <KPICard icon={<BarChart2 size={20} />} label="Qs Answered" value={summary.total_questions_answered.toLocaleString()} color={BLUE} />
            <KPICard icon={<Activity size={20} />} label="Avg Qs / Session" value={avgQps ? avgQps.avg_answered : '…'} color={GOLD} />
          </div>
        )}

        {/* Charts Row 1 */}
        <div style={styles.chartRow}>
          <ChartCard title="Daily Active Users (last 30 days)" wide>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dau}>
                <defs>
                  <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#4d7059', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#4d7059', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke={GREEN} strokeWidth={2} fill="url(#dauGrad)" name="Users" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div style={styles.chartRow2}>
          <ChartCard title="Weekly Active Users">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={wau}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: '#4d7059', fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: '#4d7059', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={BLUE} radius={[4, 4, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Score Distribution">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={scoreDistrib}
                  dataKey="count"
                  nameKey="range"
                  cx="50%" cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {scoreDistrib.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 3 */}
        <div style={styles.chartRow2}>
          <ChartCard title="Peak Activity Hours (24h)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: '#4d7059', fontSize: 9 }} tickLine={false} interval={2} />
                <YAxis tick={{ fill: '#4d7059', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sessions" name="Sessions" radius={[3, 3, 0, 0]}>
                  {peakHours.map((entry, i) => (
                    <Cell key={i} fill={entry.sessions === Math.max(...peakHours.map(h => h.sessions)) ? GREEN : GREEN2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Drop-off Analysis">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dropoff} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: '#4d7059', fontSize: 10 }} tickLine={false} />
                <YAxis dataKey="range" type="category" tick={{ fill: '#8faa99', fontSize: 11 }} width={70} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="dropped" name="Dropped" radius={[0, 4, 4, 0]}>
                  {dropoff.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Bottom stats row */}
        {avgRt && (
          <div style={styles.statRow}>
            <StatBox label="Avg Response Time" value={`${avgRt.avg_seconds}s`} sub="per question" color={PURPLE} />
            <StatBox label="Fastest Response" value={`${(avgRt.min_ms / 1000).toFixed(1)}s`} sub="min recorded" color={GREEN} />
            <StatBox label="Slowest Response" value={`${(avgRt.max_ms / 1000).toFixed(1)}s`} sub="max recorded" color={RED} />
            <StatBox label="Total Responses" value={avgRt.total_responses?.toLocaleString()} sub="answers logged" color={GOLD} />
          </div>
        )}
      </div>
    </div>
  )
}

function KPICard({ icon, label, value, color }) {
  return (
    <div style={{ ...styles.kpi, borderTop: `2px solid ${color}22` }} className="card">
      <div style={{ ...styles.kpiIcon, color, background: `${color}18` }}>{icon}</div>
      <div style={styles.kpiVal}>{value}</div>
      <div style={styles.kpiLabel}>{label}</div>
    </div>
  )
}

function ChartCard({ title, children, wide }) {
  return (
    <div className="card animate-fade" style={{ ...(wide ? { gridColumn: '1/-1' } : {}), minWidth: 0 }}>
      <div style={styles.chartTitle}>{title}</div>
      {children}
    </div>
  )
}

function StatBox({ label, value, sub, color }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
      <div style={{ fontWeight: 600, marginTop: '6px', fontSize: '0.9rem' }}>{label}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>{sub}</div>
    </div>
  )
}

const styles = {
  page: { padding: '40px 0 80px' },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '32px', gap: '16px',
  },
  title: { fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '0.9rem' },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '14px', marginBottom: '24px',
  },
  kpi: { padding: '18px' },
  kpiIcon: {
    width: '38px', height: '38px', borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '12px',
  },
  kpiVal: { fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)', lineHeight: 1 },
  kpiLabel: { color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '6px' },
  chartRow: { marginBottom: '16px' },
  chartRow2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  chartTitle: { fontWeight: 700, fontSize: '0.92rem', marginBottom: '16px', color: 'var(--text-secondary)' },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
}
