import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, BarChart3, Plus } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import StatusChip from '../components/common/StatusChip'
import { AreaChart, Donut, HBars, Sparkline } from '../components/charts'
import type { ChartColor } from '../components/charts'
import { DataTable } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { callApi } from '../data/api'
import { fmtDate } from '../data/mock'
import { useRemote } from '../data/remote'
import { useConsultants, useDevelopers, usePlots, useProjects, useSubstations } from '../data/store'
import { useSyncStatus } from '../data/sync'
import styles from './Dashboard.module.css'

const PERIODS = [{ key: '6', label: '6 months' }, { key: '12', label: '12 months' }] as const

/** Last `n` calendar months as YYYY-MM, oldest first. */
const lastMonths = (n: number) => {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` })
}
const monthLabel = (m: string) => new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(new Date(Number(m.slice(0, 4)), Number(m.slice(5)) - 1, 1))
const perMonth = (rows: { createdOn?: string }[], months: string[]) => months.map((m) => rows.filter((r) => r.createdOn?.startsWith(m)).length)
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)
const pctChange = (cur: number, prev: number) => (prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100))
const countBy = <T,>(rows: T[], key: (r: T) => string) => { const m = new Map<string, number>(); rows.forEach((r) => { const k = key(r); if (k) m.set(k, (m.get(k) ?? 0) + 1) }); return m }
const top = (m: Map<string, number>, n: number) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, value]) => ({ label, value }))

interface KpiDef { label: string; value: string; unit?: string; change?: number; spark?: number[]; color: ChartColor; hint: string }

function Kpi({ k, i }: { k: KpiDef; i: number }) {
  return (
    <div className={`card lift reveal-item ${styles.kpi}`} style={{ ['--index' as string]: i }}>
      <span className="eyebrow">{k.label}</span>
      <div className={styles.kpiValue}>{k.value}{k.unit && <small>{k.unit}</small>}</div>
      <div className={styles.kpiMeta}>
        {k.change !== undefined && <span className={`${styles.trend} ${k.change >= 0 ? styles.good : styles.bad}`}>{k.change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(k.change)}%</span>}
        <span className="faint">{k.hint}</span>
      </div>
      {k.spark && <div className={styles.spark}><Sparkline values={k.spark} color={k.color} /></div>}
    </div>
  )
}

const Card = ({ title, sub, action, children, index = 0, className = '' }: { title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode; index?: number; className?: string }) => (
  <section className={`card reveal-item ${className}`} style={{ ['--index' as string]: index }}>
    <div className="card-head"><div><h4>{title}</h4>{sub && <span className="faint" style={{ fontSize: 12 }}>{sub}</span>}</div>{action}</div>
    {children}
  </section>
)

/** Everything here is counted from the lists loaded from SQL (projects, plots, substations, developers, consultants);
 *  the connected-load totals come from the ViewConAndDevStats action. */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const sync = useSyncStatus()
  const [projects] = useProjects()
  const [plots] = usePlots()
  const [substations] = useSubstations()
  const [developers] = useDevelopers()
  const [consultants] = useConsultants()
  const [period, setPeriod] = useState<'6' | '12'>('6')
  const [filter, setFilter] = useState<'all' | 'active' | 'hidden'>('active')
  const [q, setQ] = useState('')
  const n = Number(period)
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)

  // Whole-portfolio totals (no consultant or developer filter) from SQL.
  const totals = useRemote(sync.state === 'live' ? 'totals' : null, async () => {
    const r = (await callApi('ViewConAndDevStats', {}))[0]?.[0]
    return { plots: Number(r?.TotalPlots ?? 0), tcl: Number(r?.TotalTCL ?? 0), dcp: Number(r?.TotalDCP ?? 0) }
  })

  const d = useMemo(() => {
    const months = lastMonths(2 * n)
    const cur = months.slice(n), prev = months.slice(0, n)
    const added = { projects: perMonth(projects, months), plots: perMonth(plots, months) }
    const kpiOf = (label: string, total: number, a: number[], color: ChartColor): KpiDef => ({
      label, value: total.toLocaleString('en'), change: pctChange(sum(a.slice(n)), sum(a.slice(0, n))), spark: a.slice(n), color,
      hint: `${sum(a.slice(n))} added · last ${n} months`,
    })
    // Totals and rankings count active records only; deleted (inactive) ones are shown in the Hidden figures below.
    const aProjects = projects.filter((p) => p.display), aPlots = plots.filter((p) => p.display), aSubs = substations.filter((s) => s.showInSO)
    const byProject = countBy(plots, (p) => p.maalemRef)
    const noPlots = aProjects.filter((p) => !byProject.has(p.maalemRef))
    const dewa = aSubs.filter((s) => s.builtBy === 'DEWA').length
    return {
      kpis: [
        kpiOf('Projects', aProjects.length, added.projects, 'info'),
        kpiOf('Plots', aPlots.length, added.plots, 'success'),
        { label: 'Substations', value: String(aSubs.length), color: 'primary' as ChartColor, hint: `${dewa} by DEWA · ${aSubs.length - dewa} by developers` },
        { label: 'Connected load', value: totals.data ? totals.data.tcl.toLocaleString('en', { maximumFractionDigits: 0 }) : '—', unit: 'MW', color: 'warning' as ChartColor, hint: totals.data ? `DCP ${totals.data.dcp.toLocaleString('en', { maximumFractionDigits: 0 })} MW` : 'Total connected load' },
      ] as KpiDef[],
      labels: cur.map(monthLabel), addedProjects: added.projects.slice(n), addedPlots: added.plots.slice(n), prevLabel: prev.length,
      byProject, noPlots,
      status: [
        { label: 'Active with plots', value: projects.filter((p) => p.display && byProject.has(p.maalemRef)).length, color: 'success' as ChartColor },
        { label: 'Active, no plots', value: projects.filter((p) => p.display && !byProject.has(p.maalemRef)).length, color: 'warning' as ChartColor },
        { label: 'Hidden', value: projects.filter((p) => !p.display).length, color: 'info' as ChartColor },
      ],
      builders: [{ label: 'DEWA', value: dewa, color: 'primary' as ChartColor }, { label: 'Developer', value: aSubs.length - dewa, color: 'info' as ChartColor }],
      topDevelopers: top(countBy(aPlots, (p) => p.developer), 6),
      topConsultants: top(countBy(aPlots, (p) => p.consultant), 6),
      recent: [...projects].sort((a, b) => b.createdOn.localeCompare(a.createdOn)),
    }
  }, [projects, plots, substations, totals.data, n])

  const statusTotal = d.status.reduce((a, s) => a + s.value, 0)
  const tone = (c: ChartColor) => `var(--${c === 'info' ? 'color-info' : c === 'warning' ? 'color-warning' : c === 'success' ? 'color-success' : 'accent-500'})`
  const rows = d.recent.filter((r) => (filter === 'all' || (filter === 'active' ? r.display : !r.display)) && `${r.name} ${r.developer} ${r.consultant ?? ''} ${r.maalemRef}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="page">
      <header className={`${styles.head} reveal`}>
        <div>
          <span className="eyebrow">{today}</span>
          <h1 className={styles.hello}>{greeting}, {user?.name.split(' ')[0]}</h1>
          <p className="muted">{sync.state === 'live' ? `${projects.filter((p) => p.display).length.toLocaleString('en')} active projects, ${plots.filter((p) => p.display).length.toLocaleString('en')} active plots, ${developers.filter((d) => d.showInSO).length} developers and ${consultants.filter((c) => c.showInSO).length} consultants.` : 'Some data could not be loaded right now.'}</p>
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
        <Card title="Records added" sub={`Projects and plots by month · last ${n} months`} index={4}>
          <div className="card-body"><AreaChart labels={d.labels} series={[{ name: 'Projects', values: d.addedProjects, color: 'info' }, { name: 'Plots', values: d.addedPlots, color: 'primary' }]} /></div>
        </Card>
        <Card title="Needs attention" sub={`${d.noPlots.length} project${d.noPlots.length === 1 ? '' : 's'} with no plots`} index={5} action={<Link to="/projects" className="link" style={{ fontSize: 13 }}>View all</Link>}>
          <ul className={styles.attn}>
            {d.noPlots.slice(0, 6).map((p) => (
              <li key={p.id}>
                <span className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{(p.developer.split(/\s+/).map((w) => w[0]).join('').slice(0, 2) || '?').toUpperCase()}</span>
                <div className="grow"><Link to={`/projects/${p.id}`} className="link cell-title" style={{ fontSize: 13 }}>{p.name}</Link><div className="cell-sub">{p.maalemRef} · {p.developer}</div></div>
                <span className={`badge ${p.display ? 'badge-warning' : 'badge-neutral'}`}>{p.display ? 'No plots' : 'Hidden'}</span>
              </li>
            ))}
            {d.noPlots.length === 0 && <li className="faint">Every project has at least one plot.</li>}
          </ul>
        </Card>
      </div>

      <div className={styles.row3}>
        <Card title="Project status" sub={`${statusTotal} projects`} index={6}>
          <div className="card-body">
            <div className={styles.pipe} role="img" aria-label="Projects by status">{d.status.map((s) => <i key={s.label} style={{ flex: s.value || 0.0001, background: tone(s.color) }} title={`${s.label}: ${s.value}`} />)}</div>
            <ul className={styles.stages}>
              {d.status.map((s) => <li key={s.label}><i style={{ background: tone(s.color) }} /><span className="grow">{s.label}</span><b className="num">{s.value}</b><span className="faint num">{statusTotal ? Math.round((s.value / statusTotal) * 100) : 0}%</span></li>)}
            </ul>
          </div>
        </Card>
        <Card title="Top developers" sub="By number of plots" index={7}><div className="card-body">{d.topDevelopers.length ? <HBars data={d.topDevelopers} color="info" /> : <p className="faint">No plots yet.</p>}</div></Card>
        <Card title="Substations" sub="By builder" index={8}><div className="card-body">{substations.some((s) => s.showInSO) ? <Donut data={d.builders} size={140} /> : <p className="faint">No substations yet.</p>}</div></Card>
      </div>

      <div className={styles.row2b} style={{ gridTemplateColumns: '1fr' }}>
        <Card title="Top consultants" sub="By number of plots" index={9}>
          <div className="card-body">{d.topConsultants.length ? <HBars data={d.topConsultants} color="primary" /> : <p className="faint">No plots yet.</p>}</div>
        </Card>
      </div>

      <Card title="Projects" sub="Newest first" index={11} action={
        <div className="row wrap" style={{ gap: 8 }}>
          <input className="input" style={{ width: 200, minHeight: 34, padding: '6px 12px' }} placeholder="Filter…" aria-label="Filter projects" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className={styles.seg} role="group" aria-label="Status filter">{([['all', 'All'], ['active', 'Active'], ['hidden', 'Hidden']] as const).map(([k, l]) => <button key={k} aria-pressed={filter === k} className={filter === k ? styles.segOn : ''} onClick={() => setFilter(k)}>{l}</button>)}</div>
        </div>
      }>
        <DataTable<(typeof d.recent)[number]>
          rows={rows.slice(0, 10)} empty="No projects match."
          columns={[
            { header: 'Project', render: (r) => <><Link className="link cell-title" to={`/projects/${r.id}`}>{r.name}</Link><div className="cell-sub num">{r.maalemRef}</div></> },
            { header: 'Developer', render: (r) => r.developer },
            { header: 'Consultant', render: (r) => <span className="muted">{r.consultant || '—'}</span> },
            { header: 'Plots', render: (r) => <span className="num">{d.byProject.get(r.maalemRef) ?? 0}</span> },
            { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
            { header: 'Status', render: (r) => <StatusChip status={r.display ? 'active' : 'hidden'} label={r.display ? 'Active' : 'Hidden'} /> },
          ]}
        />
      </Card>
    </div>
  )
}
