import { ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const names: Record<string, string> = { projects: 'Projects', substations: 'Substations', plots: 'Plots', consultants: 'Consultants', developers: 'Developers', reports: 'Reports', new: 'New', files: 'Files', limits: 'Standard limits', single: 'Single' }

export default function Breadcrumb() {
  const parts = useLocation().pathname.split('/').filter(Boolean)
  if (!parts.length) return null
  const crumbs = parts.map((p, i) => ({ label: names[p] ?? (/^\d+$/.test(p) ? 'Details' : decodeURIComponent(p)), to: '/' + parts.slice(0, i + 1).join('/') }))
  return (
    <nav aria-label="Breadcrumb" className="row" style={{ gap: 4, fontSize: 12, marginBottom: 6, flexWrap: 'wrap' }}>
      <Link to="/" className="muted">Dashboard</Link>
      {crumbs.map((c, i) => (
        <span key={c.to} className="row" style={{ gap: 4 }}>
          <ChevronRight size={12} className="faint" />
          {i === crumbs.length - 1 ? <span style={{ fontWeight: 600 }} aria-current="page">{c.label}</span> : <Link to={c.to} className="muted">{c.label}</Link>}
        </span>
      ))}
    </nav>
  )
}
