import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, RotateCcw, Sparkles, Bell, LogOut, Menu, Moon, Search, Settings, Sun, UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { DEWA_LOGO_WHITE } from '../../assets/logos'
import { NAV_GROUPS } from '../../constants/navigation'
import { useAuth } from '../../context/AuthContext'
import { exceeding } from '../../data/dashboard'
import { clearStored, refreshStored, snapshot } from '../../data/store'
import { markLeft } from '../../data/session'
import { useTheme } from '../../context/ThemeContext'
import AiChat, { openChat } from '../ai/AiChat'
import ConfirmationDialog from '../common/ConfirmationDialog'
import IconButton from '../common/IconButton'
import { useOutsideClose } from '../ui'
import styles from './AppLayout.module.css'


export default function AppLayout() {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [hover, setHover] = useState(false)
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 961px)').matches)
  const [open, setOpen] = useState(false)
  const [bell, setBell] = useState(false)
  const notifications = useMemo(() => {
    const pr = snapshot.projects(), pl = snapshot.plots()
    return [
      { id: 1, text: `${exceeding.length} submissions are exceeding KPI`, time: '10 min ago' },
      { id: 2, text: `New project added: ${pr[0]?.name ?? 'Project'}`, time: '1 h ago' },
      { id: 3, text: `Plot upload completed for ${pl[0]?.projectName ?? 'a project'}`, time: 'Yesterday' },
    ]
  }, [])
  const [menu, setMenu] = useState(false)
  const [q, setQ] = useState('')
  const [reset, setReset] = useState(false)
  const [spin, setSpin] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => {
    if (spin) return
    setSpin(true)
    refreshStored()
    setRefreshKey((k) => k + 1)
    setTimeout(() => setSpin(false), 700)
  }
  const bellRef = useOutsideClose(() => setBell(false))
  const menuRef = useOutsideClose(() => setMenu(false))
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 961px)')
    const h = () => setDesktop(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  // Desktop: icon rail by default, expands over the page while hovered or keyboard-focused. Mobile: slide-in drawer.
  const collapsed = desktop && !hover
  const isActive = (p?: string) => !!p && (p === '/' ? pathname === '/' : pathname.startsWith(p))
  const logOut = () => { markLeft(); navigate('/login') }

  return (
    <div className={styles.shell}>
      <div className={`${styles.rail} ${collapsed ? '' : styles.railOpen}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHover(false) }}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${open ? styles.open : ''}`} aria-label="Primary">
        <div className={styles.brand}>
          <img className={styles.brandLogo} src={DEWA_LOGO_WHITE} alt="Dubai Electricity & Water Authority" />
        </div>
        <nav className={styles.nav}>
          {NAV_GROUPS.map((g) => (
            <div key={g.id} className={styles.group}>
              <div className={styles.groupTitle}>{g.label}</div>
              {g.items.map(({ id, label, icon: Icon, path, action }) => path ? (
                <NavLink key={id} to={path} end={path === '/'} title={label} className={`${styles.item} ${isActive(path) ? styles.active : ''}`} aria-current={isActive(path) ? 'page' : undefined}>
                  <Icon size={19} /><span className={styles.label}>{label}</span>
                </NavLink>
              ) : (
                <button key={id} title={label} className={styles.item} style={{ width: '100%', textAlign: 'left' }} onClick={() => { if (action === 'chat') { openChat(); setOpen(false) } }}>
                  <Icon size={19} /><span className={styles.label}>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className={styles.userCard}>
          <span className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{user?.initials}</span>
          <span className={styles.userMeta}><b>{user?.name}</b><small>{user?.role}</small></span>
          <IconButton small className={styles.signout} onClick={logOut} aria-label="Log out" title="Log out"><LogOut size={16} /></IconButton>
        </div>
      </aside>
      </div>
      {open && <div className={styles.scrim} onClick={() => setOpen(false)} />}

      <div className={styles.main}>
        <header className={styles.header}>
          <IconButton className={styles.menuBtn} onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></IconButton>
          <div className={styles.search}>
            <Search size={15} />
            <input className="input" placeholder="Search projects, plots, developers…" aria-label="Global search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) { navigate('/projects'); setQ('') } }} />
          </div>
          <span className={styles.spacer} />
          <IconButton onClick={refresh} aria-label="Refresh" title="Refresh"><RefreshCw size={18} className={spin ? styles.spinning : ''} /></IconButton>
          <IconButton onClick={() => openChat()} aria-label="AI assistant" title="AI assistant"><Sparkles size={18} /></IconButton>
          <IconButton onClick={toggle} aria-label="Toggle theme" title={dark ? 'Light mode' : 'Dark mode'}>{dark ? <Sun size={18} /> : <Moon size={18} />}</IconButton>
          <div className="menu" ref={bellRef}>
            <IconButton onClick={() => setBell(!bell)} aria-label="Notifications" aria-expanded={bell}><Bell size={18} /><i className={styles.dot} /></IconButton>
            {bell && (
              <div className={`menu-pop ${styles.notif}`}>
                <b>Notifications</b>
                {notifications.map((n) => <button key={n.id} className={styles.notifItem} onClick={() => setBell(false)}>{n.text}<small>{n.time}</small></button>)}
              </div>
            )}
          </div>
          <div className="menu" ref={menuRef}>
            <button className={styles.userBtn} onClick={() => setMenu(!menu)} aria-label="Account menu" aria-expanded={menu}>
              <span className="avatar">{user?.initials}</span>
            </button>
            {menu && (
              <div className="menu-pop" role="menu">
                <div style={{ padding: '8px 12px' }}><b style={{ fontSize: 13 }}>{user?.name}</b><div className="muted" style={{ fontSize: 12 }}>{user?.email}</div></div>
                <div className="menu-sep" />
                <button onClick={() => setMenu(false)}><UserRound size={16} /> Profile</button>
                <button onClick={() => setMenu(false)}><Settings size={16} /> Settings</button>
                <button onClick={() => { setMenu(false); setReset(true) }}><RotateCcw size={16} /> Reset local data</button>
                <div className="menu-sep" />
                <button className="danger" onClick={logOut}><LogOut size={16} /> Log out</button>
              </div>
            )}
          </div>
        </header>
        <main className={styles.content} id="main"><Outlet key={refreshKey} /></main>
        <AiChat />
        <ConfirmationDialog open={reset} title="Reset local data" message="This removes everything you added or changed in this browser and restores the sample data." confirmLabel="Reset" destructive onConfirm={() => { clearStored(); window.location.reload() }} onClose={() => setReset(false)} />
        <footer className={styles.footer}><span>© {new Date().getFullYear()} Dubai Electricity &amp; Water Authority (PJSC)</span><span>ASAS Search Engine Portal</span></footer>
      </div>
    </div>
  )
}
