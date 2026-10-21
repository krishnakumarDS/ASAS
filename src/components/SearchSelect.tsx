import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, X } from 'lucide-react'

/** A dropdown you can type into: click to open, type to narrow the list, click a name to choose it, "All" clears it. */
export default function SearchSelect({ value, onChange, options, placeholder, label }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string; label: string }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const close = () => { setOpen(false); setQ('') }
  const ref = useRef<HTMLDivElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ left: number; top: number; width: number } | null>(null)
  // The list is drawn on the page itself (not inside the card), so a card edge or the card below never covers it.
  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => { const t = e.target as Node; if (!ref.current?.contains(t) && !pop.current?.contains(t)) close() }
    const move = (e: Event) => { if (!pop.current?.contains(e.target as Node)) close() }
    document.addEventListener('mousedown', down)
    window.addEventListener('scroll', move, true)
    window.addEventListener('resize', close)
    return () => { document.removeEventListener('mousedown', down); window.removeEventListener('scroll', move, true); window.removeEventListener('resize', close) }
  }, [open])
  const toggle = () => {
    if (open) { close(); return }
    const r = ref.current?.getBoundingClientRect()
    if (r) setBox({ left: r.left, top: r.bottom + 4, width: Math.max(r.width, 240) })
    setOpen(true)
  }
  const shown = useMemo(() => options.filter((o) => o.toLowerCase().includes(q.trim().toLowerCase())), [options, q])
  const pick = (v: string) => { onChange(v); close() }
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" className="input" aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={toggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, textAlign: 'left', cursor: 'pointer', width: '100%' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: value ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{value || placeholder}</span>
        {value
          ? <X size={15} aria-label={`Clear ${label}`} onClick={(e) => { e.stopPropagation(); pick('') }} />
          : <ChevronDown size={16} />}
      </button>
      {open && box && createPortal(
        <div ref={pop} role="listbox" aria-label={label} style={{ position: 'fixed', top: box.top, left: box.left, width: box.width, zIndex: 2000, background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', boxShadow: '0 12px 28px rgba(0,0,0,0.16)', padding: 8 }}>
          <input className="input" autoFocus placeholder="Type to search…" aria-label={`Search ${label}`} value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') close(); if (e.key === 'Enter' && shown.length) pick(shown[0]) }} />
          <ul style={{ marginTop: 8, maxHeight: 240, overflow: 'auto' }}>
            <li><button type="button" className="lookup-item" onClick={() => pick('')} style={!value ? { fontWeight: 600, color: 'var(--accent-600)' } : undefined}>All</button></li>
            {shown.map((o) => <li key={o}><button type="button" role="option" aria-selected={o === value} className="lookup-item" onClick={() => pick(o)} style={o === value ? { fontWeight: 600, color: 'var(--accent-600)', background: 'var(--accent-50)' } : undefined}>{o}</button></li>)}
            {shown.length === 0 && <li className="faint" style={{ padding: '8px 12px', fontSize: 13 }}>No match</li>}
          </ul>
        </div>, document.body)}
    </div>
  )
}
