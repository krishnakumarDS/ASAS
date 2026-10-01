import { useEffect, useState } from 'react'
import { Bell, ChevronsLeft, ChevronsRight, LogOut, Menu, Moon, Search, Settings, Sun, UserRound, Zap } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { NAV_GROUPS } from '../../constants/navigation'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import IconButton from '../common/IconButton'
import { useOutsideClose } from '../ui'
import styles from './AppLayout.module.css'

const notifications = [
  { id: 1, text: '5 submissions are exceeding KPI', time: '10 min ago' },
  { id: 2, text: 'New project added: Al Kifaf Development', time: '1 h ago' },
  { id: 3, text: 'Plot upload completed for Port Views', time: 'Yesterday' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState(false)
  const [bell, setBell] = useState(false)
  const [menu, setMenu] = useState(false)
  const [q, setQ] = useState('')
  const bellRef = useOutsideClose(() => setBell(false))
  const menuRef = useOutsideClose(() => setMenu(false))
  useEffect(() => setOpen(false), [pathname])
  const isActive = (p?: string) => !!p && (p === '/' ? pathname === '/' : pathname.startsWith(p))
  const signOut = () => { logout(); navigate('/login') }

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${open ? styles.open : ''}`} aria-label="Primary">
        <div className={styles.brand}>
          <span className={styles.logo}><Zap size={17} /></span>
          <span className={styles.brandText}><b>ASAS</b><small>Major projects platform</small></span>
        </div>
        <nav className={styles.nav}>
          {NAV_GROUPS.map((g) => (
            <div key={g.id} className={styles.group}>
              <div className={styles.groupTitle}>{g.label}</div>
              {g.items.map(({ id, label, icon: Icon, path, soon }) => path ? (
                <NavLink key={id} to={path} end={path === '/'} title={label} className={`${styles.item} ${isActive(path) ? styles.active : ''}`} aria-current={isActive(path) ? 'page' : undefined}>
                  <Icon size={19} /><span className={styles.label}>{label}</span>
                </NavLink>
              ) : (
                <span key={id} className={`${styles.item} ${styles.disabled}`} title={`${label} (coming soon)`} aria-disabled>
                  <Icon size={19} /><span className={styles.label}>{label}</span>{soon && <em className={styles.soon}>Soon</em>}
                </span>
              ))}
            </div>
          ))}
        </nav>
        <div className={styles.userCard}>
          <span className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{user?.initials}</span>
          <span className={styles.userMeta}><b>{user?.name}</b><small>{user?.role}</small></span>
          <IconButton small className={styles.signout} onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={16} /></IconButton>
        </div>
      </aside>
      {open && <div className={styles.scrim} onClick={() => setOpen(false)} />}

      <div className={styles.main}>
        <header className={styles.header}>
          <IconButton className={styles.menuBtn} onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></IconButton>
          <IconButton className={styles.collapseBtn} onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar" title="Toggle sidebar">{collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}</IconButton>
          <div className={styles.search}>
            <Search size={15} />
            <input className="input" placeholder="Search projects, plots, developers…" aria-label="Global search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) { navigate('/projects'); setQ('') } }} />
          </div>
          <span className={styles.spacer} />
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
                <div className="menu-sep" />
                <button className="danger" onClick={signOut}><LogOut size={16} /> Sign out</button>
              </div>
            )}
          </div>
        </header>
        <main className={styles.content} id="main"><Outlet /></main>
        <footer className={styles.footer}><span>© {new Date().getFullYear()} Dubai Electricity &amp; Water Authority (PJSC)</span><span>ASAS Search Engine Portal</span></footer>
      </div>
    </div>
  )
}
