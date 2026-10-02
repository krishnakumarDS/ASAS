import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Ban, FolderOpen, Plus, Power, Save, X } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import Section from '../components/common/Section'
import StatusChip from '../components/common/StatusChip'
import PageHeader from '../components/PageHeader'
import ProjectAiReview, { reviewProject } from '../components/ProjectAiReview'
import ProjectDiscussion from '../components/ProjectDiscussion'
import { ActionsMenu, DataTable, LookupModal, Modal, PickField, RadioField, SelectField, Tabs, TextField, useToast } from '../components/ui'
import { fmtDate } from '../data/mock'
import type { Substation } from '../data/mock'
import { newId, setStored, useConsultants, useDevelopers, usePersistent, useProjects, useSubstations } from '../data/store'
import { useAuth } from '../context/AuthContext'
import type { Project } from '../data/projects'

type Values = Record<string, string>
const emptyValues: Values = {
  ref: '', maalemNumber: '', maalemRef: '', name: '', areaMap: '', areaMapRef: '', areaReport: '', zone: '', subZone: '',
  built: '0', underConstruction: '0', vacant: '0', engineer: '', assistantEngineer: '', developer: '', consultant: '', masterPlanStatus: '', siteSurveyor: '',
  corridors: '', ducts: '', hvNoc: '', ss132: '0', ss400: '0', category: '',
}
const detailsFor = (p: Project): Values => {
  const [a, b, c] = p.maalemRef.split('-')
  return { ...emptyValues, ref: c, maalemNumber: `${a}-${b}`, maalemRef: p.maalemRef, name: p.name, areaMap: 'Yes', areaMapRef: `17-${p.maalemRef}-${p.name.toUpperCase().slice(0, 8)}`, areaReport: 'Full', subZone: 'B_E',
    engineer: 'LBN', assistantEngineer: 'SRN', developer: p.developer, consultant: p.consultant ?? '', masterPlanStatus: 'Approved', siteSurveyor: 'Yes', corridors: 'Approved', ducts: 'Approved', ss132: '1', category: 'ASAP' }
}
const required = ['ref', 'maalemNumber', 'maalemRef', 'name', 'areaMap', 'areaReport', 'subZone', 'engineer', 'developer', 'masterPlanStatus', 'siteSurveyor', 'corridors', 'ducts', 'category']
const opts = { areaReport: ['Full', 'Partial', 'Not available', 'Pending'], zone: ['Zone 1', 'Zone 2', 'Zone 3'], masterPlanStatus: ['Approved', 'Under review', 'Draft'], corridors: ['Approved', 'Pending', 'Not required'], category: ['ASAP', 'Residential', 'Commercial', 'Mixed use', 'Industrial'] }

const LABELS: Record<string, string> = { ref: 'REF', maalemNumber: 'Maalem number', maalemRef: 'Maalem ref', name: 'Project name', areaMap: 'Area map', areaReport: 'Area report', subZone: 'Sub-zone', engineer: 'Engineer', developer: 'Developer', masterPlanStatus: 'Master plan status', siteSurveyor: 'Site surveyor', corridors: '11kV corridors', ducts: '11kV ducts', category: 'Category' }

const SEED_EXISTING: SubRow[] = [{ id: 's1', name: 'Towers of Kifaf', status: 'Developer', createdOn: '2025-11-13T08:19:45', createdBy: 'Mariam Mohamed Alhosani', active: true, scada: 'TWRKIFAF' }]
const NO_SUBS: SubRow[] = []
const NO_REMARKS: Remark[] = []

type Picker = null | 'developer' | 'consultant'
interface SubRow { id: string; name: string; status: string; createdOn: string; createdBy: string; active: boolean; scada: string; commissioning?: string }
interface Remark { id: string; text: string; createdBy: string; createdOn: string; active: boolean }

export default function ProjectFormPage() {
  const { id = 'new' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projects, setProjects] = useProjects()
  const [devs] = useDevelopers()
  const [cons] = useConsultants()
  const [allSubs] = useSubstations()
  const project = projects.find((p) => p.id === id)
  const [saved] = usePersistent<Values | null>(`project:${id}:details`, null)
  const isNew = id === 'new'
  const [v, setV] = useState<Values>(isNew || !project ? emptyValues : (saved ?? detailsFor(project)))
  const [editable, setEditable] = useState(isNew)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState('Project details')
  const [picker, setPicker] = useState<Picker>(null)
  const [toast, say] = useToast()
  const [existing, setExisting] = usePersistent<SubRow[]>(`project:${id}:existing`, /^\d+$/.test(id) ? SEED_EXISTING : NO_SUBS)
  const [future, setFuture] = usePersistent<SubRow[]>(`project:${id}:future`, NO_SUBS)
  const [subModal, setSubModal] = useState<null | 'existing' | 'future'>(null)
  const [remarks, setRemarks] = usePersistent<Remark[]>(`project:${id}:remarks`, NO_REMARKS)
  const [remarkModal, setRemarkModal] = useState(false)

  const ro = !editable
  const set = (k: string, val: string) => { setV((p) => ({ ...p, [k]: val })); setErrors((e) => { const n = new Set(e); n.delete(k); return n }) }
  const err = (k: string) => (errors.has(k) ? 'This field is required' : undefined)
  const text = (k: string, label: string, type?: string) => <TextField label={label} value={v[k]} type={type} required={required.includes(k)} error={err(k)} readOnly={ro} onChange={(x) => set(k, x)} />
  const sel = (k: string, label: string, o: string[]) => <SelectField label={label} value={v[k]} options={o} required={required.includes(k)} error={err(k)} disabled={ro} onChange={(x) => set(k, x)} />
  const rad = (k: string, label: string) => <RadioField label={label} value={v[k]} required={required.includes(k)} error={err(k)} disabled={ro} onChange={(x) => set(k, x)} />

  const save = () => {
    const missing = new Set(required.filter((k) => !v[k].trim()))
    setErrors(missing)
    if (missing.size) { say('Please fill the required fields'); return }
    const row = { maalemRef: v.maalemRef, name: v.name, developer: v.developer, consultant: v.consultant }
    if (isNew) {
      const nid = newId()
      setProjects((l) => [{ id: nid, ...row, createdBy: user?.name ?? 'Unknown', createdOn: new Date().toISOString(), display: false }, ...l])
      setStored(`project:${nid}:details`, v)
    } else {
      setProjects((l) => l.map((p) => (p.id === id ? { ...p, ...row } : p)))
      setStored(`project:${id}:details`, v)
    }
    say('Project saved'); setTimeout(() => navigate('/projects'), 700)
  }
  const tabs = isNew ? ['Project details'] : ['Project details', 'Substation', 'Remarks', 'AI review', 'Discussion & decisions']

  return (
    <div className="page">
      <PageHeader title={isNew ? 'New project' : (project?.name ?? 'Project')} subtitle={isNew ? 'Fields marked * are required' : `REF# ${project?.maalemRef ?? id} · ${editable ? 'Editing' : 'View only — click Enable to edit'}`}
        badge={!isNew && <StatusChip status={editable ? 'inprogress' : 'active'} label={editable ? 'Editing' : 'Active'} />}
        actions={<>
          {!isNew && <AppButton variant="outlined" startIcon={<FolderOpen size={16} />} onClick={() => navigate(`/projects/${id}/files/Area Map`)}>Files</AppButton>}
          {!isNew && <AppButton variant="outlined" startIcon={editable ? <Ban size={16} /> : <Power size={16} />} onClick={() => setEditable(!editable)}>{editable ? 'Disable' : 'Enable'}</AppButton>}
          <AppButton variant="outlined" startIcon={<X size={16} />} onClick={() => navigate('/projects')}>Close</AppButton>
          {editable && <AppButton variant="contained" startIcon={<Save size={16} />} onClick={save}>Save</AppButton>}
        </>} />

      {!isNew && (
        <div className="stats gap-section reveal">
          <div className="stat"><small>Developer</small><strong style={{ fontSize: 16 }}>{v.developer}</strong></div>
          <div className="stat"><small>Consultant</small><strong style={{ fontSize: 16 }}>{v.consultant || '—'}</strong></div>
          <div className="stat"><small>Master plan</small><div style={{ marginTop: 4 }}><StatusChip status={v.masterPlanStatus === 'Approved' ? 'approved' : 'pending'} label={v.masterPlanStatus || '—'} /></div></div>
          <div className="stat"><small>Category</small><div style={{ marginTop: 4 }}><span className="badge badge-accent">{v.category || '—'}</span></div></div>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />

        {tab === 'Project details' && (
          <div className="card-body stack">
            <Section title="Identification" index={0}>
              <div className="grid-auto">{text('ref', 'REF')}{text('maalemNumber', 'Maalem Dubai number')}{text('maalemRef', 'Maalem Dubai ref')}{text('name', 'Project name')}</div>
            </Section>
            <Section title="Area & zoning" index={1}>
              <div className="grid-auto">{rad('areaMap', 'Area map')}{text('areaMapRef', 'Area map ref')}{sel('areaReport', 'Area report', opts.areaReport)}{sel('zone', 'Zone', opts.zone)}{text('subZone', 'Sub-zone')}</div>
            </Section>
            <Section title="Development status (%)" index={2}>
              <div className="grid-auto">{text('built', 'Built %', 'number')}{text('underConstruction', 'Under construction %', 'number')}{text('vacant', 'Vacant %', 'number')}</div>
            </Section>
            <Section title="Stakeholders" index={3}>
              <div className="grid-auto">
                {text('engineer', 'Engineer')}{text('assistantEngineer', 'Assistant engineer')}
                <PickField label="Developer name" required value={v.developer} error={err('developer')} disabled={ro} buttonLabel="Developer" onPick={() => setPicker('developer')} />
                <PickField label="Consultant name" value={v.consultant} disabled={ro} buttonLabel="Consultant" onPick={() => setPicker('consultant')} />
              </div>
            </Section>
            <Section title="Planning & infrastructure" index={4}>
              <div className="grid-auto">
                {sel('masterPlanStatus', 'Master plan status', opts.masterPlanStatus)}{rad('siteSurveyor', 'Site surveyor')}{sel('corridors', '11kV corridors', opts.corridors)}{sel('ducts', '11kV ducts', opts.corridors)}
                {text('hvNoc', 'HV NOC')}{text('ss132', '132kV SS', 'number')}{text('ss400', '400kV SS', 'number')}{sel('category', 'Project category', opts.category)}
              </div>
            </Section>
            {!isNew && (
              <Section title="Totals" index={5}>
                <div className="grid-auto"><TextField label="Total plots no" value="22" readOnly /><TextField label="Total TCL (MW)" value="327" readOnly /><TextField label="Total DCP (MW)" value="40" readOnly /></div>
              </Section>
            )}
          </div>
        )}

        {tab === 'Substation' && (
          <div className="card-body stack">
            {(['existing', 'future'] as const).map((kind) => {
              const rows = kind === 'existing' ? existing : future
              const setRows = kind === 'existing' ? setExisting : setFuture
              return (
                <section key={kind} className="card" style={{ overflow: 'hidden' }}>
                  <div className="card-head"><h4>{kind === 'existing' ? 'Existing substations' : 'Future substations'}</h4><AppButton variant="contained" size="small" startIcon={<Plus size={15} />} onClick={() => setSubModal(kind)}>Add</AppButton></div>
                  <DataTable<SubRow>
                    rows={rows} empty={`No ${kind} substations yet.`}
                    columns={[
                      ...(kind === 'future' ? [{ header: 'Commissioning', render: (r: SubRow) => r.commissioning || '—' }] : []),
                      { header: 'Name', render: (r) => <strong>{r.name}</strong> },
                      { header: 'Status', render: (r) => r.status },
                      { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
                      { header: 'Active', render: (r) => <StatusChip status={r.active ? 'active' : 'inactive'} label={String(r.active)} /> },
                      { header: 'SCADA', render: (r) => r.scada },
                      { header: '', align: 'right', render: (r) => <ActionsMenu items={[{ label: 'Delete', danger: true, onClick: () => { setRows(rows.filter((x) => x.id !== r.id)); say('Substation removed') } }]} /> },
                    ]}
                  />
                </section>
              )
            })}
          </div>
        )}

        {tab === 'Remarks' && (
          <div>
            <div className="card-head"><h4>Remarks log</h4><AppButton variant="contained" size="small" startIcon={<Plus size={15} />} onClick={() => setRemarkModal(true)}>Add</AppButton></div>
            <DataTable<Remark>
              rows={remarks} empty="No remarks yet."
              columns={[
                { header: 'Remark', render: (r) => r.text },
                { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
                { header: 'Active', render: (r) => <StatusChip status={r.active ? 'active' : 'inactive'} label={String(r.active)} /> },
                { header: '', align: 'right', render: (r) => <ActionsMenu items={[{ label: 'Delete', danger: true, onClick: () => setRemarks(remarks.filter((x) => x.id !== r.id)) }]} /> },
              ]}
            />
          </div>
        )}

        {tab === 'AI review' && <ProjectAiReview run={() => reviewProject(v, required, LABELS)} />}
        {tab === 'Discussion & decisions' && <ProjectDiscussion projectId={id} />}
      </div>

      {picker === 'developer' && <LookupModal title="Select developer" items={devs.map((d) => d.name)} onPick={(x) => set('developer', x)} onClose={() => setPicker(null)} />}
      {picker === 'consultant' && <LookupModal title="Select consultant" items={cons.map((d) => d.name)} onPick={(x) => set('consultant', x)} onClose={() => setPicker(null)} />}
      {subModal && <SubstationModal all={allSubs} future={subModal === 'future'} onClose={() => setSubModal(null)} onSave={(r) => { (subModal === 'future' ? setFuture : setExisting)((p) => [...p, r]); setSubModal(null); say('Substation added') }} />}
      {remarkModal && <RemarkModal onClose={() => setRemarkModal(false)} onSave={(r) => { setRemarks((p) => [...p, r]); setRemarkModal(false); say('Remark added') }} />}
      {toast}
    </div>
  )
}

function SubstationModal({ all, future, onClose, onSave }: { all: Substation[]; future: boolean; onClose: () => void; onSave: (r: SubRow) => void }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [commissioning, setCommissioning] = useState('')
  const sub = all.find((s) => s.name === name)
  return (
    <Modal title={future ? 'Add future substation' : 'Add existing substation'} size="sm" onClose={onClose} footer={
      <>
        <AppButton variant="outlined" onClick={onClose}>Cancel</AppButton>
        <AppButton variant="contained" disabled={!name} onClick={() => onSave({ id: newId(), name, status: sub?.builtBy ?? '', createdOn: new Date().toISOString(), createdBy: user?.name ?? 'Unknown', active: true, scada: sub?.scada ?? '', commissioning })}>Save</AppButton>
      </>
    }>
      <SelectField label="Substation" required value={name} options={all.map((s) => s.name)} onChange={setName} />
      {future && <TextField label="Commissioning date" type="date" value={commissioning} onChange={setCommissioning} />}
    </Modal>
  )
}

function RemarkModal({ onClose, onSave }: { onClose: () => void; onSave: (r: Remark) => void }) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [active, setActive] = useState('true')
  return (
    <Modal title="Project remarks" size="sm" onClose={onClose} footer={
      <>
        <AppButton variant="outlined" onClick={onClose}>Cancel</AppButton>
        <AppButton variant="contained" disabled={!text.trim()} onClick={() => onSave({ id: newId(), text, createdBy: user?.name ?? 'Unknown', createdOn: new Date().toISOString(), active: active === 'true' })}>Save</AppButton>
      </>
    }>
      <TextField label="Remark log" required multiline value={text} onChange={setText} />
      <RadioField label="Is active?" required options={['true', 'false']} value={active} onChange={setActive} />
    </Modal>
  )
}
