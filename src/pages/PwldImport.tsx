import { useEffect, useMemo, useState } from 'react'
import { Upload } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import Section from '../components/common/Section'
import StatusChip from '../components/common/StatusChip'
import { DataTable, FileDrop, useToast } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { callApi, userMessage } from '../data/api'
import { PWLD_COLUMNS, buildPwldRows, parsePwld } from '../data/pwld'
import type { PRow, PwldParsed } from '../data/pwld'
import { useConsultants, usePlots, useProjects, useSubstations } from '../data/store'
import { syncEntity, useSyncStatus } from '../data/sync'
import { createMany } from '../data/write'

const BATCH = 500
const MAX_MB = 5
const norm = (s: unknown) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

/** Plot-wise Load Details workbook (.xlsx): the layout with the project, developer and consultant at the top and the plot table below. */
export default function PwldImport({ initialFile = null, initialProject = '' }: { initialFile?: File | null; initialProject?: string }) {
  const { user } = useAuth()
  const live = useSyncStatus().state === 'live'
  const [toast, say] = useToast()
  const [projects] = useProjects()
  const [consultants] = useConsultants()
  const [substations] = useSubstations()
  const [plots] = usePlots()

  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<PwldParsed | null>(null)
  const [reading, setReading] = useState(false)
  const [fileError, setFileError] = useState('')
  const [projectRef, setProjectRef] = useState(initialProject)
  const [consultantId, setConsultantId] = useState('')
  const [includeOthers, setIncludeOthers] = useState(false)
  const [types, setTypes] = useState<Record<string, string>>({})
  const [notNull, setNotNull] = useState<string[]>([]) // plot columns the database does not accept empty (audit / robot columns left out: the server fills those)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<{ added: number; error: string; detail?: string } | null>(null)

  // every project, active ones first (an inactive one is marked in the list)
  const activeProjects = useMemo(() => [...projects].sort((a, b) => Number(b.display) - Number(a.display) || a.name.localeCompare(b.name)), [projects])
  const activeConsultants = useMemo(() => consultants.filter((c) => c.showInSO), [consultants])
  const project = projects.find((p) => p.maalemRef === projectRef)

  const reset = () => { setFile(null); setParsed(null); setFileError(''); setProjectRef(''); setConsultantId(''); setIncludeOthers(false); setResult(null) }

  // The column types of the plots table, so dates / numbers / text are sent in the form SQL expects.
  useEffect(() => {
    if (!parsed || !live) return
    let off = false
    callApi('plot.columns').then((t) => {
      if (off) return
      setTypes(Object.fromEntries((t[0] ?? []).map((r) => [String(r.Name).toLowerCase(), String(r.DataType).toLowerCase()])))
      setNotNull((t[0] ?? []).filter((r) => (r.Nullable === false || r.Nullable === 0 || r.Nullable === '0') && !(r.IsIdentity === true || r.IsIdentity === 1 || r.IsIdentity === '1') && !/^(rowid|isactive|created_at|created_by|updated_at|updated_by|objectkey|robotname|executionid|firstextracted|lastextracted|extractedinlastrun|lastupdated)$/i.test(String(r.Name))).map((r) => String(r.Name)))
    }).catch(() => { /* fall back to date-like handling */ })
    return () => { off = true }
  }, [parsed, live])

  const pickFile = async (f: File | null) => {
    reset()
    if (!f) return
    if (!/\.xlsx$/i.test(f.name)) { setFileError('Only Excel files (.xlsx) are allowed.'); return }
    if (f.size > MAX_MB * 1024 * 1024) { setFileError(`The file is larger than ${MAX_MB} MB.`); return }
    setFile(f); setReading(true)
    try {
      const p = await parsePwld(await f.arrayBuffer())
      if (!p.rows.length) throw new Error('No plot rows were found under the headings.')
      if (p.columns.DevPlotNum === undefined) throw new Error('The “Developer Plot Number” column was not found.')
      setParsed(p)
      // pick the project and consultant named at the top of the file when they exist in the system
      const pn = norm(p.header.project)
      const exact = activeProjects.filter((x) => norm(x.name) === pn)
      const loose = pn.length > 3 ? activeProjects.filter((x) => norm(x.name).includes(pn) || pn.includes(norm(x.name))) : []
      const hit = exact.length === 1 ? exact[0] : loose.length === 1 ? loose[0] : undefined
      if (hit && !initialProject) setProjectRef(hit.maalemRef)
      const cn = norm(p.header.consultant)
      const cExact = activeConsultants.filter((x) => norm(x.name) === cn)
      const cLoose = cn.length > 3 ? activeConsultants.filter((x) => norm(x.name).includes(cn) || cn.includes(norm(x.name))) : []
      const cHit = cExact.length === 1 ? cExact[0] : cLoose.length === 1 ? cLoose[0] : undefined
      if (cHit) setConsultantId(cHit.id)
    } catch (e) { setFileError(e instanceof Error ? e.message : 'This file could not be read.') }
    setReading(false)
  }

  // A file handed over by the standard import (it recognised the PWLD layout) is read straight away.
  useEffect(() => { if (initialFile) void pickFile(initialFile) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const subLookup = useMemo(() => {
    const byScada = new Map<string, string>(), byName = new Map<string, string>()
    substations.forEach((s) => { byScada.set(s.scada.trim().toLowerCase(), s.id); byName.set(s.name.trim().toLowerCase(), s.id) })
    return { byScada, byName }
  }, [substations])
  const existing = useMemo(() => new Set(plots.map((p) => `${p.maalemRef}|${p.devPlot}`.toLowerCase())), [plots])

  const rows = useMemo<PRow[]>(
    () => (parsed && project ? buildPwldRows(parsed, { projectRef: project.maalemRef, projectName: project.name, consultantId, types, notNull, byScada: subLookup.byScada, byName: subLookup.byName, existing }) : []),
    [parsed, project, consultantId, types, notNull, subLookup, existing],
  )

  const skipped = rows.filter((r) => r.notPlot && !includeOthers && r.errors.length === 0)
  const good = rows.filter((r) => r.errors.length === 0 && (includeOthers || !r.notPlot))
  const bad = rows.filter((r) => r.errors.length > 0)
  const warned = good.filter((r) => r.warnings.length > 0)
  // Columns the database will not accept empty that some rows leave empty: the server refuses such a batch.
  // Substations named in the file that are not in the system yet (the database needs a substation on every plot).
  const missingSubs = useMemo(() => {
    const m = new Map<string, { scada: string; full: string }>()
    rows.forEach((r) => r.missingSubs.forEach((x) => { const k = (x.scada || x.full).toLowerCase(); if (k && !m.has(k)) m.set(k, x) }))
    return [...m.values()]
  }, [rows])
  const [addingSubs, setAddingSubs] = useState(false)
  // Creates them (substation.createMany: name, SCADA name, built by) and reloads the substation list, so the plots are checked again.
  const addMissingSubs = async () => {
    if (!live) { say('The server can’t be reached right now: nothing was added. Please try again.'); return }
    setAddingSubs(true)
    try {
      await createMany('substation', missingSubs.map((x) => ({ SubstationName: x.full || x.scada, SubstationSCADAName: x.scada || x.full, BuiltBy: parsed?.header.ss132BuiltBy || 'Developer' })), user?.name)
      await syncEntity('substations')
      say(`${missingSubs.length} substation${missingSubs.length === 1 ? '' : 's'} added`)
    } catch (e) { say(userMessage(e, 'The substations could not be added. Please try again.')) }
    setAddingSubs(false)
  }

  const blankRequired = notNull.filter((col) => good.some((r) => !Object.keys(r.values).some((k) => k.toLowerCase() === col.toLowerCase() && r.values[k] != null && r.values[k] !== '')))

  const run = async () => {
    if (!live) { say('The server can’t be reached right now: nothing was imported. Please try again.'); return }
    setBusy(true); setResult(null); setProgress({ done: 0, total: good.length })
    let added = 0
    try {
      for (let i = 0; i < good.length; i += BATCH) {
        const chunk = good.slice(i, i + BATCH)
        await createMany('plot', chunk.map((r) => r.values), user?.name)
        added += chunk.length
        setProgress({ done: added, total: good.length })
      }
      setResult({ added, error: '' })
    } catch (e) {
      setResult({ added, error: userMessage(e, 'The import stopped. Rows that were already added are kept.'), detail: (e instanceof Error ? e.message : String(e ?? '')).slice(0, 1500) })
    }
    if (added) await syncEntity('plots')
    setBusy(false)
  }

  const devMismatch = project && parsed?.header.developer && !(norm(project.developer).includes(norm(parsed.header.developer)) || norm(parsed.header.developer).includes(norm(project.developer)))

  return (
    <>
      <Section title="Choose the Plot-wise Load Details file" index={1}>
        <FileDrop label="Excel file" file={file} onFile={pickFile} accept=".xlsx" hint={`Excel workbook (.xlsx) only, up to ${MAX_MB} MB. The project, developer and consultant at the top and the plot table below are found automatically; hidden sheets are ignored.`} />
        {reading && <p className="row" style={{ gap: 8 }}><span className="spinner" /> Reading the file…</p>}
        {fileError && <p className="error-text" role="alert">{fileError}</p>}
      </Section>

      {parsed && (
        <Section title="What was found" index={2}>
          <div className="stats" style={{ marginBottom: 16 }}>
            <div className="stat"><small>Sheet</small><strong style={{ fontSize: 15 }}>{parsed.sheet}</strong></div>
            <div className="stat"><small>Plot rows found</small><strong>{parsed.rows.length}</strong></div>
            <div className="stat"><small>Columns recognised</small><strong>{Object.keys(parsed.columns).length} of {PWLD_COLUMNS.length}</strong></div>
          </div>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            In the file: project <b>{parsed.header.project ?? '—'}</b> · developer <b>{parsed.header.developer ?? '—'}</b> · consultant <b>{parsed.header.consultant ?? '—'}</b>
            {parsed.ignored.length > 0 && <><br />Columns not imported (no matching field): {parsed.ignored.join('; ')}</>}
          </p>
          <div className="grid-auto">
            <div className="field">
              <label htmlFor="pw-project">Project<span className="req" aria-hidden>*</span></label>
              <select id="pw-project" className="select" value={projectRef} onChange={(e) => { setProjectRef(e.target.value); setResult(null) }}>
                <option value="">Choose the project…</option>
                {activeProjects.map((p) => <option key={p.id} value={p.maalemRef}>{p.name} — {p.maalemRef}{p.display ? '' : ' (inactive)'}</option>)}
              </select>
              {projects.length === 0 && <span className="error-text" role="alert">No projects are loaded yet. Click Refresh in the header, then choose the file again.</span>}
              {projects.length > 0 && !projectRef && <span className="error-text" role="alert">“{parsed.header.project ?? 'The project'}” was not matched to a project: choose it from the list.</span>}
              {project && !project.display && <span className="hint">This project is inactive. Plots can still be added to it.</span>}
              {devMismatch && <span className="error-text" role="alert">The file names developer “{parsed.header.developer}”, but this project’s developer is “{project?.developer}”.</span>}
            </div>
            <div className="field">
              <label htmlFor="pw-consultant">Consultant</label>
              <select id="pw-consultant" className="select" value={consultantId} onChange={(e) => { setConsultantId(e.target.value); setResult(null) }}>
                <option value="">None</option>
                {activeConsultants.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {!consultantId && parsed.header.consultant && <span className="hint">“{parsed.header.consultant}” was not found in the consultants: choose it, or leave it empty.</span>}
            </div>
          </div>
          <label className="row" style={{ gap: 8, marginTop: 8, fontSize: 13 }}>
            <input type="checkbox" className="cb" checked={includeOthers} onChange={(e) => setIncludeOthers(e.target.checked)} />
            Also import rows that are not plots (no DM plot number and no GFA), such as “Roads & Infrastructure”
          </label>
        </Section>
      )}

      {parsed && project && (
        <Section title="Check and import" index={3}>
          <div className="stats" style={{ marginBottom: 16 }}>
            <div className="stat"><small>Ready to add</small><strong>{good.length}</strong></div>
            <div className="stat"><small>With problems (skipped)</small><strong>{bad.length}</strong></div>
            <div className="stat"><small>Not plots (skipped)</small><strong>{skipped.length}</strong></div>
          </div>
          {skipped.length > 0 && <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>Skipped, not plots: {skipped.map((r) => r.label).join('; ')}. Tick the box above to import them.</p>}

          {bad.length > 0 && (
            <>
              <h4 style={{ marginBottom: 8 }}>Rows with problems</h4>
              <DataTable<PRow> rows={bad.slice(0, 20)} columns={[
                { header: 'Excel row', render: (r) => <span className="num">{r.line}</span> },
                { header: 'Plot', render: (r) => r.label || '—' },
                { header: 'Problem', render: (r) => <span className="error-text">{r.errors.join('; ')}</span> },
              ]} />
            </>
          )}
          {warned.length > 0 && (
            <>
              <h4 style={{ margin: '16px 0 8px' }}>Added with a note ({warned.length})</h4>
              <DataTable<PRow> rows={warned.slice(0, 20)} columns={[
                { header: 'Excel row', render: (r) => <span className="num">{r.line}</span> },
                { header: 'Plot', render: (r) => r.label },
                { header: 'Note', render: (r) => <span className="muted">{r.warnings.join('; ')}</span> },
              ]} />
            </>
          )}
          {good.length > 0 && (
            <>
              <h4 style={{ margin: '16px 0 8px' }}>Preview{good.length > 8 ? ' (first 8 plots to be added)' : ''}</h4>
              <DataTable<PRow> rows={good.slice(0, 8)} columns={[
                { header: 'Excel row', render: (r) => <span className="num">{r.line}</span> },
                { header: 'Plot', render: (r) => <strong>{r.label}</strong> },
                { header: 'DM plot', render: (r) => String(r.values.DMPlotNum ?? '') },
                { header: 'GFA', render: (r) => String(r.values.GFA ?? '') },
                { header: 'Total load (kW)', render: (r) => String(r.values.TotalConnectedLoad ?? '') },
                { header: 'Initial substation', render: (r) => r.init || '—' },
                { header: 'Ultimate substation', render: (r) => r.ult || '—' },
                { header: 'Status', render: () => <StatusChip status="approved" label="Ready" /> },
              ]} />
            </>
          )}

          {missingSubs.length > 0 && (
            <div className="card pad" style={{ margin: '16px 0 0', background: 'var(--color-warning-bg)' }} role="alert">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{missingSubs.length} substation{missingSubs.length === 1 ? '' : 's'} in this file {missingSubs.length === 1 ? 'is' : 'are'} not in the system yet</div>
              <div style={{ fontSize: 13, marginBottom: 10 }}>{missingSubs.map((x) => (x.full && x.scada && x.full !== x.scada ? `${x.scada} (${x.full})` : x.scada || x.full)).join(', ')}. Every plot needs its substations, so the plots below are skipped until these exist.</div>
              <AppButton variant="contained" loading={addingSubs} onClick={() => { void addMissingSubs() }}>Add the missing substation{missingSubs.length === 1 ? '' : 's'}</AppButton>
            </div>
          )}
          {blankRequired.length > 0 && good.length > 0 && (
            <p className="error-text" role="alert" style={{ margin: '16px 0 0' }}>
              The database does not accept an empty value for: <b>{blankRequired.join(', ')}</b>. Some rows have none (for a substation, add it under Substations first), so the import is likely to be refused.
            </p>
          )}

          {busy && (
            <div style={{ margin: '16px 0' }} role="status" aria-live="polite">
              <div className="row between" style={{ fontSize: 13, marginBottom: 6 }}><span>Adding plots…</span><span className="num">{progress.done} of {progress.total}</span></div>
              <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`, background: 'var(--accent-600)', transition: 'width .2s' }} /></div>
            </div>
          )}
          {result && (
            <p role="status" className={result.error ? 'error-text' : ''} style={{ margin: '16px 0', fontWeight: 600, color: result.error ? undefined : 'var(--color-success)' }}>
              {result.error ? `${result.added} added. ${result.error}` : `Done: ${result.added} plots added to ${project.name}.`}
            </p>
          )}
          {result?.detail && <details style={{ margin: '-8px 0 16px' }}><summary className="muted" style={{ cursor: 'pointer', fontSize: 13 }}>Technical details</summary><pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, marginTop: 6 }}>{result.detail}</pre></details>}
          <div className="row" style={{ marginTop: 16, gap: 10 }}>
            <AppButton variant="contained" loading={busy} disabled={good.length === 0 || (!!result && !result.error)} startIcon={<Upload size={16} />} onClick={run}>Add {good.length} plots to {project.name}</AppButton>
            <AppButton variant="outlined" disabled={busy} onClick={reset}>Start over</AppButton>
          </div>
          <p className="faint" style={{ fontSize: 12, marginTop: 10 }}>Rows with problems are skipped; the rest are added in batches of {BATCH}. If a batch is refused, nothing from that batch is saved and the import stops. A note means the plot is added with that one value left blank.</p>
        </Section>
      )}
      {toast}
    </>
  )
}
