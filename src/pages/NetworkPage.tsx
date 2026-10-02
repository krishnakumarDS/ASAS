import { useMemo, useState } from 'react'
import { Flame, Network } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatusChip from '../components/common/StatusChip'
import { Tabs } from '../components/ui'
import { useProjects, useSubstations } from '../data/store'
import styles from './NetworkPage.module.css'

const ZONES = ['Al Barsha', 'Dubai South', 'Jebel Ali', 'Business Bay', 'Downtown', 'Deira', 'Mirdif', 'Al Quoz', 'Marina', 'Hatta', 'Meydan', 'Warsan']
const seedRand = (i: number, salt: number) => ((Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1 + 1) % 1
const METRICS = { load: 'Load', growth: 'Growth', risk: 'Constraint risk' } as const
type Metric = keyof typeof METRICS

export default function NetworkPage() {
  const [substations] = useSubstations()
  const [projects] = useProjects()
  const [tab, setTab] = useState('Network model')
  const [metric, setMetric] = useState<Metric>('load')
  const [zone, setZone] = useState<number | null>(null)
  const nodes = useMemo(() => substations.map((s, i) => {
    const a = (i / substations.length) * Math.PI * 2 - Math.PI / 2
    return { ...s, x: 50 + 38 * Math.cos(a), y: 50 + 38 * Math.sin(a), load: Math.round(40 + seedRand(i, 1) * 55) }
  }), [substations])
  const zones = ZONES.map((z, i) => ({ name: z, load: Math.round(35 + seedRand(i, 2) * 60), growth: Math.round(3 + seedRand(i, 3) * 28), risk: Math.round(10 + seedRand(i, 4) * 85), projects: projects.filter((_, pi) => (pi + i) % 5 === 0) }))
  const val = (z: (typeof zones)[number]) => z[metric]
  const tone = (v: number) => (v >= 75 ? 'var(--color-danger)' : v >= 50 ? 'var(--color-warning)' : 'var(--accent-500)')

  return (
    <div className="page">
      <PageHeader title="Network & heatmaps" subtitle="11kV network model and project-connected heatmaps" back={false} badge={<span className="badge badge-warning">Sample data</span>} />
      <p className="faint" style={{ marginBottom: 14, fontSize: 13 }}>Illustrative layout and values. Live data arrives once the GIS and TMS integrations are connected.</p>
      <div className="card" style={{ overflow: 'hidden' }}>
        <Tabs tabs={['Network model', 'AI heatmap']} active={tab} onChange={setTab} />
        {tab === 'Network model' ? (
          <div className="card-body">
            <div className={styles.model}>
              <svg viewBox="0 0 100 100" className={styles.svg} role="img" aria-label="11kV network model">
                {nodes.map((n) => <line key={`l${n.id}`} x1="50" y1="50" x2={n.x} y2={n.y} className={styles.link} />)}
                {nodes.map((n, i) => i > 0 && <line key={`r${n.id}`} x1={nodes[i - 1].x} y1={nodes[i - 1].y} x2={n.x} y2={n.y} className={styles.ring} />)}
                <circle cx="50" cy="50" r="7" className={styles.grid} /><text x="50" y="51.2" textAnchor="middle" className={styles.gridText}>132kV</text>
                {nodes.map((n) => (
                  <g key={n.id}><circle cx={n.x} cy={n.y} r="4.2" fill={tone(n.load)} className={styles.node} /><text x={n.x} y={n.y + 8.5} textAnchor="middle" className={styles.label}>{n.name.length > 12 ? n.name.slice(0, 11) + '…' : n.name}</text></g>
                ))}
              </svg>
              <div>
                <h4 style={{ marginBottom: 10 }}>Substations</h4>
                <ul className={styles.list}>
                  {nodes.map((n) => <li key={n.id}><i style={{ background: tone(n.load) }} /><span className="grow">{n.name}</span><span className="num muted">{n.load}%</span></li>)}
                </ul>
                <div className="row wrap" style={{ gap: 12, marginTop: 14, fontSize: 12 }}><span className="row"><i className={styles.dot} style={{ background: 'var(--accent-500)' }} />&lt; 50%</span><span className="row"><i className={styles.dot} style={{ background: 'var(--color-warning)' }} />50–75%</span><span className="row"><i className={styles.dot} style={{ background: 'var(--color-danger)' }} />&gt; 75%</span></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-body">
            <div className="row wrap" style={{ gap: 8, marginBottom: 16 }}>
              <Flame size={16} style={{ color: 'var(--accent-600)' }} />
              {(Object.keys(METRICS) as Metric[]).map((m) => <button key={m} className="chip" aria-pressed={m === metric} style={m === metric ? { background: 'var(--accent-50)', color: 'var(--accent-600)', borderColor: 'var(--accent-100)' } : undefined} onClick={() => setMetric(m)}>{METRICS[m]}</button>)}
            </div>
            <div className={styles.heat}>
              {zones.map((z, i) => (
                <button key={z.name} className={`${styles.cell} ${zone === i ? styles.sel : ''}`} aria-pressed={zone === i} onClick={() => setZone(zone === i ? null : i)}
                  style={{ ['--c' as string]: tone(val(z)), ['--a' as string]: `${12 + val(z) * 0.5}%` }}>
                  <span>{z.name}</span><b className="num">{val(z)}{metric === 'growth' ? '%' : metric === 'load' ? '%' : ''}</b>
                </button>
              ))}
            </div>
            {zone !== null && (
              <section className="card pad" style={{ marginTop: 16, boxShadow: 'none' }}>
                <div className="row between wrap"><h4 className="row"><Network size={16} />{zones[zone].name} — connected projects</h4><span className="faint" style={{ fontSize: 12 }}>Load {zones[zone].load}% · growth {zones[zone].growth}% · risk {zones[zone].risk}</span></div>
                <ul style={{ marginTop: 10, display: 'grid', gap: 8 }}>{zones[zone].projects.length ? zones[zone].projects.map((p) => <li key={p.id} className="row between"><span><b>{p.name}</b> <span className="faint num">{p.maalemRef}</span></span><StatusChip status={p.display ? 'visible' : 'hidden'} /></li>) : <li className="muted">No projects connected to this zone.</li>}</ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
