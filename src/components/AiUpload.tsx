import { useRef, useState } from 'react'
import { FileSpreadsheet, Sparkles, Upload } from 'lucide-react'
import AppButton from './common/AppButton'
import { Modal } from './ui'

export interface TargetField { key: string; label: string; synonyms: string[]; required?: boolean }
type Row = Record<string, string>
interface SheetResult { name: string; headers: string[]; rows: string[][]; map: Record<number, string>; unmapped: string[] }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
/** Maps spreadsheet headers to target fields by normalised name/synonym (exact first, then containment). */
function mapHeaders(headers: string[], fields: TargetField[]) {
  const map: Record<number, string> = {}
  const used = new Set<string>()
  const score = (h: string, f: TargetField) => {
    const n = norm(h)
    const names = [f.label, f.key, ...f.synonyms].map(norm)
    if (names.includes(n)) return 2
    return names.some((x) => x.length > 3 && (n.includes(x) || x.includes(n))) && n.length > 2 ? 1 : 0
  }
  headers.forEach((h, i) => {
    let best: TargetField | null = null, bs = 0
    for (const f of fields) { if (used.has(f.key)) continue; const sc = score(h, f); if (sc > bs) { bs = sc; best = f } }
    if (best) { map[i] = best.key; used.add(best.key) }
  })
  return { map, unmapped: headers.filter((_, i) => !(i in map) && headers[i]) }
}

async function readSheets(file: File): Promise<{ name: string; grid: string[][] }[]> {
  if (/\.csv$/i.test(file.name)) {
    const text = await file.text()
    const grid = text.split(/\r?\n/).filter(Boolean).map((l) => l.split(',').map((c) => c.replace(/^"|"$/g, '').trim()))
    return [{ name: 'CSV', grid }]
  }
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(await file.arrayBuffer())
  return wb.worksheets.map((ws) => {
    const grid: string[][] = []
    ws.eachRow({ includeEmpty: false }, (row) => { grid.push((row.values as unknown[]).slice(1).map((v) => (v == null ? '' : typeof v === 'object' && 'text' in (v as object) ? String((v as { text: unknown }).text) : String(v)).trim())) })
    return { name: ws.name, grid }
  })
}

interface Props { entity: string; fields: TargetField[]; onClose: () => void; onImport: (rows: Row[]) => void }

/** Multi-sheet spreadsheet import with automatic column mapping: every sheet is read, headers are matched to the target fields, and only rows with the required fields are imported. */
export default function AiUpload({ entity, fields, onClose, onImport }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [sheets, setSheets] = useState<SheetResult[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const analyse = async (f: File) => {
    setFile(f); setBusy(true); setError(''); setSheets([])
    try {
      const raw = await readSheets(f)
      const out: SheetResult[] = raw.filter((s) => s.grid.length > 1).map((s) => {
        const headers = s.grid[0]
        const { map, unmapped } = mapHeaders(headers, fields)
        return { name: s.name, headers, rows: s.grid.slice(1), map, unmapped }
      })
      if (!out.length) setError('No data rows were found in this file.')
      setSheets(out)
    } catch { setError('This file could not be read. Use a valid .xlsx or .csv file.') }
    setBusy(false)
  }

  const required = fields.filter((f) => f.required)
  const toRows = (s: SheetResult): Row[] => s.rows.map((r) => { const o: Row = {}; Object.entries(s.map).forEach(([i, k]) => { o[k] = r[Number(i)] ?? '' }); return o }).filter((o) => required.every((f) => (o[f.key] ?? '').trim()))
  const usable = sheets.map((s) => ({ s, rows: toRows(s), ok: required.every((f) => Object.values(s.map).includes(f.key)) }))
  const total = usable.filter((u) => u.ok).reduce((a, u) => a + u.rows.length, 0)

  return (
    <Modal title={`AI upload — ${entity}`} size="lg" onClose={onClose} footer={
      <>
        <AppButton variant="outlined" onClick={onClose}>Cancel</AppButton>
        <AppButton variant="contained" disabled={!total} startIcon={<Upload size={15} />} onClick={() => { onImport(usable.filter((u) => u.ok).flatMap((u) => u.rows)); onClose() }}>Import {total ? `${total} rows` : ''}</AppButton>
      </>
    }>
      <p className="muted" style={{ marginBottom: 14 }}>Upload a workbook with <b>one or more sheets</b>. Each sheet is read and its columns are matched to {entity.toLowerCase()} fields automatically — no template needed.</p>
      <div className="with-action" style={{ marginBottom: 16 }}>
        <input className="input" readOnly value={file?.name ?? ''} placeholder="No file chosen (.xlsx, .xls or .csv)" />
        <AppButton variant="outlined" startIcon={<FileSpreadsheet size={15} />} onClick={() => ref.current?.click()}>Browse</AppButton>
        <input ref={ref} type="file" hidden accept=".xlsx,.csv" onChange={(e) => e.target.files?.[0] && analyse(e.target.files[0])} />
      </div>
      {busy && <p className="row" style={{ gap: 8 }}><span className="spinner" /> Reading sheets…</p>}
      {error && <p className="error-text" role="alert">{error}</p>}
      {usable.map(({ s, rows, ok }) => (
        <section key={s.name} className="card pad" style={{ marginBottom: 12, boxShadow: 'none' }}>
          <div className="row between wrap"><b className="row" style={{ gap: 8 }}><Sparkles size={15} style={{ color: 'var(--accent-600)' }} />Sheet: {s.name}</b><span className={`badge ${ok ? 'badge-success' : 'badge-danger'}`}>{ok ? `${rows.length} rows ready` : 'Missing required columns'}</span></div>
          <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
            {fields.map((f) => { const hit = Object.entries(s.map).find(([, k]) => k === f.key); return <span key={f.key} className={`chip`} style={hit ? { background: 'var(--accent-50)', color: 'var(--accent-600)', borderColor: 'var(--accent-100)' } : undefined}>{f.label}{f.required ? '*' : ''} ← {hit ? s.headers[Number(hit[0])] : 'not found'}</span> })}
          </div>
          {s.unmapped.length > 0 && <p className="faint" style={{ fontSize: 12, marginTop: 8 }}>Ignored columns: {s.unmapped.join(', ')}</p>}
        </section>
      ))}
    </Modal>
  )
}
export const FIELDS = {
  projects: [
    { key: 'name', label: 'Project name', synonyms: ['project', 'name', 'projecttitle'], required: true },
    { key: 'maalemRef', label: 'Maalem ref', synonyms: ['maalemdubairef', 'ref', 'reference', 'mpref', 'projectref'], required: true },
    { key: 'developer', label: 'Developer', synonyms: ['developername', 'owner'] },
  ],
  plots: [
    { key: 'maalemRef', label: 'Maalem ref', synonyms: ['maalemdubairef', 'projectref', 'mpref', 'reference'], required: true },
    { key: 'devPlot', label: 'Developer plot no.', synonyms: ['devplot', 'devplotnumber', 'plotno', 'plotnumber', 'developerplot'], required: true },
    { key: 'dmPlot', label: 'DM plot no.', synonyms: ['dmplot', 'dmplotnumber', 'dubaimunicipalityplot'] },
    { key: 'developer', label: 'Developer', synonyms: ['developername'] },
    { key: 'consultant', label: 'Consultant', synonyms: ['consultantname'] },
  ],
  substations: [
    { key: 'name', label: 'Substation name', synonyms: ['substation', 'name', 'substationname'], required: true },
    { key: 'scada', label: 'SCADA name', synonyms: ['substationscadaname', 'scada', 'subscadaname'], required: true },
    { key: 'builtBy', label: 'Built by', synonyms: ['builder', 'builtby', 'constructedby'] },
  ],
} satisfies Record<string, TargetField[]>
