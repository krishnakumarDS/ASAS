import styles from './charts.module.css'

export type ChartColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
interface Slice { label: string; value: number; color: ChartColor }
const colorVar: Record<ChartColor, string> = { primary: 'var(--accent-600)', secondary: 'var(--accent-500)', success: 'var(--color-success)', warning: 'var(--color-warning)', error: 'var(--color-danger)', info: 'var(--color-info)' }
const pick = (c: ChartColor) => colorVar[c]

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
  const path = (vals: number[]) => vals.map((v, i) => (Number.isNaN(v) ? null : `${i === vals.findIndex((q) => !Number.isNaN(q)) ? 'M' : 'L'}${x(i)},${y(v)}`)).filter(Boolean).join(' ')
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
