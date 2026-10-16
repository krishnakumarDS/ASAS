import type { RemoteState } from '../data/remote'
import { Spinner } from './Loader'

/** Detail-screen status: a spinner while the record's details load; a quiet note if they could not be loaded (the technical reason goes to the console only). */
export default function RemoteBadge({ state }: { state: RemoteState<unknown> }) {
  if (state.loading) return <Spinner size={18} />
  if (state.error) { console.error('Details could not be loaded:', state.error); return <span className="badge badge-warning">Some details could not be loaded</span> }
  return null
}
