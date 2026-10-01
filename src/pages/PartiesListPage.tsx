import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/PageHeader'
import { consultants, developers, fmtDate } from '../data/mock'
import { consultantByProject, projects } from '../data/projects'

export type Kind = 'consultant' | 'developer'
export const kindMeta = {
  consultant: { title: 'Consultants', one: 'Consultant', path: '/consultants', data: consultants, sub: 'Consultant directory and linked projects' },
  developer: { title: 'Developers', one: 'Developer', path: '/developers', data: developers, sub: 'Developer profiles and their portfolios' },
}
const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

export default function PartiesListPage({ kind }: { kind: Kind }) {
  const m = kindMeta[kind]
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const rows = useMemo(() => m.data.filter((r) => r.name.toLowerCase().includes(q.toLowerCase())), [m, q])
  const count = (name: string) => projects.filter((p) => (kind === 'consultant' ? consultantByProject[p.id] === name : p.developer.split(' (')[0] === name.split(' (')[0])).length

  return (
    <div className="page">
      <PageHeader title={m.title} subtitle={m.sub} back={false} actions={<AppButton variant="contained" startIcon={<Plus size={17} />} onClick={() => navigate(`${m.path}/new`)}>Add {m.one.toLowerCase()}</AppButton>} />
      <div className="card toolbar reveal-item">
        <div className="row" style={{ gap: 12 }}>
          <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 460 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-tertiary)' }} />
            <input className="input" style={{ paddingLeft: 36 }} placeholder={`Search ${m.title.toLowerCase()}…`} aria-label={`Search ${m.title}`} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <span className="faint">{rows.length} {m.title.toLowerCase()}</span>
        </div>
      </div>
      {rows.length === 0 ? <div className="card"><EmptyState compact title={`No ${m.title.toLowerCase()} found`} /></div> : (
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {rows.map((r, i) => (
            <button key={r.id} className="card lift pad reveal-item party" style={{ ['--index' as string]: i % 12 }} onClick={() => navigate(`${m.path}/${r.id}`)}>
              <div className="row" style={{ gap: 14 }}>
                <span className="avatar lg" style={{ width: 52, height: 52, fontSize: 17 }}>{initials(r.name)}</span>
                <div style={{ minWidth: 0, textAlign: 'left' }}>
                  <div className="cell-title" style={{ fontSize: 15 }}>{r.name}</div>
                  <div className="cell-sub">{count(r.name)} linked project{count(r.name) === 1 ? '' : 's'}</div>
                </div>
              </div>
              <div className="row between" style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-light)', fontSize: 12 }}>
                <span className="muted">By {r.createdBy.split(' ').slice(0, 2).join(' ')}</span>
                <span className="faint">{fmtDate(r.createdOn)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
