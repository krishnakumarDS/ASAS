// Browser persistence for everything the user adds or edits. Values live in localStorage under the
// "asas:v1:" prefix, so they survive refreshes and restarts. Seed data is only used until a key is first written.
// Files themselves are not stored (only their names/metadata).
import { useCallback, useSyncExternalStore } from 'react'
import { consultants, developers, plots, standardLimits, substations } from './mock'
import type { Party, Plot, StandardLimit, Substation } from './mock'
import { projects } from './projects'
import type { Project } from './projects'

const PREFIX = 'asas:v2:'
const cache = new Map<string, unknown>()
const subs = new Map<string, Set<() => void>>()

function read<T>(key: string, seed: T): T {
  try { const v = localStorage.getItem(PREFIX + key); return v == null ? seed : (JSON.parse(v) as T) } catch { return seed }
}
export function getStored<T>(key: string, seed: T): T {
  if (!cache.has(key)) cache.set(key, read(key, seed))
  return cache.get(key) as T
}
export function setStored<T>(key: string, value: T) {
  cache.set(key, value)
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)) } catch { /* quota/private mode: keep in memory */ }
  subs.get(key)?.forEach((f) => f())
}
const subscribe = (key: string) => (cb: () => void) => {
  if (!subs.has(key)) subs.set(key, new Set())
  subs.get(key)!.add(cb)
  return () => { subs.get(key)!.delete(cb) }
}
// Keep other tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key?.startsWith(PREFIX)) return
    const key = e.key.slice(PREFIX.length)
    cache.delete(key)
    subs.get(key)?.forEach((f) => f())
  })
}

/** Like useState, but persisted. `seed` must be a stable reference (module constant). */
export function usePersistent<T>(key: string, seed: T) {
  const value = useSyncExternalStore(useCallback(subscribe(key), [key]), () => getStored(key, seed))
  const set = useCallback((u: T | ((p: T) => T)) => {
    const cur = getStored(key, seed)
    setStored(key, typeof u === 'function' ? (u as (p: T) => T)(cur) : u)
  }, [key, seed])
  return [value, set] as const
}

/** Re-reads everything from localStorage (e.g. after another tab changed it) and notifies every screen. */
export function refreshStored() {
  cache.clear()
  subs.forEach((set) => set.forEach((f) => f()))
}

/** Wipes all stored ASAS data (used by "Reset local data"). */
export function clearStored() {
  try { Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k)) } catch { /* ignore */ }
  cache.clear()
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/* ---- entity collections ---- */
export const useProjects = () => usePersistent<Project[]>('projects', projects)
export const usePlots = () => usePersistent<Plot[]>('plots', plots)
export const useSubstations = () => usePersistent<Substation[]>('substations', substations)
export const useLimits = () => usePersistent<StandardLimit[]>('limits', standardLimits)
export const useDevelopers = () => usePersistent<Party[]>('developers', developers)
export const useConsultants = () => usePersistent<Party[]>('consultants', consultants)

/** Non-hook snapshots (e.g. for the chat assistant). */
export const snapshot = {
  projects: () => getStored<Project[]>('projects', projects),
  plots: () => getStored<Plot[]>('plots', plots),
  substations: () => getStored<Substation[]>('substations', substations),
  developers: () => getStored<Party[]>('developers', developers),
  consultants: () => getStored<Party[]>('consultants', consultants),
}
