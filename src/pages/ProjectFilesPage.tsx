import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ClipboardList, Download, FileImage, FileText, History, Layers, Map as MapIcon, Plus, Presentation, RefreshCw, Search, Upload } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import StatusChip from '../components/common/StatusChip'
import PageHeader from '../components/PageHeader'
import IconButton from '../components/common/IconButton'
import { ActionsMenu, DataTable, FileDrop, Modal, SelectField, TextField, useToast } from '../components/ui'
import { fmtDate } from '../data/mock'
import { downloadBlob, listBlobs, uploadFile } from '../data/files'
import type { BlobItem } from '../data/files'
import { errorDetail, userMessage } from '../data/api'
import { newId, usePersistent, useProjects, useSubstations } from '../data/store'
import { useAuth } from '../context/AuthContext'

const TABS: { name: string; icon: LucideIcon }[] = [
  { name: 'Area Map', icon: MapIcon }, { name: 'Area Report', icon: FileText }, { name: 'Presentation', icon: Presentation }, { name: 'Zoning', icon: Layers },
  { name: 'Project Layout', icon: FileImage }, { name: 'Issues', icon: AlertCircle }, { name: 'History', icon: History }, { name: 'PPR', icon: ClipboardList },
]
const NO_PPR: PprRow[] = []
const NO_ISSUES: IssueRow[] = []
const NO_HISTORY: HistoryRow[] = []
const ACCEPT_HINT = 'Accepted: DOC, DOCX, XLSX, XLS, JPG, PNG, JPEG and PDF.'

interface IssueRow { id: string; description: string; fileName: string; createdBy: string; createdOn: string; active: boolean }
interface HistoryRow { id: string; date: string; ptpReceived: string; mpRef: string; createdBy: string; createdOn: string; active: boolean; reply: string }
interface PprRow { id: string; substation: string; createdBy: string; createdOn: string; updatedBy: string; updatedOn: string; active: boolean; fileName: string }

const SearchRow = ({ q, setQ, placeholder, action }: { q: string; setQ: (s: string) => void; placeholder: string; action?: React.ReactNode }) => (
  <div className="row between wrap" style={{ gap: 12, padding: '14px 20px' }}>
    <div className="with-action" style={{ flex: '1 1 320px', maxWidth: 480 }}>
      <input className="input" placeholder={placeholder} aria-label={placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
      <AppButton variant="outlined" startIcon={<Search size={15} />}>Search</AppButton>
    </div>
    {action}
  </div>
)

export default function ProjectFilesPage() {
  const { id = '', tab = 'Area Map' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const ME = user?.name ?? 'Unknown'
  const [projects] = useProjects()
  const [substations] = useSubstations()
  const project = projects.find((p) => p.id === id)
  const [toast, say] = useToast()
  const [modal, setModal] = useState(false)
  const [q, setQ] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const seededFiles = /^\d+$/.test(id)
  // Files kept in Azure Blob Storage (file_Blob flow): listed for the open tab, downloaded on request
  const isFileTabNow = !['Issues', 'History', 'PPR'].includes(tab)
  const blobFolder = `${project?.maalemRef ?? id}/${tab}`
  const [blobs, setBlobs] = useState<BlobItem[]>([])
  const [blobState, setBlobState] = useState<{ loading: boolean; error: string; loaded: boolean }>({ loading: false, error: '', loaded: false })
  const [downloading, setDownloading] = useState<string | null>(null)
  const loadBlobs = useCallback(async () => {
    setBlobState((s) => ({ ...s, loading: true, error: '' }))
    try { setBlobs(await listBlobs(blobFolder)); setBlobState({ loading: false, error: '', loaded: true }) }
    // A tab nobody has uploaded to has no folder in the container yet, and the flow fails on it (502): show an empty list, not an error. The reason stays in the console.
    catch (e) { console.warn('Blob list failed (treated as no files):', errorDetail(e)); setBlobs([]); setBlobState({ loading: false, error: '', loaded: true }) }
  }, [blobFolder])
  useEffect(() => { if (isFileTabNow) void loadBlobs() }, [loadBlobs, isFileTabNow])
  const getBlobFile = async (b: BlobItem) => {
    setDownloading(b.id)
    try { await downloadBlob(b.path, b.name) } catch (e) { say(`The file could not be downloaded: ${errorDetail(e)}`) }
    setDownloading(null)
  }
  const [issues, setIssues] = usePersistent<IssueRow[]>(`project:${id}:issues`, NO_ISSUES)
  const [history, setHistory] = usePersistent<HistoryRow[]>(`project:${id}:history`, NO_HISTORY)
  const seedPpr = useMemo<PprRow[]>(() => { const sub = seededFiles ? substations[(Number(id) * 2) % Math.max(1, substations.length)] : undefined; return sub ? [{ id: `p${id}`, substation: sub.name, createdBy: sub.createdBy, createdOn: sub.createdOn, updatedBy: sub.createdBy, updatedOn: sub.createdOn, active: true, fileName: `${sub.scada.toLowerCase()}-ppr.pdf` }] : NO_PPR }, [id])
  const [ppr, setPpr] = usePersistent<PprRow[]>(`project:${id}:ppr`, seedPpr)
  const [desc, setDesc] = useState('')
  const [hDate, setHDate] = useState('')
  const [ptp, setPtp] = useState('')
  const [mp, setMp] = useState('')
  const [substation, setSubstation] = useState('')

  const close = () => { setModal(false); setFile(null); setDesc(''); setHDate(''); setPtp(''); setMp(''); setSubstation('') }
  const now = () => new Date().toISOString()
  const uid = newId
  const submit = async () => {
    // the file goes to Azure Blob Storage first (folder = "<project ref.>/<tab>", e.g. MP-00000-114/Area Map; the file keeps its own name); the lists are only updated once it is sent
    // The file lists and the Active / In-active status still read SharePoint (ASAS_GetFiles / ASAS_File_Activations), so a blob upload does not appear in them yet.
    if (file) {
      setUploading(true)
      try {
        const path = await uploadFile(`${project?.maalemRef ?? id}/${tab}`, file)
        // keep the returned path so the file can be fetched with it right away (Get_File takes this path)
        setBlobs((b) => (b.some((x) => x.path === path) ? b : [...b, { id: path, name: file.name, path, size: file.size, modified: new Date().toISOString(), isFolder: false }]))
      }
      catch (e) { say(userMessage(e, 'The file could not be uploaded. Please try again.')); setUploading(false); return }
      setUploading(false)
      setTimeout(() => { void loadBlobs() }, 2500) // give the flow a moment to store the blob, then list again
    }
    if (tab === 'Issues') setIssues((p) => [...p, { id: uid(), description: desc, fileName: file?.name ?? '', createdBy: ME, createdOn: now(), active: true }])
    else if (tab === 'History') setHistory((p) => [...p, { id: uid(), date: hDate, ptpReceived: ptp, mpRef: mp, createdBy: ME, createdOn: now(), active: true, reply: file?.name ?? '' }])
    else if (tab === 'PPR') setPpr((p) => [...p, { id: uid(), substation, createdBy: ME, createdOn: now(), updatedBy: ME, updatedOn: now(), active: true, fileName: file?.name ?? '' }])
    say(file && isFileTab ? 'Sent to Azure Blob Storage' : 'Uploaded successfully'); close()
  }
  const canSubmit = tab === 'Issues' ? !!desc.trim() : tab === 'History' ? !!hDate : tab === 'PPR' ? !!substation : !!file
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase())
  const isFileTab = !['Issues', 'History', 'PPR'].includes(tab)
  const modalTitle = tab === 'Issues' ? 'Add project issue' : tab === 'History' ? 'Add history file' : tab === 'PPR' ? 'Upload new PPR' : `Upload new ${tab} file`
  const del = (label = 'Delete', onClick: () => void) => <ActionsMenu items={[{ label, danger: true, onClick }]} />
  const AddBtn = <AppButton variant="contained" startIcon={<Plus size={16} />} onClick={() => setModal(true)}>Add</AppButton>

  return (
    <div className="page">
      <PageHeader title={project?.name ?? 'Project files'} subtitle={`REF# ${project?.maalemRef ?? id} · Project files`}
        actions={<AppButton variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate(`/projects/${id}`)}>Back</AppButton>} />
      <div className="split">
        <nav className="card vnav" aria-label="File types">
          {TABS.map(({ name, icon: Icon }) => <button key={name} className={name === tab ? 'on' : ''} aria-current={name === tab ? 'page' : undefined} onClick={() => { setQ(''); navigate(`/projects/${id}/files/${name}`) }}><Icon size={17} />{name}</button>)}
        </nav>
        <div className="stack reveal">
          {isFileTab && (
            <>
              <section className="card pad">
                <div className="row between wrap" style={{ gap: 12 }}>
                  <div><h4>{tab}</h4><p className="muted" style={{ fontSize: 13 }}>Files stored in Azure Blob Storage</p></div>
                  <AppButton variant="contained" startIcon={<Upload size={15} />} onClick={() => setModal(true)}>Upload new file</AppButton>
                </div>
              </section>
              <section className="card">
                <div className="card-head">
                  <div><h4>Files in Azure Blob Storage</h4><p className="muted" style={{ fontSize: 13 }}>{blobFolder}</p></div>
                  <AppButton variant="outlined" size="small" startIcon={<RefreshCw size={15} />} loading={blobState.loading} onClick={() => { void loadBlobs() }}>Refresh</AppButton>
                </div>
                {blobState.error && <p className="error-text" role="alert" style={{ padding: '0 20px 12px' }}>{blobState.error}</p>}
                <DataTable<BlobItem>
                  rows={blobs} empty={blobState.loading ? 'Loading…' : 'No files uploaded for this tab yet.'}
                  columns={[
                    { header: 'File name', render: (r) => <strong>{r.name}</strong> },
                    { header: 'Size', render: (r) => (r.size ? `${Math.max(1, Math.round(r.size / 1024)).toLocaleString('en')} KB` : '—') },
                    { header: 'Modified', render: (r) => (r.modified ? fmtDate(r.modified) : '—') },
                    { header: '', align: 'right', render: (r) => <IconButton small title="Download" aria-label={`Download ${r.name}`} disabled={downloading === r.id} onClick={() => { void getBlobFile(r) }}><Download size={17} /></IconButton> },
                  ]}
                />
              </section>
            </>
          )}

          {tab === 'Issues' && (
            <section className="card">
              <div className="card-head"><h4>Issues</h4></div>
              <SearchRow q={q} setQ={setQ} placeholder="Search by file name or description…" action={AddBtn} />
              <DataTable<IssueRow>
                rows={issues.filter((r) => match(r.fileName) || match(r.description))} empty="No issues logged."
                columns={[
                  { header: 'Description', render: (r) => r.description },
                  { header: 'File', render: (r) => r.fileName || '—' },
                  { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
                  { header: 'Active', render: (r) => <StatusChip status="active" label={String(r.active)} /> },
                  { header: '', align: 'right', render: (r) => del('Delete', () => setIssues(issues.filter((x) => x.id !== r.id))) },
                ]}
              />
            </section>
          )}

          {tab === 'History' && (
            <section className="card">
              <div className="card-head"><h4>History</h4>{AddBtn}</div>
              <DataTable<HistoryRow>
                rows={history} empty="No history records."
                columns={[
                  { header: 'History date', render: (r) => r.date },
                  { header: 'PTP letter received', render: (r) => r.ptpReceived || '—' },
                  { header: 'MP letter ref', render: (r) => r.mpRef || '—' },
                  { header: 'PTP reply', render: (r) => r.reply || '—' },
                  { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
                  { header: 'Active', render: (r) => <StatusChip status="active" label={String(r.active)} /> },
                  { header: '', align: 'right', render: (r) => del('Delete', () => setHistory(history.filter((x) => x.id !== r.id))) },
                ]}
              />
            </section>
          )}

          {tab === 'PPR' && (
            <section className="card">
              <div className="card-head"><h4>PPR</h4></div>
              <SearchRow q={q} setQ={setQ} placeholder="Search by substation name…" action={AddBtn} />
              <DataTable<PprRow>
                rows={ppr.filter((r) => match(r.substation))} empty="No PPR files."
                columns={[
                  { header: 'Substation', render: (r) => <span className="link cell-title">{r.substation}</span> },
                  { header: 'File', render: (r) => r.fileName },
                  { header: 'Created', render: (r) => <><div>{r.createdBy}</div><div className="cell-sub">{fmtDate(r.createdOn)}</div></> },
                  { header: 'Updated', render: (r) => <><div>{r.updatedBy}</div><div className="cell-sub">{fmtDate(r.updatedOn)}</div></> },
                  { header: 'Active', render: (r) => <StatusChip status="active" label={String(r.active)} /> },
                  { header: '', align: 'right', render: (r) => del('Delete', () => setPpr(ppr.filter((x) => x.id !== r.id))) },
                ]}
              />
            </section>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={modalTitle} size="sm" onClose={close} footer={<><AppButton variant="outlined" disabled={uploading} onClick={close}>Cancel</AppButton><AppButton variant="contained" disabled={!canSubmit} loading={uploading} startIcon={<Upload size={15} />} onClick={() => { void submit() }}>Upload</AppButton></>}>
          {tab === 'Issues' && <TextField label="Issue description" multiline value={desc} onChange={setDesc} />}
          {tab === 'History' && <><TextField label="History date" type="date" required value={hDate} onChange={setHDate} /><TextField label="PTP letter received" value={ptp} onChange={setPtp} /><TextField label="MP letter ref" value={mp} onChange={setMp} /></>}
          {tab === 'PPR' && <SelectField label="Substation" required value={substation} options={substations.map((s) => s.name)} onChange={setSubstation} />}
          <FileDrop file={file} onFile={setFile} hint={ACCEPT_HINT} />
        </Modal>
      )}
      {toast}
    </div>
  )
}
