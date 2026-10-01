import { ArrowRight, Moon, Sparkles, Sun, Zap, Network, Gauge } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppButton from '../../components/common/AppButton'
import IconButton from '../../components/common/IconButton'
import { useAuth } from '../../context/AuthContext'
import { markEntered } from '../../data/session'
import { useTheme } from '../../context/ThemeContext'
import styles from './LoginPage.module.css'

const features = [
  { icon: Network, title: 'One connected platform', text: 'GIS, TMS, SAP and Rekaaz data unified in a single view.' },
  { icon: Sparkles, title: 'AI-assisted reviews', text: 'Faster, standards-compliant reviews with an engineer in the loop.' },
  { icon: Gauge, title: 'Live KPI tracking', text: 'Workload, submissions and KPI compliance at a glance.' },
]

export default function LoginPage() {
  const { user, loading, error } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'

  const start = () => {
    markEntered()
    navigate(from, { replace: true })
  }

  return (
    <div className={styles.screen}>
      <IconButton className={styles.themeBtn} onClick={toggle} aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</IconButton>
      <section className={styles.hero}>
        <i className={`${styles.blob} ${styles.b1}`} /><i className={`${styles.blob} ${styles.b2}`} /><i className={`${styles.blob} ${styles.b3}`} />
        <div className={styles.brand}><span className={styles.logo}><Zap size={22} /></span><span><b>ASAS</b><small>Dubai Electricity &amp; Water Authority</small></span></div>
        <div className={styles.pitch}>
          <h1>AI-powered platform for major projects</h1>
          <p>Search, review and manage 11kV major project data — projects, plots, substations, developers and consultants — in one place.</p>
          <ul className={styles.features}>
            {features.map(({ icon: Icon, title, text }) => <li key={title}><span className={styles.ico}><Icon size={18} /></span><span><b>{title}</b><span>{text}</span></span></li>)}
          </ul>
        </div>
        <div className={styles.systems}><span style={{ opacity: 0.75, fontWeight: 400 }}>Integrated systems</span>{['GIS', 'TMS', 'SAP', 'Rekaaz'].map((s) => <span key={s}><i className="pulse-dot" />{s}</span>)}</div>
      </section>

      <section className={styles.formSide}>
        <div className={`card ${styles.card}`}>
          <h2>{user ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome'}</h2>
          <p className={styles.sub}>Welcome to the ASAS Search Engine Portal. Search and manage major project data, track submissions and KPIs, and generate reports — all in one place.</p>
          {error && <p className="error-text" role="alert" style={{ marginBottom: 16 }}>{error}</p>}
          <AppButton variant="contained" size="large" fullWidth loading={loading} disabled={!user} onClick={start} endIcon={!loading ? <ArrowRight size={18} /> : undefined} autoFocus>Get Started</AppButton>
        </div>
      </section>
    </div>
  )
}
