import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

export default function EmptyState({ title, description, action, compact, icon }: { title: string; description?: string; action?: ReactNode; compact?: boolean; icon?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, padding: compact ? '32px 16px' : '72px 16px', color: 'var(--text-secondary)' }}>
      <div style={{ width: compact ? 48 : 64, height: compact ? 48 : 64, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'grid', placeItems: 'center' }}>{icon ?? <Inbox size={compact ? 22 : 28} />}</div>
      <h6 style={{ color: 'var(--text-primary)', fontSize: 15 }}>{title}</h6>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
