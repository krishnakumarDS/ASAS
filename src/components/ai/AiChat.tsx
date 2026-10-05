import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Sparkles, X } from 'lucide-react'
import IconButton from '../common/IconButton'
import { exceeding, engineers } from '../../data/dashboard'
import { snapshot } from '../../data/store'
import styles from './AiChat.module.css'

export const OPEN_CHAT = 'asas:open-chat'
export const openChat = (prompt?: string) => window.dispatchEvent(new CustomEvent(OPEN_CHAT, { detail: prompt }))

interface Msg { from: 'user' | 'bot'; text: string }
const has = (s: string, ...w: string[]) => w.some((x) => s.includes(x))

/** Answers from the app's own sample data with simple rules. Swap `reply` for a call to the real AI service when it is connected. */
function reply(raw: string): string {
  const q = raw.toLowerCase()
  const projects = snapshot.projects(), developers = snapshot.developers(), plots = snapshot.plots(), substations = snapshot.substations()
  if (has(q, 'exceed', 'late', 'overdue', 'kpi')) return `${exceeding.length} submissions are exceeding KPI:\n` + exceeding.map((e) => `• ${e.project} — ${e.engineer}, +${e.over}d`).join('\n')
  if (has(q, 'workload', 'capacity', 'engineer', 'available')) {
    const t = [...engineers].map((e) => ({ n: e.name, v: e.parts.reduce((a, b) => a + b, 0) })).sort((a, b) => a.v - b.v)
    return `Lowest workload: ${t[0].n} (${t[0].v} active). Highest: ${t[t.length - 1].n} (${t[t.length - 1].v}).\n` + t.map((x) => `• ${x.n}: ${x.v}`).join('\n')
  }
  const dev = developers.find((d) => q.includes(d.name.toLowerCase().split(' (')[0]))
  if (dev) { const ps = projects.filter((p) => p.developer.toLowerCase().includes(dev.name.toLowerCase().split(' (')[0])); return `${dev.name} has ${ps.length} project(s)${ps.length ? ':\n' + ps.map((p) => `• ${p.name} (${p.maalemRef})`).join('\n') : '.'}` }
  const pr = projects.find((p) => q.includes(p.name.toLowerCase()) || q.includes(p.maalemRef.toLowerCase()))
  if (pr) return `${pr.name} (${pr.maalemRef})\nDeveloper: ${pr.developer}\nConsultant: ${pr.consultant || '—'}\nDisplay: ${pr.display ? 'visible' : 'hidden'}\nPlots: ${plots.filter((p) => p.maalemRef === pr.maalemRef).length}`
  if (has(q, 'substation')) { const d = substations.filter((s) => s.builtBy === 'DEWA').length; return `There are ${substations.length} substations: ${d} built by DEWA and ${substations.length - d} by developers.` }
  if (has(q, 'plot')) return `There are ${plots.length} plots across ${new Set(plots.map((p) => p.maalemRef)).size} projects; ${plots.filter((p) => !p.consultant).length} have no consultant.`
  if (has(q, 'project')) return `There are ${projects.length} projects; ${projects.filter((p) => p.display).length} visible and ${projects.filter((p) => !p.display).length} hidden.`
  return 'I can answer questions about projects, plots, substations, developers, consultants, KPIs and workload. Try one of the suggestions below.'
}

export default function AiChat() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'bot', text: 'Hi! I’m the ASAS assistant. Ask me about projects, plots, substations, KPIs or workload.' }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const SUGGEST = useMemo(() => ['Which submissions are exceeding KPI?', 'Who has available workload?', `Projects by ${snapshot.developers()[0]?.name ?? 'a developer'}`, 'How many substations are built by DEWA?'], [])

  const send = (t: string) => {
    const text = t.trim(); if (!text) return
    setMsgs((m) => [...m, { from: 'user', text }]); setInput(''); setTyping(true)
    setTimeout(() => { setMsgs((m) => [...m, { from: 'bot', text: reply(text) }]); setTyping(false) }, 500)
  }
  useEffect(() => {
    const h = (e: Event) => { setOpen(true); const p = (e as CustomEvent<string | undefined>).detail; if (p) send(p) }
    window.addEventListener(OPEN_CHAT, h)
    return () => window.removeEventListener(OPEN_CHAT, h)
  }, [])
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs, typing, open])

  return (
    <>
      {!open && <button className={styles.fab} onClick={() => setOpen(true)} aria-label="Open AI assistant"><Sparkles size={22} /></button>}
      {open && (
        <section className={styles.panel} role="dialog" aria-label="AI assistant">
          <header className={styles.head}>
            <span className={styles.badge}><Sparkles size={16} /></span>
            <div className="grow"><b>ASAS assistant</b><small>Demo — answers from sample data</small></div>
            <IconButton small onClick={() => setOpen(false)} aria-label="Close assistant"><X size={18} /></IconButton>
          </header>
          <div className={styles.body}>
            {msgs.map((m, i) => <div key={i} className={`${styles.msg} ${m.from === 'user' ? styles.user : styles.bot}`}>{m.text}</div>)}
            {typing && <div className={`${styles.msg} ${styles.bot}`}><span className="spinner" /></div>}
            <div ref={end} />
          </div>
          <div className={styles.suggest}>{SUGGEST.map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}</div>
          <form className={styles.form} onSubmit={(e) => { e.preventDefault(); send(input) }}>
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question…" aria-label="Message" />
            <button type="submit" className="liquid-btn" aria-label="Send" disabled={!input.trim()}><Send size={16} /></button>
          </form>
        </section>
      )}
    </>
  )
}
