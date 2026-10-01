import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Building2, ClipboardList, HardHat, Handshake, MapPinned, Send, Users, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import PageHeader from '../components/PageHeader'
import { LookupModal, PickField, TextField, useToast } from '../components/ui'
import { consultants, developers } from '../data/mock'
import { projects } from '../data/projects'

type Tone = 'accent' | 'info' | 'warning' | 'danger' | 'neutral' | 'success'
interface Report { key: string; title: string; desc: string; icon: LucideIcon; tone: Tone; pick?: { label: string; button: string; items: string[] } }

const reports: Report[] = [
  { key: 'projects', title: 'Projects report', desc: 'All projects with developer, consultant and status.', icon: Building2, tone: 'accent' },
  { key: 'developers', title: 'Developers report', desc: 'Developer portfolios and project counts.', icon: HardHat, tone: 'success' },
  { key: 'developer-issues', title: 'Developer issues report', desc: 'Open issues raised against a developer.', icon: ClipboardList, tone: 'warning', pick: { label: 'Developer', button: 'Developer', items: developers.map((d) => d.name) } },
  { key: 'substations', title: 'Substations report', desc: 'Substation list with SCADA names and builders.', icon: Zap, tone: 'neutral' },
  { key: 'consultants', title: 'Consultants report', desc: 'Consultant directory with linked projects.', icon: Users, tone: 'danger' },
  { key: 'consultant-issues', title: 'Consultant issues report', desc: 'Open issues raised against a consultant.', icon: Handshake, tone: 'info', pick: { label: 'Consultant', button: 'Consultant', items: consultants.map((c) => c.name) } },
  { key: 'plots', title: 'Plot report for a single project', desc: 'Plot-level load details for one project.', icon: MapPinned, tone: 'accent', pick: { label: 'Project', button: 'Project', items: projects.map((p) => `${p.maalemRef} – ${p.name}`) } },
]
const toneVar: Record<Tone, string> = { accent: 'var(--accent-600)', info: 'var(--color-info)', warning: 'var(--color-warning)', danger: 'var(--color-danger)', neutral: 'var(--color-neutral)', success: 'var(--color-success)' }

export function ReportsPage() {
  return (
    <div className="page">
      <PageHeader title="Reports" subtitle="Generate a report and email it" back={false} />
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
        {reports.map(({ key, title, desc, icon: Icon, tone }, i) => (
          <Link key={key} to={`/reports/${key}`} className="card lift pad reveal-item report" style={{ ['--index' as string]: i, ['--tone' as string]: toneVar[tone] }}>
            <span className="report-ico"><Icon size={22} /></span>
            <h5 style={{ marginTop: 14 }}>{title}</h5>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

const emailOk = (s: string) => s.split(/[;,]/).map((x) => x.trim()).filter(Boolean).every((x) => /^\S+@\S+\.\S+$/.test(x))

export function ReportFormPage() {
  const { key } = useParams()
  const navigate = useNavigate()
  const report = reports.find((r) => r.key === key)
  const [subject, setSubject] = useState('')
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [lookup, setLookup] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, say] = useToast()
  if (!report) return <PageHeader title="Report not found" />
  const Icon = report.icon

  const toErr = submitted ? (!to.trim() ? 'This field is required' : !emailOk(to) ? 'Enter valid email address(es)' : undefined) : undefined
  const ccErr = submitted && cc.trim() && !emailOk(cc) ? 'Enter valid email address(es)' : undefined
  const subjErr = submitted && report.pick && !subject ? 'This field is required' : undefined
  const send = () => {
    setSubmitted(true)
    if (!to.trim() || !emailOk(to) || (cc.trim() && !emailOk(cc)) || (report.pick && !subject)) return
    say('Report sent'); setTimeout(() => navigate('/reports'), 1000)
  }

  return (
    <div className="page">
      <PageHeader title={report.title} subtitle={report.desc} />
      <div className="card pad reveal-item" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="row" style={{ gap: 12, marginBottom: 20 }}>
          <span className="report-ico" style={{ ['--tone' as string]: toneVar[report.tone] }}><Icon size={22} /></span>
          <div><h5>Email this report</h5><p className="muted" style={{ fontSize: 13 }}>Separate multiple addresses with commas or semicolons.</p></div>
        </div>
        {report.pick && <PickField label={report.pick.label} required value={subject} error={subjErr} buttonLabel={report.pick.button} onPick={() => setLookup(true)} />}
        <TextField label="Email to" required value={to} error={toErr} onChange={setTo} placeholder="name@dewa.gov.ae" />
        <TextField label="Email CC" value={cc} error={ccErr} onChange={setCc} />
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <AppButton variant="outlined" onClick={() => navigate('/reports')}>Cancel</AppButton>
          <AppButton variant="contained" startIcon={<Send size={16} />} onClick={send}>Send report</AppButton>
        </div>
      </div>
      {lookup && report.pick && <LookupModal title={`Select ${report.pick.label.toLowerCase()}`} items={report.pick.items} onPick={setSubject} onClose={() => setLookup(false)} />}
      {toast}
    </div>
  )
}
