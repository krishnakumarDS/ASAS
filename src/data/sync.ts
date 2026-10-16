// Loads projects, plots, substations, developers and consultants from SQL (through the flow) and
// writes them into the same persisted store (local storage) the screens already read, so no screen needs to change.
//   - First use (nothing stored for this user): all five lists are loaded through the flow.
//   - Next visits: the stored lists are used as they are; the flow is not called.
//   - After a create / update / delete: only the affected list is loaded again (syncEntity).
//   - Refresh button: all five lists are loaded again (syncFromDatabase(true)).
// If the flow cannot be reached (e.g. plain browser, no connection) the existing/sample data stays.
import { useSyncExternalStore } from 'react'
import { fetchAll } from './api'
import type { Row } from './api'
import type { Party, Plot, Substation } from './mock'
import type { Project } from './projects'
import { getStored, setStored } from './store'

export type SyncState = 'idle' | 'loading' | 'live' | 'offline'
export interface SyncStatus { state: SyncState; at?: string; error?: string }

let status: SyncStatus = { state: 'idle' }
const listeners = new Set<() => void>()
const setStatus = (s: SyncStatus) => { status = s; listeners.forEach((f) => f()) }
let settled = false // true once the first load has finished (loaded or failed)
/** False until the first load of the lists has finished: pages show a loader instead of stale data. */
export const useDataReady = () => useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb) } }, () => settled)
export const useSyncStatus = () => useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb) } }, () => status)

const str = (v: unknown) => (v == null ? '' : String(v))
/** IsActive as SQL returns it: true / 1 / "True" / "1" mean active; a missing value is treated as active (only an explicit false / 0 hides a record). */
const active = (v: unknown) => (v == null || v === '' ? true : v === true || v === 1 || /^(true|1|yes|y)$/i.test(String(v)))

const toParty = (r: Row, idKey: string, nameKey: string, urlKey: string): Party => ({
  id: str(r[idKey]), name: str(r[nameKey]), url: str(r[urlKey]), showInSO: active(r.IsActive), createdBy: str(r.created_by), createdOn: str(r.created_at),
})
const toPlot = (r: Row): Plot => ({
  id: str(r.RowID), maalemRef: str(r.MaalemDubaiRef), projectName: str(r.ProjectName), devPlot: str(r.DevPlotNum), dmPlot: str(r.DMPlotNum),
  developer: str(r.DeveloperName), consultant: str(r.ConsultantName), display: active(r.IsActive), createdOn: str(r.created_at),
})
const toSubstation = (r: Row): Substation => ({
  id: str(r.SubstationID), name: str(r.SubstationName), scada: str(r.SubstationSCADAName), builtBy: /dewa/i.test(str(r.BuiltBy)) ? 'DEWA' : 'Developer',
  showInSO: active(r.IsActive), createdBy: str(r.created_by), createdOn: str(r.created_at),
})

export type Entity = 'projects' | 'plots' | 'substations' | 'developers' | 'consultants'

/** A project's consultant comes from its plots (the project table has no consultant column): rebuilt from the stored plots. */
const consultantByProject = () => new Map(getStored<Plot[]>('plots', []).filter((p) => p.consultant).map((p) => [p.maalemRef, p.consultant]))

const JOBS: { key: Entity; search: string; orderBy: string; load: (rows: Row[]) => void }[] = [
  { key: 'plots', search: 'SearchPlots', orderBy: 'PLT.RowID', load: (rows) => {
    setStored('plots', rows.filter((r) => r.RowID != null).map(toPlot))
    // keep each project's consultant in step with its plots
    const byRef = consultantByProject()
    setStored('projects', getStored<Project[]>('projects', []).map((p) => ({ ...p, consultant: byRef.get(p.maalemRef) })))
  } },
  { key: 'projects', search: 'SearchProjects', orderBy: 'MPT.MaalemDubaiRef', load: (rows) => {
    const byRef = consultantByProject()
    const projects: Project[] = rows.filter((r) => r.MaalemDubaiRef != null).map((r) => ({
      id: str(r.MaalemDubaiRef), maalemRef: str(r.MaalemDubaiRef), name: str(r.ProjectName), developer: str(r.DeveloperName),
      createdBy: str(r.created_by), createdOn: str(r.created_at), display: active(r.IsActive), consultant: byRef.get(str(r.MaalemDubaiRef)),
    }))
    setStored('projects', projects)
  } },
  { key: 'substations', search: 'SearchSubstations', orderBy: 'SUB.SubstationID', load: (rows) => setStored('substations', rows.filter((r) => r.SubstationID != null).map(toSubstation)) },
  { key: 'developers', search: 'SearchDevelopers', orderBy: 'DeveloperID', load: (rows) => setStored('developers', rows.map((r) => toParty(r, 'DeveloperID', 'DeveloperName', 'DeveloperURL'))) },
  { key: 'consultants', search: 'SearchConsultants', orderBy: 'ConsultantID', load: (rows) => setStored('consultants', rows.map((r) => toParty(r, 'ConsultantID', 'ConsultantName', 'ConsultantURL'))) },
]
const job = (k: Entity) => JOBS.find((j) => j.key === k)!

/** What is stored in this browser says "all lists were loaded at <at> for <user>". */
interface Meta { at: string; user: string }
const META_KEY = 'syncMeta'
let currentUser = ''

let inflight: Promise<void> | null = null

/** Loads all five lists through the flow (plots first, the project list uses them). Never rejects. force = run again once a running load finishes. */
export function syncFromDatabase(force = false): Promise<void> {
  if (inflight) return force ? inflight.then(() => syncFromDatabase()) : inflight
  setStatus({ state: 'loading' })
  inflight = (async () => {
    const results: PromiseSettledResult<void>[] = []
    for (const batch of [[job('plots'), job('substations'), job('developers'), job('consultants')], [job('projects')]]) {
      const fetched = await Promise.allSettled(batch.map((j) => fetchAll(j.search, j.orderBy)))
      fetched.forEach((f, i) => { if (f.status === 'fulfilled') { try { batch[i].load(f.value); results.push({ status: 'fulfilled', value: undefined }) } catch (e) { results.push({ status: 'rejected', reason: e }) } } else results.push(f) })
    }
    const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    const reason = failed[0]?.reason
    const error = reason instanceof Error ? reason.message : reason ? String(reason) : undefined
    const at = new Date().toISOString()
    // Only a complete load is remembered: after a partial or failed one the next visit loads again.
    if (failed.length === 0) setStored<Meta>(META_KEY, { at, user: currentUser })
    settled = true
    setStatus(failed.length === results.length ? { state: 'offline', error } : { state: 'live', at, error })
  })().finally(() => { inflight = null })
  return inflight
}

/** Opening the app: if this browser already holds the lists for this user, use them and do not call the flow; otherwise load them (first use). */
export function startSync(userId: string): Promise<void> {
  currentUser = userId
  const meta = getStored<Meta | null>(META_KEY, null)
  if (meta && meta.user === userId) {
    settled = true
    setStatus({ state: 'live', at: meta.at })
    return Promise.resolve()
  }
  return syncFromDatabase(true)
}

/** After a create / update / delete: load only the affected list again (not all five). A failed reload is logged, not shown. */
export async function syncEntity(entity: Entity): Promise<void> {
  try {
    const j = job(entity)
    j.load(await fetchAll(j.search, j.orderBy))
    const meta = getStored<Meta | null>(META_KEY, null)
    if (meta) setStored<Meta>(META_KEY, { ...meta, at: new Date().toISOString() })
  } catch (e) {
    console.error(`Could not refresh the ${entity} list`, e)
  }
}
