import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import IconButton from '../components/common/IconButton'
import StatusChip from '../components/common/StatusChip'
import PageHeader from '../components/PageHeader'
import { AppInput, DataTable, FilterBar, Pager, usePaged, useToast } from '../components/ui'
import { plots as seed } from '../data/mock'
import type { Plot } from '../data/mock'

const keys = ['name', 'ref', 'developer', 'devPlot', 'dmPlot', 'scada', 'substation', 'consultant'] as const
type K = (typeof keys)[number]
const blank = Object.fromEntries(keys.map((k) => [k, ''])) as Record<K, string>

export default function PlotsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Plot[]>(seed)
  const [draft, setDraft] = useState(blank)
  const [applied, setApplied] = useState(blank)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirm, setConfirm] = useState(false)
  const [toast, say] = useToast()
  const has = (v: string, q: string) => v.toLowerCase().includes(q.toLowerCase())
  const filtered = useMemo(() => rows.filter((r) => has(r.projectName, applied.name) && has(r.maalemRef, applied.ref) && has(r.devPlot, applied.devPlot) && has(r.dmPlot, applied.dmPlot) && has(r.developer, applied.developer) && has(r.consultant, applied.consultant)), [rows, applied])
  const { visible, page, pages, setPage } = usePaged(filtered, 8)
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const f = (k: K, label: string) => <AppInput key={k} label={label} placeholder={label} value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />

  return (
    <div className="page">
      <PageHeader title="Plots" subtitle="Developer and DM plot numbers per project" back={false}
        actions={<AppButton variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/plots/new')}>Add plots</AppButton>} />
      <FilterBar resultText={`${filtered.length} plots`} onSearch={() => { setApplied(draft); setPage(1) }} onClear={() => { setDraft(blank); setApplied(blank) }}
        advanced={<>{f('devPlot', 'Developer plot no.')}{f('dmPlot', 'DM plot no.')}{f('scada', 'Sub. SCADA name')}{f('substation', 'Substation name')}{f('consultant', 'Consultant')}</>}>
        {f('name', 'Project name')}{f('ref', 'Project ref.')}{f('developer', 'Developer')}
      </FilterBar>
      <div className="card reveal-item">
        {selected.size > 0 && (
          <div className="row between wrap" style={{ padding: '10px 20px', background: 'var(--accent-50)', borderBottom: '1px solid var(--accent-100)' }} role="status">
            <b style={{ color: 'var(--accent-600)' }}>{selected.size} selected</b>
            <div className="row">
              <AppButton variant="outlined" size="small" startIcon={<EyeOff size={15} />} onClick={() => { setRows(rows.map((r) => selected.has(r.id) ? { ...r, display: false } : r)); say('Selected plots disabled'); setSelected(new Set()) }}>Disable</AppButton>
              <AppButton variant="outlined" color="error" size="small" startIcon={<Trash2 size={15} />} onClick={() => setConfirm(true)}>Delete</AppButton>
            </div>
          </div>
        )}
        <DataTable<Plot>
          rows={visible} empty="No plots found."
          columns={[
            { header: '', render: (r) => <input type="checkbox" className="cb" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`Select plot ${r.devPlot}`} /> },
            { header: 'Project', render: (r) => <><strong>{r.projectName}</strong><div className="cell-sub num">{r.maalemRef}</div></> },
            { header: 'Dev plot', render: (r) => <span className="num">{r.devPlot}</span> },
            { header: 'DM plot', render: (r) => <span className="num">{r.dmPlot}</span> },
            { header: 'Developer', render: (r) => r.developer },
            { header: 'Consultant', render: (r) => r.consultant || '—' },
            { header: 'Smart Office', render: (r) => <StatusChip status={r.display ? 'visible' : 'hidden'} /> },
            { header: 'Actions', align: 'right', render: (r) => (
              <div className="row" style={{ justifyContent: 'flex-end', gap: 2 }}>
                <IconButton small title="Edit" aria-label="Edit" onClick={() => navigate(`/plots/${r.id}`)}><Pencil size={17} /></IconButton>
                <IconButton small title="Map" aria-label="Map"><MapPin size={17} /></IconButton>
                <IconButton small title="View" aria-label="View" onClick={() => navigate(`/plots/${r.id}`)}><Eye size={17} /></IconButton>
              </div>
            ) },
          ]}
        />
        <Pager page={page} pages={pages} setPage={setPage} />
      </div>
      <ConfirmationDialog open={confirm} title="Delete plots" message={`Delete ${selected.size} selected plot(s)?`} confirmLabel="Delete" destructive
        onConfirm={() => { setRows(rows.filter((r) => !selected.has(r.id))); setSelected(new Set()) }} onClose={() => setConfirm(false)} />
      {toast}
    </div>
  )
}
