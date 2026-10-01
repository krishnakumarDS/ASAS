import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export interface User { name: string; email: string; role: string; initials: string }
interface Ctx { user: User | null; login: () => Promise<void>; logout: () => void }
const AuthCtx = createContext<Ctx>({ user: null, login: async () => {}, logout: () => {} })
const KEY = 'asas-session'

const titleCase = (s: string) => s.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim()
const readUser = (): User | null => { try { const v = localStorage.getItem(KEY); return v ? (JSON.parse(v) as User) : null } catch { return null } }

/** Demo-only auth: Get Started signs in a default user. Replace `login` with the real identity provider (e.g. SSO). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readUser)
  const login = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 700))
    const email = 'venkat.reddy@dewa.gov.ae'
    const name = titleCase(email.split('@')[0])
    const u: User = { name, email, role: 'Engineer', initials: name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() }
    try { localStorage.setItem(KEY, JSON.stringify(u)) } catch { /* ignore */ }
    setUser(u)
  }, [])
  const logout = useCallback(() => { try { localStorage.removeItem(KEY) } catch { /* ignore */ } setUser(null) }, [])
  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
export const useAuth = () => useContext(AuthCtx)
