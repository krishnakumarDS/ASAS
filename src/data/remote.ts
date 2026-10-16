// Loads one record's details from SQL (through the flow) when a detail screen opens.
import { useEffect, useState } from 'react'

export interface RemoteState<T> { loading: boolean; data?: T; error?: string }

/** Runs `load` whenever `key` changes (null = do nothing). The result for an older key is never shown. */
export function useRemote<T>(key: string | null, load: () => Promise<T>): RemoteState<T> {
  const [state, setState] = useState<{ key: string | null } & RemoteState<T>>({ key, loading: key != null })
  useEffect(() => {
    if (key == null) return
    let cancelled = false
    setState({ key, loading: true })
    load().then(
      (data) => { if (!cancelled) setState({ key, loading: false, data }) },
      (e) => { if (!cancelled) setState({ key, loading: false, error: e instanceof Error ? e.message : String(e) }) },
    )
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state.key === key ? state : { loading: key != null }
}
