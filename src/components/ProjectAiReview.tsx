import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, Sparkles } from 'lucide-react'
import AppButton from './common/AppButton'

type Level = 'ok' | 'warn' | 'error' | 'info'
interface Finding { level: Level; title: string; detail: string }

/** Rule-based review of the project record: required fields, percentage totals, reference format and linked parties. */
export function reviewProject(v: Record<string, string>, required: string[], labels: Record<string, string>): Finding[] {
  const out: Finding[] = []
  const missing = required.filter((k) => !v[k]?.trim())
  out.push(missing.length ? { level: 'error', title: `${missing.length} required field(s) missing`, detail: missing.map((k) => labels[k] ?? k).join(', ') } : { level: 'ok', title: 'All required fields are filled', detail: 'Identification, stakeholders and planning details are complete.' })
  const pct = ['built', 'underConstruction', 'vacant'].map((k) => Number(v[k]) || 0)
  const sum = pct.reduce((a, b) => a + b, 0)
  out.push(sum === 100 ? { level: 'ok', title: 'Development status adds up to 100%', detail: `Built ${pct[0]}% · Under construction ${pct[1]}% · Vacant ${pct[2]}%` } : { level: 'warn', title: `Development status adds up to ${sum}%, not 100%`, detail: 'Built, under construction and vacant percentages should total 100.' })
  out.push(/^MP-\d{5}-\d{3}$/.test(v.maalemRef ?? '') ? { level: 'ok', title: 'Maalem Dubai reference format is valid', detail: v.maalemRef } : { level: 'error', title: 'Maalem Dubai reference format looks wrong', detail: `Expected MP-00000-000, found “${v.maalemRef || 'empty'}”.` })
  if (!v.consultant?.trim()) out.push({ level: 'warn', title: 'No consultant linked', detail: 'Link a consultant so issues and reports can be traced.' })
  if (v.corridors && v.corridors !== 'Approved') out.push({ level: 'warn', title: `11kV corridors are “${v.corridors}”`, detail: 'Confirm the corridor status before approving the master plan.' })
  if (v.ducts && v.ducts !== 'Approved') out.push({ level: 'warn', title: `11kV ducts are “${v.ducts}”`, detail: 'Confirm the duct status before approving the master plan.' })
  if (v.masterPlanStatus === 'Approved' && (v.corridors !== 'Approved' || v.ducts !== 'Approved')) out.push({ level: 'error', title: 'Master plan is Approved but corridors/ducts are not', detail: 'Approval conflicts with the infrastructure status.' })
  return out
}

const ICON = { ok: <CheckCircle2 size={18} />, warn: <AlertTriangle size={18} />, error: <AlertTriangle size={18} />, info: <Info size={18} /> }
const COLOR = { ok: 'var(--color-success)', warn: 'var(--color-warning)', error: 'var(--color-danger)', info: 'var(--color-info)' }

export default function ProjectAiReview({ run }: { run: () => Finding[] }) {
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const [busy, setBusy] = useState(false)
  const go = () => { setBusy(true); setTimeout(() => { setFindings(run()); setBusy(false) }, 700) }
  const bad = findings?.filter((f) => f.level === 'error').length ?? 0
  const warn = findings?.filter((f) => f.level === 'warn').length ?? 0
  return (
    <div className="card-body">
      <div className="row between wrap" style={{ gap: 12, marginBottom: 16 }}>
        <div><h4 className="row" style={{ gap: 8 }}><Sparkles size={17} style={{ color: 'var(--accent-600)' }} />AI-enabled review</h4><p className="muted" style={{ fontSize: 13 }}>Checks this record against the standard rules. An engineer makes the final decision.</p></div>
        <AppButton variant="contained" loading={busy} startIcon={<Sparkles size={16} />} onClick={go}>{findings ? 'Re-run review' : 'Run review'}</AppButton>
      </div>
      {findings && (
        <>
          <div className="stats" style={{ marginBottom: 16 }}>
            <div className="stat"><small>Passed</small><strong>{findings.filter((f) => f.level === 'ok').length}</strong></div>
            <div className="stat"><small>Warnings</small><strong>{warn}</strong></div>
            <div className="stat"><small>Errors</small><strong>{bad}</strong></div>
          </div>
          <ul style={{ display: 'grid', gap: 10 }}>
            {findings.map((f, i) => (
              <li key={i} className="reveal-item row" style={{ ['--index' as string]: i, alignItems: 'flex-start', gap: 12, padding: '12px 14px', border: '1px solid var(--border-light)', borderLeft: `4px solid ${COLOR[f.level]}`, borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                <span style={{ color: COLOR[f.level], marginTop: 1 }}>{ICON[f.level]}</span>
                <div><b style={{ fontSize: 14 }}>{f.title}</b><div className="muted" style={{ fontSize: 13 }}>{f.detail}</div></div>
              </li>
            ))}
          </ul>
        </>
      )}
      {!findings && !busy && <p className="faint">No review run yet.</p>}
    </div>
  )
}
