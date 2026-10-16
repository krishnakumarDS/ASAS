import { useState } from 'react'
import { Database, FileText, Globe2, Layers, RefreshCw, Satellite, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import PageHeader from '../components/PageHeader'

type Status = 'connected' | 'attention'
interface Sys { key: string; name: string; desc: string; icon: LucideIcon; status: Status; note?: string }
const SYSTEMS: Sys[] = [
  { key: 'gis', name: 'GIS', desc: 'Plot boundaries, network layers and map views.', icon: Globe2, status: 'attention', note: 'Layer sync needs a fix' },
  { key: 'tms', name: 'TMS', desc: 'Transaction and submission tracking.', icon: Workflow, status: 'connected' },
  { key: 'sap', name: 'SAP', desc: 'Project, vendor and cost records.', icon: Database, status: 'connected' },
  { key: 'rekaaz', name: 'ReKaaz', desc: 'Document and records repository.', icon: Layers, status: 'connected' },
  { key: 'reports', name: 'Reports', desc: 'Report and presentation generation.', icon: FileText, status: 'connected' },
]

export default function IntegrationsPage() {
  const [syncing, setSyncing] = useState<string | null>(null)
  const [last, setLast] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Record<string, Status>>(Object.fromEntries(SYSTEMS.map((s) => [s.key, s.status])))
  const sync = (k: string) => { setSyncing(k); setTimeout(() => { setSyncing(null); setLast((l) => ({ ...l, [k]: new Date().toLocaleTimeString() })); if (k === 'gis') setStatus((s) => ({ ...s, gis: 'connected' })) }, 1200) }
  return (
    <div className="page">
      <PageHeader title="Integrations" subtitle="The systems ASAS connects together" back={false} badge={<span className="badge badge-warning">Sample status</span>} />
      <p className="faint" style={{ marginBottom: 14, fontSize: 13 }}>Status and sync times shown here are illustrative until each integration is built and connected.</p>
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {SYSTEMS.map(({ key, name, desc, icon: Icon, note }, i) => {
          const ok = status[key] === 'connected'
          return (
            <section key={key} className="card lift pad reveal-item" style={{ ['--index' as string]: i }}>
              <div className="row between"><span className="avatar" style={{ borderRadius: 'var(--radius-md)' }}><Icon size={20} /></span><span className={`badge ${ok ? 'badge-success' : 'badge-warning'}`}>{ok ? 'Connected' : 'Needs attention'}</span></div>
              <h5 style={{ marginTop: 14 }}>{name}</h5>
              <p className="muted" style={{ fontSize: 13, margin: '4px 0 12px' }}>{desc}</p>
              {!ok && note && <p className="error-text" style={{ marginBottom: 10 }}>{note}</p>}
              <div className="row between"><span className="faint" style={{ fontSize: 12 }}>{last[key] ? `Synced ${last[key]}` : 'Not synced this session'}</span>
                <AppButton variant="outlined" size="small" loading={syncing === key} startIcon={<RefreshCw size={14} />} onClick={() => sync(key)}>{ok ? 'Sync now' : 'Fix & sync'}</AppButton></div>
            </section>
          )
        })}
      </div>
      <p className="faint" style={{ marginTop: 14, fontSize: 12 }}><Satellite size={12} style={{ verticalAlign: -1 }} /> Each integration will be wired to its source system as it is delivered.</p>
    </div>
  )
}
