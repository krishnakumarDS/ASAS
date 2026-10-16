import { useState } from 'react'
import { Play } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import PageHeader from '../components/PageHeader'
import { TextField } from '../components/ui'
import { ACTIONS, CRUD_ENTITY_NAMES, CRUD_OPS, crudSample, sampleJson } from './flowActions'
import { Retrieve_SQL_DataService } from '../generated'

type Row = Record<string, unknown>
interface Run { ms: number; ok: boolean; raw: string; tables: [string, Row[]][]; error?: string }

/** The flow returns the SQL action's body as one text value: {"ResultSets":{"Table1":[…],"Table2":[…]}, …}. */
function parseTables(raw: string): [string, Row[]][] {
  try {
    const sets = (JSON.parse(raw) as { ResultSets?: Record<string, Row[]> }).ResultSets ?? {}
    return Object.entries(sets).filter(([, rows]) => Array.isArray(rows))
  } catch { return [] }
}
const cell = (v: unknown) => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v))

/** Calls the Retrieve_SQL_Data flow (Power Apps trigger → sp_UC000420_Api) and shows what comes back. */
export default function FlowTestPage() {
  const [action, setAction] = useState(ACTIONS[0])
  const [json, setJson] = useState(sampleJson(ACTIONS[0]))
  const [busy, setBusy] = useState(false)
  const [run, setRun] = useState<Run | null>(null)

  // "<table>.<operation>" actions get the CRUD sample, everything else the read sample.
  const sample = (a: string) => (a.includes('.') ? crudSample(a.split('.')[0], a.split('.')[1]) : sampleJson(a))
  const pick = (a: string) => { setAction(a); if (a) setJson(sample(a)) }

  const go = async () => {
    setBusy(true); setRun(null)
    const t0 = performance.now()
    try {
      // The generated service names the flow's two inputs text (Action) and text_1 (Inputs, the JSON).
      const r = await Retrieve_SQL_DataService.Run({ text: action, text_1: json })
      const ms = Math.round(performance.now() - t0)
      const raw = r.data?.output ?? ''
      if (!r.success) setRun({ ms, ok: false, raw, tables: [], error: r.error?.message ?? 'The flow call failed.' })
      else setRun({ ms, ok: true, raw, tables: parseTables(raw) })
    } catch (e) {
      setRun({ ms: Math.round(performance.now() - t0), ok: false, raw: '', tables: [], error: e instanceof Error ? e.message : String(e) })
    }
    setBusy(false)
  }

  let jsonError: string | undefined
  try { JSON.parse(json || '{}') } catch { jsonError = 'Not valid JSON' }

  return (
    <div className="page">
      <PageHeader title="Flow test" subtitle="Run the SQL flow with an action and JSON, and see the raw response" back={false} badge={<span className="badge badge-warning">Test page</span>} />
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <section className="card pad reveal-item">
          <div className="field">
            <label htmlFor="flow-action">Action<span className="req" aria-hidden>*</span></label>
            <select id="flow-action" className="select" value={action} onChange={(e) => pick(e.target.value)}>
              <optgroup label="Read actions">{ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</optgroup>
              {CRUD_ENTITY_NAMES.map((t) => <optgroup key={t} label={`${t} (CRUD)`}>{CRUD_OPS.map((o) => <option key={o} value={`${t}.${o}`}>{`${t}.${o}`}</option>)}</optgroup>)}
            </select>
            {action.includes('.') && !action.endsWith('.list') && !action.endsWith('.get') && <span className="faint" style={{ fontSize: 12 }}>This action changes real data: use a test record and replace the sample ids.</span>}
          </div>
          <TextField label="JSON" value={json} onChange={setJson} multiline error={jsonError} />
          <p className="faint" style={{ fontSize: 12, margin: '4px 0 14px' }}>
            Sent to the flow as <b>Action</b> and <b>JSON</b>, then to <b>sp_UC000420_Api</b>. “Nope” should come back as an unknown-action error.
          </p>
          <AppButton variant="contained" loading={busy} disabled={!!jsonError || !action} startIcon={<Play size={16} />} onClick={go}>Run flow</AppButton>
          {!window.location.hostname.includes('localhost') ? null : <p className="faint" style={{ fontSize: 12, marginTop: 10 }}>Running on localhost: the flow only answers inside the Power Apps host (npm run dev).</p>}
        </section>

        <section className="card pad reveal-item" style={{ ['--index' as string]: 1 }}>
          <div className="row between wrap" style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ margin: 0 }}>Response</div>
            {run && <span className={`badge ${run.ok ? 'badge-success' : 'badge-danger'}`}>{run.ok ? `Succeeded · ${run.ms} ms` : `Failed · ${run.ms} ms`}</span>}
          </div>
          {!run && !busy && <p className="faint">No call yet.</p>}
          {busy && <p className="row" style={{ gap: 8 }}><span className="spinner" /> Waiting for the flow…</p>}
          {run?.error && <p className="error-text" role="alert" style={{ whiteSpace: 'pre-wrap' }}>{run.error}</p>}
          {run?.tables.map(([name, rows]) => (
            <div key={name} style={{ marginBottom: 14 }}>
              <b style={{ fontSize: 13 }}>{name}</b> <span className="faint" style={{ fontSize: 12 }}>· {rows.length} row{rows.length === 1 ? '' : 's'}</span>
              {rows.length > 0 && (
                <div className="table-wrap" style={{ marginTop: 6 }}>
                  <table className="table">
                    <thead><tr>{Object.keys(rows[0]).map((k) => <th key={k}>{k}</th>)}</tr></thead>
                    <tbody>{rows.slice(0, 20).map((r, i) => <tr key={i}>{Object.keys(rows[0]).map((k) => <td key={k}>{cell(r[k])}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
          {run && (
            <details>
              <summary className="muted" style={{ cursor: 'pointer', fontSize: 13 }}>Raw output</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, marginTop: 8, maxHeight: 320, overflow: 'auto' }}>{run.raw || '(empty)'}</pre>
            </details>
          )}
        </section>
      </div>
    </div>
  )
}
