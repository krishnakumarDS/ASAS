// Stores an uploaded file in SharePoint through the Asas_file_Storage flow (folder + file name + file content).
import { ASAS_File_ActivationsService, ASAS_GetFilesService, Asas_file_StorageService } from '../generated'

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const r = new FileReader()
  r.onload = () => resolve(String(r.result).split(',')[1] ?? '')
  r.onerror = () => reject(new Error('The file could not be read'))
  r.readAsDataURL(file)
})

/** Sends the file to the storage flow. folder = the sub-folder under the library; name = the file name it is saved as. Rejects if the flow fails. */
export async function uploadFile(folder: string, file: File, name = file.name): Promise<void> {
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
