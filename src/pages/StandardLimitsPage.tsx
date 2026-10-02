import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import PageHeader from '../components/PageHeader'
import { ActionsMenu, DataTable, Modal, RadioField, TextField, useToast } from '../components/ui'
import { fmtDate } from '../data/mock'
import { newId, useLimits } from '../data/store'
import type { StandardLimit } from '../data/mock'

export default function StandardLimitsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useLimits()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [show, setShow] = useState('')
  const [toast, say] = useToast()
  const reset = () => { setOpen(false); setAmount(''); setDesc(''); setShow('') }

  return (
    <div className="page">
      <PageHeader title="Standard limits" subtitle="Substation standard limit settings" actions={
        <>
          <AppButton variant="outlined" startIcon={<X size={16} />} onClick={() => navigate('/substations')}>Close</AppButton>
          <AppButton variant="contained" startIcon={<Plus size={16} />} onClick={() => setOpen(true)}>Add limit</AppButton>
        </>
      } />
      <div className="card reveal-item">
        <DataTable<StandardLimit>
          rows={rows}
          columns={[
            { header: 'Limit', render: (r) => <strong className="num">{r.amount}</strong> },
            { header: 'Description', render: (r) => r.description },
            { header: 'Smart Office', render: (r) => <span className={`badge ${r.showInSO ? 'badge-success' : 'badge-neutral'}`}>{r.showInSO ? 'Yes' : 'No'}</span> },
            { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
            { header: '', align: 'right', render: (r) => <ActionsMenu items={[{ label: 'Delete', danger: true, onClick: () => setRows(rows.filter((x) => x.id !== r.id)) }]} /> },
          ]}
        />
      </div>
      {open && (
        <Modal title="Substation standard limit" size="sm" onClose={reset} footer={
          <>
            <AppButton variant="outlined" onClick={reset}>Cancel</AppButton>
            <AppButton variant="contained" disabled={!amount || !desc || !show} onClick={() => { setRows((p) => [...p, { id: newId(), amount, description: desc, showInSO: show === 'Yes', createdOn: new Date().toISOString(), createdBy: 'venkat reddy' }]); reset(); say('Limit added') }}>Save</AppButton>
          </>
        }>
          <TextField label="Standard limit amount" required value={amount} onChange={setAmount} />
          <TextField label="Standard limit description" required value={desc} onChange={setDesc} />
          <RadioField label="Show in Smart Office?" required value={show} onChange={setShow} />
        </Modal>
      )}
      {toast}
    </div>
  )
}
