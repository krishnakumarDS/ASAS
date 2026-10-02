import { useState } from 'react'
import { CheckCircle2, Clock, MessageSquare, Send, XCircle } from 'lucide-react'
import AppButton from './common/AppButton'
import { fmtDate } from '../data/mock'
import { useAuth } from '../context/AuthContext'

type Verdict = 'Approved' | 'Rejected' | 'Deferred'
interface Comment { id: string; by: string; at: string; text: string }
interface Decision { id: string; by: string; at: string; verdict: Verdict; note: string }
const TONE: Record<Verdict, string> = { Approved: 'badge-success', Rejected: 'badge-danger', Deferred: 'badge-warning' }
const ICON = { Approved: <CheckCircle2 size={14} />, Rejected: <XCircle size={14} />, Deferred: <Clock size={14} /> }

/** Discussion thread plus an append-only decision log, so approvals and their reasons are preserved with who/when. */
export default function ProjectDiscussion() {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [text, setText] = useState('')
  const [note, setNote] = useState('')
  const me = user?.name ?? 'Unknown'
  const post = () => { if (!text.trim()) return; setComments((c) => [...c, { id: String(Date.now()), by: me, at: new Date().toISOString(), text: text.trim() }]); setText('') }
  const decide = (verdict: Verdict) => { if (!note.trim()) return; setDecisions((d) => [{ id: String(Date.now()), by: me, at: new Date().toISOString(), verdict, note: note.trim() }, ...d]); setNote('') }
  return (
    <div className="card-body grid-2">
      <section>
        <h4 className="row" style={{ gap: 8, marginBottom: 12 }}><MessageSquare size={16} />Discussion</h4>
        <ul style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
          {comments.length === 0 && <li className="faint">No comments yet — start the discussion.</li>}
          {comments.map((c) => <li key={c.id} className="reveal-item" style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}><div className="row between"><b style={{ fontSize: 13 }}>{c.by}</b><span className="faint" style={{ fontSize: 11 }}>{fmtDate(c.at)}</span></div><p style={{ marginTop: 4 }}>{c.text}</p></li>)}
        </ul>
        <div className="with-action"><input className="input" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && post()} placeholder="Add a comment…" aria-label="Comment" /><AppButton variant="contained" disabled={!text.trim()} onClick={post} aria-label="Post comment"><Send size={15} /></AppButton></div>
      </section>
      <section>
        <h4 style={{ marginBottom: 12 }}>Decision log</h4>
        <div className="field"><label htmlFor="dnote">Reason (required)</label><textarea id="dnote" className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why is this approved, rejected or deferred?" /></div>
        <div className="row wrap" style={{ marginBottom: 14 }}>
          <AppButton variant="contained" disabled={!note.trim()} startIcon={<CheckCircle2 size={15} />} onClick={() => decide('Approved')}>Approve</AppButton>
          <AppButton variant="outlined" color="error" disabled={!note.trim()} startIcon={<XCircle size={15} />} onClick={() => decide('Rejected')}>Reject</AppButton>
          <AppButton variant="outlined" disabled={!note.trim()} startIcon={<Clock size={15} />} onClick={() => decide('Deferred')}>Defer</AppButton>
        </div>
        <ul style={{ display: 'grid', gap: 10 }}>
          {decisions.length === 0 && <li className="faint">No decisions recorded.</li>}
          {decisions.map((d) => <li key={d.id} className="reveal-item" style={{ padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}><div className="row between"><span className={`badge ${TONE[d.verdict]}`}>{ICON[d.verdict]}{d.verdict}</span><span className="faint" style={{ fontSize: 11 }}>{d.by} · {fmtDate(d.at)}</span></div><p style={{ marginTop: 6 }}>{d.note}</p></li>)}
        </ul>
      </section>
    </div>
  )
}
