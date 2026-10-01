import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface Ctx { dark: boolean; toggle: () => void }
const ThemeCtx = createContext<Ctx>({ dark: false, toggle: () => {} })

const read = () => { try { return localStorage.getItem('theme') === 'dark' } catch { return false } }

/** Dark mode = `.dark` class on <html> (see design.md). App-controlled, not OS-driven. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(read)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('theme', dark ? 'dark' : 'light') } catch { /* ignore */ }
  }, [dark])
  const toggle = useCallback(() => setDark((d) => !d), [])
  const value = useMemo(() => ({ dark, toggle }), [dark, toggle])
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}
export const useTheme = () => useContext(ThemeCtx)
