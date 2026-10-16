import { useEffect, useState } from 'react'
import { ArrowRight, Moon, ShieldCheck, Sun, Zap } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppButton from '../../components/common/AppButton'
import IconButton from '../../components/common/IconButton'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { markEntered } from '../../data/session'
import { DEWA_LOGO } from '../../assets/logos'
import styles from './LoginPage.module.css'

/** The six systems ASAS pulls together (from the "Integrated Systems" slide), placed on a hexagonal orbit. */
const SYSTEMS = ['GIS', 'TMS', 'SAP', 'Rekaaz', 'Sheets', 'Reports']
const node = (i: number) => {
  const a = (-90 + i * 60) * (Math.PI / 180)
  return { x: 50 + 32 * Math.cos(a), y: 50 + 32 * Math.sin(a) }
}
const STATS = [
  { label: 'Active projects', value: 256, suffix: '', pos: styles.s1 },
  { label: 'KPI compliance', value: 92, suffix: '%', pos: styles.s2 },
  { label: 'Systems connected', value: 6, suffix: '', pos: styles.s3 },
]

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Counts up to `to` on mount (instant when the user prefers reduced motion). */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [n, setN] = useState(reducedMotion() ? to : 0)
  useEffect(() => {
    if (reducedMotion()) return
    const t0 = performance.now(), dur = 1400
    let raf = 0
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / dur); setN(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{n}{suffix}</>
}

export default function LoginPage() {
  const { user, loading, error } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const start = () => { markEntered(); navigate(from, { replace: true }) }
  const first = user?.name.split(' ')[0]

  return (
    <div className={styles.screen}>
      <i className={`${styles.blob} ${styles.b1}`} /><i className={`${styles.blob} ${styles.b2}`} /><i className={`${styles.blob} ${styles.b3}`} />
      <div className={styles.grid} aria-hidden />

      <header className={styles.top}>
        <span className={styles.brand}><img className={styles.brandLogo} src={DEWA_LOGO} alt="Dubai Electricity & Water Authority" /></span>
        <IconButton onClick={toggle} aria-label="Toggle theme" className={styles.theme}>{dark ? <Sun size={18} /> : <Moon size={18} />}</IconButton>
      </header>

      <main className={styles.stage}>
        <section className={styles.copy}>
          <span className={`eyebrow ${styles.kicker} reveal-item`} style={{ ['--index' as string]: 0 }}><i className="pulse-dot" /> Search Engine Portal</span>
          <p className={`${styles.greet} reveal-item`} style={{ ['--index' as string]: 1 }}>
            <span className={styles.greetAvatar}>{user?.initials ?? <Zap size={14} />}</span>
            <span>Welcome{first ? <>, <b>{first}</b></> : ''}</span>
          </p>
          <h1 className={`${styles.title} reveal-item`} style={{ ['--index' as string]: 1 }}>
            Every major project,<br /><em>one intelligent view.</em>
          </h1>
          <p className={`${styles.lede} reveal-item`} style={{ ['--index' as string]: 2 }}>
            ASAS brings projects, plots, substations, developers and consultants together with live KPIs — so engineers decide faster, with the full picture.
          </p>
          <div className={`${styles.cta} reveal-item`} style={{ ['--index' as string]: 3 }}>
            <AppButton variant="contained" size="large" loading={loading} disabled={!user} onClick={start} endIcon={!loading ? <ArrowRight size={18} /> : undefined} autoFocus>Get Started</AppButton>
            <span className={styles.secure}><ShieldCheck size={15} /> Signed in securely with your DEWA account</span>
          </div>
          {error && <p className="error-text" role="alert" style={{ marginTop: 14 }}>{error}</p>}
          <ul className={`${styles.status} reveal-item`} style={{ ['--index' as string]: 4 }} aria-label="Integrated systems">
            {SYSTEMS.slice(0, 4).map((s) => <li key={s}><i className="pulse-dot" />{s}</li>)}
          </ul>
        </section>

        <section className={`${styles.diagram} reveal-item`} style={{ ['--index' as string]: 2 }} aria-label="ASAS integrated systems">
          <div className={styles.panel}>
            <i className={styles.ring} />
            <svg className={styles.lines} viewBox="0 0 100 100" aria-hidden>
              {SYSTEMS.map((_, i) => { const n = node(i); return <line key={i} x1="50" y1="50" x2={n.x} y2={n.y} /> })}
              {!reducedMotion() && SYSTEMS.map((_, i) => {
                const n = node(i), d = `${i * 0.6}s`
                return (
                  <g key={`p${i}`}>
                    <circle r="1.25" className={styles.packet}>
                      <animate attributeName="cx" values={`${n.x};50;${n.x}`} keyTimes="0;0.5;1" dur="3.6s" begin={d} repeatCount="indefinite" />
                      <animate attributeName="cy" values={`${n.y};50;${n.y}`} keyTimes="0;0.5;1" dur="3.6s" begin={d} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="3.6s" begin={d} repeatCount="indefinite" />
                    </circle>
                  </g>
                )
              })}
            </svg>
            {SYSTEMS.map((s, i) => {
              const n = node(i)
              return (
                <span key={s} className={styles.hex} style={{ left: `${n.x}%`, top: `${n.y}%`, ['--d' as string]: `${i * -2.2}s`, ['--lit' as string]: `${i * 0.9}s` }}>
                  <span className={styles.hexIn}>{s}</span>
                </span>
              )
            })}
            <i className={styles.ripple} /><i className={`${styles.ripple} ${styles.ripple2}`} />
            <span className={styles.core}><span className={styles.coreIn}><Zap size={20} />ASAS</span></span>
          </div>
          {STATS.map((s) => (
            <div key={s.label} className={`${styles.chip} ${s.pos}`}>
              <span className="eyebrow">{s.label}</span>
              <b className="num"><CountUp to={s.value} suffix={s.suffix} /></b>
            </div>
          ))}
        </section>
      </main>

      <footer className={styles.foot}>© {new Date().getFullYear()} Dubai Electricity &amp; Water Authority</footer>
    </div>
  )
}
