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
/** One tab's files as Active (any number) and In-active. Once the app has set a Status on any file in the tab, Status decides; before that the newest file counts as active. */
export function splitTab(files: SpFile[]): { active: SpFile[]; inactive: SpFile[] } {
  if (!files.some((f) => f.status)) return { active: files.slice(0, 1), inactive: files.slice(1) }
  return { active: files.filter(isActive), inactive: files.filter((f) => !isActive(f)) }
}

/** Sets one file Active or Inactive (one flow call; the other files of the tab are not touched).
 *  The flow has no response step, so the stored list is updated here instead of read back. Before any status exists in the tab, the newest file was
 *  active by default: it is written out first so that changing another file does not silently switch it. */
export async function setFileActive(ref: string, tab: string, target: SpFile, active: boolean): Promise<void> {
  const tabFiles = filesIn(getStored<SpState>('spFiles', NONE).items, ref, tab)
  const changes = new Map<string, 'Active' | 'Inactive'>()
  if (!tabFiles.some((f) => f.status)) tabFiles.forEach((f, i) => changes.set(f.id, i === 0 ? 'Active' : 'Inactive'))
  changes.set(target.id, active ? 'Active' : 'Inactive')
  const done = new Map<string, string>()
  try {
    for (const [id, want] of changes) { await setFileStatus(Number(id), want); done.set(id, want) }
  } finally {
    if (done.size) {
      const state = getStored<SpState>('spFiles', NONE)
      const folder = `${SP_ROOT}/${ref}/${tab}`.toLowerCase()
      setStored<SpState>('spFiles', { ...state, items: state.items.map((f) => (done.has(f.id) && f.folder.toLowerCase() === folder ? { ...f, status: done.get(f.id)! } : f)) })
    }
  }
}

/** The files (not folders) of one project tab, newest first. */
export function filesIn(items: SpFile[], ref: string, tab: string): SpFile[] {
  const folder = `${SP_ROOT}/${ref}/${tab}`.toLowerCase()
  return items.filter((f) => !f.isFolder && f.folder.toLowerCase() === folder).sort((a, b) => b.modified.localeCompare(a.modified))
}

/** An address that makes SharePoint send the file as a download (also for Excel / Word / PowerPoint, which a plain link or ?download=1 can open in the web viewer):
 *  <site>/_layouts/15/download.aspx?SourceUrl=<the file's server-relative path>. Falls back to ?download=1 if the link cannot be read. */
export function downloadUrl(f: SpFile): string {
  if (!f.link) return ''
  try {
    const u = new URL(f.link)
    const path = decodeURIComponent(u.pathname)
    const at = path.toLowerCase().indexOf(`/${SP_ROOT.toLowerCase()}/`)
    if (at < 0) throw new Error('library not in the link')
    return `${u.origin}${path.slice(0, at)}/_layouts/15/download.aspx?SourceUrl=${encodeURIComponent(path)}`
  } catch {
    return `${f.link.split('?')[0]}?download=1`
  }
}
