import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ban, CheckCircle2, Download, Eye, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import IconButton from '../components/common/IconButton'
import StatusChip from '../components/common/StatusChip'
import PageHeader from '../components/PageHeader'
import { DataTable, Pager, Tabs, usePaged, useSort, useToast } from '../components/ui'
import { fmtDate } from '../data/mock'
import { useAuth } from '../context/AuthContext'
import { useConsultants, useDevelopers, usePlots, useProjects } from '../data/store'
import SearchFilters, { NO_SEARCH } from '../components/SearchFilters'
import { useSyncStatus } from '../data/sync'
import { userMessage } from '../data/api'
import { deleteRecord, setActiveRecord } from '../data/write'
import type { Project } from '../data/projects'


const names = (list: { name: string }[]) => [...new Set(list.map((x) => x.name.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b))

const has = (hay: (string | undefined)[], t: string) => hay.some((h) => (h ?? '').toLowerCase().includes(t))

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [developers] = useDevelopers()
  const [consultants] = useConsultants()
  const [rows, setRows] = useProjects()
  const [toDelete, setToDelete] = useState<Project | null>(null)
  const [view, setView] = useState<'active' | 'inactive'>('active') // deleted (inactive) projects are listed separately
  const [q, setQ] = useState(NO_SEARCH)
  const [plots] = usePlots()
  // a project is found by its own details or by any of its plots (plot numbers, substations, consultant)
  const source = useMemo(() => {
    const t = q.text.trim().toLowerCase()
    const byRef = new Map<string, typeof plots>()
    for (const pl of plots) byRef.set(pl.maalemRef, [...(byRef.get(pl.maalemRef) ?? []), pl])
    return rows.filter((p) => {
      const pls = byRef.get(p.maalemRef) ?? []
      return (!q.developer || p.developer === q.developer) && (!q.consultant || pls.some((x) => x.consultant === q.consultant))
        && (!t || has([p.name, p.maalemRef, p.developer, ...pls.flatMap((x) => [x.devPlot, x.dmPlot, x.subs, x.consultant])], t))
    })
  }, [rows, plots, q])
  const nActive = source.filter((p) => p.display).length, nInactive = source.length - nActive
  const [toast, say] = useToast()
  const { user } = useAuth()
  const live = useSyncStatus().state === 'live'
  const consultantOf = (p: Project) => p.consultant ?? ''

  const filtered = useMemo(() => source.filter((p) =>
    p.display === (view === 'active')), [source, view])
  const { sorted, sortFor } = useSort(filtered, { name: (p) => p.name, developer: (p) => p.developer, consultant: consultantOf, created: (p) => p.createdOn, display: (p) => String(p.display) })
  const { visible, page, pages, setPage } = usePaged(sorted, 8)
  // Enable / disable and delete write to SQL (project.setActive / project.delete); "delete" hides the project, it can be enabled again.
  const toggle = async (p: Project) => {
    if (!live) { say('The server can’t be reached right now: nothing was changed. Please try again.'); return }
    try { await setActiveRecord('project', p.id, !p.display, user?.name); setRows(rows.map((r) => (r.id === p.id ? { ...r, display: !r.display } : r))); say(p.display ? 'Project disabled' : 'Project enabled') }
    catch (e) { say(userMessage(e, 'Could not change the project')) }
  }
  const remove = async (p: Project) => {
    if (!live) { say('The server can’t be reached right now: nothing was changed. Please try again.'); return }
    try { await deleteRecord('project', p.id, user?.name); setRows(rows.map((r) => (r.id === p.id ? { ...r, display: false } : r))); say('Project deleted (hidden)') }
    catch (e) { say(userMessage(e, 'Could not delete the project')) }
  }

  return (
    <div className="page">
      <PageHeader title="Projects" subtitle="Master plan projects, developers and approval details" back={false}
        actions={<>
          <AppButton variant="outlined" startIcon={<Download size={16} />} onClick={() => navigate('/import?table=project')}>Import</AppButton>
          <AppButton variant="contained" startIcon={<Plus size={17} />} onClick={() => navigate('/projects/new')}>Add project</AppButton>
        </>} />
      <SearchFilters value={q} onChange={(v) => { setQ(v); setPage(1) }} developers={names(developers)} consultants={names(consultants)} resultText={`${filtered.length} of ${view === 'active' ? nActive : nInactive} ${view} projects`} />
      <div className="card reveal-item">
        <Tabs tabs={[`Active (${nActive})`, `Inactive (${nInactive})`]} active={view === 'active' ? `Active (${nActive})` : `Inactive (${nInactive})`} onChange={(t) => { setView(t.startsWith('Active') ? 'active' : 'inactive'); setPage(1) }} />
        <DataTable<Project>
          rows={visible} empty={view === 'active' ? 'No active projects match your search.' : 'No inactive projects.'}
          columns={[
            { header: 'Project', sort: sortFor('name'), render: (p) => <><a href={`/projects/${p.id}`} className="link cell-title" onClick={(e) => { e.preventDefault(); navigate(`/projects/${p.id}`) }}>{p.name}</a><div className="cell-sub num">{p.maalemRef}</div></> },
            { header: 'Developer', sort: sortFor('developer'), render: (p) => p.developer },
            { header: 'Consultant', sort: sortFor('consultant'), render: (p) => consultantOf(p) || '—' },
            { header: 'Created', sort: sortFor('created'), render: (p) => <><div>{p.createdBy}</div><div className="cell-sub">{fmtDate(p.createdOn)}</div></> },
            { header: 'Display', sort: sortFor('display'), render: (p) => <StatusChip status={p.display ? 'visible' : 'hidden'} /> },
            { header: 'Actions', align: 'right', render: (p) => (
              <div className="row" style={{ justifyContent: 'flex-end', gap: 2 }}>
                <IconButton small title="Files" aria-label="Files" onClick={() => navigate(`/projects/${p.id}/files/Area Map`)}><FolderOpen size={17} /></IconButton>
                <IconButton small title="View" aria-label="View" onClick={() => navigate(`/projects/${p.id}`)}><Eye size={17} /></IconButton>
                <IconButton small title="Edit" aria-label="Edit" onClick={() => navigate(`/projects/${p.id}`)}><Pencil size={17} /></IconButton>
                <IconButton small title={p.display ? 'Disable' : 'Enable'} aria-label={p.display ? 'Disable' : 'Enable'} onClick={() => toggle(p)}>{p.display ? <Ban size={17} /> : <CheckCircle2 size={17} />}</IconButton>
                {p.display && <IconButton small danger title="Delete" aria-label="Delete" onClick={() => setToDelete(p)}><Trash2 size={17} /></IconButton>}
              </div>
            ) },
          ]}
        />
        <Pager page={page} pages={pages} setPage={setPage} />
      </div>
      <ConfirmationDialog open={!!toDelete} title="Delete project" message={`Delete “${toDelete?.name}”? It is hidden (set inactive) and can be enabled again.`} confirmLabel="Delete" destructive
        onConfirm={() => toDelete && remove(toDelete)} onClose={() => setToDelete(null)} />
      {toast}
    </div>
  )
}
