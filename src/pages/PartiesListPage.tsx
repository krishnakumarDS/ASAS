import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownUp, Plus } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/PageHeader'
import { AiSearchBar, matchQuery } from '../components/ui'
import { consultants, developers, fmtDate } from '../data/mock'
import { consultantByProject, projects } from '../data/projects'

export type Kind = 'consultant' | 'developer'
export const kindMeta = {
  consultant: { title: 'Consultants', one: 'Consultant', path: '/consultants', data: consultants, sub: 'Consultant directory and linked projects' },
  developer: { title: 'Developers', one: 'Developer', path: '/developers', data: developers, sub: 'Developer profiles and their portfolios' },
}
const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
type SortKey = 'name' | 'projects' | 'created'

export default function PartiesListPage({ kind }: { kind: Kind }) {
  const m = kindMeta[kind]
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortKey>('name')
  const [asc, setAsc] = useState(true)
  const count = (name: string) => projects.filter((p) => (kind === 'consultant' ? consultantByProject[p.id] === name : p.developer.split(' (')[0] === name.split(' (')[0])).length
  const rows = useMemo(() => {
    const f = m.data.filter((r) => matchQuery(`${r.name} ${r.createdBy}`, q))
    const val = (r: (typeof f)[number]) => (sort === 'name' ? r.name : sort === 'created' ? r.createdOn : count(r.name))
    return [...f].sort((a, b) => { const x = val(a), y = val(b); const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)); return asc ? c : -c })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, q, sort, asc])

  return (
    <div className="page">
      <PageHeader title={m.title} subtitle={m.sub} back={false} actions={<AppButton variant="contained" startIcon={<Plus size={17} />} onClick={() => navigate(`${m.path}/new`)}>Add {m.one.toLowerCase()}</AppButton>} />
      <AiSearchBar value={q} onChange={setQ} placeholder={`Ask in plain words — e.g. “${kind === 'developer' ? 'developers with Dubai in the name' : 'consultants added by Mariam'}”`} suggestions={kind === 'developer' ? ['Dubai', 'Meraas', 'Al Wasl'] : ['AECOM', 'Engineering', 'Mariam']} resultText={`${rows.length} of ${m.data.length} ${m.title.toLowerCase()}`} />
      <div className="row wrap" style={{ gap: 8, marginBottom: 14 }}>
        <span className="eyebrow">Sort by</span>
        {([['name', 'Name'], ['projects', 'Linked projects'], ['created', 'Date added']] as [SortKey, string][]).map(([k, l]) => (
          <button key={k} className="chip" aria-pressed={sort === k} style={sort === k ? { background: 'var(--accent-50)', color: 'var(--accent-600)', borderColor: 'var(--accent-100)' } : undefined} onClick={() => (sort === k ? setAsc(!asc) : (setSort(k), setAsc(true)))}>{l}{sort === k && <ArrowDownUp size={12} style={{ transform: asc ? undefined : 'scaleY(-1)' }} />}</button>
        ))}
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
