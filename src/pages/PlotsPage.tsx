import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ban, CheckCircle2, Download, Eye, MapPin, Pencil, Plus } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import IconButton from '../components/common/IconButton'
import StatusChip from '../components/common/StatusChip'
import PageHeader from '../components/PageHeader'
import { DataTable, Pager, Tabs, usePaged, useSort, useToast } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useConsultants, useDevelopers, usePlots } from '../data/store'
import AddPlotDialog from '../components/AddPlotDialog'
import SearchFilters, { NO_SEARCH } from '../components/SearchFilters'
import { useSyncStatus } from '../data/sync'
import { userMessage } from '../data/api'
import { setActiveMany } from '../data/write'
import type { Plot } from '../data/mock'


const names = (list: { name: string }[]) => [...new Set(list.map((x) => x.name.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b))

const has = (hay: (string | undefined)[], t: string) => hay.some((h) => (h ?? '').toLowerCase().includes(t))

export default function PlotsPage() {
  const navigate = useNavigate()
  const [developers] = useDevelopers()
  const [consultants] = useConsultants()
  const [rows, setRows] = usePlots()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'active' | 'inactive'>('active') // disabled (inactive) plots are listed separately
  const [q, setQ] = useState(NO_SEARCH)
  const [adding, setAdding] = useState(false)
  const source = useMemo(() => {
    const t = q.text.trim().toLowerCase()
    return rows.filter((r) => (!q.developer || r.developer === q.developer) && (!q.consultant || r.consultant === q.consultant)
      && (!t || has([r.projectName, r.maalemRef, r.devPlot, r.dmPlot, r.subs, r.developer, r.consultant], t)))
  }, [rows, q])
  const nActive = source.filter((r) => r.display).length, nInactive = source.length - nActive
  const [toast, say] = useToast()
  const { user } = useAuth()
  const live = useSyncStatus().state === 'live'
  const filtered = useMemo(() => source.filter((r) =>
    r.display === (view === 'active')), [source, view])
  const { sorted, sortFor } = useSort(filtered, { project: (r) => r.projectName, dev: (r) => r.devPlot, dm: (r) => r.dmPlot, developer: (r) => r.developer, consultant: (r) => r.consultant, display: (r) => String(r.display) })
  const { visible, page, pages, setPage } = usePaged(sorted, 8)
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  // Enable / disable write to SQL (plot.setActiveMany: IsActive); a disabled plot is hidden, never removed, so it can be enabled again.
  const apply = async (ids: string[], what: 'enable' | 'disable') => {
    if (!live) { say('The server can’t be reached right now: nothing was changed. Please try again.'); return }
    try {
      // ONE flow call for the whole selection (plot.setActiveMany)
      const changed = await setActiveMany('plot', ids, what === 'enable', user?.name)
      const ok = new Set(ids)
      setRows((cur) => cur.map((r) => (ok.has(r.id) ? { ...r, display: what === 'enable' } : r)))
      setSelected(new Set())
      say(changed === ids.length ? `${changed} plot(s) ${what === 'enable' ? 'enabled' : 'disabled'}` : `${changed} of ${ids.length} plot(s) changed`)
    } catch (e) {
      say(userMessage(e, 'Could not change the plots'))
    }
  }

  return (
    <div className="page">
      <PageHeader title="Plots" subtitle="Developer and DM plot numbers per project" back={false}
        actions={<>
          <AppButton variant="outlined" startIcon={<Download size={16} />} onClick={() => navigate('/import?table=plot')}>Import</AppButton>
          <AppButton variant="contained" startIcon={<Plus size={16} />} onClick={() => setAdding(true)}>Add plot</AppButton>
        </>} />
      <SearchFilters value={q} onChange={(v) => { setQ(v); setPage(1) }} developers={names(developers)} consultants={names(consultants)} resultText={`${filtered.length} of ${view === 'active' ? nActive : nInactive} ${view} plots`} />
      <div className="card reveal-item">
        <Tabs tabs={[`Active (${nActive})`, `Inactive (${nInactive})`]} active={view === 'active' ? `Active (${nActive})` : `Inactive (${nInactive})`} onChange={(t) => { setView(t.startsWith('Active') ? 'active' : 'inactive'); setPage(1) }} />
        {selected.size > 0 && (
          <div className="row between wrap" style={{ padding: '10px 20px', background: 'var(--accent-50)', borderBottom: '1px solid var(--accent-100)' }} role="status">
            <b style={{ color: 'var(--accent-600)' }}>{selected.size} selected</b>
            <div className="row">
              {view === 'inactive' && <AppButton variant="outlined" size="small" startIcon={<CheckCircle2 size={15} />} onClick={() => apply([...selected], 'enable')}>Enable</AppButton>}
              {view === 'active' && <AppButton variant="outlined" size="small" startIcon={<Ban size={15} />} onClick={() => apply([...selected], 'disable')}>Disable</AppButton>}
            </div>
          </div>
        )}
        <DataTable<Plot>
          rows={visible} empty={view === 'active' ? 'No active plots match your search.' : 'No inactive plots.'}
          columns={[
            { header: '', render: (r) => <input type="checkbox" className="cb" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Select plot ${r.devPlot}`} /> },
            { header: 'Project', sort: sortFor('project'), render: (r) => <><strong>{r.projectName}</strong><div className="cell-sub num">{r.maalemRef}</div></> },
            { header: 'Dev plot', sort: sortFor('dev'), render: (r) => <span className="num">{r.devPlot}</span> },
            { header: 'DM plot', sort: sortFor('dm'), render: (r) => <span className="num">{r.dmPlot}</span> },
            { header: 'Developer', sort: sortFor('developer'), render: (r) => r.developer },
            { header: 'Consultant', sort: sortFor('consultant'), render: (r) => r.consultant || '—' },
            { header: 'Smart Office', sort: sortFor('display'), render: (r) => <button type="button" title={r.display ? 'Click to disable' : 'Click to enable'} aria-label={`${r.display ? 'Disable' : 'Enable'} plot ${r.devPlot}`} onClick={() => apply([r.id], r.display ? 'disable' : 'enable')}><StatusChip status={r.display ? 'visible' : 'hidden'} /></button> },
            { header: 'Actions', align: 'right', render: (r) => (
              <div className="row" style={{ justifyContent: 'flex-end', gap: 2 }}>
                <IconButton small title="Edit" aria-label="Edit" onClick={() => navigate(`/plots/${r.id}`)}><Pencil size={17} /></IconButton>
                <IconButton small title="Map" aria-label="Map" onClick={() => navigate('/network')}><MapPin size={17} /></IconButton>
                <IconButton small title="View" aria-label="View" onClick={() => navigate(`/plots/${r.id}`)}><Eye size={17} /></IconButton>
                <IconButton small title={r.display ? 'Disable' : 'Enable'} aria-label={r.display ? 'Disable' : 'Enable'} onClick={() => { void apply([r.id], r.display ? 'disable' : 'enable') }}>{r.display ? <Ban size={17} /> : <CheckCircle2 size={17} />}</IconButton>
              </div>
            ) },
          ]}
        />
        <Pager page={page} pages={pages} setPage={setPage} />
      </div>
      {adding && <AddPlotDialog onClose={() => setAdding(false)} />}
      {toast}
    </div>
  )
}
