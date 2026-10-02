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
  { label: 'Active projects', value: '256', pos: styles.s1 },
  { label: 'KPI compliance', value: '92%', pos: styles.s2 },
  { label: 'Systems connected', value: '6', pos: styles.s3 },
]

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
            ASAS brings projects, plots, substations, developers and consultants together with live KPIs and AI-assisted reviews — so engineers decide faster, with the full picture.
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
            </svg>
            {SYSTEMS.map((s, i) => {
              const n = node(i)
              return (
                <span key={s} className={styles.hex} style={{ left: `${n.x}%`, top: `${n.y}%`, ['--d' as string]: `${i * -2.2}s` }}>
                  <span className={styles.hexIn}>{s}</span>
                </span>
              )
            })}
            <span className={styles.core}><span className={styles.coreIn}><Zap size={20} />ASAS</span></span>
          </div>
          {STATS.map((s) => (
            <div key={s.label} className={`${styles.chip} ${s.pos}`}>
              <span className="eyebrow">{s.label}</span>
              <b className="num">{s.value}</b>
            </div>
          ))}
        </section>
      </main>

      <footer className={styles.foot}>© {new Date().getFullYear()} Dubai Electricity &amp; Water Authority (PJSC)</footer>
    </div>
  )
}
