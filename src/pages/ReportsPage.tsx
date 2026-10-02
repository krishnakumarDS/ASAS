import { useMemo, useState } from 'react'
import { Building2, Download, FileSpreadsheet, FileText, HardHat, Handshake, MapPinned, Presentation, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import PageHeader from '../components/PageHeader'
import { consultants, developers, plots, substations } from '../data/mock'
import { consultantByProject, projects } from '../data/projects'
import { useToast } from '../components/ui'

type Row = Record<string, string | number | boolean>
interface Source { key: string; label: string; icon: LucideIcon; rows: () => Row[] }
const SOURCES: Source[] = [
  { key: 'projects', label: 'Projects', icon: Building2, rows: () => projects.map((p) => ({ 'Maalem ref': p.maalemRef, Project: p.name, Developer: p.developer, Consultant: consultantByProject[p.id] ?? '', 'Created by': p.createdBy, 'Created on': p.createdOn, Displayed: p.display })) },
  { key: 'plots', label: 'Plots', icon: MapPinned, rows: () => plots.map((p) => ({ 'Maalem ref': p.maalemRef, Project: p.projectName, 'Dev plot': p.devPlot, 'DM plot': p.dmPlot, Developer: p.developer, Consultant: p.consultant, Displayed: p.display })) },
  { key: 'substations', label: 'Substations', icon: Zap, rows: () => substations.map((s) => ({ Substation: s.name, SCADA: s.scada, 'Built by': s.builtBy, 'Smart Office': s.showInSO, 'Created on': s.createdOn })) },
  { key: 'developers', label: 'Developers', icon: HardHat, rows: () => developers.map((d) => ({ Developer: d.name, 'Created by': d.createdBy, 'Created on': d.createdOn, 'Linked projects': projects.filter((p) => p.developer.split(' (')[0] === d.name.split(' (')[0]).length })) },
  { key: 'consultants', label: 'Consultants', icon: Handshake, rows: () => consultants.map((c) => ({ Consultant: c.name, 'Created by': c.createdBy, 'Created on': c.createdOn, 'Linked projects': projects.filter((p) => consultantByProject[p.id] === c.name).length })) },
]
const esc = (v: unknown) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
const toCsv = (title: string, rows: Row[]) => (rows.length ? [title.toUpperCase(), Object.keys(rows[0]).join(','), ...rows.map((r) => Object.values(r).map(esc).join(','))].join('\n') : title.toUpperCase())

const DECKS = [
  { name: 'Executive KPI deck', desc: 'Department KPIs, compliance and workload in a single summary.' },
  { name: 'Project review deck', desc: 'One project with plots, substations and open issues.' },
  { name: 'Network & forecast deck', desc: 'Trends, heatmaps and constraint risk for planning.' },
]

export default function ReportsPage() {
  const [sel, setSel] = useState<Set<string>>(new Set(['projects']))
  const [format, setFormat] = useState<'csv' | 'pdf' | 'pptx'>('csv')
  const [toast, say] = useToast()
  const counts = useMemo(() => Object.fromEntries(SOURCES.map((s) => [s.key, s.rows().length])), [])
  const total = [...sel].reduce((a, k) => a + (counts[k] ?? 0), 0)
  const toggle = (k: string) => setSel((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n })

  const generate = () => {
    const body = SOURCES.filter((s) => sel.has(s.key)).map((s) => toCsv(s.label, s.rows())).join('\n\n')
    const url = URL.createObjectURL(new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `asas-report-${new Date().toISOString().slice(0, 10)}.csv` })
    a.click(); URL.revokeObjectURL(url)
    say(`Report generated — ${total} rows`)
  }

  return (
    <div className="page">
      <PageHeader title="Reports & presentations" subtitle="Pick what to include and generate in one go" back={false} />
      <div className="grid-main-side">
        <section className="card reveal-item">
          <div className="card-head"><h4>1 · Choose what to include</h4><span className="faint" style={{ fontSize: 12 }}>Select one or more</span></div>
          <div className="card-body">
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {SOURCES.map(({ key, label, icon: Icon }) => (
                <label key={key} className={`pick ${sel.has(key) ? 'on' : ''}`}>
                  <input type="checkbox" className="cb" checked={sel.has(key)} onChange={() => toggle(key)} />
                  <span className="pick-ico"><Icon size={18} /></span>
                  <span className="grow"><b>{label}</b><span className="cell-sub" style={{ display: 'block' }}>{counts[key]} records</span></span>
                </label>
              ))}
            </div>
            <div className="row" style={{ gap: 8, marginTop: 14 }}>
              <AppButton variant="outlined" size="small" onClick={() => setSel(new Set(SOURCES.map((s) => s.key)))}>Select all</AppButton>
              <AppButton variant="outlined" size="small" onClick={() => setSel(new Set())}>Clear</AppButton>
            </div>
          </div>
        </section>
        <section className="card reveal-item">
          <div className="card-head"><h4>2 · Format & generate</h4></div>
          <div className="card-body">
            <div className="radio-group" style={{ flexDirection: 'column' }}>
              {([['csv', 'Excel / CSV', FileSpreadsheet, false], ['pdf', 'PDF', FileText, true], ['pptx', 'PowerPoint', Presentation, true]] as const).map(([k, l, Icon, soon]) => (
                <label key={k} className="radio" style={soon ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}><input type="radio" name="fmt" disabled={soon} checked={format === k} onChange={() => setFormat(k)} /><Icon size={16} />{l}{soon && <span className="badge badge-neutral" style={{ marginLeft: 'auto' }}>Soon</span>}</label>
              ))}
            </div>
            <p className="muted" style={{ margin: '16px 0', fontSize: 13 }}>{sel.size ? <><b>{sel.size}</b> section{sel.size > 1 ? 's' : ''} · <b>{total}</b> rows, in one file.</> : 'Select at least one section.'}</p>
            <AppButton variant="contained" fullWidth disabled={!sel.size} startIcon={<Download size={16} />} onClick={generate}>Generate report</AppButton>
          </div>
        </section>
      </div>
      <section className="reveal-item" style={{ marginTop: 20 }}>
        <div className="row" style={{ gap: 10, marginBottom: 12 }}><h4>Presentations</h4><span className="badge badge-neutral">Coming soon</span></div>
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {DECKS.map((d) => (
            <div key={d.name} className="card pad" style={{ opacity: 0.85 }}>
              <span className="avatar" style={{ borderRadius: 'var(--radius-md)' }}><Presentation size={18} /></span>
              <h5 style={{ marginTop: 12 }}>{d.name}</h5>
              <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{d.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {toast}
    </div>
  )
}
