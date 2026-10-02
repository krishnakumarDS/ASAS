import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, SlidersHorizontal, Sparkles } from 'lucide-react'
import AiUpload, { FIELDS } from '../components/AiUpload'
import AppButton from '../components/common/AppButton'
import IconButton from '../components/common/IconButton'
import PageHeader from '../components/PageHeader'
import { AiSearchBar, DataTable, Pager, matchQuery, usePaged, useSort, useToast } from '../components/ui'
import { fmtDate } from '../data/mock'
import { newId, useSubstations } from '../data/store'
import type { Substation } from '../data/mock'

const SUGGEST = ['built by DEWA', 'Developer', 'hidden in smart office', 'Remraam']

export default function SubstationsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useSubstations()
  const [q, setQ] = useState('')
  const [upload, setUpload] = useState(false)
  const [toast, say] = useToast()
  const filtered = useMemo(() => rows.filter((s) => matchQuery(`${s.name} ${s.scada} ${s.builtBy} ${s.showInSO ? 'shown smart office' : 'hidden smart office'} ${s.createdBy}`, q)), [rows, q])
  const { sorted, sortFor } = useSort(filtered, { name: (s) => s.name, builtBy: (s) => s.builtBy, so: (s) => String(s.showInSO), created: (s) => s.createdOn })
  const { visible, page, pages, setPage } = usePaged(sorted, 10)

  return (
    <div className="page">
      <PageHeader title="Substations" subtitle="Substation records, SCADA names and standard limits" back={false} actions={
        <>
          <AppButton variant="outlined" startIcon={<Sparkles size={16} />} onClick={() => setUpload(true)}>AI upload</AppButton>
          <AppButton variant="outlined" startIcon={<SlidersHorizontal size={16} />} onClick={() => navigate('/substations/limits')}>Standard limits</AppButton>
          <AppButton variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/substations/new')}>Add substation</AppButton>
        </>
      } />
      <AiSearchBar value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder="Ask in plain words — e.g. “substations built by developer”" suggestions={SUGGEST} resultText={`${filtered.length} of ${rows.length} substations`} />
      <div className="card reveal-item">
        <DataTable<Substation>
          rows={visible} empty="No substations match your search."
          columns={[
            { header: 'Substation', sort: sortFor('name'), render: (r) => <><a href="#" className="link cell-title" onClick={(e) => { e.preventDefault(); navigate(`/substations/${r.id}`) }}>{r.name}</a><div className="cell-sub num">{r.scada}</div></> },
            { header: 'Built by', sort: sortFor('builtBy'), render: (r) => <span className={`badge ${r.builtBy === 'DEWA' ? 'badge-accent' : 'badge-neutral'}`}>{r.builtBy}</span> },
            { header: 'Smart Office', sort: sortFor('so'), render: (r) => <span className={`badge ${r.showInSO ? 'badge-success' : 'badge-neutral'}`}>{r.showInSO ? 'Shown' : 'Hidden'}</span> },
            { header: 'Created', sort: sortFor('created'), render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
            { header: '', align: 'right', render: (r) => <IconButton small title="Edit" aria-label="Edit" onClick={() => navigate(`/substations/${r.id}`)}><Pencil size={17} /></IconButton> },
          ]}
        />
        <Pager page={page} pages={pages} setPage={setPage} />
      </div>
      {upload && <AiUpload entity="Substations" fields={FIELDS.substations} onClose={() => setUpload(false)} onImport={(imp) => {
        setRows((r) => [...imp.map((o): Substation => ({ id: newId(), name: o.name, scada: o.scada, builtBy: /dewa/i.test(o.builtBy ?? '') ? 'DEWA' : 'Developer', showInSO: true, createdOn: new Date().toISOString(), createdBy: 'AI upload' })), ...r])
        say(`${imp.length} substations imported`)
      }} />}
      {toast}
    </div>
  )
}
