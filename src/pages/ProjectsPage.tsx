import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, FolderOpen, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import AiUpload, { FIELDS } from '../components/AiUpload'
import AppButton from '../components/common/AppButton'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import IconButton from '../components/common/IconButton'
import StatusChip from '../components/common/StatusChip'
import PageHeader from '../components/PageHeader'
import { AiSearchBar, AppInput, DataTable, Pager, matchQuery, usePaged, useSort, useToast } from '../components/ui'
import { fmtDate } from '../data/mock'
import { newId, useProjects } from '../data/store'
import type { Project } from '../data/projects'

const SUGGEST = ['hidden projects', 'Al Wasl', 'Dubai Properties Group', 'visible']

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useProjects()
  const [q, setQ] = useState('')
  const [dev, setDev] = useState('')
  const [cons, setCons] = useState('')
  const [toDelete, setToDelete] = useState<Project | null>(null)
  const [upload, setUpload] = useState(false)
  const [toast, say] = useToast()
  const consultantOf = (p: Project) => p.consultant ?? ''

  const filtered = useMemo(() => rows.filter((p) =>
    matchQuery(`${p.name} ${p.maalemRef} ${p.developer} ${consultantOf(p)} ${p.createdBy} ${p.display ? 'visible' : 'hidden'}`, q)
    && p.developer.toLowerCase().includes(dev.toLowerCase()) && consultantOf(p).toLowerCase().includes(cons.toLowerCase())), [rows, q, dev, cons])
  const { sorted, sortFor } = useSort(filtered, { name: (p) => p.name, developer: (p) => p.developer, consultant: consultantOf, created: (p) => p.createdOn, display: (p) => String(p.display) })
  const { visible, page, pages, setPage } = usePaged(sorted, 8)
  const toggle = (p: Project) => { setRows(rows.map((r) => (r.id === p.id ? { ...r, display: !r.display } : r))); say(p.display ? 'Project disabled' : 'Project enabled') }

  return (
    <div className="page">
      <PageHeader title="Projects" subtitle="Master plan projects, developers and approval details" back={false}
        actions={<>
          <AppButton variant="outlined" startIcon={<Sparkles size={16} />} onClick={() => setUpload(true)}>AI upload</AppButton>
          <AppButton variant="contained" startIcon={<Plus size={17} />} onClick={() => navigate('/projects/new')}>Add project</AppButton>
        </>} />
      <AiSearchBar value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder="Ask in plain words — e.g. “hidden projects by Al Wasl”" suggestions={SUGGEST} resultText={`${filtered.length} of ${rows.length} projects`} />
      <div className="card toolbar reveal-item" style={{ paddingBottom: 4 }}>
        <div className="toolbar-grid">
          <AppInput label="Developer name" placeholder="Filter by developer" value={dev} onChange={(e) => { setDev(e.target.value); setPage(1) }} />
          <AppInput label="Consultant name" placeholder="Filter by consultant" value={cons} onChange={(e) => { setCons(e.target.value); setPage(1) }} />
        </div>
      </div>
      <div className="card reveal-item">
        <DataTable<Project>
          rows={visible} empty="No projects match your search."
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
                <IconButton small danger title="Delete" aria-label="Delete" onClick={() => setToDelete(p)}><Trash2 size={17} /></IconButton>
              </div>
            ) },
          ]}
        />
        <Pager page={page} pages={pages} setPage={setPage} />
      </div>
      <ConfirmationDialog open={!!toDelete} title="Delete project" message={`Delete “${toDelete?.name}”? This can’t be undone.`} confirmLabel="Delete" destructive
        onConfirm={() => toDelete && setRows((r) => r.filter((x) => x.id !== toDelete.id))} onClose={() => setToDelete(null)} />
      {upload && <AiUpload entity="Projects" fields={FIELDS.projects} onClose={() => setUpload(false)} onImport={(imp) => {
        setRows((r) => [...imp.map((o): Project => ({ id: newId(), maalemRef: o.maalemRef, name: o.name, developer: o.developer ?? '', createdBy: 'AI upload', createdOn: new Date().toISOString(), display: false })), ...r])
        say(`${imp.length} projects imported`)
      }} />}
      {toast}
    </div>
  )
}
