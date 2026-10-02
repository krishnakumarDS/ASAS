import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, CheckCircle2, FilePlus2, Plus, Send, Sparkles, Upload } from 'lucide-react'
import { openChat } from '../components/ai/AiChat'
import AppButton from '../components/common/AppButton'
import StatusChip from '../components/common/StatusChip'
import { AreaChart, Donut, Sparkline } from '../components/charts'
import type { ChartColor } from '../components/charts'
import { DataTable } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { CAPACITY, PERIODS, WEEKLY, active, activity, byType, engineers, examples, exceeding, hotspots, pipeline } from '../data/dashboard'
import styles from './Dashboard.module.css'

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)
const avg = (a: number[]) => sum(a) / a.length
const pctChange = (cur: number, prev: number) => Math.round(((cur - prev) / prev) * 100)
const initials = (n: string) => n.split(' ').map((w) => w[0]).join('').slice(0, 2)
const FEED = { ok: <CheckCircle2 size={15} />, new: <FilePlus2 size={15} />, warn: <AlertTriangle size={15} />, upload: <Upload size={15} /> }
const FEED_TONE = { ok: 'var(--color-success)', new: 'var(--color-info)', warn: 'var(--color-danger)', upload: 'var(--accent-600)' }

interface KpiDef { label: string; value: string; unit?: string; change: number; goodWhenUp: boolean; spark: number[]; color: ChartColor; hint: string }

function Kpi({ k, i }: { k: KpiDef; i: number }) {
  const good = k.goodWhenUp ? k.change >= 0 : k.change <= 0
  return (
    <div className={`card lift reveal-item ${styles.kpi}`} style={{ ['--index' as string]: i }}>
      <span className="eyebrow">{k.label}</span>
      <div className={styles.kpiValue}>{k.value}{k.unit && <small>{k.unit}</small>}</div>
      <div className={styles.kpiMeta}>
        <span className={`${styles.trend} ${good ? styles.good : styles.bad}`}>{k.change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(k.change)}%</span>
        <span className="faint">{k.hint}</span>
      </div>
      <div className={styles.spark}><Sparkline values={k.spark} color={k.color} /></div>
    </div>
  )
}

const Card = ({ title, sub, action, children, index = 0, className = '' }: { title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode; index?: number; className?: string }) => (
  <section className={`card reveal-item ${className}`} style={{ ['--index' as string]: index }}>
    <div className="card-head"><div><h4>{title}</h4>{sub && <span className="faint" style={{ fontSize: 12 }}>{sub}</span>}</div>{action}</div>
    {children}
  </section>
)

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [period, setPeriod] = useState<'4' | '12'>('4')
  const [filter, setFilter] = useState<'all' | 'ok' | 'late'>('all')
  const [q, setQ] = useState('')
  const [question, setQuestion] = useState('')
  const n = Number(period)
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)

  const d = useMemo(() => {
    const cur = (a: number[]) => a.slice(-n), prev = (a: number[]) => a.slice(-2 * n, -n)
    const kpis: KpiDef[] = [
      { label: 'Submissions received', value: String(sum(cur(WEEKLY.received))), change: pctChange(sum(cur(WEEKLY.received)), sum(prev(WEEKLY.received))), goodWhenUp: true, spark: cur(WEEKLY.received), color: 'info', hint: `vs previous ${n} weeks` },
      { label: 'Completed', value: String(sum(cur(WEEKLY.completed))), change: pctChange(sum(cur(WEEKLY.completed)), sum(prev(WEEKLY.completed))), goodWhenUp: true, spark: cur(WEEKLY.completed), color: 'success', hint: `vs previous ${n} weeks` },
      { label: 'KPI compliance', value: avg(cur(WEEKLY.compliance)).toFixed(1), unit: '%', change: pctChange(avg(cur(WEEKLY.compliance)), avg(prev(WEEKLY.compliance))), goodWhenUp: true, spark: cur(WEEKLY.compliance), color: 'primary', hint: `vs previous ${n} weeks` },
      { label: 'Avg. review time', value: avg(cur(WEEKLY.reviewDays)).toFixed(1), unit: 'days', change: pctChange(avg(cur(WEEKLY.reviewDays)), avg(prev(WEEKLY.reviewDays))), goodWhenUp: false, spark: cur(WEEKLY.reviewDays), color: 'warning', hint: `vs previous ${n} weeks` },
    ]
    const labels = Array.from({ length: 24 }, (_, i) => `W${i + 1}`).slice(-n)
    return { kpis, labels, received: WEEKLY.received.slice(-n), completed: WEEKLY.completed.slice(-n) }
  }, [n])

  const total = pipeline.reduce((a, p) => a + p.value, 0)
  const rows = active.filter((r) => (filter === 'all' || (filter === 'ok' ? r.ok : !r.ok)) && `${r.project} ${r.type} ${r.engineer}`.toLowerCase().includes(q.toLowerCase()))
  const ask = () => { if (question.trim()) { openChat(question.trim()); setQuestion('') } }

  return (
    <div className="page">
      <header className={`${styles.head} reveal`}>
        <div>
          <span className="eyebrow">{today}</span>
          <h1 className={styles.hello}>{greeting}, {user?.name.split(' ')[0]}</h1>
          <p className="muted">Here’s how the department is doing.</p>
        </div>
        <div className={styles.headActions}>
          <div className={styles.seg} role="group" aria-label="Period">
            {PERIODS.map((p) => <button key={p.key} aria-pressed={period === p.key} className={period === p.key ? styles.segOn : ''} onClick={() => setPeriod(p.key)}>{p.label}</button>)}
          </div>
          <AppButton variant="outlined" startIcon={<BarChart3 size={16} />} onClick={() => navigate('/reports')}>Reports</AppButton>
          <AppButton variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/projects/new')}>New project</AppButton>
        </div>
      </header>


      <div className={styles.kpis}>{d.kpis.map((k, i) => <Kpi key={k.label} k={k} i={i + 1} />)}</div>

      <div className={styles.row2}>
        <Card title="Throughput" sub={`Received vs completed · last ${n} weeks`} index={4}>
          <div className="card-body"><AreaChart labels={d.labels} series={[{ name: 'Received', values: d.received, color: 'info' }, { name: 'Completed', values: d.completed, color: 'primary' }]} /></div>
        </Card>
        <Card title="Needs attention" sub="Past KPI date" index={5} action={<Link to="/projects" className="link" style={{ fontSize: 13 }}>View all</Link>}>
          <ul className={styles.attn}>
            {exceeding.map((e) => (
              <li key={e.project}>
                <span className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{initials(e.engineer)}</span>
                <div className="grow"><Link to={`/projects/${e.id}`} className="link cell-title" style={{ fontSize: 13 }}>{e.project}</Link><div className="cell-sub">{e.type} · {e.engineer}</div></div>
                <span className="badge badge-danger num">+{e.over}d</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className={styles.row3}>
        <Card title="Pipeline" sub={`${total} submissions in flight`} index={6}>
          <div className="card-body">
            <div className={styles.pipe} role="img" aria-label="Pipeline by stage">{pipeline.map((p) => <i key={p.label} style={{ flex: p.value, background: `var(--${p.color === 'info' ? 'color-info' : p.color === 'warning' ? 'color-warning' : p.color === 'success' ? 'color-success' : 'accent-500'})` }} title={`${p.label}: ${p.value}`} />)}</div>
            <ul className={styles.stages}>
              {pipeline.map((p) => <li key={p.label}><i style={{ background: `var(--${p.color === 'info' ? 'color-info' : p.color === 'warning' ? 'color-warning' : p.color === 'success' ? 'color-success' : 'accent-500'})` }} /><span className="grow">{p.label}</span><b className="num">{p.value}</b><span className="faint num">{Math.round((p.value / total) * 100)}%</span></li>)}
            </ul>
          </div>
        </Card>
        <Card title="Workload" sub={`Active items vs capacity of ${CAPACITY}`} index={7}>
          <ul className={`card-body ${styles.load}`}>
            {engineers.map((e) => { const v = sum(e.parts); const pc = Math.min(100, Math.round((v / CAPACITY) * 100)); const tone = pc > 90 ? 'var(--color-danger)' : pc > 70 ? 'var(--color-warning)' : 'var(--accent-600)'; return (
              <li key={e.name}><div className="row between"><span style={{ fontSize: 13, fontWeight: 600 }}>{e.name}</span><span className="faint num" style={{ fontSize: 12 }}>{v} of {CAPACITY}</span></div><div className={styles.track}><i style={{ width: `${pc}%`, background: tone }} /></div></li>) })}
          </ul>
        </Card>
        <Card title="By type" sub="All active submissions" index={8}><div className="card-body"><Donut data={byType} size={140} /></div></Card>
      </div>

      <div className={styles.row2b}>
        <Card title="Recent activity" index={9}>
          <ul className={styles.feed}>
            {activity.map((a, i) => <li key={i}><span className={styles.feedIco} style={{ color: FEED_TONE[a.kind as keyof typeof FEED_TONE] }}>{FEED[a.kind as keyof typeof FEED]}</span><div className="grow"><div style={{ fontSize: 13, fontWeight: 500 }}>{a.text}</div><div className="cell-sub">{a.by}</div></div><span className="faint" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{a.when}</span></li>)}
          </ul>
        </Card>
        <div className="stack">
          <Card title="Network hotspots" sub="Sample data" index={10} action={<Link to="/network" className="link" style={{ fontSize: 13 }}>Open map</Link>}>
            <div className={`card-body ${styles.hot}`}>
              {hotspots.map((h) => <Link to="/network" key={h.zone} style={{ ['--c' as string]: h.load >= 75 ? 'var(--color-danger)' : 'var(--color-warning)' }}><span>{h.zone}</span><b className="num">{h.load}%</b></Link>)}
            </div>
          </Card>
          <section className={`card reveal-item ${styles.ai}`} style={{ ['--index' as string]: 11 }}>
            <h4 className="row" style={{ gap: 8 }}><Sparkles size={16} style={{ color: 'var(--accent-600)' }} />Ask ASAS</h4>
            <div className="with-action" style={{ margin: '12px 0' }}>
              <input className="input" placeholder="Ask about projects, KPIs, workload…" aria-label="Ask ASAS" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()} />
              <AppButton variant="contained" aria-label="Send" disabled={!question.trim()} onClick={ask}><Send size={15} /></AppButton>
            </div>
            <div className="row wrap" style={{ gap: 6 }}>{examples.map((e) => <button key={e} className="chip" onClick={() => openChat(e)}>{e}</button>)}</div>
          </section>
        </div>
      </div>

      <Card title="Active submissions" index={12} action={
        <div className="row wrap" style={{ gap: 8 }}>
          <input className="input" style={{ width: 200, minHeight: 34, padding: '6px 12px' }} placeholder="Filter…" aria-label="Filter submissions" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className={styles.seg} role="group" aria-label="KPI filter">{([['all', 'All'], ['ok', 'Within KPI'], ['late', 'Exceeding']] as const).map(([k, l]) => <button key={k} aria-pressed={filter === k} className={filter === k ? styles.segOn : ''} onClick={() => setFilter(k)}>{l}</button>)}</div>
        </div>
      }>
        <DataTable<(typeof active)[number]>
          rows={rows} empty="No submissions match."
          columns={[
            { header: 'Project', render: (r) => <><Link className="link cell-title" to={`/projects/${r.id}`}>{r.project}</Link><div className="cell-sub">{r.type}</div></> },
            { header: 'Category', render: (r) => <span className="muted">{r.category}</span> },
            { header: 'Engineer', render: (r) => r.engineer },
            { header: 'Days open', render: (r) => <span className="num">{r.days}</span> },
            { header: 'KPI', render: (r) => <StatusChip status={r.ok ? 'approved' : 'rejected'} label={r.ok ? 'Within KPI' : 'Exceeding'} /> },
          ]}
        />
      </Card>
    </div>
  )
}
