import { useMemo, useState } from 'react'
import { ArrowUpRight, Gauge, TrendingUp } from 'lucide-react'
import { LineChart } from '../components/charts'
import KPICard from '../components/common/KPICard'
import PageHeader from '../components/PageHeader'

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
const SERIES = {
  submissions: { label: 'Submissions per month', unit: '', actual: [38, 41, 40, 47, 52, 49, 58, 61, 60, 68, 72, 75] },
  load: { label: 'Connected load (MW)', unit: ' MW', actual: [210, 214, 223, 231, 240, 244, 259, 268, 277, 286, 301, 312] },
  kpi: { label: 'KPI compliance (%)', unit: '%', actual: [88, 90, 89, 91, 90, 93, 92, 94, 91, 93, 92, 92] },
} as const
type Key = keyof typeof SERIES

/** Least-squares line through the actual points, extended `n` steps. */
function project(vals: readonly number[], n: number) {
  const m = vals.length
  const sx = (m * (m - 1)) / 2, sy = vals.reduce((a, b) => a + b, 0)
  const sxy = vals.reduce((a, v, i) => a + i * v, 0), sxx = vals.reduce((a, _, i) => a + i * i, 0)
  const slope = (m * sxy - sx * sy) / (m * sxx - sx * sx), icpt = (sy - slope * sx) / m
  return { slope, out: Array.from({ length: n }, (_, k) => Math.round((icpt + slope * (m + k)) * 10) / 10) }
}

export default function TrendsPage() {
  const [key, setKey] = useState<Key>('submissions')
  const [horizon, setHorizon] = useState(6)
  const s = SERIES[key]
  const { slope, out } = useMemo(() => project(s.actual, horizon), [s, horizon])
  const labels = [...MONTHS, ...Array.from({ length: horizon }, (_, i) => `+${i + 1}m`)]
  const last = s.actual[s.actual.length - 1]
  const end = out[out.length - 1]
  const pct = Math.round(((end - last) / last) * 100)

  return (
    <div className="page">
      <PageHeader title="Trends & forecast" subtitle="Where submissions, load and KPI compliance are heading" back={false} />
      <div className="card toolbar reveal-item">
        <div className="row between wrap" style={{ gap: 12 }}>
          <div className="row wrap">{(Object.keys(SERIES) as Key[]).map((k) => <button key={k} className="chip" aria-pressed={k === key} style={k === key ? { background: 'var(--accent-50)', color: 'var(--accent-600)', borderColor: 'var(--accent-100)' } : undefined} onClick={() => setKey(k)}>{SERIES[k].label}</button>)}</div>
          <div className="row"><span className="eyebrow">Forecast</span>{[3, 6, 12].map((h) => <button key={h} className="chip" aria-pressed={h === horizon} style={h === horizon ? { background: 'var(--accent-50)', color: 'var(--accent-600)', borderColor: 'var(--accent-100)' } : undefined} onClick={() => setHorizon(h)}>{h} months</button>)}</div>
        </div>
      </div>
      <div className="grid-kpi gap-section" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <KPICard index={0} label="Latest" value={String(last)} unit={s.unit.trim()} icon={<Gauge size={20} />} color="info" hint="most recent month" />
        <KPICard index={1} label={`In ${horizon} months`} value={String(Math.round(end))} unit={s.unit.trim()} icon={<TrendingUp size={20} />} color="primary" trend={{ dir: pct >= 0 ? 'up' : 'down', text: `${Math.abs(pct)}%`, good: key === 'kpi' ? pct >= 0 : true }} hint="projected" />
        <KPICard index={2} label="Trend" value={`${slope >= 0 ? '+' : ''}${(Math.round(slope * 10) / 10).toString()}`} unit={`${s.unit.trim()}/mo`} icon={<ArrowUpRight size={20} />} color="secondary" hint="average change per month" />
      </div>
      <section className="card reveal-item">
        <div className="card-head"><h4>{s.label}</h4><span className="faint" style={{ fontSize: 12 }}>Sample history · linear-trend forecast</span></div>
        <div className="card-body"><LineChart labels={labels} actual={[...s.actual]} forecast={[...Array(s.actual.length - 1).fill(NaN), last, ...out]} unit={s.unit.trim()} /></div>
      </section>
    </div>
  )
}
