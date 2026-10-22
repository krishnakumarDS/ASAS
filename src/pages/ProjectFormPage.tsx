import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Ban, FolderOpen, Plus, Power, Save } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import Section from '../components/common/Section'
import StatusChip from '../components/common/StatusChip'
import PageHeader from '../components/PageHeader'
import ProjectDiscussion from '../components/ProjectDiscussion'
import RemoteBadge from '../components/RemoteBadge'
import { SubstationEntryModal } from '../components/SubstationPicker'
import type { SubstationEntry } from '../components/SubstationPicker'
import { loadProject, loadProjectRemarks, loadProjectSubstations } from '../data/details'
import { userMessage } from '../data/api'
import { deleteRecord, saveRecord } from '../data/write'
import { useRemote } from '../data/remote'
import { syncEntity, useSyncStatus } from '../data/sync'
import { ActionsMenu, DataTable, LookupModal, Modal, PickField, RadioField, SelectField, Tabs, TextField, useToast } from '../components/ui'
import { fmtDate } from '../data/mock'
import { newId, setStored, useConsultants, useDevelopers, usePersistent, usePlots, useProjects, useSubstations } from '../data/store'
import { useAuth } from '../context/AuthContext'
import type { Project } from '../data/projects'

type Values = Record<string, string>
const emptyValues: Values = {
  ref: '', maalemNumber: '', maalemRef: '', name: '', areaMap: '', areaMapRef: '', areaReport: '', zone: '', subZone: '',
  built: '0', underConstruction: '0', vacant: '0', engineer: '', assistantEngineer: '', developer: '', consultant: '', masterPlanStatus: '', siteSurveyor: '',
  corridors: '', ducts: '', hvNoc: '', ss132: '0', ss400: '0', category: '',
}
const pick = <T,>(arr: T[], n: number) => arr[n % arr.length]
const ENG = ['KAM', 'FAS', 'OFA', 'YAM', 'SZ', 'RN']
/** Deterministic, varied defaults for a seeded project (so the sample data isn't identical across projects). */
const detailsFor = (p: Project): Values => {
  const n = Number(p.id) || 1
  const [a, b, c] = p.maalemRef.split('-')
  const built = pick([100, 80, 60, 45, 30, 0, 70, 90], n)
  const under = Math.min(100 - built, pick([0, 10, 25, 35, 40, 50], n))
  return { ...emptyValues, ref: c, maalemNumber: `${a}-${b}`, maalemRef: p.maalemRef, name: p.name, areaMap: n % 5 === 0 ? 'No' : 'Yes', areaMapRef: `17-${p.maalemRef}-${p.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8)}`,
    areaReport: pick(['Full', 'Partial', 'Pending'], n), zone: pick(['Zone 1', 'Zone 2', 'Zone 3'], n), subZone: pick(['B_E', 'A_N', 'C_S', 'D_W'], n + 1),
    built: String(built), underConstruction: String(under), vacant: String(100 - built - under),
    engineer: pick(ENG, n), assistantEngineer: pick(ENG, n + 2), developer: p.developer, consultant: p.consultant ?? '',
    masterPlanStatus: pick(['Approved', 'Approved', 'Under review', 'Draft'], n), siteSurveyor: n % 3 ? 'Yes' : 'No',
    corridors: pick(['Approved', 'Approved', 'Pending'], n), ducts: pick(['Approved', 'Pending', 'Approved'], n + 1),
    hvNoc: n % 2 ? `HV-${1000 + n * 7}` : '', ss132: String(n % 3), ss400: n % 7 === 0 ? '1' : '0', category: pick(['ASAP', 'Residential', 'Commercial', 'Mixed use', 'Industrial'], n) }
}
const required = ['ref', 'maalemNumber', 'maalemRef', 'name', 'areaMap', 'areaReport', 'subZone', 'engineer', 'developer', 'masterPlanStatus', 'siteSurveyor', 'corridors', 'ducts', 'category']
const opts = { areaReport: ['Full', 'Partial', 'Not available', 'Pending'], zone: ['Zone 1', 'Zone 2', 'Zone 3'], masterPlanStatus: ['Approved', 'Under review', 'Draft'], corridors: ['Approved', 'Pending', 'Not required'], category: ['ASAP', 'Residential', 'Commercial', 'Mixed use', 'Industrial'] }


const NO_SUBS: SubRow[] = []
const NO_REMARKS: Remark[] = []

type Picker = null | 'developer' | 'consultant'
interface SubRow { id: string; name: string; status: string; createdOn: string; createdBy: string; active: boolean; scada: string; commissioning?: string; substationId?: string; year?: string; remark?: string }
interface Remark { id: string; text: string; createdBy: string; createdOn: string; active: boolean }

export default function ProjectFormPage() {
  const { id = 'new' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projects] = useProjects()
  const [devs] = useDevelopers()
  const [cons] = useConsultants()
  const [allSubs] = useSubstations()
  const [allPlots] = usePlots()
  const project = projects.find((p) => p.id === id)
  const [saved] = usePersistent<Values | null>(`project:${id}:details`, null)
  const isNew = id === 'new'
  // Projects loaded from SQL have a non-numeric id (the Maalem reference): start from what the list knows, not from generated sample values.
  const fromDb = !isNew && !/^\d+$/.test(id)
  const [v, setV] = useState<Values>(isNew || !project ? emptyValues : fromDb ? { ...emptyValues, maalemRef: project.maalemRef, name: project.name, developer: project.developer, consultant: project.consultant ?? '' } : (saved ?? detailsFor(project)))
  const [editable, setEditable] = useState(isNew)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState('Project details')
  const [picker, setPicker] = useState<Picker>(null)
  const [toast, say] = useToast()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const seedExisting = useMemo<SubRow[]>(() => { const sub = /^\d+$/.test(id) ? allSubs[(Number(id) * 3) % Math.max(1, allSubs.length)] : undefined; return sub ? [{ id: `s${id}`, name: sub.name, status: sub.builtBy, createdOn: sub.createdOn, createdBy: sub.createdBy, active: true, scada: sub.scada }] : NO_SUBS }, [id])
  const [existing, setExisting] = usePersistent<SubRow[]>(`project:${id}:existing`, seedExisting)
  const [future, setFuture] = usePersistent<SubRow[]>(`project:${id}:future`, NO_SUBS)
  // The substation dialog: which table, and whether it adds a row or shows / edits an existing one.
  const [subModal, setSubModal] = useState<null | { kind: 'existing' | 'future'; mode: 'add' | 'view' | 'edit'; row?: SubRow }>(null)
  const [subSaving, setSubSaving] = useState(false)
  const [remarks, setRemarks] = usePersistent<Remark[]>(`project:${id}:remarks`, NO_REMARKS)
  const [remarkModal, setRemarkModal] = useState<null | 'new' | Remark>(null) // 'new' = add, a remark = edit it
  const [remarkSaving, setRemarkSaving] = useState(false)

  // Opening a project calls the flow for its details, substations, remarks and totals.
  const remote = useRemote(fromDb ? id : null, () => loadProject(id))
  useEffect(() => {
    const d = remote.data
    if (!d) return
    setV((p) => ({ ...p, ...d.values }))
  }, [remote.data, id])
  const totals = remote.data?.totals

  // The Remarks tab reads the project's remarks (with their row ids) when it is opened, and again after every change.
  const [remarksKey, setRemarksKey] = useState(0)
  const remarksRemote = useRemote(fromDb && tab === 'Remarks' ? `${id}:${remarksKey}` : null, () => loadProjectRemarks(id))
  useEffect(() => { if (remarksRemote.data) setStored(`project:${id}:remarks`, remarksRemote.data) }, [remarksRemote.data, id])

  // The Substation tab reads the project's existing and future substations (with their row ids) when it is opened, and again after every change.
  const [subsKey, setSubsKey] = useState(0)
  const subsRemote = useRemote(fromDb && tab === 'Substation' ? `${id}:${subsKey}` : null, () => loadProjectSubstations(id))
  useEffect(() => {
    const d = subsRemote.data
    if (!d) return
    setStored(`project:${id}:existing`, d.existing)
    setStored(`project:${id}:future`, d.future)
  }, [subsRemote.data, id])

  const ro = !editable
  const plotCount = allPlots.filter((x) => x.maalemRef === v.maalemRef).length
  const tcl = Math.round(plotCount * (8 + (Number(id) % 7) * 3.1))
  const set = (k: string, val: string) => { setV((p) => ({ ...p, [k]: val })); setErrors((e) => { const n = new Set(e); n.delete(k); return n }) }
  const err = (k: string) => (errors.has(k) ? 'This field is required' : undefined)
  const text = (k: string, label: string, type?: string) => <TextField label={label} value={v[k]} type={type} required={required.includes(k)} error={err(k)} readOnly={ro} onChange={(x) => set(k, x)} />
  const sel = (k: string, label: string, o: string[]) => <SelectField label={label} value={v[k]} options={v[k] && !o.includes(v[k]) ? [...o, v[k]] : o} required={required.includes(k)} error={err(k)} disabled={ro} onChange={(x) => set(k, x)} />
  const rad = (k: string, label: string) => <RadioField label={label} value={v[k]} required={required.includes(k)} error={err(k)} disabled={ro} onChange={(x) => set(k, x)} />

  const live = useSyncStatus().state === 'live'
  const [saving, setSaving] = useState(false)

  // Adding or editing a substation: search popup, then the confirm form; Save writes to SQL (existingKVSS.create / .update, projectFutureYear.create / .update).
  const addSubstation = async (e: SubstationEntry) => {
    const kind = subModal?.kind
    const editing = subModal?.mode === 'edit' ? subModal.row : undefined
    if (!kind) return
    if (!fromDb) { // a sample project that is not in the database: keep it in this browser only
      const set = kind === 'future' ? setFuture : setExisting
      const fields = { name: e.substation.name, status: e.status, active: e.display === 'true', scada: e.substation.scada, substationId: e.substation.id, commissioning: e.year, year: e.year }
      if (editing) set((p) => p.map((x) => (x.id === editing.id ? { ...x, ...fields } : x)))
      else set((p) => [...p, { id: newId(), createdOn: new Date().toISOString(), createdBy: user?.name ?? 'Unknown', ...fields }])
      setSubModal(null); say(editing ? 'Substation updated' : 'Substation added'); return
    }
    if (!live) { say('The server can’t be reached right now: nothing was saved. Please try again.'); return }
    setSubSaving(true)
    try {
      await saveRecord(kind === 'future' ? 'projectFutureYear' : 'existingKVSS', editing ? editing.id : null, {
        MaalemDubaiRef: id, SubstationID: Number(e.substation.id), Status: e.status, IsActive: e.display === 'true',
        ...(kind === 'future' ? { ProjectYear: e.year, ...(editing ? {} : { Remark: e.remark }) } : {}),
      }, user?.name)
      setSubsKey((k) => k + 1); setSubModal(null); say(editing ? 'Substation updated' : 'Substation added')
    } catch (err) { say(userMessage(err, editing ? 'Could not update the substation' : 'Could not add the substation')) }
    setSubSaving(false)
  }
  // Add / edit a remark: Save writes to UC000420_ProjectsRemarks (projectRemark.create / projectRemark.update).
  const saveRemark = async (r: Remark) => {
    const editing = remarkModal && remarkModal !== 'new' ? remarkModal : null
    if (!fromDb) { // a sample project that is not in the database: keep it in this browser only
      setRemarks((p) => (editing ? p.map((x) => (x.id === editing.id ? { ...x, text: r.text, active: r.active } : x)) : [...p, r])); setRemarkModal(null); say(editing ? 'Remark updated' : 'Remark added'); return
    }
    if (!live) { say('The server can’t be reached right now: nothing was saved. Please try again.'); return }
    setRemarkSaving(true)
    try {
      await saveRecord('projectRemark', editing ? editing.id : null, { MaalemDubaiRef: id, Remarks: r.text, IsActive: r.active }, user?.name)
      setRemarksKey((k) => k + 1); setRemarkModal(null); say(editing ? 'Remark updated' : 'Remark added')
    } catch (err) { say(userMessage(err, 'Could not save the remark')) }
    setRemarkSaving(false)
  }
  // "Delete" hides the remark (projectRemark.delete); it stays in the list as inactive.
  const removeRemark = async (r: Remark) => {
    if (!fromDb) { setRemarks((p) => p.filter((x) => x.id !== r.id)); say('Remark removed'); return }
    if (!live) { say('The server can’t be reached right now: nothing was changed. Please try again.'); return }
    try { await deleteRecord('projectRemark', r.id, user?.name); setRemarksKey((k) => k + 1); say('Remark removed') }
    catch (err) { say(userMessage(err, 'Could not remove the remark')) }
  }
  // "Delete" hides the row (existingKVSS.delete / projectFutureYear.delete); it stays in the list as inactive.
  const removeSubstation = async (kind: 'existing' | 'future', r: SubRow) => {
    if (!fromDb) { (kind === 'future' ? setFuture : setExisting)((p) => p.filter((x) => x.id !== r.id)); say('Substation removed'); return }
    if (!live) { say('The server can’t be reached right now: nothing was changed. Please try again.'); return }
    try { await deleteRecord(kind === 'future' ? 'projectFutureYear' : 'existingKVSS', r.id, user?.name); setSubsKey((k) => k + 1); say('Substation removed') }
    catch (err) { say(userMessage(err, 'Could not remove the substation')) }
  }
  // Save writes to SQL through the flow (project.create / project.update), links the consultant, then reloads the lists.
  const save = async () => {
    const missing = new Set(required.filter((k) => !v[k].trim()))
    setErrors(missing)
    if (missing.size) { say('Please fill the required fields'); return }
    if (!live) { say('The server can’t be reached right now: nothing was saved. Please try again.'); return }
    const devId = devs.find((d) => d.name === v.developer)?.id
    if (!devId) { say('Pick the developer from the list'); return }
    const conId = cons.find((c) => c.name === v.consultant)?.id
    const fields = {
      Ref: v.ref, MaalemDubaiNo: v.maalemNumber, MaalemDubaiRef: v.maalemRef, ProjectName: v.name, DeveloperID: devId,
      Engineer: v.engineer, AsstEng: v.assistantEngineer, MasterPlanStatus: v.masterPlanStatus, Corridors11kV: v.corridors, Ducts11kV: v.ducts,
      HVNOC: v.hvNoc, SiteSurveyor: v.siteSurveyor, AreaMap: v.areaMap, AreaMapRef: v.areaMapRef, AreaReport: v.areaReport,
      SS132kV: v.ss132, SS400kV: v.ss400, Zone: v.zone, SubZone: v.subZone, BuiltPerc: v.built, UCPerc: v.underConstruction, VPerc: v.vacant,
      ProjectCategory: v.category,
    }
    setSaving(true)
    try {
      const ref = await saveRecord('project', isNew ? null : id, fields, user?.name)
      let note = ''
      if (conId && (isNew || v.consultant !== (project?.consultant ?? ''))) {
        try { await saveRecord('projectConsultant', null, { MaalemDubaiRef: ref || v.maalemRef, ConsultantID: conId }, user?.name) }
        catch (e) { note = ` (the consultant link was not saved: ${userMessage(e, 'please try again')})` }
      }
      await syncEntity('projects')
      say(`Project saved${note}`)
      setTimeout(() => navigate('/projects'), note ? 2500 : 700)
    } catch (e) {
      say(userMessage(e, 'Could not save the project'))
    }
    setSaving(false)
  }
  const tabs = isNew ? ['Project details'] : ['Project details', 'Substation', 'Remarks', 'Discussion & decisions']

  return (
    <div className="page">
      <PageHeader title={isNew ? 'New project' : (project?.name ?? 'Project')} subtitle={isNew ? 'Fields marked * are required' : `REF# ${project?.maalemRef ?? id} · ${editable ? 'Editing' : 'View only — click Enable to edit'}`}
        badge={!isNew && <><StatusChip status={editable ? 'inprogress' : 'active'} label={editable ? 'Editing' : 'Active'} />{fromDb && <RemoteBadge state={remote} />}</>}
        actions={<>
          {!isNew && <AppButton variant="outlined" startIcon={<FolderOpen size={16} />} onClick={() => navigate(`/projects/${id}/files/Area Map`)}>Files</AppButton>}
          {!isNew && <AppButton variant="outlined" startIcon={editable ? <Ban size={16} /> : <Power size={16} />} onClick={() => setEditable(!editable)}>{editable ? 'Disable' : 'Enable'}</AppButton>}
          <AppButton variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/projects')}>Back</AppButton>
          {editable && <AppButton variant="contained" loading={saving} startIcon={<Save size={16} />} onClick={save}>Save</AppButton>}
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
                <div className="grid-auto"><TextField label="Total plots no" value={String(totals?.plots ?? plotCount)} readOnly /><TextField label="Total TCL (MW)" value={String(totals?.tcl ?? tcl)} readOnly /><TextField label="Total DCP (MW)" value={String(totals?.dcp ?? Math.round(tcl * 0.12))} readOnly /></div>
              </Section>
            )}
          </div>
        )}

        {tab === 'Substation' && (
          <div className="card-body stack">
            {(['existing', 'future'] as const).map((kind) => {
              const rows = kind === 'existing' ? existing : future
              return (
                <section key={kind} className="card" style={{ overflow: 'hidden' }}>
                  <div className="card-head"><h4>{kind === 'existing' ? 'Existing substations' : 'Future substations'}</h4><AppButton variant="contained" size="small" startIcon={<Plus size={15} />} onClick={() => setSubModal({ kind, mode: 'add' })}>Add</AppButton></div>
                  <DataTable<SubRow>
                    rows={rows} empty={`No ${kind} substations yet.`}
                    columns={[
                      ...(kind === 'future' ? [{ header: 'Commissioning', render: (r: SubRow) => r.commissioning || '—' }] : []),
                      { header: 'Name', render: (r) => <strong>{r.name}</strong> },
                      { header: 'Status', render: (r) => r.status },
                      { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
                      { header: 'Active', render: (r) => <StatusChip status={r.active ? 'active' : 'inactive'} label={String(r.active)} /> },
                      { header: 'SCADA', render: (r) => r.scada },
                      { header: '', align: 'right', render: (r) => <ActionsMenu items={[{ label: 'View', onClick: () => setSubModal({ kind, mode: 'view', row: r }) }, { label: 'Edit', onClick: () => setSubModal({ kind, mode: 'edit', row: r }) }, { label: 'Delete', danger: true, onClick: () => { void removeSubstation(kind, r) } }]} /> },
                    ]}
                  />
                </section>
              )
            })}
          </div>
        )}

        {tab === 'Remarks' && (
          <div>
            <div className="card-head"><h4>Remarks log</h4><AppButton variant="contained" size="small" startIcon={<Plus size={15} />} onClick={() => setRemarkModal('new')}>Add</AppButton></div>
            <DataTable<Remark>
              rows={remarks} empty="No remarks yet."
              columns={[
                { header: 'Remark', render: (r) => r.text },
                { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
                { header: 'Active', render: (r) => <StatusChip status={r.active ? 'active' : 'inactive'} label={String(r.active)} /> },
                { header: '', align: 'right', render: (r) => <ActionsMenu items={[{ label: 'Edit', onClick: () => setRemarkModal(r) }, { label: 'Delete', danger: true, onClick: () => { void removeRemark(r) } }]} /> },
              ]}
            />
          </div>
        )}

        {tab === 'Discussion & decisions' && <ProjectDiscussion projectId={id} />}
      </div>

      {picker === 'developer' && <LookupModal title="Select developer" items={devs.filter((d) => d.showInSO).map((d) => d.name)} onPick={(x) => set('developer', x)} onClose={() => setPicker(null)} />}
      {picker === 'consultant' && <LookupModal title="Select consultant" items={cons.filter((d) => d.showInSO).map((d) => d.name)} onPick={(x) => set('consultant', x)} onClose={() => setPicker(null)} />}
      {subModal && (() => {
        const { kind, mode, row } = subModal
        const list = kind === 'future' ? future : existing
        // the row's own substation is not "already in the list" while it is being edited
        const taken = new Set(list.filter((r) => r.active && r.id !== row?.id).map((r) => r.substationId ?? ''))
        const initial = row && { substation: allSubs.find((x) => x.id === row.substationId) ?? { id: row.substationId ?? '', name: row.name, scada: row.scada, builtBy: (/dewa/i.test(row.status) ? 'DEWA' : 'Developer') as 'DEWA' | 'Developer', showInSO: true, createdOn: '', createdBy: '' }, status: row.status, display: (row.active ? 'true' : 'false') as 'true' | 'false', year: row.year ?? (row.commissioning ?? '').split(' · ')[0] }
        return <SubstationEntryModal key={`${kind}-${mode}-${row?.id ?? 'new'}`} future={kind === 'future'} mode={mode} initial={initial} substations={allSubs.filter((x) => x.showInSO)} taken={taken} saving={subSaving} onClose={() => setSubModal(null)} onSave={addSubstation} />
      })()}
      {remarkModal && <RemarkModal initial={remarkModal === 'new' ? undefined : remarkModal} saving={remarkSaving} onClose={() => setRemarkModal(null)} onSave={saveRemark} />}
      {toast}
    </div>
  )
}

function RemarkModal({ initial, saving, onClose, onSave }: { initial?: Remark; saving?: boolean; onClose: () => void; onSave: (r: Remark) => void }) {
  const { user } = useAuth()
  const [text, setText] = useState(initial?.text ?? '')
  const [active, setActive] = useState(initial ? String(initial.active) : 'true')
  return (
    <Modal title="Project remarks" size="sm" onClose={onClose} footer={
      <>
        <AppButton variant="outlined" disabled={saving} onClick={onClose}>Cancel</AppButton>
        <AppButton variant="contained" loading={saving} disabled={!text.trim()} onClick={() => onSave({ id: initial?.id ?? newId(), text: text.trim(), createdBy: initial?.createdBy ?? user?.name ?? 'Unknown', createdOn: initial?.createdOn ?? new Date().toISOString(), active: active === 'true' })}>Save</AppButton>
      </>
    }>
      <TextField label="Remark log" required multiline value={text} onChange={setText} />
      <RadioField label="Is active?" required options={['true', 'false']} value={active} onChange={setActive} />
    </Modal>
  )
}
