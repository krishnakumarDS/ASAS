import { useId, useState } from 'react'
import styles from './charts.module.css'

export type ChartColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
interface Slice { label: string; value: number; color: ChartColor }
const colorVar: Record<ChartColor, string> = { primary: 'var(--accent-600)', secondary: 'var(--accent-500)', success: 'var(--color-success)', warning: 'var(--color-warning)', error: 'var(--color-danger)', info: 'var(--color-info)' }
const pick = (c: ChartColor) => colorVar[c]

/** Smooth curve through points (Catmull-Rom converted to cubic Béziers). */
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

export function Donut({ data, size = 150, centerLabel = 'Total' }: { data: Slice[]; size?: number; centerLabel?: string }) {
  const total = data.reduce((a, d) => a + d.value, 0)
  const r = 52, c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className={styles.donut}>
      <svg viewBox="0 0 140 140" width={size} height={size} role="img" aria-label={data.map((d) => `${d.label} ${d.value}`).join(', ')}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth="18" />
        {data.map((d) => {
          const len = (d.value / total) * c
          const el = <circle key={d.label} cx="70" cy="70" r={r} fill="none" stroke={pick(d.color)} strokeWidth="18" strokeDasharray={`${len - 1.5} ${c - len + 1.5}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" />
          offset += len
          return el
        })}
        <text x="70" y="68" textAnchor="middle" className={styles.donutV}>{total}</text>
        <text x="70" y="86" textAnchor="middle" className={styles.donutL}>{centerLabel}</text>
      </svg>
      <ul className={styles.legend}>
        {data.map((d) => <li key={d.label}><i style={{ background: pick(d.color) }} />{d.label}<b>{d.value}</b><span>({Math.round((d.value / total) * 100)}%)</span></li>)}
      </ul>
    </div>
  )
}

export function Columns({ data, height = 150 }: { data: Slice[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value))
  const total = data.reduce((a, d) => a + d.value, 0)
  return (
    <div className={styles.cols} style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className={styles.colWrap}>
          <span className={styles.colVal}>{d.value}<small> ({Math.round((d.value / total) * 100)}%)</small></span>
          <div className={styles.colBar} style={{ height: `${(d.value / max) * 100}%`, background: pick(d.color) }} />
          <span className={styles.colLab}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function StackedColumns({ rows, colors, legend, height = 170 }: { rows: { name: string; parts: number[] }[]; colors: ChartColor[]; legend: string[]; height?: number }) {
  const max = Math.max(...rows.map((r) => r.parts.reduce((a, b) => a + b, 0)))
  const total = rows.reduce((a, r) => a + r.parts.reduce((x, y) => x + y, 0), 0)
  return (
    <>
      <div className={styles.cols} style={{ height }}>
        {rows.map((r) => {
          const sum = r.parts.reduce((a, b) => a + b, 0)
          return (
            <div key={r.name} className={styles.colWrap}>
              <span className={styles.colVal}>{sum}<small> ({Math.round((sum / total) * 100)}%)</small></span>
              <div className={styles.stackBar} style={{ height: `${(sum / max) * 100}%` }}>
                {[...r.parts].map((p, i) => <div key={i} style={{ flex: p, background: pick(colors[i]) }} title={`${legend[i]}: ${p}`}>{p}</div>).reverse()}
              </div>
              <span className={styles.colLab}>{r.name}</span>
            </div>
          )
        })}
      </div>
      <ul className={`${styles.legend} ${styles.inline}`}>{legend.map((l, i) => <li key={l}><i style={{ background: pick(colors[i]) }} />{l}</li>)}</ul>
    </>
  )
}

export function HBars({ data, color = 'info' }: { data: { label: string; value: number }[]; color?: ChartColor }) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <ul className={styles.hbars}>
      {data.map((d) => <li key={d.label}><span>{d.label}</span><div><i style={{ width: `${(d.value / max) * 100}%`, background: pick(color) }} /></div><b>{d.value}</b></li>)}
    </ul>
  )
}

export function MiniBar({ pct, color = 'success' }: { pct: number; color?: ChartColor }) {
  return <span className={styles.bar}><i style={{ width: `${pct}%`, background: pick(color) }} /></span>
}

export function LineChart({ labels, actual, forecast, height = 240, unit = '' }: { labels: string[]; actual: number[]; forecast: number[]; height?: number; unit?: string }) {
  const all = [...actual, ...forecast.filter((v) => !Number.isNaN(v))]
  const max = Math.max(...all) * 1.1, min = Math.min(...all) * 0.9
  const W = 600, H = 220, pad = 28
  const x = (i: number) => pad + (i / (labels.length - 1)) * (W - pad * 2)
  const y = (v: number) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2)
  const path = (vals: number[]) => smooth(vals.map((v, i): [number, number] | null => (Number.isNaN(v) ? null : [x(i), y(v)])).filter((p): p is [number, number] => p !== null))
  const lastA = actual.length - 1
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ height }} role="img" aria-label="Actual and forecast trend">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => <g key={t}><line x1={pad} x2={W - pad} y1={pad + t * (H - pad * 2)} y2={pad + t * (H - pad * 2)} stroke="var(--border-light)" strokeWidth="1" /><text x={4} y={pad + t * (H - pad * 2) + 4} fontSize="10" fill="var(--text-tertiary)">{Math.round(max - t * (max - min))}{unit}</text></g>)}
        <path d={`${path(forecast)} L${x(labels.length - 1)},${H - pad} L${x(lastA)},${H - pad} Z`} fill="var(--accent-600)" opacity="0.07" />
        <path d={path(forecast)} fill="none" stroke="var(--accent-600)" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" />
        <path d={path(actual)} fill="none" stroke="var(--color-info)" strokeWidth="2.5" strokeLinecap="round" />
        {actual.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="var(--bg-secondary)" stroke="var(--color-info)" strokeWidth="2" />)}
        {labels.map((l, i) => (i % 2 === 0 || labels.length < 10) && <text key={l + i} x={x(i)} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--text-tertiary)">{l}</text>)}
      </svg>
      <ul className={styles.legend} style={{ flexDirection: 'row', display: 'flex', gap: 18, marginTop: 8 }}><li><i style={{ background: 'var(--color-info)' }} />Actual</li><li><i style={{ background: 'var(--accent-600)' }} />Forecast</li></ul>
    </div>
  )
}

/** Tiny inline trend line for KPI cards. */
export function Sparkline({ values, color = 'primary' }: { values: number[]; color?: ChartColor }) {
  const id = useId()
  const max = Math.max(...values), min = Math.min(...values)
  const pts = values.map((v, i): [number, number] => [(i / (values.length - 1)) * 100, 28 - ((v - min) / (max - min || 1)) * 22])
  const line = smooth(pts)
  const last = pts[pts.length - 1]
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" width="100%" height="40" aria-hidden>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pick(color)} stopOpacity="0.28" /><stop offset="1" stopColor={pick(color)} stopOpacity="0" /></linearGradient></defs>
      <path d={`${line} L100,32 L0,32 Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={pick(color)} strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="1.8" fill={pick(color)} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

interface AreaSeries { name: string; values: number[]; color: ChartColor }
/** Multi-series area chart with a hover read-out. */
export function AreaChart({ labels, series, height = 250 }: { labels: string[]; series: AreaSeries[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const all = series.flatMap((s) => s.values)
  const max = Math.max(...all) * 1.08, min = Math.min(...all) * 0.85
  const W = 640, H = 240, L = 34, R = 12, T = 12, B = 26
  const x = (i: number) => L + (i / (labels.length - 1)) * (W - L - R)
  const y = (v: number) => H - B - ((v - min) / (max - min || 1)) * (H - T - B)
  const path = (v: number[]) => smooth(v.map((q, i): [number, number] => [x(i), y(q)]))
  const gid = useId()
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    setHover(Math.max(0, Math.min(labels.length - 1, Math.round(((px - L) / (W - L - R)) * (labels.length - 1)))))
  }
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ height, display: 'block' }} onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label={series.map((s) => s.name).join(' and ')}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => <g key={t}><line x1={L} x2={W - R} y1={T + t * (H - T - B)} y2={T + t * (H - T - B)} stroke="var(--border-light)" /><text x={L - 6} y={T + t * (H - T - B) + 3.5} fontSize="10" textAnchor="end" fill="var(--text-tertiary)">{Math.round(max - t * (max - min))}</text></g>)}
        <defs>{series.map((s, i) => <linearGradient key={i} id={`${gid}${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pick(s.color)} stopOpacity="0.32" /><stop offset="1" stopColor={pick(s.color)} stopOpacity="0" /></linearGradient>)}</defs>
        {series.map((s, i) => <path key={`a${i}`} d={`${path(s.values)} L${x(labels.length - 1)},${H - B} L${x(0)},${H - B} Z`} fill={`url(#${gid}${i})`} />)}
        {series.map((s) => <path key={s.name} d={path(s.values)} fill="none" stroke={pick(s.color)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />)}
        {series.map((s) => s.values.map((q, i) => <circle key={s.name + i} cx={x(i)} cy={y(q)} r="3" fill="var(--bg-secondary)" stroke={pick(s.color)} strokeWidth="2" />))}
        {labels.map((l, i) => (labels.length <= 8 || i % Math.ceil(labels.length / 8) === 0) && <text key={i} x={x(i)} y={H - 7} fontSize="10" textAnchor="middle" fill="var(--text-tertiary)">{l}</text>)}
        {hover !== null && <g><line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="var(--border-strong)" strokeDasharray="3 3" />{series.map((s) => <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r="4.5" fill="var(--bg-secondary)" stroke={pick(s.color)} strokeWidth="2.5" />)}</g>}
      </svg>
      {hover !== null && (
        <div style={{ position: 'absolute', top: 6, left: `${Math.min(78, Math.max(2, (x(hover) / W) * 100 + 2))}%`, background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', padding: '8px 12px', fontSize: 12, pointerEvents: 'none' }}>
          <b>{labels[hover]}</b>
          {series.map((s) => <div key={s.name} className="row" style={{ gap: 6, marginTop: 3 }}><i style={{ width: 8, height: 8, borderRadius: '50%', background: pick(s.color) }} />{s.name}: <b className="num">{s.values[hover]}</b></div>)}
        </div>
      )}
      <ul className={styles.legend} style={{ display: 'flex', flexDirection: 'row', gap: 18, marginTop: 6 }}>{series.map((s) => <li key={s.name}><i style={{ background: pick(s.color) }} />{s.name}</li>)}</ul>
    </div>
  )
}
