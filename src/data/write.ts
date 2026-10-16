// Writes one row to SQL through the flow (sp_UC000420_Api -> sp_UC000420_Crud) and returns its id.
import { callApi } from './api'

/** Blank form values: left out on create, sent as null on update (so a cleared field is cleared in SQL). */
function clean(fields: Record<string, unknown>, forUpdate: boolean) {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(fields)) {
    const blank = v === undefined || v === null || (typeof v === 'string' && v.trim() === '')
    if (blank) { if (forUpdate) out[k] = null } else out[k] = typeof v === 'string' ? v.trim() : v
  }
  return out
}

/** entity: project, plot, substation, developer, consultant, projectConsultant, … ; id null = create, otherwise update that id.
 *  Field names are the SQL column names (any letter case). Throws with SQL's message if the database refuses. */
export async function saveRecord(entity: string, id: string | null, fields: Record<string, unknown>, user?: string): Promise<string> {
  const body = { ...(id ? { id } : {}), ...clean(fields, id !== null), user }
  const res = await callApi(`${entity}.${id ? 'update' : 'create'}`, body)
  return id ?? String(res[0]?.[0]?.Id ?? '')
}

/** Show (true) or hide (false) a row: sets IsActive. */
export async function setActiveRecord(entity: string, id: string, isActive: boolean, user?: string): Promise<void> {
  await callApi(`${entity}.setActive`, { id, isActive, user })
}

/** "Delete": the row is hidden (IsActive = 0) and stays in the table, so it can be enabled again. */
export async function deleteRecord(entity: string, id: string, user?: string): Promise<void> {
  await callApi(`${entity}.delete`, { id, user })
}

/** Show / hide many rows with ONE flow call (entity.setActiveMany). Returns how many rows SQL changed. */
export async function setActiveMany(entity: string, ids: string[], isActive: boolean, user?: string): Promise<number> {
  const res = await callApi(`${entity}.setActiveMany`, { ids, isActive, user })
  return Number(res[0]?.[0]?.RowsAffected ?? 0)
}

/** "Delete" many rows with ONE flow call (entity.deleteMany): they are hidden (IsActive = 0). Returns how many rows SQL changed. */
export async function deleteMany(entity: string, ids: string[], user?: string): Promise<number> {
  const res = await callApi(`${entity}.deleteMany`, { ids, user })
  return Number(res[0]?.[0]?.RowsAffected ?? 0)
}

/** Insert many rows with ONE flow call (entity.createMany). Field names are column names. Returns the new ids. */
export async function createMany(entity: string, rows: Record<string, unknown>[], user?: string): Promise<string[]> {
  const res = await callApi(`${entity}.createMany`, { rows, user })
  return (res[0] ?? []).map((r) => String(r.Id))
}
