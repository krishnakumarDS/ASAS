// Reads a "Plot-wise Load Details" (PWLD) workbook: the layout the consultants send.
//   - a few lines at the top give the project, developer and consultant (label in one cell, value in the next cells),
//   - the plot table has its headings further down (row 5, row 10, …): found by the heading "Developer Plot Number",
//   - below the table there may be a "Total" row and notes; hidden sheets (calculations) are ignored.
// Headings are matched by their wording, tolerating the usual misspellings (Genaral, Requirment, Substaion, Commsioning, Industral, Ligting).

export type PwldKind = 'text' | 'number' | 'dateish' | 'sub'
export interface PwldColumn { key: string; label: string; test: RegExp; kind: PwldKind; required?: boolean }

/** key = SQL column in UC000420_Plots; the four 'sub' keys are looked up as substations (InitSubID / UltSubID). */
export const PWLD_COLUMNS: PwldColumn[] = [
  { key: 'DevPlotNum', label: 'Developer Plot Number', test: /^(developerplot|devplot)/, kind: 'text', required: true },
  { key: 'DMPlotNum', label: 'DM Plot number', test: /^dmplot/, kind: 'text' },
  { key: 'PlotOwnerName', label: 'Plot Owner Name', test: /^plotowner/, kind: 'text' },
  { key: 'PlotProjectName', label: 'Plot Project Name', test: /^plotprojectname/, kind: 'text' },
  { key: 'PowerDensity', label: 'Power Density', test: /^powerdensity/, kind: 'number' },
  { key: 'GFA', label: 'GFA', test: /^gfa/, kind: 'number' },
  { key: 'LandUse', label: 'Land Use', test: /^landuse/, kind: 'text' },
  { key: 'PlotStatus', label: 'Plot Status', test: /^plotstatus/, kind: 'text' },
  { key: 'ExpPowerReq', label: 'Expected Power Requirement date', test: /^expectedpower/, kind: 'dateish' },
  { key: 'GenaralLoad', label: 'General Load (kW)', test: /^gen\w*load/, kind: 'number' },
  { key: 'LocalizedCoolingLoad', label: 'Localized Cooling Load (kW)', test: /^localizedcooling/, kind: 'number' },
  { key: 'DCP', label: 'DCP (kW)', test: /^dcp/, kind: 'number' },
  { key: 'TotalConnectedLoad', label: 'Total Connected Load (kW)', test: /^totalconnectedload/, kind: 'number' },
  { key: 'InitSCADA', label: 'Initial DEWA substation (SCADA name)', test: /^(initial|interim)\w*scada/, kind: 'sub' },
  { key: 'InitFull', label: 'Initial DEWA substation (full name)', test: /^(initial|interim)\w*dewasubstationfull/, kind: 'sub' },
  { key: 'InitDevSubCommDate', label: 'Initial substation commissioning', test: /^(initial|interim)\w*(commsioning|commissioning)/, kind: 'dateish' },
  { key: 'UltSCADA', label: 'Ultimate DEWA substation (SCADA name)', test: /^ultimate\w*scada/, kind: 'sub' },
  { key: 'UltFull', label: 'Ultimate DEWA substation (full name)', test: /^ultimate\w*dewasubstationfull/, kind: 'sub' },
  { key: 'UltDevSubCommDate', label: 'Ultimate substation commissioning', test: /^ultimate\w*(commsioning|commissioning)/, kind: 'dateish' },
  { key: 'NOCRelease', label: 'NOC Can Be Released', test: /^noc/, kind: 'text' },
  { key: 'EVChargerLoad', label: 'EV Charger Load (kW)', test: /^evcharger/, kind: 'number' },
  { key: 'DataCenterLoad', label: 'Data Center Load (kW)', test: /^datacenter/, kind: 'number' },
  { key: 'SolarLoad', label: 'Solar Load (kW)', test: /^solar/, kind: 'number' },
  { key: 'IndustrialLoad', label: 'Industrial Load (kW)', test: /^indust\w*load/, kind: 'number' },
  { key: 'LightingLoad', label: 'Lighting Load (kW)', test: /^lig\w*load/, kind: 'number' },
  { key: 'AgritechLoad', label: 'Agritech Load (kW)', test: /^agritech/, kind: 'number' },
  { key: 'OtherLoads', label: 'Other Loads (kW)', test: /^otherload/, kind: 'number' },
]

export interface PwldParsed {
  sheet: string
  headingRow: number
  header: { project?: string; developer?: string; consultant?: string; ss132BuiltBy?: string }
  columns: Record<string, number>          // column key -> 0-based column index
  ignored: string[]                        // headings in the file that are not plot columns (e.g. Remarks)
  rows: { line: number; cells: unknown[] }[]
}

const norm = (s: unknown) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
export const isBlank = (v: unknown) => v == null || (typeof v === 'string' && v.trim() === '')

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

/** Throws an Error with a readable message when the file is not a PWLD workbook. */
export async function parsePwld(buffer: ArrayBuffer): Promise<PwldParsed> {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  try { await wb.xlsx.load(buffer) } catch { throw new Error('This file could not be read. Use a valid Excel workbook (.xlsx).') }

  for (const ws of wb.worksheets) {
    if (ws.state !== 'visible') continue // hidden sheets hold calculations, not the plot table
    const rowCells = (n: number) => Array.from(ws.getRow(n).values as unknown[], cellValue).slice(1)

    // 1. the heading row: the first row that has a "Developer Plot Number" heading
    let headingRow = 0
    for (let r = 1; r <= Math.min(ws.rowCount, 60) && !headingRow; r++) if (rowCells(r).some((c) => /^(developerplot|devplot)/.test(norm(c)))) headingRow = r
    if (!headingRow) continue

    // 2. project / developer / consultant: a label cell, then the first different non-empty cell to its right
    const header: PwldParsed['header'] = {}
    for (let r = 1; r < headingRow; r++) {
      const cells = rowCells(r)
      cells.forEach((c, i) => {
        const n = norm(c)
        const key = /^projectname/.test(n) ? 'project' : /^developername/.test(n) ? 'developer' : /^consultantname/.test(n) ? 'consultant' : /^132kv\w*builtby/.test(n) ? 'ss132BuiltBy' : null
        if (!key || header[key]) return
        const v = cells.slice(i + 1).find((x) => !isBlank(x) && norm(x) !== n)
        if (!isBlank(v)) header[key] = String(v).trim()
      })
    }

    // 3. match the headings to plot columns
    const columns: Record<string, number> = {}
    const ignored: string[] = []
    rowCells(headingRow).forEach((h, i) => {
      if (isBlank(h)) return
      const col = PWLD_COLUMNS.find((c) => columns[c.key] === undefined && c.test.test(norm(h)))
      if (col) columns[col.key] = i
      else ignored.push(String(h).replace(/\s+/g, ' ').trim())
    })

    // 4. the plot rows: from the row after the headings until a "Total" row or the first empty row
    const rows: PwldParsed['rows'] = []
    for (let r = headingRow + 1; r <= ws.rowCount; r++) {
      const cells = rowCells(r)
      const empty = cells.every(isBlank)
      if (empty) { if (rows.length) break; continue }
      if (cells.some((c) => typeof c === 'string' && /^\s*total\b/i.test(c))) break
      rows.push({ line: r, cells })
    }
    return { sheet: ws.name, headingRow, header, columns, ignored, rows }
  }
  throw new Error('This does not look like a Plot-wise Load Details file: no visible sheet has a “Developer Plot Number” heading.')
}

/** A date from an Excel date, an Excel serial number, a bare year (2026 -> 2026-01-01), yyyy-mm-dd, dd/mm/yyyy or "Jun-2021"; null when it is not a date. */
export function toIsoDate(v: unknown): string | null {
  const ymd = (y: number, m: number, d: number) => { const t = new Date(Date.UTC(y, m - 1, d)); return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d ? t.toISOString().slice(0, 10) : null }
  if (v instanceof Date) return Number.isNaN(+v) ? null : v.toISOString().slice(0, 10)
  if (typeof v === 'number') {
    if (Number.isInteger(v) && v >= 1900 && v <= 2100) return ymd(v, 1, 1)
    return Number.isFinite(v) && v > 2100 ? new Date(Math.round((v - 25569) * 86400000)).toISOString().slice(0, 10) : null
  }
  const s = String(v).trim()
  if (/^\d{4}$/.test(s)) return ymd(+s, 1, 1)
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return ymd(+m[1], +m[2], +m[3])
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (m) return ymd(+m[3], +m[2], +m[1])
  if (/^[A-Za-z]{3,9}[ -/]\d{4}$/.test(s)) { const t = Date.parse(`1 ${s.replace(/[-/]/, ' ')} UTC`); if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10) }
  return null
}

/* ---------- turning the plot rows into records for UC000420_Plots ---------- */
const text = (v: unknown) => String(v instanceof Date ? v.toISOString().slice(0, 10) : v ?? '').trim()

export interface MissingSub { scada: string; full: string }
export interface PRow { id: string; missingSubs: MissingSub[]; line: number; label: string; values: Record<string, unknown>; errors: string[]; warnings: string[]; notPlot: boolean; init: string; ult: string }
export type SqlKind = 'date' | 'number' | 'bit' | 'text'
export const kindOf = (t?: string): SqlKind | undefined => (!t ? undefined : /date|time/.test(t) ? 'date' : /int|decimal|numeric|float|real|money/.test(t) ? 'number' : t === 'bit' ? 'bit' : 'text')

/** Date-like cells (expected power date, commissioning): stored the way the column is defined in SQL; anything that does not fit is left blank with a warning. */
export function dateish(raw: unknown, kind: SqlKind | undefined, label: string): { v?: unknown; warn?: string } {
  const k = kind ?? 'date'
  if (k === 'date') { const d = toIsoDate(raw); return d ? { v: d } : { warn: `${label} “${text(raw)}” is not a date: left blank` } }
  if (k === 'number') {
    const n = raw instanceof Date ? raw.getUTCFullYear() : typeof raw === 'number' ? raw : Number(text(raw).replace(/,/g, ''))
    return Number.isFinite(n) ? { v: n } : { warn: `${label} “${text(raw)}” is not a number: left blank` }
  }
  if (k === 'bit') { const s = text(raw).toLowerCase(); return /^(yes|y|true|1)$/.test(s) ? { v: 'Yes' } : /^(no|n|false|0)$/.test(s) ? { v: 'No' } : { warn: `${label} “${text(raw)}” is not Yes or No: left blank` } }
  return { v: text(raw) }
}

export interface BuildOptions {
  projectRef: string; projectName: string; consultantId: string
  types: Record<string, string>                       // SQL data types of the plot columns (lower-case name -> type); {} = unknown
  byScada: Map<string, string>; byName: Map<string, string>   // substation lookups (lower-case) -> id
  notNull?: string[]                                  // plot columns the database does not accept empty (InitSubID / UltSubID are, as the server's "Missing required field(s)" error shows)
  existing: Set<string>                               // "<projectRef>|<plot number>" (lower-case) of plots that are already in the system
}

export function buildPwldRows(parsed: PwldParsed, o: BuildOptions): PRow[] {
  const c = parsed.columns
  const cell = (r: { cells: unknown[] }, key: string) => (c[key] === undefined ? null : r.cells[c[key]])
  const seen = new Set<string>()
  return parsed.rows.map((r, i) => {
    const values: Record<string, unknown> = { MaalemDubaiRef: o.projectRef }
    const errors: string[] = [], warnings: string[] = [], missingSubs: MissingSub[] = []
    if (o.consultantId) values.ConsultantID = Number(o.consultantId)
    for (const f of PWLD_COLUMNS) {
      if (f.kind === 'sub') continue
      const raw = cell(r, f.key)
      if (isBlank(raw)) { if (f.required) errors.push(`${f.label} is required`); continue }
      if (f.kind === 'text') values[f.key] = text(raw)
      else if (f.kind === 'number') {
        const n = typeof raw === 'number' ? raw : Number(text(raw).replace(/,/g, ''))
        if (Number.isFinite(n)) values[f.key] = n; else errors.push(`${f.label} must be a number`)
      } else {
        const d = dateish(raw, kindOf(o.types[f.key.toLowerCase()]), f.label)
        if (d.warn) warnings.push(d.warn); else values[f.key] = d.v
      }
    }
    if (isBlank(values.PlotProjectName)) values.PlotProjectName = o.projectName
    // The initial and ultimate substation must exist: the database refuses a plot without them (and refuses the whole batch with it), so such a row is flagged and skipped.
    const subRequired = (col: string) => !o.notNull?.length || o.notNull.some((n) => n.toLowerCase() === col.toLowerCase())
    const sub = (stage: 'Init' | 'Ult') => {
      const word = stage === 'Init' ? 'Initial' : 'Ultimate'
      const scada = text(cell(r, `${stage}SCADA`)), full = text(cell(r, `${stage}Full`))
      if (!scada && !full) { if (subRequired(`${stage}SubID`)) errors.push(`${word} substation is required`); return '' }
      const id = o.byScada.get(scada.toLowerCase()) ?? o.byName.get(full.toLowerCase()) ?? o.byName.get(scada.toLowerCase())
      if (id) { values[`${stage}SubID`] = Number(id); return scada || full }
      missingSubs.push({ scada, full })
      const msg = `${word} substation “${scada || full}” was not found`
      if (subRequired(`${stage}SubID`)) errors.push(`${msg}: add it under Substations first`); else warnings.push(`${msg}: left blank`)
      return `${scada || full} (not found)`
    }
    const init = sub('Init'), ult = sub('Ult')
    const notPlot = isBlank(cell(r, 'DMPlotNum')) && isBlank(cell(r, 'GFA'))
    if (!errors.length) {
      const k = `${o.projectRef}|${text(values.DevPlotNum)}`.toLowerCase()
      if (o.existing.has(k)) errors.push('Already exists')
      else if (seen.has(k)) errors.push('Appears more than once in the file')
      seen.add(k)
    }
    return { id: `r${i}`, missingSubs, line: r.line, label: text(values.DevPlotNum), values, errors, warnings, notPlot, init, ult }
  })
}
