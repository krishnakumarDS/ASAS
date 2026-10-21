import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppButton from './common/AppButton'
import SearchSelect from './SearchSelect'
import { Modal, RadioField } from './ui'
import { useProjects } from '../data/store'

const SINGLE = 'Single plot (open the form)'
const MANY = 'Multiple plots (upload the PWLD file)'

/** First step of "Add plot": which project, and one plot or many. One plot opens the form for that project; many go to the bulk import with the project already chosen. */
export default function AddPlotDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [projects] = useProjects()
  const [project, setProject] = useState('')
  const [kind, setKind] = useState('')
  const options = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of projects) if (p.display) m.set(`${p.maalemRef} · ${p.name}`, p.maalemRef)
    return m
  }, [projects])
  const ref = options.get(project)
  const next = () => {
    if (!ref || !kind) return
    navigate(kind === SINGLE ? `/plots/new?ref=${encodeURIComponent(ref)}` : `/import?table=pwld&project=${encodeURIComponent(ref)}`)
  }
  return (
    <Modal title="Add plots" size="sm" onClose={onClose} footer={<><AppButton variant="outlined" onClick={onClose}>Cancel</AppButton><AppButton variant="contained" disabled={!ref || !kind} onClick={next}>Next</AppButton></>}>
      <div className="field">
        <span className="label">Maalem Dubai reference / project<span className="req">*</span></span>
        <SearchSelect label="Project" placeholder="Search the project…" options={[...options.keys()]} value={project} onChange={setProject} />
      </div>
      <RadioField label="How many plots?" required value={kind} options={[SINGLE, MANY]} onChange={setKind} />
    </Modal>
  )
}
