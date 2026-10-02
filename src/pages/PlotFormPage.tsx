import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Save, X } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import Section from '../components/common/Section'
import PageHeader from '../components/PageHeader'
import { LookupModal, PickField, RadioField, TextField, useToast } from '../components/ui'
import { newId, setStored, useConsultants, usePersistent, usePlots, useProjects, useSubstations } from '../data/store'

type V = Record<string, string>
const loads = ['dataCenter', 'solar', 'industrial', 'lighting', 'evCharger', 'agritech', 'other']
const loadLabel: Record<string, string> = { dataCenter: 'Data center load (kW)', solar: 'Solar load (kW)', industrial: 'Industrial load (kW)', lighting: 'Lighting load (kW)', evCharger: 'EV charger load (kW)', agritech: 'Agritech load (kW)', other: 'Other loads (kW)' }

export default function PlotFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [plots, setPlots] = usePlots()
  const [projects] = useProjects()
  const [consultants] = useConsultants()
  const [substations] = useSubstations()
  const [saved] = usePersistent<V | null>(`plot:${id ?? 'new'}:details`, null)
  const plot = plots.find((p) => p.id === id)
  const ref = plot?.maalemRef ?? params.get('ref') ?? ''
  const project = projects.find((p) => p.maalemRef === ref)
  const [v, setV] = useState<V>(saved ?? {
    show: plot ? (plot.display ? 'Yes' : 'No') : '', maalemRef: ref, consultant: plot?.consultant ?? '', devPlot: plot?.devPlot ?? '', dmPlot: plot?.dmPlot ?? '',
    owner: '', status: '', noc: '', initSub: '', ultSub: '', projectName: plot?.projectName ?? project?.name ?? '', developer: plot?.developer ?? project?.developer ?? '',
    powerDensity: '', gfa: '', landUse: '', expPower: '', generalLoad: '', cooling: '', dcp: '', tcl: '', initDate: '', ultDate: '',
    ...Object.fromEntries(loads.map((l) => [l, ''])),
  })
  const [lookup, setLookup] = useState<null | 'consultant' | 'initSub' | 'ultSub'>(null)
  const [submitted, setSubmitted] = useState(false)
  const [toast, say] = useToast()
  const set = (k: string) => (x: string) => setV((p) => ({ ...p, [k]: x }))
  const t = (k: string, label: string, o: { required?: boolean; type?: string; readOnly?: boolean } = {}) =>
    <TextField label={label} value={v[k]} onChange={set(k)} type={o.type} readOnly={o.readOnly} required={o.required} error={submitted && o.required && !v[k] ? 'This field is required' : undefined} />
  const save = () => {
    setSubmitted(true)
    if (!v.show || !v.devPlot) return
    const row = { maalemRef: v.maalemRef, projectName: v.projectName, devPlot: v.devPlot, dmPlot: v.dmPlot, developer: v.developer, consultant: v.consultant, display: v.show === 'Yes' }
    if (plot) { setPlots((l) => l.map((p) => (p.id === plot.id ? { ...p, ...row } : p))); setStored(`plot:${plot.id}:details`, v) }
    else { const nid = newId(); setPlots((l) => [{ id: nid, ...row }, ...l]); setStored(`plot:${nid}:details`, v) }
    say('Plot saved'); setTimeout(() => navigate('/plots'), 700)
  }

  return (
    <div className="page">
      <PageHeader title={plot ? `Plot ${plot.devPlot}` : 'New plot'} subtitle={project ? `${project.maalemRef} · ${project.name}` : 'Fields marked * are required'} actions={
        <>
          <AppButton variant="outlined" startIcon={<X size={16} />} onClick={() => navigate('/plots')}>Close</AppButton>
          <AppButton variant="contained" startIcon={<Save size={16} />} onClick={save}>Save</AppButton>
        </>
      } />
      <div className="stack">
        <Section title="Project & plot" index={0}>
          <div className="grid-auto">
            {t('projectName', 'Plot project name', { readOnly: true })}{t('developer', 'Developer name', { readOnly: true })}{t('maalemRef', 'Maalem Dubai ref', { readOnly: true })}
            <PickField label="Consultant name" value={v.consultant} buttonLabel="Consultant" onPick={() => setLookup('consultant')} />
            {t('devPlot', 'Dev plot number', { required: true })}{t('dmPlot', 'DM plot number')}{t('owner', 'Plot owner name')}{t('status', 'Plot status')}{t('noc', 'NOC release')}
            <RadioField label="Show in Smart Office?" required value={v.show} onChange={set('show')} error={submitted && !v.show ? 'This field is required' : undefined} />
          </div>
        </Section>
        <Section title="Substations & dates" index={1}>
          <div className="grid-auto">
            <PickField label="Init substation" value={v.initSub} buttonLabel="Substation" onPick={() => setLookup('initSub')} />
            <PickField label="Ult substation" value={v.ultSub} buttonLabel="Substation" onPick={() => setLookup('ultSub')} />
            {t('initDate', 'Initial dev sub-station comm date', { type: 'date' })}{t('ultDate', 'Ult dev sub comm date', { type: 'date' })}
          </div>
        </Section>
        <Section title="Loads (kW)" index={2}><div className="grid-auto">{loads.map((l) => <div key={l}>{t(l, loadLabel[l], { type: 'number' })}</div>)}</div></Section>
        <Section title="Demand & land use" index={3}>
          <div className="grid-auto">
            {t('powerDensity', 'Power density', { type: 'number' })}{t('gfa', 'GFA', { type: 'number' })}{t('landUse', 'Land use')}{t('expPower', 'Exp power req', { type: 'number' })}
            {t('generalLoad', 'General load', { type: 'number' })}{t('cooling', 'Localized cooling load', { type: 'number' })}{t('dcp', 'DCP (kW)', { type: 'number' })}{t('tcl', 'Total connected load (kW)', { type: 'number' })}
          </div>
        </Section>
      </div>
      {lookup === 'consultant' && <LookupModal title="Select consultant" items={consultants.map((c) => c.name)} onPick={set('consultant')} onClose={() => setLookup(null)} />}
      {(lookup === 'initSub' || lookup === 'ultSub') && <LookupModal title="Select substation" items={substations.map((s) => s.name)} onPick={set(lookup)} onClose={() => setLookup(null)} />}
      {toast}
    </div>
  )
}
