// File upload goes to Azure Blob Storage through the file_Blob flow (Action "Upload": folder + file name + file content).
// The older SharePoint upload (Asas_file_Storage flow) is kept as uploadFileToSharePoint.
import { ASAS_File_ActivationsService, ASAS_GetFilesService, Asas_file_StorageService, File_BlobService, Get_FileService } from '../generated'

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const r = new FileReader()
  r.onload = () => resolve(String(r.result).split(',')[1] ?? '')
  r.onerror = () => reject(new Error('The file could not be read'))
  r.readAsDataURL(file)
})

/** Sends the file to Azure Blob Storage through the file_Blob flow and returns the blob's path (what Get_File needs to read it back).
 *  The flow names the blob after "Text", so Text is the full blob name "<folder>/<file name>" (e.g. "MEF-2000/Area Map/map.xlsx").
 *  The path comes from the flow's answer when it is a path (Respond with body('Create_blob_(V2)')?['Path']); otherwise it is built as "/asas/<blob name>". */
export async function uploadFile(folder: string, file: File, name = file.name): Promise<string> {
  const blobName = `${folder}/${name}`
  const r = await File_BlobService.Run({ text: blobName, file: { name, contentBytes: await toBase64(file) }, text_1: 'Upload', text_2: `/${BLOB_CONTAINER}/${folder}` })
  if (!r.success) throw new Error(r.error?.message ?? 'The file could not be uploaded')
  const out = (r.data?.output ?? '').trim()
  return out.startsWith('/') ? out : `/${BLOB_CONTAINER}/${blobName}`
}

/** The previous upload: stores the file in SharePoint through the Asas_file_Storage flow. */
export async function uploadFileToSharePoint(folder: string, file: File, name = file.name): Promise<void> {
  const r = await Asas_file_StorageService.Run({ text: folder, file: { name, contentBytes: await toBase64(file) } })
  if (!r.success) throw new Error(r.error?.message ?? 'The file could not be uploaded')
}

/** Lists the files in a SharePoint sub-folder through the ASAS_GetFiles flow (SharePoint "Get files (properties only)"). Returns the file property objects. */
export async function listFiles(folder: string): Promise<Record<string, unknown>[]> {
  const r = await ASAS_GetFilesService.Run({ text: folder })
  if (!r.success) throw new Error(r.error?.message ?? 'The file list could not be read')
  const raw = r.data?.output
  if (!raw) return []
  const parsed: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw
  return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : []
}

/** Sets the Status column of one library file (the ASAS_File_Activations flow: SharePoint "Update file properties"). itemId = the file's SharePoint item number (ID). */
export async function setFileStatus(itemId: number, status: 'Active' | 'Inactive'): Promise<void> {
  const r = await ASAS_File_ActivationsService.Run({ text: status, number: itemId })
  if (!r.success) throw new Error(r.error?.message ?? 'The file status could not be changed')
}

/* ---------- Azure Blob Storage: list (file_Blob flow) and download (Get_File flow) ----------
   file_Blob, Action "List":  Text = the folder (e.g. "MP-00000-114/Area Map")  -> output = the JSON array returned by "Lists blobs (V2)", as text
   Get_File:                  Text = the blob Path exactly as List returned it  -> file = the file content (base64)
   Both triggers still require a File content, so these calls send a one-byte placeholder (make that input optional in the flows to drop it). */
/** The blob container the file_Blob flow writes to (the Folder of its Create blob / Lists blobs actions). */
const BLOB_CONTAINER = 'asas'
export interface BlobItem { id: string; name: string; path: string; size: number; modified: string; isFolder: boolean }
const PLACEHOLDER = { name: 'none.txt', contentBytes: 'AA==' }
const BLOB_TIMEOUT_MS = 60_000

const withTimeout = <T,>(p: Promise<T>, what: string) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`${what} took longer than ${BLOB_TIMEOUT_MS / 1000} seconds.`)), BLOB_TIMEOUT_MS))])

async function blobList(folder: string): Promise<string> {
  const r = await withTimeout(File_BlobService.Run({ text: folder, file: PLACEHOLDER, text_1: 'List', text_2: `/${BLOB_CONTAINER}/${folder}` }), 'The blob list')
  if (!r.success) throw new Error(r.error?.message ?? 'The blob list failed')
  const out = r.data?.output
  if (out == null || out === '') throw new Error('The file_Blob flow returned no data. Check that its List branch responds with a Text output named "output".')
  return out
}

const asText = (v: unknown) => (v == null ? '' : String(v))
/** Lists the blobs in a folder (Action "List"). Folders are left out. */
export async function listBlobs(folder: string): Promise<BlobItem[]> {
  const raw = JSON.parse(await blobList(folder)) as unknown
  const rows = Array.isArray(raw) ? raw : Array.isArray((raw as { value?: unknown })?.value) ? (raw as { value: unknown[] }).value : []
  return (rows as Record<string, unknown>[])
    .map((b) => {
      const path = asText(b.Path ?? b.path ?? b.Name)
      return { id: path || asText(b.Id), name: asText(b.DisplayName ?? b.Name ?? b.name) || path.split('/').pop() || '', path, size: Number(b.Size ?? b.size ?? 0), modified: asText(b.LastModified ?? b.modified), isFolder: b.IsFolder === true }
    })
    .filter((b) => !b.isFolder && b.path)
}

const MIME: Record<string, string> = {
  pdf: 'application/pdf', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', xls: 'application/vnd.ms-excel', csv: 'text/csv',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', doc: 'application/msword', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', txt: 'text/plain', json: 'application/json',
}

/** Reads one blob through the Get_File flow and returns its bytes with a content type taken from the file extension. */
export async function getBlob(path: string, name = path.split('/').pop() ?? 'file'): Promise<Blob> {
  const r = await withTimeout(Get_FileService.Run({ text: path, file: PLACEHOLDER }), 'The download')
  if (!r.success) throw new Error(r.error?.message ?? 'The file could not be read')
  const raw = (r.data as { file?: unknown } | undefined)?.file
  if (raw == null || raw === '') throw new Error('The Get_File flow returned no content. Check that its Respond step returns the file content in an output named "file".')
  const out = (typeof raw === 'string' ? raw : JSON.stringify(raw)).trim()
  // accept a plain base64 string, a data: URL, or {"contentBase64"|"$content": "..."}
  let b64 = out
  if (out.startsWith('{')) { const o = JSON.parse(out) as Record<string, unknown>; b64 = asText(o.contentBase64 ?? o.$content ?? o.content) }
  b64 = b64.replace(/^data:[^,]*,/, '').replace(/^"|"$/g, '')
  const type = MIME[name.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream'
  let bytes: Uint8Array<ArrayBuffer>
  try {
    const bin = atob(b64)
    bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  } catch {
    // not base64: the flow sent the raw content as text. Fine for text files (csv, txt); a binary file (xlsx, pdf) arrives damaged, so the flow must send base64.
    console.warn('Get_File returned content that is not base64; saving it as text.')
    bytes = new TextEncoder().encode(out)
  }
  return new Blob([bytes], { type })
}

/** Gets a blob and saves it through the browser (a temporary download link). */
export async function downloadBlob(path: string, name = path.split('/').pop() ?? 'file'): Promise<void> {
  const url = URL.createObjectURL(await getBlob(path, name))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
