import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import PageHeader from '../components/PageHeader'
import RemoteBadge from '../components/RemoteBadge'
import { loadSubstation } from '../data/details'
import { userMessage } from '../data/api'
import { saveRecord } from '../data/write'
import { useRemote } from '../data/remote'
import { syncEntity, useSyncStatus } from '../data/sync'
import StatusChip from '../components/common/StatusChip'
import { DataTable, RadioField, SelectField, Tabs, TextField, useToast } from '../components/ui'
import { fmtDate } from '../data/mock'
import { useSubstations } from '../data/store'
import { useAuth } from '../context/AuthContext'

export default function SubstationFormPage() {
  const { id = 'new' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [substations] = useSubstations()
  const existing = substations.find((s) => s.id === id)
  const isNew = !existing
  const [name, setName] = useState(existing?.name ?? '')
  const [show, setShow] = useState(existing ? (existing.showInSO ? 'Yes' : 'No') : '')
  const [scada, setScada] = useState(existing?.scada ?? '')
  const [builtBy, setBuiltBy] = useState<string>(existing?.builtBy ?? '')
  // Opening a substation calls the flow for its details, limits, totals and the projects it serves.
  const live = useSyncStatus().state === 'live'
  const remote = useRemote(existing && live ? existing.id : null, () => loadSubstation(existing!.id))
  useEffect(() => {
    const d = remote.data
    if (!d) return
    setName(d.name); setScada(d.scada); if (d.builtBy) setBuiltBy(d.builtBy)
  }, [remote.data])
  const detail = remote.data
  const [tab, setTab] = useState('Substation Details')
  const [submitted, setSubmitted] = useState(false)
  const [toast, say] = useToast()
  const e = (v: string) => (submitted && !v ? 'This field is required' : undefined)
  const [saving, setSaving] = useState(false)
  // Save writes to SQL through the flow (substation.create / substation.update), then reloads the lists.
  const save = async () => {
    setSubmitted(true)
    if (!name || !show || !scada || !builtBy) return
    if (!live) { say('The server can’t be reached right now: nothing was saved. Please try again.'); return }
    setSaving(true)
    try {
      await saveRecord('substation', existing ? existing.id : null, { SubstationName: name, SubstationSCADAName: scada, BuiltBy: builtBy, IsActive: show === 'Yes' }, user?.name)
      await syncEntity('substations')
      say('Substation saved'); setTimeout(() => navigate('/substations'), 700)
    } catch (err) {
      say(userMessage(err, 'Could not save the substation'))
    }
    setSaving(false)
  }

  return (
    <div className="page">
      <PageHeader title={isNew ? 'New substation' : existing.name} badge={!isNew && <RemoteBadge state={remote} />} subtitle={isNew ? 'Fields marked * are required' : `SCADA: ${existing.scada}`} actions={
        <>
          <AppButton variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/substations')}>Back</AppButton>
          <AppButton variant="contained" loading={saving} startIcon={<Save size={16} />} onClick={save}>Save</AppButton>
        </>
      } />
      <div className="card" style={{ overflow: 'hidden' }}>
        <Tabs tabs={isNew ? ['Substation Details'] : ['Substation Details', 'Limit History', 'Projects']} active={tab} onChange={setTab} />
        {tab === 'Substation Details' ? (
          <div className="card-body" style={{ maxWidth: 820 }}>
            <TextField label="Substation Name" required value={name} error={e(name)} onChange={setName} />
            <RadioField label="Show in Smart Office?" required value={show} error={e(show)} onChange={setShow} />
            <TextField label="Substation SCADA Name" required value={scada} error={e(scada)} onChange={setScada} />
            <SelectField label="Built By" required value={builtBy} options={['DEWA', 'Developer']} error={e(builtBy)} onChange={setBuiltBy} />
            {!isNew && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: 20 }}>
                  <TextField label="Limit Amount" value={detail?.limits[0]?.amount ?? ''} readOnly />
                  <TextField label="Limit Description" value={detail?.limits[0]?.description ?? ''} readOnly />
                </div>
                <TextField label="Total Plots" value={detail?.totals.plots != null ? String(detail.totals.plots) : ''} readOnly />
                <TextField label="Total TCL" value={detail?.totals.tcl != null ? String(detail.totals.tcl) : ''} readOnly />
                <TextField label="Total DCP" value={detail?.totals.dcp != null ? String(detail.totals.dcp) : ''} readOnly />
              </>
            )}
          </div>
        ) : tab === 'Limit History' ? (
          <DataTable rows={detail?.history.length ? detail.history : (detail?.limits ?? []).map((l) => ({ ...l, createdOn: '', createdBy: '', active: true }))} empty="No limits for this substation."
            columns={[
              { header: 'Limit Amount', render: (r) => r.amount },
              { header: 'Limit Description', render: (r) => r.description },
              { header: 'Created On', render: (r) => (r.createdOn ? fmtDate(r.createdOn) : '—') },
              { header: 'Created by', render: (r) => r.createdBy || '—' },
              { header: 'Show in Smart Office', render: (r) => <StatusChip status={r.active ? 'active' : 'inactive'} label={String(r.active)} /> },
            ]} />
        ) : (
          <div>
            <div className="card-body"><div className="stats">
              <div className="stat"><small>Total plots</small><strong>{detail?.totals.plots ?? '—'}</strong></div>
              <div className="stat"><small>Total TCL (MW)</small><strong>{detail?.totals.tcl ?? '—'}</strong></div>
              <div className="stat"><small>Total DCP (MW)</small><strong>{detail?.totals.dcp ?? '—'}</strong></div>
            </div></div>
            <DataTable rows={detail?.projects ?? []} empty="No projects are fed from this substation."
              columns={[
                { header: 'Project', render: (r) => <><a href="#" className="link cell-title" onClick={(e) => { e.preventDefault(); navigate(`/projects/${r.id}`) }}>{r.name}</a><div className="cell-sub num">{r.ref}</div></> },
                { header: 'Plots', render: (r) => r.plots },
                { header: 'TCL (MW)', render: (r) => r.tcl },
              ]} />
          </div>
        )}
      </div>
      {toast}
    </div>
  )
}
