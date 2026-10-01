import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, BarChart3, Building2, CalendarDays, CheckCircle2, Clock, FileText, Plus, Send, Sparkles, Timer, TrendingUp, UserCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import AppButton from '../components/common/AppButton'
import KPICard from '../components/common/KPICard'
import StatusChip from '../components/common/StatusChip'
import { Columns, Donut, HBars, MiniBar, StackedColumns } from '../components/charts'
import type { ChartColor } from '../components/charts'
import { DataTable } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { active, byStatus, byType, engineers, examples, exceeding, insights, kpiCompliance, kpis, pmpCategories } from '../data/dashboard'

const icons: Record<string, ReactNode> = { file: <FileText size={21} />, clock: <Clock size={21} />, check: <CheckCircle2 size={21} />, alert: <AlertTriangle size={21} />, building: <Building2 size={21} />, timer: <Timer size={21} /> }
const typeColors: ChartColor[] = ['info', 'warning', 'primary']
const typeNames = ['Power Supply Master Plans', 'Power Supply NOCs', 'Infrastructure NOCs']

const Panel = ({ title, children, id, action, index = 0, className = '' }: { title: ReactNode; children: ReactNode; id?: string; action?: ReactNode; index?: number; className?: string }) => (
  <section id={id} className={`card reveal-item ${className}`} style={{ ['--index' as string]: index }}>
    <div className="card-head"><h4 className="row" style={{ gap: 8 }}>{title}</h4>{action}</div>
    <div className="card-body">{children}</div>
  </section>
)
const Flush = ({ title, children, action, index = 0 }: { title: ReactNode; children: ReactNode; action?: ReactNode; index?: number }) => (
  <section className="card reveal-item" style={{ ['--index' as string]: index }}>
    <div className="card-head"><h4>{title}</h4>{action}</div>
    {children}
  </section>
)

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
  const ask = () => question.trim() && setAnswer(`“${question.trim()}” — the AI assistant isn’t connected yet. Once it is, answers appear here.`)

  return (
    <div className="page">
      <section className="card hero reveal gap-section">
        <div className="row between wrap" style={{ gap: 20, position: 'relative' }}>
          <div>
            <span className="eyebrow row" style={{ gap: 6 }}><CalendarDays size={13} /> {today}</span>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 34px)', margin: '6px 0 4px' }}>{greeting}, {user?.name.split(' ')[0]}</h1>
            <p className="muted">Here’s the whole-department overview for today.</p>
            <div className="row wrap" style={{ gap: 14, marginTop: 14, fontSize: 12 }}>
              <span className="faint">Integrated systems</span>
              {['GIS', 'TMS', 'SAP', 'Rekaaz'].map((s) => <span key={s} className="row" style={{ gap: 6, fontWeight: 600 }}><i className="pulse-dot" />{s}</span>)}
            </div>
          </div>
          <div className="row wrap" style={{ gap: 10 }}>
            <AppButton variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/projects/new')}>New project</AppButton>
            <AppButton variant="outlined" startIcon={<BarChart3 size={16} />} onClick={() => navigate('/reports')}>Reports</AppButton>
            <AppButton variant="outlined" startIcon={<Sparkles size={16} />} onClick={() => document.getElementById('ai')?.scrollIntoView({ behavior: 'smooth' })}>AI assistant</AppButton>
          </div>
        </div>
      </section>

      <div className="grid-kpi gap-section">
        {kpis.map((k, i) => (
          <KPICard key={k.key} index={i} label={k.label} value={k.value} unit={'unit' in k ? k.unit : undefined} icon={icons[k.icon]} color={k.tone} hint={k.hint}
            to={'to' in k ? k.to : undefined}
            trend={k.delta ? { dir: k.up ? 'up' : 'down', text: k.delta, good: k.key === 'exceed' || k.key === 'time' ? !k.up : k.up } : undefined} />
        ))}
      </div>

      <div className="grid-3 gap-section">
        <Panel title="Submissions by type" index={1}><Donut data={byType} /></Panel>
        <Panel title="KPI compliance" index={2}>
          <Donut data={kpiCompliance} />
          <p className="faint" style={{ fontSize: 12, marginTop: 14 }}>Target: review within defined KPI time</p>
        </Panel>
        <Panel title="Submissions by status" index={3}><Columns data={byStatus} height={210} /></Panel>
      </div>

      <div className="grid-main-side gap-section">
        <div className="stack">
          <Panel title="Engineer workload" index={4}><StackedColumns rows={engineers} colors={typeColors} legend={typeNames} height={190} /></Panel>
          <div className="grid-2">
            <Panel title="Master plan categories" index={5}><HBars data={pmpCategories} /></Panel>
            <Flush title="KPI compliance by engineer" index={6}>
              <DataTable<{ id: string; name: string; within: number; exceeding: number }>
                rows={engineers.map((e) => ({ id: e.name, name: e.name, within: e.within, exceeding: e.exceeding }))}
                columns={[
                  { header: 'Engineer', render: (r) => r.name },
                  { header: 'Within', render: (r) => <><MiniBar pct={Math.round((r.within / (r.within + r.exceeding)) * 100)} />{r.within}</> },
                  { header: 'Over', render: (r) => <span className={r.exceeding ? 'neg' : 'muted'}>{r.exceeding}</span> },
                  { header: '%', render: (r) => <b>{Math.round((r.within / (r.within + r.exceeding)) * 100)}%</b> },
                ]}
              />
            </Flush>
          </div>
        </div>
        <Panel id="ai" title={<><Sparkles size={16} /> AI assistant</>} index={5}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Smart insights</div>
          <ul style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
            {insights.map((i) => (
              <li key={i.text} className="row" style={{ alignItems: 'flex-start', gap: 10, fontSize: 13, lineHeight: 1.45 }}>
                <span style={{ color: i.tone === 'red' ? 'var(--color-danger)' : i.tone === 'blue' ? 'var(--color-info)' : 'var(--color-success)', marginTop: 2 }}>
                  {i.tone === 'red' ? <AlertTriangle size={15} /> : i.tone === 'blue' ? <UserCheck size={15} /> : <TrendingUp size={15} />}
                </span>{i.text}
              </li>
            ))}
          </ul>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Ask ASAS</div>
          <div className="with-action">
            <input className="input" placeholder="Ask a question…" aria-label="Ask ASAS" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()} />
            <AppButton variant="contained" onClick={ask} aria-label="Send"><Send size={15} /></AppButton>
          </div>
          {answer && <p style={{ marginTop: 12, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--accent-50)', color: 'var(--accent-600)', fontSize: 13 }} role="status">{answer}</p>}
          <div className="row wrap" style={{ gap: 6, marginTop: 14 }}>{examples.map((e) => <button key={e} className="chip" onClick={() => setQuestion(e)}>{e}</button>)}</div>
        </Panel>
      </div>

      <div className="grid-2">
        <Flush title="Active submissions" index={7} action={<Link to="/projects" className="link" style={{ fontSize: 13 }}>View all →</Link>}>
          <DataTable<(typeof active)[number]>
            rows={active}
            columns={[
              { header: 'Project', render: (r) => <><Link className="link cell-title" to={`/projects/${r.id}`}>{r.project}</Link><div className="cell-sub">{r.type}</div></> },
              { header: 'Category', render: (r) => <span className="muted">{r.category}</span> },
              { header: 'Engineer', render: (r) => r.engineer },
              { header: 'Days', render: (r) => <span className="num">{r.days}</span> },
              { header: 'KPI', render: (r) => <StatusChip status={r.ok ? 'approved' : 'rejected'} label={r.ok ? 'Within' : 'Exceeding'} /> },
            ]}
          />
        </Flush>
        <Flush title="Recently exceeding KPI" index={8} action={<Link to="/projects" className="link" style={{ fontSize: 13 }}>View all →</Link>}>
          <DataTable<(typeof exceeding)[number]>
            rows={exceeding}
            columns={[
              { header: 'Project', render: (r) => <><Link className="link cell-title" to={`/projects/${r.id}`}>{r.project}</Link><div className="cell-sub">{r.type}</div></> },
              { header: 'Engineer', render: (r) => r.engineer },
              { header: 'Over', render: (r) => <span className="neg num">+{r.over}d</span> },
            ]}
          />
        </Flush>
      </div>
    </div>
  )
}
