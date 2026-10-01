import { initialize } from '@pa-client/power-code-sdk/lib/Lifecycle'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

/** Initializes the Power Platform SDK once on mount. Failure is logged, not fatal:
 * AuthContext surfaces the real error (or dev fallback) when the host context can't be read. */
export default function PowerProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initialize()
      .then(() => console.log('Power Platform SDK initialized successfully'))
      .catch((error) => console.error('Failed to initialize Power Platform SDK', error))
  }, [])
  return <>{children}</>
}
