import type { ReactNode } from 'react'

/** Titled form card with a staggered reveal. */
export default function Section({ title, icon, index = 0, children, action }: { title: string; icon?: ReactNode; index?: number; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="card pad reveal-item" style={{ ['--index' as string]: index }}>
      <div className="row between" style={{ marginBottom: 16 }}><div className="section-title" style={{ margin: 0 }}>{icon}{title}</div>{action}</div>
      {children}
    </section>
  )
}
