import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, SlidersHorizontal } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import IconButton from '../components/common/IconButton'
import PageHeader from '../components/PageHeader'
import { AppInput, DataTable, FilterBar, Pager, RadioField, usePaged } from '../components/ui'
import { fmtDate, substations } from '../data/mock'
import type { Substation } from '../data/mock'

export default function SubstationsPage() {
  const navigate = useNavigate()
  const [scada, setScada] = useState('')
  const [name, setName] = useState('')
  const [built, setBuilt] = useState('')
  const [applied, setApplied] = useState({ scada: '', name: '', built: '' })
  const rows = useMemo(() => substations.filter((s) => s.scada.toLowerCase().includes(applied.scada.toLowerCase()) && s.name.toLowerCase().includes(applied.name.toLowerCase()) && (!applied.built || s.builtBy === applied.built)), [applied])
  const { visible, page, pages, setPage } = usePaged(rows, 10)

  return (
    <div className="page">
      <PageHeader title="Substations" subtitle="Substation records and SCADA names" back={false} actions={
        <>
          <AppButton variant="outlined" startIcon={<SlidersHorizontal size={16} />} onClick={() => navigate('/substations/limits')}>Standard limits</AppButton>
          <AppButton variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/substations/new')}>Add substation</AppButton>
        </>
      } />
      <FilterBar resultText={`${rows.length} substations`} onSearch={() => { setApplied({ scada, name, built }); setPage(1) }} onClear={() => { setScada(''); setName(''); setBuilt(''); setApplied({ scada: '', name: '', built: '' }) }}>
        <AppInput label="Substation name" placeholder="Search by name" value={name} onChange={(e) => setName(e.target.value)} />
        <AppInput label="SCADA name" placeholder="Search by SCADA name" value={scada} onChange={(e) => setScada(e.target.value)} />
        <RadioField label="Built by" options={['DEWA', 'Developer']} value={built} onChange={setBuilt} />
      </FilterBar>
      <div className="card reveal-item">
        <DataTable<Substation>
          rows={visible}
          columns={[
            { header: 'Substation', render: (r) => <><a href="#" className="link cell-title" onClick={(e) => { e.preventDefault(); navigate(`/substations/${r.id}`) }}>{r.name}</a><div className="cell-sub num">{r.scada}</div></> },
            { header: 'Built by', render: (r) => <span className={`badge ${r.builtBy === 'DEWA' ? 'badge-accent' : 'badge-neutral'}`}>{r.builtBy}</span> },
            { header: 'Smart Office', render: (r) => <span className={`badge ${r.showInSO ? 'badge-success' : 'badge-neutral'}`}>{r.showInSO ? 'Shown' : 'Hidden'}</span> },
            { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
            { header: '', align: 'right', render: (r) => <IconButton small title="Edit" aria-label="Edit" onClick={() => navigate(`/substations/${r.id}`)}><Pencil size={17} /></IconButton> },
          ]}
        />
        <Pager page={page} pages={pages} setPage={setPage} />
      </div>
    </div>
  )
}
