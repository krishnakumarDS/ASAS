import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import PageHeader from '../components/PageHeader'
import { FileDrop, LookupModal, PickField, RadioField } from '../components/ui'
import { projects } from '../data/projects'

const STEPS = ['Select project', 'Upload data', 'Validate', 'Complete']

export default function PlotWizardPage() {
  const navigate = useNavigate()
  const [project, setProject] = useState('')
  const [mode, setMode] = useState('')
  const [lookup, setLookup] = useState(false)
  const [step, setStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)

  const next = () => (mode === 'Single load update' ? navigate(`/plots/new/single?ref=${encodeURIComponent(project)}`) : setStep(1))

  return (
    <div className="page">
      <PageHeader title="Upload new plots" subtitle="Add a single plot or import an overall PWLD file" />
      <div className="card pad reveal-item" style={{ maxWidth: 720, margin: '0 auto' }}>
        <ol className="steps" aria-label="Progress">
          {STEPS.map((s, i) => <li key={s} className={i <= step ? 'on' : ''} aria-current={i === step ? 'step' : undefined}><b>{i < step ? <Check size={14} /> : i + 1}</b><span>{s}</span></li>)}
        </ol>
        {step === 0 && (
          <>
            <PickField label="Maalem Dubai reference" required value={project} buttonLabel="Project" onPick={() => setLookup(true)} />
            <RadioField label="Update type" options={['Single load update', 'Upload overall PWLD']} value={mode} onChange={setMode} />
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
              <AppButton variant="outlined" onClick={() => navigate('/plots')}>Cancel</AppButton>
              <AppButton variant="contained" disabled={!project || !mode} onClick={next}>Next</AppButton>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h4 style={{ marginBottom: 14 }}>Data upload</h4>
            <FileDrop file={file} onFile={setFile} accept=".xls,.xlsx" hint="Only .xls and .xlsx files are accepted." />
            <div className="row" style={{ justifyContent: 'flex-end' }}><AppButton variant="outlined" onClick={() => setStep(0)}>Back</AppButton><AppButton variant="contained" disabled={!file} onClick={() => setStep(2)}>Start</AppButton></div>
          </>
        )}
        {step === 2 && (
          <>
            <h4 style={{ marginBottom: 14 }}>Validation</h4>
            <div className="stats"><div className="stat"><small>Rows read</small><strong>24</strong></div><div className="stat"><small>Valid</small><strong>24</strong></div><div className="stat"><small>Errors</small><strong>0</strong></div></div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 20 }}><AppButton variant="outlined" onClick={() => setStep(1)}>Back</AppButton><AppButton variant="contained" onClick={() => setStep(3)}>Import</AppButton></div>
          </>
        )}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <span className="avatar lg" style={{ margin: '0 auto 14px', background: 'var(--color-success-bg)', color: 'var(--color-success)', borderColor: 'transparent', borderRadius: '50%' }}><Check size={32} /></span>
            <h4>Import complete</h4>
            <p className="muted" style={{ margin: '6px 0 20px' }}>24 plots were imported for {project}.</p>
            <AppButton variant="contained" onClick={() => navigate('/plots')}>Done</AppButton>
          </div>
        )}
      </div>
      {lookup && <LookupModal title="Select project" items={projects.map((p) => p.maalemRef)} onPick={setProject} onClose={() => setLookup(false)} />}
    </div>
  )
}
