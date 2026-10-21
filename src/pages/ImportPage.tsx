import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, Upload } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import Section from '../components/common/Section'
import StatusChip from '../components/common/StatusChip'
import PageHeader from '../components/PageHeader'
import { DataTable, FileDrop, SelectField, useToast } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { userMessage } from '../data/api'
import { IMPORTS } from '../data/importConfig'
import type { ImportField } from '../data/importConfig'
import { useConsultants, useDevelopers, usePlots, useProjects, useSubstations } from '../data/store'
import { syncEntity, useSyncStatus } from '../data/sync'
import { createMany } from '../data/write'
import { parsePwld } from '../data/pwld'
import PwldImport from './PwldImport'

const MAX_ROWS = 5000   // rows per upload
const BATCH = 500       // rows sent per call (the server accepts up to 1000)
const MAX_MB = 5
const PWLD_LABEL = 'Plots: Plot-wise Load Details (PWLD) file'  // consultants' workbook layout, handled by PwldImport

interface Sheet { name: string; headers: string[]; rows: unknown[][] }
interface Parsed { id: string; line: number; values: Record<string, unknown>; errors: string[] }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const blank = (v: unknown) => v == null || (typeof v === 'string' && v.trim() === '')

/** A cell as plain data: formulas give their result, rich text and links their text. */
function cellValue(v: unknown): unknown {
  if (v == null) return null
  if (v instanceof Date) return v
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    if ('result' in o) return cellValue(o.result)
    if ('richText' in o && Array.isArray(o.richText)) return (o.richText as { text: string }[]).map((t) => t.text).join('')
    if ('text' in o) return String(o.text)
    return null
  }
  return v
}

async function readWorkbook(file: File): Promise<Sheet[]> {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(await file.arrayBuffer())
  const sheets: Sheet[] = []
  wb.eachSheet((ws) => {
    const grid: unknown[][] = []
    ws.eachRow({ includeEmpty: false }, (row) => { grid.push(Array.from((row.values as unknown[]).slice(1), cellValue)) })
    if (grid.length < 2) return
    const headers = grid[0].map((h) => String(h ?? '').trim())
    sheets.push({ name: ws.name, headers, rows: grid.slice(1).filter((r) => r.some((c) => !blank(c))) })
  })
  return sheets
}

function toDate(v: unknown): string | null {
  const ymd = (y: number, m: number, d: number) => { const t = new Date(Date.UTC(y, m - 1, d)); return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d ? t.toISOString().slice(0, 10) : null }
  if (v instanceof Date) return Number.isNaN(+v) ? null : v.toISOString().slice(0, 10)
  if (typeof v === 'number') return Number.isFinite(v) ? new Date(Math.round((v - 25569) * 86400000)).toISOString().slice(0, 10) : null // Excel date serial
  const s = String(v).trim()
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return ymd(+m[1], +m[2], +m[3])
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/) // day first
  return m ? ymd(+m[3], +m[2], +m[1]) : null
}

function autoMap(headers: string[], fields: ImportField[]): Record<string, number> {
  const map: Record<string, number> = {}
  const used = new Set<number>()
  for (const f of fields) {
    const names = [f.label, f.key, ...(f.synonyms ?? [])].map(norm)
    const i = headers.findIndex((h, idx) => !used.has(idx) && names.includes(norm(h)))
    map[f.key] = i
    if (i >= 0) used.add(i)
  }
  return map
}

/** Bulk import from an Excel workbook (.xlsx only): pick the table, match the columns, check every row, then add the valid rows in batches. */
export default function ImportPage() {
  const { user } = useAuth()
  const live = useSyncStatus().state === 'live'
  const [toast, say] = useToast()
  const [developers] = useDevelopers()
  const [consultants] = useConsultants()
  const [substations] = useSubstations()
  const [projects] = useProjects()
  const [plots] = usePlots()

  // ?table=project|plot|substation|developer|consultant preselects the table (entry point from each list page)
  const [params, setParams] = useSearchParams()
  const initial = IMPORTS.find((e) => e.entity === params.get('table'))
  const [label, setLabel] = useState(params.get('table') === 'pwld' ? PWLD_LABEL : initial?.label ?? IMPORTS[0].label)
  const isPwld = label === PWLD_LABEL
  const [pwldFile, setPwldFile] = useState<File | null>(null) // a file the standard import recognised as a PWLD workbook
  const cfg = IMPORTS.find((e) => e.label === label) ?? IMPORTS[0]
  const [file, setFile] = useState<File | null>(null)
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [sheetIdx, setSheetIdx] = useState(0)
  const [map, setMap] = useState<Record<string, number>>({})
  const [reading, setReading] = useState(false)
  const [fileError, setFileError] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<{ added: number; error: string; detail?: string } | null>(null)
  const sheet = sheets[sheetIdx]

  const reset = () => { setFile(null); setSheets([]); setSheetIdx(0); setMap({}); setFileError(''); setResult(null) }
  const changeTable = (l: string) => {
    const next = IMPORTS.find((e) => e.label === l)
    setLabel(l)
    setPwldFile(null)
    setParams(next ? { table: next.entity } : l === PWLD_LABEL ? { table: 'pwld' } : {})
    reset()
  }

  const pickFile = async (f: File | null) => {
    reset()
    if (!f) return
    if (!/\.xlsx$/i.test(f.name)) { setFileError('Only Excel files (.xlsx) are allowed.'); return }
    if (f.size > MAX_MB * 1024 * 1024) { setFileError(`The file is larger than ${MAX_MB} MB.`); return }
    setFile(f); setReading(true)
    try {
      const s = await readWorkbook(f)
      // No heading matches on the first row: a Plot-wise Load Details workbook (headings below the project / developer / consultant block) is read by its own importer.
      if (!s.length || Object.values(autoMap(s[0].headers, cfg.fields)).every((i) => i < 0)) {
        try { await parsePwld(await f.arrayBuffer()); setPwldFile(f); setLabel(PWLD_LABEL); setParams({ table: 'pwld' }); setFile(null); setReading(false); return } catch { /* not a PWLD file: carry on with the standard import */ }
      }
      if (!s.length) setFileError('The workbook has no data rows. Put the column headings in the first row and the data below.')
      else if (s[0].rows.length > MAX_ROWS) setFileError(`The first sheet has more than ${MAX_ROWS.toLocaleString('en')} rows. Split the file and import it in parts.`)
      else { setSheets(s); setMap(autoMap(s[0].headers, cfg.fields)) }
    } catch { setFileError('This file could not be read. Use a valid Excel workbook (.xlsx).') }
    setReading(false)
  }
  const pickSheet = (i: number) => { setSheetIdx(i); setMap(autoMap(sheets[i].headers, cfg.fields)); setResult(null) }

  const downloadTemplate = async () => {
    const { default: ExcelJS } = await import('exceljs')
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet(cfg.label)
    ws.columns = cfg.fields.map((f) => ({ header: f.required ? `${f.label} *` : f.label, key: f.key, width: Math.max(18, f.label.length + 6) }))
    ws.getRow(1).font = { bold: true }
    const buf = await wb.xlsx.writeBuffer()
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })), download: `${cfg.entity}-import-template.xlsx` })
    a.click(); URL.revokeObjectURL(a.href)
  }

  /* ---- check every row ---- */
  const lookups = useMemo(() => {
    const by = (list: { id: string; name: string }[]) => new Map(list.map((x) => [x.name.trim().toLowerCase(), x.id]))
    return { developer: by(developers), consultant: by(consultants), substation: by(substations) }
  }, [developers, consultants, substations])
  const existing = useMemo(() => {
    const set = new Set<string>()
    if (cfg.entity === 'project') projects.forEach((p) => set.add(p.maalemRef.toLowerCase()))
    if (cfg.entity === 'plot') plots.forEach((p) => set.add(`${p.maalemRef}|${p.devPlot}`.toLowerCase()))
    if (cfg.entity === 'substation') substations.forEach((s) => set.add(s.name.toLowerCase()))
    if (cfg.entity === 'developer') developers.forEach((d) => set.add(d.name.toLowerCase()))
    if (cfg.entity === 'consultant') consultants.forEach((c) => set.add(c.name.toLowerCase()))
    return set
  }, [cfg.entity, projects, plots, substations, developers, consultants])

  const missingColumns = cfg.fields.filter((f) => f.required && (map[f.key] ?? -1) < 0)
  const rows = useMemo<Parsed[]>(() => {
    if (!sheet) return []
    const keyOf = (v: Record<string, unknown>) => String(
      cfg.entity === 'project' ? v.MaalemDubaiRef : cfg.entity === 'plot' ? `${v.MaalemDubaiRef}|${v.DevPlotNum}` : cfg.entity === 'substation' ? v.SubstationName : cfg.entity === 'developer' ? v.DeveloperName : v.ConsultantName).toLowerCase()
    const seen = new Set<string>()
    return sheet.rows.map((r, i) => {
      const values: Record<string, unknown> = {}
      const errors: string[] = []
      for (const f of cfg.fields) {
        const idx = map[f.key] ?? -1
        const raw = idx >= 0 ? r[idx] : null
        if (blank(raw)) { if (f.required) errors.push(`${f.label} is required`); continue }
        if (f.ref) {
          const id = lookups[f.ref].get(String(raw).trim().toLowerCase())
          if (id === undefined) errors.push(`${f.label} “${String(raw).trim()}” was not found`); else values[f.key] = Number(id)
        } else if (f.type === 'number') {
          const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, '').trim())
          if (Number.isFinite(n)) values[f.key] = n; else errors.push(`${f.label} must be a number`)
        } else if (f.type === 'date') {
          const d = toDate(raw)
          if (d) values[f.key] = d; else errors.push(`${f.label} is not a valid date`)
        } else if (f.type === 'yesno') {
          const s = String(raw).trim().toLowerCase()
          if (/^(yes|y|true|1)$/.test(s)) values[f.key] = 'Yes'; else if (/^(no|n|false|0)$/.test(s)) values[f.key] = 'No'; else errors.push(`${f.label} must be Yes or No`)
        } else values[f.key] = String(raw instanceof Date ? raw.toISOString().slice(0, 10) : raw).trim()
      }
      if (!errors.length) {
        const k = keyOf(values)
        if (existing.has(k)) errors.push('Already exists')
        else if (seen.has(k)) errors.push('Appears more than once in the file')
        seen.add(k)
      }
      return { id: `r${i}`, line: i + 2, values, errors }
    })
  }, [sheet, map, cfg, lookups, existing])

  const good = rows.filter((r) => r.errors.length === 0)
  const bad = rows.filter((r) => r.errors.length > 0)
  const previewFields = cfg.fields.filter((f) => (map[f.key] ?? -1) >= 0).slice(0, 4)

  const run = async () => {
    if (!live) { say('The server can’t be reached right now: nothing was imported. Please try again.'); return }
    setBusy(true); setResult(null); setProgress({ done: 0, total: good.length })
    let added = 0
    try {
      for (let i = 0; i < good.length; i += BATCH) {
        const chunk = good.slice(i, i + BATCH)
        await createMany(cfg.entity, chunk.map((r) => r.values), user?.name)
        added += chunk.length
        setProgress({ done: added, total: good.length })
      }
      setResult({ added, error: '' })
    } catch (e) {
      setResult({ added, error: userMessage(e, 'The import stopped. Rows that were already added are kept.'), detail: (e instanceof Error ? e.message : String(e ?? '')).slice(0, 1500) })
    }
    if (added) await syncEntity(cfg.list)
    setBusy(false)
  }

  if (isPwld) {
    return (
      <div className="page">
        <PageHeader title="Bulk import" subtitle="Add many records at once from an Excel file" back={false} />
        <div className="stack">
          <Section title="1. Choose what to import" index={0}>
            <SelectField label="Add to" value={label} options={[...IMPORTS.map((e) => e.label), PWLD_LABEL]} onChange={changeTable} required />
          </Section>
          <PwldImport key={pwldFile?.name ?? 'new'} initialFile={pwldFile} initialProject={params.get('project') ?? ''} />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Bulk import" subtitle="Add many records at once from an Excel file" back={false} />
      <div className="stack">
        <Section title="1. Choose the table and the file" index={0}>
          <div className="grid-auto">
            <SelectField label="Add to" value={label} options={[...IMPORTS.map((e) => e.label), PWLD_LABEL]} onChange={changeTable} required />
            <div className="field"><label>Template</label><AppButton variant="outlined" startIcon={<Download size={15} />} onClick={downloadTemplate}>Download the Excel template</AppButton></div>
          </div>
          <FileDrop label="Excel file" file={file} onFile={pickFile} accept=".xlsx" hint={`Excel workbook (.xlsx) only. The first row holds the column headings. Up to ${MAX_ROWS.toLocaleString('en')} rows and ${MAX_MB} MB.`} />
          {reading && <p className="row" style={{ gap: 8 }}><span className="spinner" /> Reading the file…</p>}
          {fileError && <p className="error-text" role="alert">{fileError}</p>}
        </Section>

        {sheet && (
          <Section title="2. Match the columns" index={1}>
            {sheets.length > 1 && <SelectField label="Sheet" value={sheet.name} options={sheets.map((s) => s.name)} onChange={(n) => pickSheet(Math.max(0, sheets.findIndex((s) => s.name === n)))} />}
            <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>Each field is matched to the column with the same heading. Change a match, or choose “Not in the file”. Fields marked * are required.</p>
            <div className="grid-auto">
              {cfg.fields.map((f) => (
                <div className="field" key={f.key}>
                  <label htmlFor={`m-${f.key}`}>{f.label}{f.required && <span className="req" aria-hidden>*</span>}</label>
                  <select id={`m-${f.key}`} className="select" value={String(map[f.key] ?? -1)} onChange={(e) => { setMap({ ...map, [f.key]: Number(e.target.value) }); setResult(null) }}>
                    <option value="-1">Not in the file</option>
                    {sheet.headers.map((h, i) => <option key={i} value={i}>{h || `(column ${i + 1})`}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {missingColumns.length > 0 && <p className="error-text" role="alert">Match the required field(s): {missingColumns.map((f) => f.label).join(', ')}.</p>}
          </Section>
        )}

        {sheet && missingColumns.length === 0 && (
          <Section title="3. Check and import" index={2}>
            <div className="stats" style={{ marginBottom: 16 }}>
              <div className="stat"><small>Rows in the file</small><strong>{rows.length.toLocaleString('en')}</strong></div>
              <div className="stat"><small>Ready to add</small><strong>{good.length.toLocaleString('en')}</strong></div>
              <div className="stat"><small>With problems (skipped)</small><strong>{bad.length.toLocaleString('en')}</strong></div>
            </div>

            {bad.length > 0 && (
              <>
                <h4 style={{ marginBottom: 8 }}>Rows with problems{bad.length > 20 ? ' (first 20)' : ''}</h4>
                <DataTable<Parsed> rows={bad.slice(0, 20)} columns={[
                  { header: 'Excel row', render: (r) => <span className="num">{r.line}</span> },
                  { header: 'Problem', render: (r) => <span className="error-text">{r.errors.join('; ')}</span> },
                ]} />
              </>
            )}

            {good.length > 0 && (
              <>
                <h4 style={{ margin: '16px 0 8px' }}>Preview{good.length > 8 ? ' (first 8 rows to be added)' : ''}</h4>
                <DataTable<Parsed> rows={good.slice(0, 8)} columns={[
                  { header: 'Excel row', render: (r) => <span className="num">{r.line}</span> },
                  ...previewFields.map((f) => ({ header: f.label, render: (r: Parsed) => String(r.values[f.key] ?? '') })),
                  { header: 'Status', render: () => <StatusChip status="approved" label="Ready" /> },
                ]} />
              </>
            )}

            {busy && (
              <div style={{ margin: '16px 0' }} role="status" aria-live="polite">
                <div className="row between" style={{ fontSize: 13, marginBottom: 6 }}><span>Adding records…</span><span className="num">{progress.done.toLocaleString('en')} of {progress.total.toLocaleString('en')}</span></div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`, background: 'var(--accent-600)', transition: 'width .2s' }} /></div>
              </div>
            )}
            {result && (
              <p role="status" className={result.error ? 'error-text' : ''} style={{ margin: '16px 0', fontWeight: 600, color: result.error ? undefined : 'var(--color-success)' }}>
                {result.error ? `${result.added.toLocaleString('en')} added. ${result.error}` : `Done: ${result.added.toLocaleString('en')} ${cfg.label.toLowerCase()} added.`}
              </p>
            )}
            {result?.detail && <details style={{ margin: '-8px 0 16px' }}><summary className="muted" style={{ cursor: 'pointer', fontSize: 13 }}>Technical details</summary><pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, marginTop: 6 }}>{result.detail}</pre></details>}

            <div className="row" style={{ marginTop: 16, gap: 10 }}>
              <AppButton variant="contained" loading={busy} disabled={good.length === 0 || !!result && !result.error} startIcon={<Upload size={16} />} onClick={run}>
                Add {good.length.toLocaleString('en')} {cfg.label.toLowerCase()}
              </AppButton>
              <AppButton variant="outlined" disabled={busy} onClick={reset}>Start over</AppButton>
            </div>
            <p className="faint" style={{ fontSize: 12, marginTop: 10 }}>Rows with problems are skipped; the rest are added in batches of {BATCH}. If a batch is refused, nothing from that batch is saved and the import stops.</p>
          </Section>
        )}
      </div>
      {toast}
    </div>
  )
}
