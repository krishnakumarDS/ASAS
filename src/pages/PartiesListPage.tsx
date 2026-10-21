import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownUp, Ban, CheckCircle2, Download, Plus } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import EmptyState from '../components/common/EmptyState'
import IconButton from '../components/common/IconButton'
import PageHeader from '../components/PageHeader'
import { SearchBar, Tabs, matchQuery, useToast } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { userMessage } from '../data/api'
import { syncEntity, useSyncStatus } from '../data/sync'
import { setActiveRecord } from '../data/write'
import { fmtDate } from '../data/mock'
import type { Party } from '../data/mock'
import { useConsultants, useDevelopers, useProjects } from '../data/store'

export type Kind = 'consultant' | 'developer'
export const kindMeta = {
  consultant: { title: 'Consultants', one: 'Consultant', path: '/consultants', sub: 'Consultant directory and linked projects' },
  developer: { title: 'Developers', one: 'Developer', path: '/developers', sub: 'Developer profiles and their portfolios' },
}
const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
type SortKey = 'name' | 'projects' | 'created'

export default function PartiesListPage({ kind }: { kind: Kind }) {
  const m = kindMeta[kind]
  const navigate = useNavigate()
  const { user } = useAuth()
  const [toast, say] = useToast()
  const live = useSyncStatus().state === 'live'
  const [busyId, setBusyId] = useState<string | null>(null)
  const [devs] = useDevelopers()
  const [cons] = useConsultants()
  const [projects] = useProjects()
  const data: Party[] = kind === 'developer' ? devs : cons
  const [q, setQ] = useState('')
  const [view, setView] = useState<'active' | 'inactive'>('active') // deleted (inactive) records are listed separately
  const nActive = data.filter((r) => r.showInSO).length, nInactive = data.length - nActive
  const [sort, setSort] = useState<SortKey>('name')
  const [asc, setAsc] = useState(true)
  const count = (name: string) => projects.filter((p) => (kind === 'consultant' ? p.consultant === name : p.developer.split(' (')[0] === name.split(' (')[0])).length
  const rows = useMemo(() => {
    const f = data.filter((r) => r.showInSO === (view === 'active') && matchQuery(`${r.name} ${r.createdBy}`, q))
    const val = (r: (typeof f)[number]) => (sort === 'name' ? r.name : sort === 'created' ? r.createdOn : count(r.name))
    return [...f].sort((a, b) => { const x = val(a), y = val(b); const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)); return asc ? c : -c })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, projects, q, sort, asc, view])

  // Enable / disable writes to SQL (developer.setActive / consultant.setActive: IsActive); the record is hidden, never removed, so it can be enabled again.
  const toggle = async (r: Party) => {
    if (!live) { say('The server can’t be reached right now: nothing was changed. Please try again.'); return }
    setBusyId(r.id)
    try {
      await setActiveRecord(kind, r.id, !r.showInSO, user?.name)
      await syncEntity(kind === 'developer' ? 'developers' : 'consultants')
      say(`${m.one} ${r.showInSO ? 'disabled' : 'enabled'}`)
    } catch (e) { say(userMessage(e, `Could not ${r.showInSO ? 'disable' : 'enable'} the ${m.one.toLowerCase()}`)) }
    setBusyId(null)
  }

  return (
    <div className="page">
      <PageHeader title={m.title} subtitle={m.sub} back={false} actions={<>
        <AppButton variant="outlined" startIcon={<Download size={16} />} onClick={() => navigate(`/import?table=${kind}`)}>Import</AppButton>
        <AppButton variant="contained" startIcon={<Plus size={17} />} onClick={() => navigate(`${m.path}/new`)}>Add {m.one.toLowerCase()}</AppButton>
      </>} />
      <SearchBar value={q} onChange={setQ} placeholder={`Search ${m.title.toLowerCase()} by name`} resultText={`${rows.length} of ${view === 'active' ? nActive : nInactive} ${view} ${m.title.toLowerCase()}`} />
      <div className="card" style={{ overflow: 'hidden', marginBottom: 14 }}>
        <Tabs tabs={[`Active (${nActive})`, `Inactive (${nInactive})`]} active={view === 'active' ? `Active (${nActive})` : `Inactive (${nInactive})`} onChange={(t) => setView(t.startsWith('Active') ? 'active' : 'inactive')} />
      </div>
      <div className="row wrap" style={{ gap: 8, marginBottom: 14 }}>
        <span className="eyebrow">Sort by</span>
        {([['name', 'Name'], ['projects', 'Linked projects'], ['created', 'Date added']] as [SortKey, string][]).map(([k, l]) => (
          <button key={k} className="chip" aria-pressed={sort === k} style={sort === k ? { background: 'var(--accent-50)', color: 'var(--accent-600)', borderColor: 'var(--accent-100)' } : undefined} onClick={() => (sort === k ? setAsc(!asc) : (setSort(k), setAsc(true)))}>{l}{sort === k && <ArrowDownUp size={12} style={{ transform: asc ? undefined : 'scaleY(-1)' }} />}</button>
        ))}
      </div>
      {rows.length === 0 ? <div className="card"><EmptyState compact title={view === 'active' ? `No active ${m.title.toLowerCase()} found` : `No inactive ${m.title.toLowerCase()}`} /></div> : (
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {rows.map((r, i) => (
            <div key={r.id} role="button" tabIndex={0} className="card lift pad reveal-item party" style={{ ['--index' as string]: i % 12, cursor: 'pointer' }} onClick={() => navigate(`${m.path}/${r.id}`)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`${m.path}/${r.id}`) } }}>
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
                <IconButton small title={r.showInSO ? 'Disable' : 'Enable'} aria-label={`${r.showInSO ? 'Disable' : 'Enable'} ${r.name}`} disabled={busyId === r.id}
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); void toggle(r) }} onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}>
                  {r.showInSO ? <Ban size={17} /> : <CheckCircle2 size={17} />}
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
      {toast}
    </div>
  )
}
