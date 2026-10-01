export type StatusVariant = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'draft' | 'published' | 'approved' | 'rejected' | 'inprogress' | 'visible' | 'hidden'

const map: Record<StatusVariant, { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  active: { label: 'Active', tone: 'success' }, inactive: { label: 'Inactive', tone: 'neutral' }, pending: { label: 'Pending', tone: 'warning' },
  completed: { label: 'Completed', tone: 'info' }, cancelled: { label: 'Cancelled', tone: 'neutral' }, draft: { label: 'Draft', tone: 'info' },
  published: { label: 'Published', tone: 'info' }, approved: { label: 'Approved', tone: 'success' }, rejected: { label: 'Rejected', tone: 'danger' },
  inprogress: { label: 'In progress', tone: 'warning' }, visible: { label: 'Visible', tone: 'success' }, hidden: { label: 'Hidden', tone: 'neutral' },
}

/** Canonical way to show a status anywhere in the app. */
export default function StatusChip({ status, label }: { status: StatusVariant; label?: string }) {
  const d = map[status]
  return <span className={`badge badge-${d.tone}`}>{label ?? d.label}</span>
}
