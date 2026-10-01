import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import Section from '../components/common/Section'
import PageHeader from '../components/PageHeader'
import { DataTable, RadioField, SelectField, Tabs, TextField, useToast } from '../components/ui'
import { standardLimits, substations } from '../data/mock'

export default function SubstationFormPage() {
  const { id = 'new' } = useParams()
  const navigate = useNavigate()
  const existing = substations.find((s) => s.id === id)
  const isNew = !existing
  const [name, setName] = useState(existing?.name ?? '')
  const [show, setShow] = useState(existing ? (existing.showInSO ? 'Yes' : 'No') : '')
  const [scada, setScada] = useState(existing?.scada ?? '')
  const [builtBy, setBuiltBy] = useState<string>(existing?.builtBy ?? '')
  const [limit, setLimit] = useState(existing?.limit ?? '')
  const [tab, setTab] = useState('Substation details')
  const [submitted, setSubmitted] = useState(false)
  const [toast, say] = useToast()
  const e = (v: string) => (submitted && !v ? 'This field is required' : undefined)
  const save = () => {
    setSubmitted(true)
    if (!name || !show || !scada || !builtBy || (!isNew && !limit)) return
    say('Substation saved'); setTimeout(() => navigate('/substations'), 900)
  }

  return (
    <div className="page">
      <PageHeader title={isNew ? 'New substation' : existing.name} subtitle={isNew ? 'Fields marked * are required' : `SCADA: ${existing.scada}`} actions={
        <>
          <AppButton variant="outlined" startIcon={<X size={16} />} onClick={() => navigate('/substations')}>Close</AppButton>
          <AppButton variant="contained" startIcon={<Save size={16} />} onClick={save}>Save</AppButton>
        </>
      } />
      <div className="card" style={{ overflow: 'hidden' }}>
        <Tabs tabs={isNew ? ['Substation details'] : ['Substation details', 'Limit history']} active={tab} onChange={setTab} />
        {tab === 'Substation details' ? (
          <div className="card-body" style={{ maxWidth: 820 }}>
            <Section title="Details">
              <div className="grid-auto">
                <TextField label="Substation name" required value={name} error={e(name)} onChange={setName} />
                <TextField label="Substation SCADA name" required value={scada} error={e(scada)} onChange={setScada} />
                <SelectField label="Built by" required value={builtBy} options={['DEWA', 'Developer']} error={e(builtBy)} onChange={setBuiltBy} />
                <RadioField label="Show in Smart Office?" required value={show} error={e(show)} onChange={setShow} />
                {!isNew && <SelectField label="Limit" required value={limit} options={standardLimits.map((l) => l.amount)} error={e(limit)} onChange={setLimit} />}
              </div>
            </Section>
          </div>
        ) : (
          <DataTable rows={standardLimits.slice(0, 0)} empty="No limit history for this substation."
            columns={[{ header: 'Limit amount', render: () => '' }, { header: 'Description', render: () => '' }, { header: 'Created on', render: () => '' }, { header: 'Created by', render: () => '' }, { header: 'Smart Office', render: () => '' }]} />
        )}
      </div>
      {toast}
    </div>
  )
}
