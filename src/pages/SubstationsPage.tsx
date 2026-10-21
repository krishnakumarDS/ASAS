import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Eye, EyeOff, Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import IconButton from '../components/common/IconButton'
import PageHeader from '../components/PageHeader'
import { SearchBar, DataTable, Pager, Tabs, matchQuery, usePaged, useSort, useToast } from '../components/ui'
import { fmtDate } from '../data/mock'
import { useAuth } from '../context/AuthContext'
import { useSubstations } from '../data/store'
import { useSyncStatus } from '../data/sync'
import { userMessage } from '../data/api'
import { deleteRecord, setActiveRecord } from '../data/write'
import type { Substation } from '../data/mock'


export default function SubstationsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useSubstations()
  const { user } = useAuth()
  const live = useSyncStatus().state === 'live'
  const [toast, say] = useToast()
  const [toDelete, setToDelete] = useState<Substation | null>(null)
  const [view, setView] = useState<'active' | 'inactive'>('active') // deleted (inactive) substations are listed separately
  const nActive = rows.filter((r) => r.showInSO).length, nInactive = rows.length - nActive
  // Show / hide and delete write to SQL (substation.setActive / substation.delete); "delete" hides the substation, it can be shown again.
  const toggle = async (r: Substation) => {
    if (!live) { say('The server can’t be reached right now: nothing was changed. Please try again.'); return }
    try { await setActiveRecord('substation', r.id, !r.showInSO, user?.name); setRows(rows.map((x) => (x.id === r.id ? { ...x, showInSO: !x.showInSO } : x))); say(r.showInSO ? 'Substation hidden' : 'Substation shown') }
    catch (e) { say(userMessage(e, 'Could not change the substation')) }
  }
  const remove = async (r: Substation) => {
    if (!live) { say('The server can’t be reached right now: nothing was changed. Please try again.'); return }
    try { await deleteRecord('substation', r.id, user?.name); setRows(rows.map((x) => (x.id === r.id ? { ...x, showInSO: false } : x))); say('Substation deleted (hidden)') }
    catch (e) { say(userMessage(e, 'Could not delete the substation')) }
  }
  const [q, setQ] = useState('')
  const filtered = useMemo(() => rows.filter((s) => s.showInSO === (view === 'active') && matchQuery(`${s.name} ${s.scada} ${s.builtBy} ${s.showInSO ? 'shown smart office' : 'hidden smart office'} ${s.createdBy}`, q)), [rows, q, view])
  const { sorted, sortFor } = useSort(filtered, { name: (s) => s.name, builtBy: (s) => s.builtBy, so: (s) => String(s.showInSO), created: (s) => s.createdOn })
  const { visible, page, pages, setPage } = usePaged(sorted, 10)

  return (
    <div className="page">
      <PageHeader title="Substations" subtitle="Substation records, SCADA names and standard limits" back={false} actions={
        <>
          <AppButton variant="outlined" startIcon={<Download size={16} />} onClick={() => navigate('/import?table=substation')}>Import</AppButton>
          <AppButton variant="outlined" startIcon={<SlidersHorizontal size={16} />} onClick={() => navigate('/substations/limits')}>Standard limits</AppButton>
          <AppButton variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/substations/new')}>Add substation</AppButton>
        </>
      } />
      <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder="Search by substation name, SCADA name or builder" resultText={`${filtered.length} of ${view === 'active' ? nActive : nInactive} ${view} substations`} />
      <div className="card reveal-item">
        <Tabs tabs={[`Active (${nActive})`, `Inactive (${nInactive})`]} active={view === 'active' ? `Active (${nActive})` : `Inactive (${nInactive})`} onChange={(t) => { setView(t.startsWith('Active') ? 'active' : 'inactive'); setPage(1) }} />
        <DataTable<Substation>
          rows={visible} empty={view === 'active' ? 'No active substations match your search.' : 'No inactive substations.'}
          columns={[
            { header: 'Substation', sort: sortFor('name'), render: (r) => <><a href="#" className="link cell-title" onClick={(e) => { e.preventDefault(); navigate(`/substations/${r.id}`) }}>{r.name}</a><div className="cell-sub num">{r.scada}</div></> },
            { header: 'Built by', sort: sortFor('builtBy'), render: (r) => <span className={`badge ${r.builtBy === 'DEWA' ? 'badge-accent' : 'badge-neutral'}`}>{r.builtBy}</span> },
            { header: 'Smart Office', sort: sortFor('so'), render: (r) => <span className={`badge ${r.showInSO ? 'badge-success' : 'badge-neutral'}`}>{r.showInSO ? 'Shown' : 'Hidden'}</span> },
            { header: 'Created', sort: sortFor('created'), render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
            { header: 'Actions', align: 'right', render: (r) => (
              <div className="row" style={{ justifyContent: 'flex-end', gap: 2 }}>
                <IconButton small title="Edit" aria-label="Edit" onClick={() => navigate(`/substations/${r.id}`)}><Pencil size={17} /></IconButton>
                <IconButton small title={r.showInSO ? 'Hide' : 'Show'} aria-label={r.showInSO ? 'Hide' : 'Show'} onClick={() => toggle(r)}>{r.showInSO ? <EyeOff size={17} /> : <Eye size={17} />}</IconButton>
                {r.showInSO && <IconButton small danger title="Delete" aria-label="Delete" onClick={() => setToDelete(r)}><Trash2 size={17} /></IconButton>}
              </div>
            ) },
          ]}
        />
        <Pager page={page} pages={pages} setPage={setPage} />
      </div>
      <ConfirmationDialog open={!!toDelete} title="Delete substation" message={`Delete “${toDelete?.name}”? It is hidden (set inactive) and can be shown again.`} confirmLabel="Delete" destructive
        onConfirm={() => toDelete && remove(toDelete)} onClose={() => setToDelete(null)} />
      {toast}
    </div>
  )
}
