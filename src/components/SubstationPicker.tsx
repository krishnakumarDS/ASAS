import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import AppButton from './common/AppButton'
import { DataTable, Modal, RadioField, TextField } from './ui'
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

/** Project details › Existing KVSS (or Future substation): Name (picked in the search popup), Status, Display in Smart Office, then Save. */
export function SubstationEntryModal({ future, substations, taken, saving, onClose, onSave }: {
  future: boolean; substations: Substation[]; taken: Set<string>; saving?: boolean; onClose: () => void; onSave: (e: SubstationEntry) => void
}) {
  const [picking, setPicking] = useState(true) // the search popup opens first
  const [sub, setSub] = useState<Substation | null>(null)
  const [display, setDisplay] = useState('')
  const [year, setYear] = useState('')
  const [remark, setRemark] = useState('')
  const dup = !!sub && taken.has(sub.id)
  return (
    <>
      <Modal title={future ? 'Project details › Future substation' : 'Project details › Existing KVSS'} size="md" onClose={onClose} footer={
        <>
          <AppButton variant="outlined" disabled={saving} onClick={onClose}>Cancel</AppButton>
          <AppButton variant="contained" loading={saving} disabled={!sub || !display || dup} onClick={() => sub && onSave({ substation: sub, status: sub.builtBy, display: display as 'true' | 'false', year, remark })}>Save</AppButton>
        </>
      }>
        <div className="with-action" style={{ alignItems: 'flex-end' }}>
          <TextField label="Name" required value={sub?.name ?? ''} readOnly placeholder="Choose a substation" />
          <AppButton variant="contained" startIcon={<Search size={15} />} onClick={() => setPicking(true)}>Substation</AppButton>
        </div>
        {dup && <p className="error-text" role="alert">This substation is already in the list.</p>}
        <TextField label="Status" value={sub?.builtBy ?? ''} readOnly />
        {future && <TextField label="Commissioning year" type="number" value={year} onChange={setYear} />}
        {future && <TextField label="Remark" value={remark} onChange={setRemark} />}
        <RadioField label="Display in Smart Office?" required options={['true', 'false']} value={display} onChange={setDisplay} />
      </Modal>
      {picking && <SubstationPicker substations={substations} onDone={(s) => { setSub(s); setPicking(false) }} onClose={() => { setPicking(false); if (!sub) onClose() }} />}
    </>
  )
}
