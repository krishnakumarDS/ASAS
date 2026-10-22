import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import AppButton from './common/AppButton'
import { DataTable, Modal, RadioField, SelectField, TextField } from './ui'
import type { Substation } from '../data/mock'

/** "Search Substation": filter by substation name or SCADA name, click a row, then Done. */
export function SubstationPicker({ substations, onDone, onClose }: { substations: Substation[]; onDone: (s: Substation) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [scada, setScada] = useState('')
  const [applied, setApplied] = useState({ name: '', scada: '' })
  const [sel, setSel] = useState<Substation | null>(null)
  const rows = useMemo(() => substations.filter((s) => s.name.toLowerCase().includes(applied.name) && s.scada.toLowerCase().includes(applied.scada)), [substations, applied])
  const search = () => setApplied({ name: name.trim().toLowerCase(), scada: scada.trim().toLowerCase() })
  const clear = () => { setName(''); setScada(''); setApplied({ name: '', scada: '' }) }
  const shown = rows.slice(0, 200)
  return (
    <Modal title="Search Substation" size="lg" onClose={onClose} footer={
      <>
        <AppButton variant="outlined" onClick={onClose}>Cancel</AppButton>
        <AppButton variant="contained" disabled={!sel} onClick={() => sel && onDone(sel)}>Done</AppButton>
      </>
    }>
      <div className="row wrap" style={{ gap: 10, marginBottom: 12 }}>
        <input className="input" style={{ flex: '1 1 220px' }} placeholder="By substation name…" aria-label="Substation name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} autoFocus />
        <input className="input" style={{ flex: '1 1 220px' }} placeholder="By substation SCADA name…" aria-label="Substation SCADA name" value={scada} onChange={(e) => setScada(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
        <AppButton variant="contained" startIcon={<Search size={15} />} onClick={search}>Search</AppButton>
        <AppButton variant="outlined" startIcon={<X size={15} />} onClick={clear}>Clear</AppButton>
      </div>
      <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
        <DataTable<Substation> rows={shown} empty="No substations match." columns={[
          { header: 'Substation name', render: (s) => <button type="button" className="lookup-item" style={sel?.id === s.id ? { background: 'var(--accent-50)', color: 'var(--accent-600)', fontWeight: 600 } : undefined} onClick={() => setSel(s)} aria-pressed={sel?.id === s.id}>{s.name}</button> },
          { header: 'SCADA name', render: (s) => s.scada },
          { header: 'Built by', render: (s) => s.builtBy },
          { header: 'Show in Smart Office', render: (s) => String(s.showInSO) },
        ]} />
      </div>
      {rows.length > shown.length && <p className="faint" style={{ fontSize: 12, marginTop: 6 }}>Showing the first {shown.length} of {rows.length}. Use the filters to narrow the list.</p>}
      <div style={{ marginTop: 14 }}><TextField label="Selected substation" value={sel ? `${sel.name} (${sel.scada})` : ''} readOnly placeholder="Click a row above" /></div>
    </Modal>
  )
}

export interface SubstationEntry { substation: Substation; status: string; display: 'true' | 'false'; year: string; remark: string }
/** What an existing row already holds, to show it (view) or change it (edit). */
export interface SubstationInitial { substation: Substation; status: string; display: 'true' | 'false'; year: string }

/** Project details › Existing KVSS (or Future substation): add, view or edit one row.
 *  Future substation: Commissioning Year, Substation (picked in the search popup), Status, Is Active ?. Existing KVSS: Name, Status, Display in Smart Office?. */
export function SubstationEntryModal({ future, mode = 'add', initial, substations, taken, saving, onClose, onSave }: {
  future: boolean; mode?: 'add' | 'view' | 'edit'; initial?: SubstationInitial; substations: Substation[]; taken: Set<string>; saving?: boolean; onClose: () => void; onSave: (e: SubstationEntry) => void
}) {
  const view = mode === 'view'
  const [picking, setPicking] = useState(mode === 'add') // when adding, the search popup opens first
  const [sub, setSub] = useState<Substation | null>(initial?.substation ?? null)
  const [display, setDisplay] = useState<string>(initial?.display ?? '')
  const [year, setYear] = useState(initial?.year ?? '')
  const [status, setStatus] = useState(initial?.status ?? '') // Future substation: chosen from a list; Existing: the substation's "built by"
  const dup = !!sub && taken.has(sub.id)
  const yearBad = future && !!year.trim() && !/^(19|20)\d{2}$/.test(year.trim()) // ProjectYear in UC000420_ProjectsFutureYears: a four-digit year
  const base = future ? 'Project details › Future substation' : 'Project details › Existing KVSS'
  return (
    <>
      <Modal title={view ? `${base} (view)` : mode === 'edit' ? `${base} (edit)` : base} size="md" onClose={onClose} footer={view ? <AppButton variant="outlined" onClick={onClose}>Close</AppButton> : (
        <>
          <AppButton variant="outlined" disabled={saving} onClick={onClose}>Cancel</AppButton>
          <AppButton variant="contained" loading={saving} disabled={!sub || !display || dup || (future && (!year.trim() || yearBad || !status))} onClick={() => sub && onSave({ substation: sub, status: future ? status : status || sub.builtBy, display: display as 'true' | 'false', year: year.trim(), remark: '' })}>Save</AppButton>
        </>
      )}>
        {future && <TextField label="Commissioning Year" type="number" required={!view} value={year} readOnly={view} onChange={setYear} error={yearBad ? 'Enter a four-digit year, for example 2028' : undefined} />}
        <div className="field">
          <label htmlFor="kvss-name">{future ? 'Substation' : 'Name'}{!view && <span className="req" aria-hidden>*</span>}</label>
          <div className="with-action">
            <input id="kvss-name" className={`input${dup ? ' invalid' : ''}`} readOnly value={sub?.name ?? ''} placeholder="Choose a substation" aria-invalid={dup} />
            {!view && <AppButton variant="contained" startIcon={<Search size={15} />} onClick={() => setPicking(true)}>Substation</AppButton>}
          </div>
        </div>
        {dup && <p className="error-text" role="alert">This substation is already in the list.</p>}
        {future
          ? <SelectField label="Status" required={!view} value={status} options={status && !['DEWA', 'Developer'].includes(status) ? ['DEWA', 'Developer', status] : ['DEWA', 'Developer']} disabled={view} onChange={setStatus} />
          : <TextField label="Status" value={status} readOnly />}
        <RadioField label={future ? 'Is Active ?' : 'Display in Smart Office?'} required={!view} options={['true', 'false']} value={display} disabled={view} onChange={setDisplay} />
      </Modal>
      {picking && <SubstationPicker substations={substations} onDone={(s) => { setSub(s); setStatus((cur) => (future ? cur || s.builtBy : s.builtBy)); setPicking(false) }} onClose={() => { setPicking(false); if (!sub) onClose() }} />}
    </>
  )
}
