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
