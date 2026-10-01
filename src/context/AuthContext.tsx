import { getContext } from '@microsoft/power-apps/app'
import { initialize } from '@pa-client/power-code-sdk/lib/Lifecycle'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export interface User { id: string; name: string; email: string; role: string; initials: string }
interface Ctx { user: User | null; loading: boolean; error: string | null }
const AuthCtx = createContext<Ctx>({ user: null, loading: true, error: null })

const initialsOf = (name: string) => name.split(/[\s.@_-]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Timed out waiting for the Power Platform host.')), ms))])

/** Local-only identity so `npm run dev:web` (plain browser, no Power host) is still usable. Never used in a production build. */
const DEV_USER: User = { id: 'dev-user', name: 'Venkat Reddy', email: 'venkat.reddy@dewa.gov.ae', role: 'Engineer', initials: 'VR' }

/** Identity comes from the Power Platform host (the signed-in Entra ID user via
 * @microsoft/power-apps getContext) — there is no login form and nothing is persisted locally.
 * Add an allow-list/role lookup here once ASAS user/role tables exist in Dataverse. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await withTimeout(initialize(), 6000)
        const ctx = await withTimeout(getContext(), 6000)
        const email = ctx.user.userPrincipalName ?? ''
        const name = ctx.user.fullName || email || 'Unknown User'
        if (!cancelled) setUser({ id: ctx.user.objectId || email || name, name, email, role: 'Engineer', initials: initialsOf(name) })
      } catch (err) {
        if (cancelled) return
        if (import.meta.env.DEV) setUser(DEV_USER)
        else setError(err instanceof Error ? err.message : 'Failed to resolve the signed-in user.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const value = useMemo(() => ({ user, loading, error }), [user, loading, error])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
export const useAuth = () => useContext(AuthCtx)
