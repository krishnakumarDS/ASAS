// One loader per detail screen. Each calls a View* action of sp_UC000420_Api through the flow and maps the
// result sets onto the shapes the screens already use. Columns come from db.md; missing ones become ''.
import { callApi } from './api'
import type { Row } from './api'

const str = (v: unknown) => (v == null ? '' : String(v))
const num = (v: unknown) => (v == null || v === '' || Number.isNaN(Number(v)) ? undefined : Number(v))
const day = (v: unknown) => str(v).slice(0, 10)
const yn = (v: unknown) => (v == null || v === '' ? '' : v === true || /^(yes|y|true|1)$/i.test(String(v)) ? 'Yes' : 'No')

export interface Totals { plots?: number; tcl?: number; dcp?: number }
const totalsOf = (r?: Row): Totals => ({ plots: num(r?.PLOTS), tcl: num(r?.TCL), dcp: num(r?.DCP) })

/* ---------------- project ---------------- */
export interface SubRow { id: string; name: string; status: string; createdOn: string; createdBy: string; active: boolean; scada: string; commissioning?: string }
export interface RemarkRow { id: string; text: string; createdBy: string; createdOn: string; active: boolean }
export interface ProjectDetail { values: Record<string, string>; existing: SubRow[]; future: SubRow[]; remarks: RemarkRow[]; totals: Totals }

export async function loadProject(ref: string): Promise<ProjectDetail> {
  const [p = [], ex = [], fut = [], rem = [], tot = []] = await callApi('ViewProjDetails_SO', { maalemDubaiRef: ref })
  const r = p[0]
  if (!r) throw new Error('This project was not found.')
  return {
    values: {
      ref: str(r.Ref), maalemNumber: str(r.MaalemDubaiNo), maalemRef: str(r.MaalemDubaiRef), name: str(r.ProjectName),
      areaMap: yn(r.AreaMap), areaMapRef: str(r.AreaMapRef), areaReport: str(r.AreaReport), zone: str(r.Zone), subZone: str(r.SubZone),
      built: str(r.BuiltPerc), underConstruction: str(r.UCPerc), vacant: str(r.VPerc),
      engineer: str(r.Engineer), assistantEngineer: str(r.AsstEng), developer: str(r.DeveloperName),
      masterPlanStatus: str(r.MasterPlanStatus), siteSurveyor: yn(r.SiteSurveyor), corridors: str(r.Corridors11kV), ducts: str(r.Ducts11kV),
      hvNoc: str(r.HVNOC), ss132: str(r.SS132kV), ss400: str(r.SS400kV), category: str(r.ProjectCategory),
    },
    existing: ex.map((x, i) => ({ id: `${ref}-ex-${i}`, name: str(x.SubstationName), status: str(x.Status), createdOn: '', createdBy: '', active: true, scada: str(x.SubstationSCADAName) })),
    future: fut.map((x, i) => ({ id: `${ref}-fu-${i}`, name: str(x.SubstationName), status: str(x.Status), createdOn: '', createdBy: '', active: true, scada: str(x.SubstationSCADAName), commissioning: [str(x.ProjectYear), str(x.Remark)].filter(Boolean).join(' · ') })),
    remarks: rem.map((x, i) => ({ id: `${ref}-rm-${i}`, text: str(x.Remarks), createdBy: '', createdOn: str(x.updated_at), active: true })),
    totals: totalsOf(tot[0]),
  }
}

/* ---------------- plot ---------------- */
export async function loadPlot(rowId: string): Promise<Record<string, string>> {
  const [dt, st] = await Promise.all([
    callApi('ViewPlotDetails', { rowID: Number(rowId) }),
    callApi('ViewPlotSubstations', { rowID: Number(rowId) }).catch(() => [] as Row[][]),
  ])
  const d = dt[0]?.[0], s = st[0]?.[0]
  if (!d) throw new Error('This plot was not found.')
  return {
    maalemRef: str(d.MaalemDubaiRef), devPlot: str(d.DevPlotNum), dmPlot: str(d.DMPlotNum), owner: str(d.PlotOwnerName), projectName: str(d.PlotProjectName),
    powerDensity: str(d.PowerDensity), gfa: str(d.GFA), landUse: str(d.LandUse), status: str(d.PlotStatus), expPower: str(d.ExpPowerReq),
    generalLoad: str(d.GenaralLoad), cooling: str(d.LocalizedCoolingLoad), dcp: str(d.DCP), tcl: str(d.TotalConnectedLoad),
    initDate: day(d.InitDevSubCommDate), ultDate: day(d.UltDevSubCommDate), noc: str(d.NOCRelease),
    consultant: str(d.ConsultantName), developer: str(d.DeveloperName), show: yn(d.IsActive),
    evCharger: str(d.EVChargerLoad), dataCenter: str(d.DataCenterLoad), solar: str(d.SolarLoad), industrial: str(d.IndustrialLoad),
    lighting: str(d.LightingLoad), agritech: str(d.AgritechLoad), other: str(d.OtherLoads),
    initSub: str(s?.InitSubSCADAName), ultSub: str(s?.UltSubSCADAName),
  }
}

/* ---------------- substation ---------------- */
export interface SubstationDetail {
  name: string; scada: string; builtBy: string; limits: { id: string; amount: string; description: string }[]
  totals: Totals; projects: { id: string; ref: string; name: string; plots: number; tcl: number }[]
}
export async function loadSubstation(id: string): Promise<SubstationDetail> {
  const [h = [], lim = [], tot = [], proj = []] = await callApi('ViewSubDetails_SO', { substationId: Number(id) })
  const r = h[0]
  if (!r) throw new Error('This substation was not found.')
  return {
    name: str(r.SubstationName), scada: str(r.SubstationSCADAName), builtBy: /dewa/i.test(str(r.BuiltBy)) ? 'DEWA' : str(r.BuiltBy) ? 'Developer' : '',
    limits: lim.map((l, i) => ({ id: `${id}-l${i}`, amount: str(l.LimitAmount), description: str(l.LimitDesc) })),
    totals: totalsOf(tot[0]),
    projects: proj.map((p) => ({ id: str(p.MaalemDubaiRef), ref: str(p.MaalemDubaiRef), name: str(p.ProjectName), plots: Number(p.TotalPlots ?? 0), tcl: Number(p.TCL ?? 0) })),
  }
}

/* ---------------- developer / consultant ---------------- */
export interface PartyIssue { id: string; ref: string; project: string; description: string; createdBy: string; createdOn: string; showInSO: boolean }
export interface PartyDetail { url: string; issues: PartyIssue[]; projects: { ref: string; name: string; other: string; tcl?: number; plots?: number }[]; totals: Totals }

export async function loadParty(kind: 'developer' | 'consultant', id: string): Promise<PartyDetail> {
  const dev = kind === 'developer'
  const [h = [], iss = [], proj = [], tot = []] = await callApi(dev ? 'ViewDevDetails_SO' : 'ViewConDetails_SO', dev ? { developerID: Number(id) } : { consultantID: Number(id) })
  return {
    url: str(h[0]?.[dev ? 'DeveloperURL' : 'ConsultantURL']),
    issues: iss.map((x, i) => ({ id: `${id}-i${i}`, ref: str(x.MaalemDubaiRef), project: str(x.ProjectName), description: str(x.Description), createdBy: '', createdOn: '', showInSO: true })),
    projects: proj.map((x) => ({ ref: str(x.MaalemDubaiRef), name: str(x.ProjectName), other: str(dev ? x.ConsultantName : x.DeveloperName), tcl: num(x.TCL), plots: num(x.PLOTS) })),
    totals: totalsOf(tot[0]),
  }
}
