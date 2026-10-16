/** Small inline spinner (uses the app's .spinner style). */
export function Spinner({ size = 16 }: { size?: number }) {
  return <span className="spinner" style={{ width: size, height: size, color: 'var(--accent-600)' }} role="status" aria-label="Loading" />
}

/** Centered spinner shown instead of a page while its data is loading. */
export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={{ minHeight: 'calc(60 * var(--vh))', display: 'grid', placeItems: 'center' }} role="status" aria-live="polite">
      <div className="row" style={{ gap: 12 }}><span className="spinner" style={{ width: 28, height: 28, color: 'var(--accent-600)' }} aria-hidden /><span className="muted">{label}</span></div>
    </div>
  )
}
