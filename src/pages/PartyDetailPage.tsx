import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImageIcon, Pencil, Plus, Save, Search, Trash2, Upload } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import Section from '../components/common/Section'
import PageHeader from '../components/PageHeader'
import StatusChip from '../components/common/StatusChip'
import RemoteBadge from '../components/RemoteBadge'
import { callApi } from '../data/api'
import { userMessage } from '../data/api'
import { deleteRecord, setActiveRecord } from '../data/write'
import { loadParty } from '../data/details'
import { useRemote } from '../data/remote'
import { syncEntity, useSyncStatus } from '../data/sync'
import { ActionsMenu, DataTable, Modal, RadioField, SelectField, Tabs, TextField, useToast } from '../components/ui'
import { fmtDate } from '../data/mock'
import type { Party } from '../data/mock'
import { newId, setStored, useConsultants, useDevelopers, usePersistent, useProjects } from '../data/store'
import { useAuth } from '../context/AuthContext'
import { kindMeta } from './PartiesListPage'
import type { Kind } from './PartiesListPage'

interface Issue { id: string; ref: string; project: string; description: string; createdBy: string; createdOn: string; showInSO: boolean }

const NO_ISSUES: Issue[] = []

export default function PartyDetailPage({ kind }: { kind: Kind }) {
  const m = kindMeta[kind]
  const other = kind === 'consultant' ? 'Developers' : 'Consultants'
  const { id = 'new' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projects] = useProjects()
  const [devs] = useDevelopers()
  const [cons] = useConsultants()
  const list: Party[] = kind === 'developer' ? devs : cons
  const party = list.find((p) => p.id === id)
  const isNew = !party
  const [edit, setEdit] = useState(isNew)
  const [name, setName] = useState(party?.name ?? '')
  const [url, setUrl] = useState(party?.url ?? '')
  const [show, setShow] = useState(party ? (party.showInSO ? 'Yes' : 'No') : '')
  const [savedImage] = usePersistent<string>(`party:${kind}:${id}:image`, '')
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const image = pendingImage ?? savedImage
  const pickImage = (f?: File) => {
    if (!f) return
    if (f.size > 400_000) { say('Image is too large — use one under 400 KB'); return }
    const r = new FileReader()
    r.onload = () => setPendingImage(String(r.result))
    r.readAsDataURL(f)
  }
  const [tab, setTab] = useState('Main details')
  const [submitted, setSubmitted] = useState(false)
  const [issues, setIssues] = usePersistent<Issue[]>(`party:${kind}:${id}:issues`, NO_ISSUES)
  const [issueModal, setIssueModal] = useState(false)
  const [fRef, setFRef] = useState('')
  const [fName, setFName] = useState('')
  const [fBy, setFBy] = useState('')
  const [toast, say] = useToast()

  // Opening a developer/consultant calls the flow for its profile, issues, projects and totals.
  const live = useSyncStatus().state === 'live'
  const remote = useRemote(party && live ? party.id : null, () => loadParty(kind, id))
  useEffect(() => {
    const d = remote.data
    if (!d) return
    if (d.url) setUrl(d.url)
    setStored(`party:${kind}:${id}:issues`, d.issues)
  }, [remote.data, kind, id])
  const totals = remote.data?.totals

  const related = projects.filter((p) => (kind === 'consultant' ? p.consultant === name : p.developer.split(' (')[0] === name.split(' (')[0] || p.developer === name))
  const others = [...new Set(related.map((p) => (kind === 'consultant' ? p.developer : p.consultant)).filter(Boolean))]
  const tabs = isNew ? ['Main details'] : edit ? ['Main details', 'Issues'] : ['Main details', 'Issues', 'Projects', other]
  const match = (a: string, b: string) => a.toLowerCase().includes(b.toLowerCase())
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  // Restore: show a deleted (inactive) record again (developer.setActive / consultant.setActive).
  const restore = async () => {
    if (!live) { say('The server can’t be reached right now: nothing was changed. Please try again.'); return }
    setBusy(true)
    try { await setActiveRecord(kind, id, true, user?.name); await syncEntity(kind === 'developer' ? 'developers' : 'consultants'); setShow('Yes'); say(`${m.one} restored`) }
    catch (e) { say(userMessage(e, 'Could not restore')) }
    setBusy(false)
  }
  // Delete writes to SQL (developer.delete / consultant.delete): the row is hidden (IsActive = 0), not removed.
  const remove = async () => {
    if (!live) { say('The server can’t be reached right now: nothing was changed. Please try again.'); return }
    setBusy(true)
    try { await deleteRecord(kind, id, user?.name); await syncEntity(kind === 'developer' ? 'developers' : 'consultants'); say(`${m.one} deleted (hidden)`); setTimeout(() => navigate(m.path), 700) }
    catch (e) { say(userMessage(e, 'Could not delete')) }
    setBusy(false)
  }
  // Save writes to SQL through the flow (developer.create / developer.update, consultant.create / consultant.update), then reloads the lists.
  const save = async () => {
    setSubmitted(true)
    if (!name.trim()) return
    if (!live) { say('The server can’t be reached right now: nothing was saved. Please try again.'); return }
    const fields = {
      [kind === 'developer' ? 'developerName' : 'consultantName']: name.trim(),
      [kind === 'developer' ? 'developerURL' : 'consultantURL']: url.trim() || null,
      ...(show ? { isActive: show === 'Yes' } : {}),
      user: user?.name || user?.email,
    }
    setBusy(true)
    try {
      const res = await callApi(`${kind}.${isNew ? 'create' : 'update'}`, isNew ? fields : { id, ...fields })
      // The logo is a Documentum file and is not stored in SQL here: it stays in this browser only.
      if (pendingImage) setStored(`party:${kind}:${isNew ? String(res[0]?.[0]?.Id ?? id) : id}:image`, pendingImage)
      setPendingImage(null)
      await syncEntity(kind === 'developer' ? 'developers' : 'consultants')
      say(`${m.one} saved`)
      setTimeout(() => (isNew ? navigate(m.path) : setEdit(false)), 700)
    } catch (e) {
      say(userMessage(e, 'Could not save'))
    }
    setBusy(false)
  }
  const initials = name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div className="page">
      <PageHeader badge={!isNew && <RemoteBadge state={remote} />} title={isNew ? `New ${m.one.toLowerCase()}` : name} subtitle={isNew ? undefined : `${m.one} · created ${fmtDate(party?.createdOn ?? '')}`} actions={
        <>
          <AppButton variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate(m.path)}>Back</AppButton>
          {!isNew && !edit && show === 'Yes' && <AppButton variant="outlined" color="error" startIcon={<Trash2 size={16} />} onClick={() => setConfirmDelete(true)}>Delete</AppButton>}
          {!isNew && !edit && show === 'No' && <AppButton variant="contained" loading={busy} onClick={restore}>Restore</AppButton>}
          {edit ? <AppButton variant="contained" loading={busy} startIcon={<Save size={16} />} onClick={save}>Save</AppButton>
            : <AppButton variant="contained" startIcon={<Pencil size={16} />} onClick={() => setEdit(true)}>Edit</AppButton>}
        </>
      } />

      {!isNew && (
        <section className="card hero gap-section reveal">
          <div className="row wrap" style={{ gap: 20, position: 'relative' }}>
            <span className="avatar lg">{initials}</span>
            <div className="grow">
              <h3 style={{ fontSize: 22 }}>{name}</h3>
              <div className="row wrap" style={{ marginTop: 8 }}>
                <StatusChip status={show === 'Yes' ? 'active' : 'hidden'} label={show === 'Yes' ? 'Shown in Smart Office' : 'Hidden in Smart Office'} />
                {url && <a className="link" href={url} target="_blank" rel="noreferrer">{url}</a>}
              </div>
            </div>
            <div className="stats" style={{ minWidth: 280 }}>
              <div className="stat"><small>Projects</small><strong>{related.length}</strong></div>
              <div className="stat"><small>{other}</small><strong>{others.length}</strong></div>
            </div>
          </div>
        </section>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />

        {tab === 'Main details' && (
          <div className="card-body" style={{ maxWidth: 900 }}>
            <Section title="Profile">
              <div className="row wrap" style={{ gap: 24, alignItems: 'flex-start' }}>
                <div style={{ width: 140 }}>
                  <div className="avatar lg" style={{ width: 140, height: 120, borderStyle: 'dashed', borderRadius: 'var(--radius-lg)' }}>{image ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> : <span className="muted" style={{ textAlign: 'center', fontSize: 12 }}><ImageIcon size={26} /><br />No image</span>}</div>
                  {edit && <AppButton component="label" variant="outlined" fullWidth size="small" startIcon={<Upload size={14} />} style={{ marginTop: 10 }}>Upload<input type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files?.[0])} /></AppButton>}
                </div>
                <div className="grow" style={{ minWidth: 260 }}>
                  <TextField label="Name" required value={name} readOnly={!edit} onChange={setName} error={submitted && !name.trim() ? 'This field is required' : undefined} />
                  <TextField label="URL" value={url} readOnly={!edit} onChange={setUrl} placeholder="https://" />
                  <RadioField label="Show in Smart Office?" value={show} disabled={!edit} onChange={setShow} />
                </div>
              </div>
            </Section>
          </div>
        )}

        {tab === 'Issues' && (
          <div>
            <div className="row between wrap" style={{ gap: 12, padding: '14px 20px' }}>
              <div className="row wrap">
                <input className="input" style={{ width: 160 }} placeholder="Maalem ref#" aria-label="Maalem ref" value={fRef} onChange={(e) => setFRef(e.target.value)} />
                <input className="input" style={{ width: 200 }} placeholder="Project name" aria-label="Project name" value={fName} onChange={(e) => setFName(e.target.value)} />
                <input className="input" style={{ width: 160 }} placeholder="Created by" aria-label="Created by" value={fBy} onChange={(e) => setFBy(e.target.value)} />
                <AppButton variant="outlined" startIcon={<Search size={15} />}>Search</AppButton>
              </div>
              {edit && <AppButton variant="contained" startIcon={<Plus size={15} />} onClick={() => setIssueModal(true)}>Add issue</AppButton>}
            </div>
            <DataTable<Issue>
              rows={issues.filter((i) => match(i.ref, fRef) && match(i.project, fName) && match(i.createdBy, fBy))} empty="No issues recorded."
              columns={[
                { header: 'Project', render: (r) => <><strong>{r.project}</strong><div className="cell-sub num">{r.ref}</div></> },
                { header: 'Description', render: (r) => r.description },
                { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
                { header: 'Smart Office', render: (r) => <StatusChip status={r.showInSO ? 'visible' : 'hidden'} /> },
                { header: '', align: 'right', render: (r) => <ActionsMenu items={[{ label: 'Delete', danger: true, onClick: () => setIssues(issues.filter((x) => x.id !== r.id)) }]} /> },
              ]}
            />
          </div>
        )}

        {tab === 'Projects' && (
          <div>
            <div className="card-body"><div className="stats">
              <div className="stat"><small>Total plots</small><strong>{totals?.plots ?? related.length * 11}</strong></div>
              <div className="stat"><small>Total TCL (MW)</small><strong>{(totals?.tcl ?? related.length * 612.4).toLocaleString('en', { maximumFractionDigits: 2 })}</strong></div>
              <div className="stat"><small>Total DCP (MW)</small><strong>{(totals?.dcp ?? related.length * 20).toFixed(2)}</strong></div>
            </div></div>
            <DataTable
              rows={related} empty="No linked projects."
              columns={[
                { header: 'Project', render: (r) => <><a href="#" className="link cell-title" onClick={(e) => { e.preventDefault(); navigate(`/projects/${r.id}`) }}>{r.name}</a><div className="cell-sub num">{r.maalemRef}</div></> },
                { header: kind === 'consultant' ? 'Developer' : 'Consultant', render: (r) => (kind === 'consultant' ? r.developer : r.consultant) || '—' },
                { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
                { header: '', align: 'right', render: (r) => <ActionsMenu items={[{ label: 'Open project', onClick: () => navigate(`/projects/${r.id}`) }]} /> },
              ]}
            />
          </div>
        )}

        {tab === other && (
          <DataTable<{ id: string; name: string }>
            rows={others.map((n) => ({ id: n, name: n }))} empty={`No linked ${other.toLowerCase()}.`}
            columns={[
              { header: `${other.slice(0, -1)}`, render: (r) => <strong>{r.name}</strong> },
              { header: 'Created by', render: (r) => <span className="muted">{(kind === 'consultant' ? devs : cons).find((x) => x.name === r.name)?.createdBy ?? '—'}</span> },
              { header: 'Smart Office', render: () => <StatusChip status="visible" label="true" /> },
            ]}
          />
        )}
      </div>

      {issueModal && <IssueModal refs={related.map((p) => p.maalemRef)} onClose={() => setIssueModal(false)} onSave={(i) => { const p = projects.find((x) => x.maalemRef === i.ref); setIssues((prev) => [...prev, { ...i, id: newId(), project: p?.name ?? '' }]); setIssueModal(false); say('Issue added') }} />}
      <ConfirmationDialog open={confirmDelete} title={`Delete ${m.one.toLowerCase()}`} message={`Delete “${name}”? It is hidden (set inactive) and can be shown again.`} confirmLabel="Delete" destructive onConfirm={remove} onClose={() => setConfirmDelete(false)} />
      {toast}
    </div>
  )
}

function IssueModal({ refs, onClose, onSave }: { refs: string[]; onClose: () => void; onSave: (i: Issue) => void }) {
  const { user } = useAuth()
  const [ref, setRef] = useState('')
  const [desc, setDesc] = useState('')
  const [show, setShow] = useState('')
  return (
    <Modal title="Add issue" size="sm" onClose={onClose} footer={
      <>
        <AppButton variant="outlined" onClick={onClose}>Cancel</AppButton>
        <AppButton variant="contained" disabled={!desc.trim() || !show} onClick={() => onSave({ id: String(Date.now()), ref, project: '', description: desc, createdBy: user?.name ?? 'Unknown', createdOn: new Date().toISOString(), showInSO: show === 'Yes' })}>Save</AppButton>
      </>
    }>
      <SelectField label="Maalem Dubai ref" value={ref} options={refs} onChange={setRef} />
      <TextField label="Description" required multiline placeholder="Please explain the issue details…" value={desc} onChange={setDesc} />
      <RadioField label="Show in Smart Office?" required value={show} onChange={setShow} />
    </Modal>
  )
}
