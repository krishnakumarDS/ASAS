// The SharePoint library listing, loaded through the ASAS_GetFiles flow and kept in the persisted store (local storage),
// so the project Files screens only read it. Layout of the library: <SP_ROOT>/<project ref>/<tab>/<file>, e.g. ASASFile_Storage/MP-00000-095/Area Map/map.pdf.
//   - Opening the app and the Refresh button load it again (syncFiles); after an upload the screen does the same.
//   - The flow returns the whole library (files and folders, with thumbnails and user details), so each item is cut down to what the screens use.
import { useSyncExternalStore } from 'react'
import { listFiles, setFileStatus } from './files'
import { getStored, setStored, usePersistent } from './store'

export const SP_ROOT = 'ASASFile_Storage'

export interface SpFile {
  id: string            // SharePoint list item number
  identifier: string    // connector file id (the encoded path)
  driveItemId: string   // Graph id: stays the same if the file is renamed
  name: string          // file name with extension
  folder: string        // parent folder, no trailing slash
  isFolder: boolean
  modified: string      // ISO date-time
  by: string            // who last changed it
  link: string          // SharePoint URL
  status: string        // the library's Status column: "Active" / "Inactive" (empty until the app sets it)
}
interface SpState { at: string; items: SpFile[] }
const NONE: SpState = { at: '', items: [] }

const str = (v: unknown) => (v == null ? '' : String(v))
/** The Status column comes as text, or as { Value } when it is a choice column. */
const statusOf = (v: unknown) => str(v && typeof v === 'object' ? (v as { Value?: unknown }).Value : v)
/** One item of the flow's output ("Get files (properties only)": braced keys such as {FullPath}) as a SpFile. */
export const toSpFile = (f: Record<string, unknown>): SpFile => ({
  id: str(f.ID), identifier: str(f['{Identifier}']), driveItemId: str(f['{DriveItemId}']),
  name: str(f['{FilenameWithExtension}'] ?? f['{Name}']), folder: str(f['{Path}']).replace(/\/+$/, ''), isFolder: f['{IsFolder}'] === true,
  status: statusOf(f.Status), modified: str(f.Modified), by: str((f.Editor as { DisplayName?: string } | undefined)?.DisplayName), link: str(f['{Link}']),
})

export type FilesStatus = 'idle' | 'loading' | 'error'
let status: FilesStatus = 'idle'
const listeners = new Set<() => void>()
const setStatus = (s: FilesStatus) => { status = s; listeners.forEach((f) => f()) }
export const useFilesStatus = () => useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb) } }, () => status)

export const useSpFiles = () => usePersistent<SpState>('spFiles', NONE)[0]

let inflight: Promise<boolean> | null = null
/** Loads the library listing and stores it. Resolves true on success, false if the flow failed (the stored listing is kept). Never rejects. */
export function syncFiles(): Promise<boolean> {
  if (inflight) return inflight
  setStatus('loading')
  inflight = listFiles(SP_ROOT)
    .then((raw) => { setStored<SpState>('spFiles', { at: new Date().toISOString(), items: raw.map(toSpFile) }); setStatus('idle'); return true })
    .catch((e) => { console.error('Could not load the file list', e); setStatus('error'); return false })
    .finally(() => { inflight = null })
  return inflight
}

const isActive = (f: SpFile) => /^active$/i.test(f.status)
/** One tab's files as Active (at most one) and In-active. Once the app has set a Status on any file, Status decides; before that the newest file counts as active. */
export function splitTab(files: SpFile[]): { active?: SpFile; inactive: SpFile[] } {
  const active = files.some((f) => f.status) ? files.find(isActive) : files[0]
  return { active, inactive: files.filter((f) => f !== active) }
}

/** Makes `target` the tab's only active file (null = none): sets Active on it and Inactive on the others, one flow call per file that changes.
 *  The flow has no response step, so the stored list is updated here instead of read back. Throws if a call fails (the files already changed stay changed). */
export async function setTabActive(ref: string, tab: string, target: SpFile | null): Promise<void> {
  const state = getStored<SpState>('spFiles', NONE)
  const files = filesIn(state.items, ref, tab)
  const done = new Map<string, string>()
  try {
    for (const f of files) {
      const want = f === target || (target && f.id === target.id) ? 'Active' : 'Inactive'
      if (f.status.toLowerCase() === want.toLowerCase()) continue
      await setFileStatus(Number(f.id), want)
      done.set(f.id, want)
    }
  } finally {
    if (done.size) setStored<SpState>('spFiles', { ...state, items: getStored<SpState>('spFiles', NONE).items.map((f) => (done.has(f.id) && f.folder.toLowerCase() === `${SP_ROOT}/${ref}/${tab}`.toLowerCase() ? { ...f, status: done.get(f.id)! } : f)) })
  }
}

/** The files (not folders) of one project tab, newest first. */
export function filesIn(items: SpFile[], ref: string, tab: string): SpFile[] {
  const folder = `${SP_ROOT}/${ref}/${tab}`.toLowerCase()
  return items.filter((f) => !f.isFolder && f.folder.toLowerCase() === folder).sort((a, b) => b.modified.localeCompare(a.modified))
}

/** The file's SharePoint address in a form that downloads it instead of opening it (?download=1). The share parameter (?d=…) that {Link} carries is dropped. */
export const downloadUrl = (f: SpFile): string => (f.link ? `${f.link.split('?')[0]}?download=1` : '')
