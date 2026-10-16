// Calls the Retrieve_SQL_Data flow (Power Apps trigger -> sp_UC000420_Api) and returns the SQL result sets.
// The flow's two inputs are named text (Action) and text_1 (Inputs: the JSON) by the generated service.
import { useSyncExternalStore } from 'react'
import { Retrieve_SQL_DataService } from '../generated'

export type Row = Record<string, unknown>

/* How many requests are running right now: drives the spinner in the header. */
let pending = 0
const busyListeners = new Set<() => void>()
const bump = (d: number) => { pending += d; busyListeners.forEach((f) => f()) }
export const useApiBusy = () => useSyncExternalStore((cb) => { busyListeners.add(cb); return () => { busyListeners.delete(cb) } }, () => pending > 0)

/** What to show the user when something fails: SQL / flow / connection wording is replaced by a plain message (the original goes to the console). */
export function userMessage(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const raw = e instanceof Error ? e.message : String(e ?? '')
  console.error(raw)
  return !raw || /BadGateway|\b502\b|NoResponse|flow|connection reference|Microsoft SQL|Invalid (object|column)|ALTERd|sp_UC|time[d ]?out|Failed to fetch|ResultSets|upstream|input|database|SQL/i.test(raw) ? fallback : raw
}

/** Runs one dispatcher action. Resolves with the result sets in order (Table1, Table2, …); rejects if the flow or the procedure fails. */
export async function callApi(action: string, params: Record<string, unknown> = {}): Promise<Row[][]> {
  bump(1)
  try { return await callApiNow(action, params) } finally { bump(-1) }
}

async function callApiNow(action: string, params: Record<string, unknown>): Promise<Row[][]> {
  const r = await Retrieve_SQL_DataService.Run({ text: action, text_1: JSON.stringify(params) })
  if (!r.success) throw new Error(r.error?.message ?? `The flow call failed (${action}).`)
  const raw = r.data?.output
  if (!raw) throw new Error(`The flow returned no data (${action}).`)
  const body = JSON.parse(raw) as { ResultSets?: Record<string, Row[]>; message?: string }
  // When the flow is set to answer on failure, `output` carries the SQL error (e.g. a THROW message) instead of result sets.
  if (!body.ResultSets && typeof body.message === 'string') throw new Error(body.message)
  const sets = body.ResultSets ?? {}
  const num = (k: string) => Number(k.replace(/\D/g, '')) || 0
  return Object.keys(sets).sort((a, b) => num(a) - num(b)).map((k) => sets[k])
}

const PAGE = 500 // the dispatcher accepts at most 500 rows per page

/** Reads every row of a Search* list: asks <search>_Count for the total, then fetches all pages in parallel. */
export async function fetchAll(search: string, orderBy: string): Promise<Row[]> {
  const counted = await callApi(`${search}_Count`)
  const total = Number(counted[0]?.[0]?.TotalCount ?? 0)
  const pages = Math.max(1, Math.ceil(total / PAGE))
  const chunks = await Promise.all(
    Array.from({ length: pages }, (_, i) => callApi(search, { pageSize: PAGE, pageNumber: i + 1, orderBy, sort: 'ASC' }).then((t) => t[0] ?? [])),
  )
  return chunks.flat()
}
