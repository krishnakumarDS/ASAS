import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppButton from '../components/common/AppButton'
import PageHeader from '../components/PageHeader'
import { LookupModal, PickField } from '../components/ui'
import { useProjects } from '../data/store'

/** Add a single plot: choose the project (Maalem Dubai reference), then fill the plot form. */
export default function PlotWizardPage() {
  const navigate = useNavigate()
  const [projects] = useProjects()
  const [project, setProject] = useState('')
  const [lookup, setLookup] = useState(false)
  return (
    <div className="page">
      <PageHeader title="Add plot" subtitle="Search with the Maalem Dubai reference to pick the project" />
      <div className="card pad reveal-item" style={{ maxWidth: 640, margin: '0 auto' }}>
        <PickField label="Maalem Dubai reference" required value={project} buttonLabel="Project" onPick={() => setLookup(true)} />
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <AppButton variant="outlined" onClick={() => navigate('/plots')}>Cancel</AppButton>
          <AppButton variant="contained" disabled={!project} onClick={() => navigate(`/plots/new/single?ref=${encodeURIComponent(project)}`)}>Continue</AppButton>
        </div>
      </div>
      {lookup && <LookupModal title="Select project" items={projects.map((p) => p.maalemRef)} onPick={setProject} onClose={() => setLookup(false)} />}
    </div>
  )
}
