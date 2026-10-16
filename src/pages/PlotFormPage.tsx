import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import AppButton from '../components/common/AppButton'
import Section from '../components/common/Section'
import PageHeader from '../components/PageHeader'
import RemoteBadge from '../components/RemoteBadge'
import { loadPlot } from '../data/details'
import { userMessage } from '../data/api'
import { saveRecord } from '../data/write'
import { useRemote } from '../data/remote'
import { syncEntity, useSyncStatus } from '../data/sync'
import { LookupModal, PickField, RadioField, TextField, useToast } from '../components/ui'
import { useConsultants, usePersistent, usePlots, useProjects, useSubstations } from '../data/store'

type V = Record<string, string>
const loads = ['dataCenter', 'solar', 'industrial', 'lighting', 'evCharger', 'agritech', 'other']
const loadLabel: Record<string, string> = { dataCenter: 'Data center load (kW)', solar: 'Solar load (kW)', industrial: 'Industrial load (kW)', lighting: 'Lighting load (kW)', evCharger: 'EV charger load (kW)', agritech: 'Agritech load (kW)', other: 'Other loads (kW)' }

export default function PlotFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [plots] = usePlots()
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
  // Opening a plot calls the flow for its full record and its initial/ultimate substations.
  const live = useSyncStatus().state === 'live' // ids are only database ids once the lists came from SQL
  const remote = useRemote(plot && live ? plot.id : null, () => loadPlot(plot!.id))
  useEffect(() => { if (remote.data) setV((p) => ({ ...p, ...remote.data })) }, [remote.data])
  const [lookup, setLookup] = useState<null | 'consultant' | 'initSub' | 'ultSub'>(null)
  const [submitted, setSubmitted] = useState(false)
  const [toast, say] = useToast()
  const set = (k: string) => (x: string) => setV((p) => ({ ...p, [k]: x }))
  const t = (k: string, label: string, o: { required?: boolean; type?: string; readOnly?: boolean } = {}) =>
    <TextField label={label} value={v[k]} onChange={set(k)} type={o.type} readOnly={o.readOnly} required={o.required} error={submitted && o.required && !v[k] ? 'This field is required' : undefined} />
  const [saving, setSaving] = useState(false)
  // Save writes to SQL through the flow (plot.create / plot.update), then reloads the lists.
  const save = async () => {
    setSubmitted(true)
    if (!v.show || !v.devPlot) return
    if (!live) { say('The server can’t be reached right now: nothing was saved. Please try again.'); return }
    if (!v.maalemRef) { say('Choose the project first'); return }
    const subId = (name: string) => substations.find((s) => s.name === name)?.id
    const fields = {
      MaalemDubaiRef: v.maalemRef, ConsultantID: consultants.find((c) => c.name === v.consultant)?.id, DevPlotNum: v.devPlot, DMPlotNum: v.dmPlot,
      PlotOwnerName: v.owner, PlotProjectName: v.projectName, PlotStatus: v.status, NOCRelease: v.noc, IsActive: v.show === 'Yes',
      InitSubID: subId(v.initSub), UltSubID: subId(v.ultSub), InitDevSubCommDate: v.initDate, UltDevSubCommDate: v.ultDate,
      PowerDensity: v.powerDensity, GFA: v.gfa, LandUse: v.landUse, ExpPowerReq: v.expPower, GenaralLoad: v.generalLoad, LocalizedCoolingLoad: v.cooling,
      DCP: v.dcp, TotalConnectedLoad: v.tcl, DataCenterLoad: v.dataCenter, SolarLoad: v.solar, IndustrialLoad: v.industrial, LightingLoad: v.lighting,
      EVChargerLoad: v.evCharger, AgritechLoad: v.agritech, OtherLoads: v.other,
    }
    setSaving(true)
    try {
      await saveRecord('plot', plot ? plot.id : null, fields)
      await syncEntity('plots')
      say('Plot saved'); setTimeout(() => navigate('/plots'), 700)
    } catch (e) {
      say(userMessage(e, 'Could not save the plot'))
    }
    setSaving(false)
  }

  return (
    <div className="page">
      <PageHeader title={plot ? `Plot ${plot.devPlot}` : 'New plot'} subtitle={project ? `${project.maalemRef} · ${project.name}` : 'Fields marked * are required'} badge={plot && <RemoteBadge state={remote} />} actions={
        <>
          <AppButton variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/plots')}>Back</AppButton>
          <AppButton variant="contained" loading={saving} startIcon={<Save size={16} />} onClick={save}>Save</AppButton>
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
      {lookup === 'consultant' && <LookupModal title="Select consultant" items={consultants.filter((c) => c.showInSO).map((c) => c.name)} onPick={set('consultant')} onClose={() => setLookup(null)} />}
      {(lookup === 'initSub' || lookup === 'ultSub') && <LookupModal title="Select substation" items={substations.filter((s) => s.showInSO).map((s) => s.name)} onPick={set(lookup)} onClose={() => setLookup(null)} />}
      {toast}
    </div>
  )
}
