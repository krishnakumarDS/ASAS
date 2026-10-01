import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from './common/Breadcrumb'
import IconButton from './common/IconButton'

interface Props { title: string; subtitle?: string; actions?: ReactNode; back?: boolean; badge?: ReactNode }

export default function PageHeader({ title, subtitle, actions, back = true, badge }: Props) {
  const navigate = useNavigate()
  return (
    <header style={{ marginBottom: 20 }} className="reveal">
      <Breadcrumb />
      <div className="row between wrap" style={{ gap: 16 }}>
        <div className="row" style={{ gap: 12, minWidth: 0 }}>
          {back && <IconButton onClick={() => navigate(-1)} aria-label="Back" style={{ border: '1px solid var(--border-light)', background: 'var(--bg-secondary)' }}><ArrowLeft size={18} /></IconButton>}
          <div style={{ minWidth: 0 }}>
            <div className="row wrap" style={{ gap: 10 }}><h1 style={{ fontSize: 'clamp(22px, 2.4vw, 28px)' }}>{title}</h1>{badge}</div>
            {subtitle && <p className="muted" style={{ marginTop: 2 }}>{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="row wrap" style={{ gap: 8 }}>{actions}</div>}
      </div>
    </header>
  )
}
