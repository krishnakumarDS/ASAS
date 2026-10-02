import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Sparkles, ChevronLeft, ChevronRight, MoreVertical, Search, SlidersHorizontal, Upload, X } from 'lucide-react'
import AppButton from '../common/AppButton'
import EmptyState from '../common/EmptyState'
import IconButton from '../common/IconButton'

/* ---------- fields ---------- */
const Label = ({ label, required, htmlFor }: { label: string; required?: boolean; htmlFor?: string }) => <label htmlFor={htmlFor}>{label}{required && <span className="req" aria-hidden>*</span>}</label>

interface TextProps { label: string; value: string; onChange?: (v: string) => void; required?: boolean; error?: string; type?: string; readOnly?: boolean; placeholder?: string; multiline?: boolean }
export function TextField({ label, value, onChange, required, error, type = 'text', readOnly, placeholder, multiline }: TextProps) {
  const cls = `${multiline ? 'textarea' : 'input'}${error ? ' invalid' : ''}`
  const id = useId()
  return (
    <div className="field">
      <Label label={label} required={required} htmlFor={id} />
      {multiline
        ? <textarea id={id} className={cls} value={value} placeholder={placeholder} readOnly={readOnly} onChange={(e) => onChange?.(e.target.value)} aria-invalid={!!error} />
        : <input id={id} className={cls} type={type} value={value} placeholder={placeholder} readOnly={readOnly} onChange={(e) => onChange?.(e.target.value)} aria-invalid={!!error} />}
      {error && <span className="error-text" role="alert">{error}</span>}
    </div>
  )
}

interface SelectProps { label: string; value: string; options: string[]; onChange?: (v: string) => void; required?: boolean; error?: string; disabled?: boolean }
export function SelectField({ label, value, options, onChange, required, error, disabled }: SelectProps) {
  const id = useId()
  return (
    <div className="field">
      <Label label={label} required={required} htmlFor={id} />
      <select id={id} className={`select${error ? ' invalid' : ''}`} value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} aria-invalid={!!error}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <span className="error-text" role="alert">{error}</span>}
    </div>
  )
}

interface RadioProps { label: string; value: string; options?: string[]; onChange?: (v: string) => void; required?: boolean; error?: string; disabled?: boolean }
export function RadioField({ label, value, options = ['Yes', 'No'], onChange, required, error, disabled }: RadioProps) {
  const name = useRef(`r-${Math.random().toString(36).slice(2)}`).current
  return (
    <div className="field" role="radiogroup" aria-label={label}>
      <span className="label">{label}{required && <span className="req">*</span>}</span>
      <div className="radio-group">
        {options.map((o) => <label className="radio" key={o}><input type="radio" name={name} disabled={disabled} checked={value === o} onChange={() => onChange?.(o)} /> {o}</label>)}
      </div>
      {error && <span className="error-text" role="alert">{error}</span>}
    </div>
  )
}

interface PickProps { label: string; value: string; onPick: () => void; buttonLabel: string; required?: boolean; error?: string; disabled?: boolean }
export function PickField({ label, value, onPick, buttonLabel, required, error, disabled }: PickProps) {
  const id = useId()
  return (
    <div className="field">
      <Label label={label} required={required} htmlFor={id} />
      <div className="with-action">
        <input id={id} className={`input${error ? ' invalid' : ''}`} value={value} readOnly placeholder="Not selected" />
        <AppButton variant="outlined" disabled={disabled} onClick={onPick} startIcon={<Search size={15} />}>{buttonLabel}</AppButton>
      </div>
      {error && <span className="error-text" role="alert">{error}</span>}
    </div>
  )
}

interface FileProps { label?: string; file: File | null; onFile: (f: File | null) => void; hint: string; accept?: string }
export function FileDrop({ label = 'Select a file to upload', file, onFile, hint, accept }: FileProps) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="field">
      <Label label={label} />
      <div className="with-action">
        <input className="input" readOnly value={file?.name ?? ''} placeholder="No file chosen" />
        <AppButton variant="outlined" onClick={() => ref.current?.click()} startIcon={<Upload size={15} />}>Browse</AppButton>
        <input ref={ref} type="file" accept={accept} hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      </div>
      <span className="hint">{hint}</span>
    </div>
  )
}

interface InputProps { label?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; id?: string; style?: React.CSSProperties; autoFocus?: boolean }
export function AppInput({ label, value, onChange, placeholder, id, style, autoFocus }: InputProps) {
  return (
    <div className="field" style={{ marginBottom: label ? undefined : 0, ...style }}>
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} className="input" value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus} aria-label={label ?? placeholder} />
    </div>
  )
}

/* ---------- overlays ---------- */
export function Modal({ title, onClose, children, footer, size = 'md' }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = prev }
  }, [onClose])
  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal-panel size-${size}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>{title}</h2><IconButton small onClick={onClose} aria-label="Close"><X size={18} /></IconButton></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function LookupModal({ title, items, onPick, onClose }: { title: string; items: string[]; onPick: (v: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  const shown = items.filter((i) => i.toLowerCase().includes(q.toLowerCase()))
  return (
    <Modal title={title} size="sm" onClose={onClose}>
      <input className="input" autoFocus placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
      <ul style={{ marginTop: 12, maxHeight: 300, overflow: 'auto' }}>
        {shown.map((i) => <li key={i}><button className="lookup-item" onClick={() => { onPick(i); onClose() }}>{i}</button></li>)}
        {shown.length === 0 && <EmptyState compact title="No matches" />}
      </ul>
    </Modal>
  )
}

export function useToast(): [ReactNode, (m: string) => void] {
  const [msg, setMsg] = useState('')
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(''), 2400); return () => clearTimeout(t) }, [msg])
  return [msg ? <div className="toast" role="status">{msg}</div> : null, setMsg]
}

/* ---------- navigation / data ---------- */
export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => <button key={t} role="tab" aria-selected={t === active} className={`tab${t === active ? ' active' : ''}`} onClick={() => onChange(t)}>{t}</button>)}
    </div>
  )
}

export interface Column<T> { header: string; render: (row: T) => ReactNode; align?: 'right'; sort?: { active: boolean; asc: boolean; onToggle: () => void } }
export function DataTable<T extends { id: string }>({ columns, rows, empty = 'No records found.' }: { columns: Column<T>[]; rows: T[]; empty?: string }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header} className={c.align} aria-sort={c.sort?.active ? (c.sort.asc ? 'ascending' : 'descending') : undefined}>
                {c.sort ? <button className="sort-btn" onClick={c.sort.onToggle}>{c.header}{c.sort.active ? (c.sort.asc ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}</button> : c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map((r) => <tr key={r.id}>{columns.map((c) => <td key={c.header} className={c.align}>{c.render(r)}</td>)}</tr>)}</tbody>
      </table>
      {rows.length === 0 && <EmptyState compact title={empty} />}
    </div>
  )
}

export function usePaged<T>(rows: T[], size = 8) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(page, pages)
  return { visible: rows.slice((current - 1) * size, current * size), page: current, pages, setPage, total: rows.length }
}

export function Pager({ page, pages, setPage }: { page: number; pages: number; setPage: (n: number) => void }) {
  return (
    <div className="table-footer">
      <span>Page {page} of {pages}</span>
      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} className={n === page ? 'on' : ''} onClick={() => setPage(n)} aria-current={n === page ? 'page' : undefined}>{n}</button>)}
        <button disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
      </div>
    </div>
  )
}

export function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])
  return ref
}

export function ActionsMenu({ items }: { items: { label: string; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClose(() => setOpen(false))
  return (
    <div className="menu" ref={ref}>
      <IconButton small onClick={() => setOpen(!open)} aria-label="Actions" aria-expanded={open}><MoreVertical size={17} /></IconButton>
      {open && <div className="menu-pop" role="menu">{items.map((i) => <button key={i.label} role="menuitem" className={i.danger ? 'danger' : ''} onClick={() => { setOpen(false); i.onClick() }}>{i.label}</button>)}</div>}
    </div>
  )
}

/** Horizontal filter bar: primary fields always visible, `advanced` fields behind a toggle. */
export function FilterBar({ children, advanced, onSearch, onClear, resultText }: { children: ReactNode; advanced?: ReactNode; onSearch: () => void; onClear: () => void; resultText?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <form className="card toolbar" onSubmit={(e) => { e.preventDefault(); onSearch() }}>
      <div className="toolbar-grid">{children}
        <div className="toolbar-actions" style={{ marginBottom: 12 }}>
          {advanced && <AppButton type="button" variant="outlined" onClick={() => setOpen(!open)} startIcon={<SlidersHorizontal size={15} />} endIcon={<ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />}>More</AppButton>}
          <AppButton type="button" variant="outlined" onClick={onClear}>Clear</AppButton>
          <AppButton type="submit" variant="contained" startIcon={<Search size={15} />}>Search</AppButton>
        </div>
      </div>
      {advanced && open && <div className="advanced"><div className="toolbar-grid">{advanced}</div></div>}
      {resultText && <div className="faint" style={{ fontSize: 12 }}>{resultText}</div>}
    </form>
  )
}

/* ---------- sorting ---------- */
/** Click-to-sort for any column: `getters` maps a column key to a sortable value. Sort happens before paging. */
export function useSort<T>(rows: T[], getters: Record<string, (r: T) => string | number>) {
  const [key, setKey] = useState<string | null>(null)
  const [asc, setAsc] = useState(true)
  const g = useRef(getters)
  g.current = getters
  const sorted = useMemo(() => {
    if (!key || !g.current[key]) return rows
    const get = g.current[key]
    return [...rows].sort((a, b) => {
      const x = get(a), y = get(b)
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: 'base' })
      return asc ? c : -c
    })
  }, [rows, key, asc])
  const sortFor = (k: string) => ({ active: key === k, asc, onToggle: () => { if (key === k) setAsc(!asc); else { setKey(k); setAsc(true) } } })
  return { sorted, sortFor }
}

/* ---------- smart (natural-language) search ---------- */
const STOP = new Set(['show', 'me', 'all', 'find', 'list', 'the', 'of', 'for', 'with', 'in', 'a', 'an', 'and', 'by', 'who', 'which', 'are', 'is', 'that', 'have', 'has', 'get', 'give', 'display'])
/** Words naming the list itself ("hidden projects") are optional — they only count if they actually appear in the row. */
const ENTITY = new Set(['project', 'plot', 'substation', 'developer', 'consultant', 'record', 'item', 'result'])
/** Every other meaningful word in the query must appear somewhere in the row's text. */
export function matchQuery(text: string, query: string) {
  const t = text.toLowerCase()
  return query.toLowerCase().split(/[\s,]+/).filter((w) => w && !STOP.has(w)).every((w) => t.includes(w) || ENTITY.has(w.replace(/s$/, '')))
}

export function AiSearchBar({ value, onChange, placeholder, suggestions = [], resultText }: { value: string; onChange: (v: string) => void; placeholder: string; suggestions?: string[]; resultText?: string }) {
  return (
    <div className="card toolbar ai-search reveal-item">
      <div className="ai-input">
        <Sparkles size={18} className="ai-ico" />
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label="Smart search" />
        {value && <IconButton small onClick={() => onChange('')} aria-label="Clear search"><X size={16} /></IconButton>}
      </div>
      <div className="row wrap" style={{ gap: 8, marginTop: 10 }}>
        {resultText && <span className="faint" style={{ fontSize: 12, marginRight: 4 }}>{resultText}</span>}
        {suggestions.map((s) => <button key={s} type="button" className="chip" onClick={() => onChange(s)}>{s}</button>)}
      </div>
    </div>
  )
}
