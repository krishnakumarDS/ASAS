import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, MapPin, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import AiUpload, { FIELDS } from '../components/AiUpload'
import AppButton from '../components/common/AppButton'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import IconButton from '../components/common/IconButton'
import StatusChip from '../components/common/StatusChip'
import PageHeader from '../components/PageHeader'
import { AiSearchBar, AppInput, DataTable, Pager, matchQuery, usePaged, useSort, useToast } from '../components/ui'
import { newId, usePlots, useProjects } from '../data/store'
import type { Plot } from '../data/mock'


export default function PlotsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = usePlots()
  const [projects] = useProjects()
  const [q, setQ] = useState('')
  const [ref, setRef] = useState('')
  const SUGGEST = useMemo(() => ['hidden plots', rows[0]?.developer ?? '', rows.find((r) => r.consultant)?.consultant ?? '', 'plots without consultant'].filter(Boolean), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirm, setConfirm] = useState(false)
  const [upload, setUpload] = useState(false)
  const [toast, say] = useToast()
  const filtered = useMemo(() => rows.filter((r) =>
    matchQuery(`${r.projectName} ${r.maalemRef} ${r.devPlot} ${r.dmPlot} ${r.developer} ${r.consultant || 'without consultant'} ${r.display ? 'visible' : 'hidden'}`, q) && r.maalemRef.toLowerCase().includes(ref.toLowerCase())), [rows, q, ref])
  const { sorted, sortFor } = useSort(filtered, { project: (r) => r.projectName, dev: (r) => r.devPlot, dm: (r) => r.dmPlot, developer: (r) => r.developer, consultant: (r) => r.consultant, display: (r) => String(r.display) })
  const { visible, page, pages, setPage } = usePaged(sorted, 8)
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })

  return (
    <div className="page">
      <PageHeader title="Plots" subtitle="Developer and DM plot numbers per project" back={false}
        actions={<>
          <AppButton variant="outlined" startIcon={<Sparkles size={16} />} onClick={() => setUpload(true)}>AI upload</AppButton>
          <AppButton variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/plots/new')}>Add plot</AppButton>
        </>} />
      <AiSearchBar value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder={`Ask in plain words — e.g. “hidden plots for ${rows[0]?.developer ?? 'a developer'}”`} suggestions={SUGGEST} resultText={`${filtered.length} of ${rows.length} plots`} />
      <div className="card toolbar reveal-item" style={{ paddingBottom: 4 }}>
        <div className="toolbar-grid"><AppInput label="Maalem Dubai reference" placeholder="MP-00000-000" value={ref} onChange={(e) => { setRef(e.target.value); setPage(1) }} /></div>
      </div>
      <div className="card reveal-item">
        {selected.size > 0 && (
          <div className="row between wrap" style={{ padding: '10px 20px', background: 'var(--accent-50)', borderBottom: '1px solid var(--accent-100)' }} role="status">
            <b style={{ color: 'var(--accent-600)' }}>{selected.size} selected</b>
            <div className="row">
              <AppButton variant="outlined" size="small" startIcon={<Eye size={15} />} onClick={() => { setRows(rows.map((r) => selected.has(r.id) ? { ...r, display: true } : r)); say(`${selected.size} plot(s) enabled`); setSelected(new Set()) }}>Enable</AppButton>
              <AppButton variant="outlined" size="small" startIcon={<EyeOff size={15} />} onClick={() => { setRows(rows.map((r) => selected.has(r.id) ? { ...r, display: false } : r)); say(`${selected.size} plot(s) disabled`); setSelected(new Set()) }}>Disable</AppButton>
              <AppButton variant="outlined" color="error" size="small" startIcon={<Trash2 size={15} />} onClick={() => setConfirm(true)}>Delete</AppButton>
            </div>
          </div>
        )}
        <DataTable<Plot>
          rows={visible} empty="No plots match your search."
          columns={[
            { header: '', render: (r) => <input type="checkbox" className="cb" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Select plot ${r.devPlot}`} /> },
            { header: 'Project', sort: sortFor('project'), render: (r) => <><strong>{r.projectName}</strong><div className="cell-sub num">{r.maalemRef}</div></> },
            { header: 'Dev plot', sort: sortFor('dev'), render: (r) => <span className="num">{r.devPlot}</span> },
            { header: 'DM plot', sort: sortFor('dm'), render: (r) => <span className="num">{r.dmPlot}</span> },
            { header: 'Developer', sort: sortFor('developer'), render: (r) => r.developer },
            { header: 'Consultant', sort: sortFor('consultant'), render: (r) => r.consultant || '—' },
            { header: 'Smart Office', sort: sortFor('display'), render: (r) => <button type="button" title={r.display ? 'Click to disable' : 'Click to enable'} aria-label={`${r.display ? 'Disable' : 'Enable'} plot ${r.devPlot}`} onClick={() => { setRows(rows.map((x) => (x.id === r.id ? { ...x, display: !x.display } : x))); say(r.display ? 'Plot disabled' : 'Plot enabled') }}><StatusChip status={r.display ? 'visible' : 'hidden'} /></button> },
            { header: 'Actions', align: 'right', render: (r) => (
              <div className="row" style={{ justifyContent: 'flex-end', gap: 2 }}>
                <IconButton small title="Edit" aria-label="Edit" onClick={() => navigate(`/plots/${r.id}`)}><Pencil size={17} /></IconButton>
                <IconButton small title="Map" aria-label="Map" onClick={() => navigate('/network')}><MapPin size={17} /></IconButton>
                <IconButton small title="View" aria-label="View" onClick={() => navigate(`/plots/${r.id}`)}><Eye size={17} /></IconButton>
              </div>
            ) },
          ]}
        />
        <Pager page={page} pages={pages} setPage={setPage} />
      </div>
      <ConfirmationDialog open={confirm} title="Delete plots" message={`Delete ${selected.size} selected plot(s)?`} confirmLabel="Delete" destructive
        onConfirm={() => { setRows(rows.filter((r) => !selected.has(r.id))); setSelected(new Set()) }} onClose={() => setConfirm(false)} />
      {upload && <AiUpload entity="Plots" fields={FIELDS.plots} onClose={() => setUpload(false)} onImport={(imp) => {
        setRows((r) => [...imp.map((o): Plot => { const pr = projects.find((p) => p.maalemRef === o.maalemRef); return { id: newId(), maalemRef: o.maalemRef, projectName: pr?.name ?? '', devPlot: o.devPlot, dmPlot: o.dmPlot ?? '', developer: o.developer || pr?.developer || '', consultant: o.consultant ?? '', display: true } }), ...r])
        say(`${imp.length} plots imported`)
      }} />}
      {toast}
    </div>
  )
}
