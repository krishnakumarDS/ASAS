import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import IconButton from '../components/common/IconButton'
import StatusChip from '../components/common/StatusChip'
import PageHeader from '../components/PageHeader'
import { SearchBar, AppInput, DataTable, Pager, Tabs, matchQuery, usePaged, useSort, useToast } from '../components/ui'
import { fmtDate } from '../data/mock'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../data/store'
import { useSyncStatus } from '../data/sync'
import { userMessage } from '../data/api'
import { deleteRecord, setActiveRecord } from '../data/write'
import type { Project } from '../data/projects'


export default function ProjectsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useProjects()
  const [q, setQ] = useState('')
  const [dev, setDev] = useState('')
  const [cons, setCons] = useState('')
  const [toDelete, setToDelete] = useState<Project | null>(null)
  const [view, setView] = useState<'active' | 'inactive'>('active') // deleted (inactive) projects are listed separately
  const nActive = rows.filter((p) => p.display).length, nInactive = rows.length - nActive
  const [toast, say] = useToast()
  const { user } = useAuth()
  const live = useSyncStatus().state === 'live'
  const consultantOf = (p: Project) => p.consultant ?? ''

  const filtered = useMemo(() => rows.filter((p) =>
    p.display === (view === 'active') && matchQuery(`${p.name} ${p.maalemRef} ${p.developer} ${consultantOf(p)} ${p.createdBy} ${p.display ? 'visible' : 'hidden'}`, q)
    && p.developer.toLowerCase().includes(dev.toLowerCase()) && consultantOf(p).toLowerCase().includes(cons.toLowerCase())), [rows, q, dev, cons, view])
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
          <AppButton variant="contained" startIcon={<Plus size={17} />} onClick={() => navigate('/projects/new')}>Add project</AppButton>
        </>} />
      <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder="Search by project name, reference or developer" resultText={`${filtered.length} of ${view === 'active' ? nActive : nInactive} ${view} projects`} />
      <div className="card toolbar reveal-item" style={{ paddingBottom: 4 }}>
        <div className="toolbar-grid">
          <AppInput label="Developer name" placeholder="Filter by developer" value={dev} onChange={(e) => { setDev(e.target.value); setPage(1) }} />
          <AppInput label="Consultant name" placeholder="Filter by consultant" value={cons} onChange={(e) => { setCons(e.target.value); setPage(1) }} />
        </div>
      </div>
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
                <IconButton small title="Edit" aria-label="Edit" onClick={() => navigate(`/projects/${p.id}`)}><Pencil size={17} /></IconButton>
                <IconButton small title={p.display ? 'Disable' : 'Enable'} aria-label={p.display ? 'Disable' : 'Enable'} onClick={() => toggle(p)}>{p.display ? <EyeOff size={17} /> : <Eye size={17} />}</IconButton>
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
