import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import IconButton from '../components/common/IconButton'
import StatusChip from '../components/common/StatusChip'
import PageHeader from '../components/PageHeader'
import { AppInput, DataTable, FilterBar, Pager, usePaged } from '../components/ui'
import { fmtDate } from '../data/mock'
import { projects as seed } from '../data/projects'
import type { Project } from '../data/projects'

type Filters = { name: string; ref: string; developer: string; devPlot: string; dmPlot: string; scada: string; substation: string; consultant: string }
const empty: Filters = { name: '', ref: '', developer: '', devPlot: '', dmPlot: '', scada: '', substation: '', consultant: '' }

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Project[]>(seed)
  const [draft, setDraft] = useState<Filters>(empty)
  const [applied, setApplied] = useState<Filters>(empty)
  const [asc, setAsc] = useState(true)
  const [toDelete, setToDelete] = useState<Project | null>(null)
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [k]: e.target.value })

  const filtered = useMemo(() => {
    const has = (v: string, q: string) => v.toLowerCase().includes(q.trim().toLowerCase())
    return rows.filter((r) => has(r.name, applied.name) && has(r.maalemRef, applied.ref) && has(r.developer, applied.developer)).sort((a, b) => (asc ? 1 : -1) * a.name.localeCompare(b.name))
  }, [rows, applied, asc])
  const { visible, page, pages, setPage } = usePaged(filtered, 8)

  return (
    <div className="page">
      <PageHeader title="Projects" subtitle="Master plan projects, developers and approval details" back={false}
        actions={<AppButton variant="contained" startIcon={<Plus size={17} />} onClick={() => navigate('/projects/new')}>Add project</AppButton>} />
      <FilterBar
        onSearch={() => { setApplied(draft); setPage(1) }} onClear={() => { setDraft(empty); setApplied(empty); setPage(1) }}
        resultText={`${filtered.length} project${filtered.length === 1 ? '' : 's'} found`}
        advanced={<>
          <AppInput label="Developer plot no." placeholder="Plot number" value={draft.devPlot} onChange={set('devPlot')} />
          <AppInput label="DM plot no." placeholder="Plot number" value={draft.dmPlot} onChange={set('dmPlot')} />
          <AppInput label="Sub. SCADA name" placeholder="SCADA name" value={draft.scada} onChange={set('scada')} />
          <AppInput label="Substation name" placeholder="Substation" value={draft.substation} onChange={set('substation')} />
          <AppInput label="Consultant" placeholder="Consultant name" value={draft.consultant} onChange={set('consultant')} />
        </>}>
        <AppInput label="Project name" placeholder="e.g. Cherrywood" value={draft.name} onChange={set('name')} />
        <AppInput label="Project ref." placeholder="MP-00000-000" value={draft.ref} onChange={set('ref')} />
        <AppInput label="Developer" placeholder="Developer name" value={draft.developer} onChange={set('developer')} />
      </FilterBar>
      <div className="card reveal-item">
        <DataTable<Project>
          rows={visible}
          empty="No projects match your filters."
          columns={[
            { header: 'Project', sort: { asc, onToggle: () => setAsc(!asc) }, render: (p) => <><a href={`/projects/${p.id}`} className="link cell-title" onClick={(e) => { e.preventDefault(); navigate(`/projects/${p.id}`) }}>{p.name}</a><div className="cell-sub num">{p.maalemRef}</div></> },
            { header: 'Developer', render: (p) => p.developer },
            { header: 'Created', render: (p) => <><div>{p.createdBy}</div><div className="cell-sub">{fmtDate(p.createdOn)}</div></> },
            { header: 'Display', render: (p) => <StatusChip status={p.display ? 'visible' : 'hidden'} /> },
            { header: 'Actions', align: 'right', render: (p) => (
              <div className="row" style={{ justifyContent: 'flex-end', gap: 2 }}>
                <IconButton small title="Files" aria-label="Files" onClick={() => navigate(`/projects/${p.id}/files/Area Map`)}><FolderOpen size={17} /></IconButton>
                <IconButton small title="Edit" aria-label="Edit" onClick={() => navigate(`/projects/${p.id}`)}><Pencil size={17} /></IconButton>
                <IconButton small danger title="Delete" aria-label="Delete" onClick={() => setToDelete(p)}><Trash2 size={17} /></IconButton>
              </div>
            ) },
          ]}
        />
        <Pager page={page} pages={pages} setPage={setPage} />
      </div>
      <ConfirmationDialog open={!!toDelete} title="Delete project" message={`Delete “${toDelete?.name}”? This can’t be undone.`} confirmLabel="Delete" destructive
        onConfirm={() => toDelete && setRows((r) => r.filter((x) => x.id !== toDelete.id))} onClose={() => setToDelete(null)} />
    </div>
  )
}
