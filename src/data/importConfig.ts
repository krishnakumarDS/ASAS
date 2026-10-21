// What can be bulk-imported from an Excel file: for each table the columns (SQL column names), their type and which are required.
// A field with `ref` holds a NAME in the file (e.g. a developer name) that is turned into the id before sending.
export type FieldType = 'text' | 'number' | 'date' | 'yesno'
export interface ImportField {
  key: string                 // SQL column name sent to the server
  label: string               // column heading in the template / on screen
  type: FieldType
  required?: boolean
  synonyms?: string[]         // other headings that map to this field (compared in lower case, letters and digits only)
  ref?: 'developer' | 'consultant' | 'substation'
}
export interface ImportEntity {
  entity: 'project' | 'plot' | 'substation' | 'developer' | 'consultant'   // name used by the server's CRUD procedure
  list: 'projects' | 'plots' | 'substations' | 'developers' | 'consultants' // which stored list to reload afterwards
  label: string
  fields: ImportField[]
}

const num = (key: string, label: string, synonyms?: string[]): ImportField => ({ key, label, type: 'number', synonyms })
const txt = (key: string, label: string, synonyms?: string[], required?: boolean): ImportField => ({ key, label, type: 'text', synonyms, required })

export const IMPORTS: ImportEntity[] = [
  { entity: 'project', list: 'projects', label: 'Projects', fields: [
    txt('MaalemDubaiRef', 'Maalem Dubai ref', ['maalemref', 'mpref', 'projectref', 'reference', 'maalemdubaireference'], true),
    txt('ProjectName', 'Project name', ['name', 'project'], true),
    { key: 'DeveloperID', label: 'Developer name', type: 'text', required: true, ref: 'developer', synonyms: ['developer'] },
    txt('MaalemDubaiNo', 'Maalem Dubai number', ['maalemnumber']), txt('Ref', 'REF', ['refno']),
    txt('Engineer', 'Engineer'), txt('AsstEng', 'Assistant engineer', ['asstengineer', 'assistantengineer']),
    txt('MasterPlanStatus', 'Master plan status'), txt('Corridors11kV', '11kV corridors', ['corridors']), txt('Ducts11kV', '11kV ducts', ['ducts']),
    txt('HVNOC', 'HV NOC', ['hvnoc']), { key: 'SiteSurveyor', label: 'Site surveyor', type: 'yesno' },
    { key: 'AreaMap', label: 'Area map', type: 'yesno' }, txt('AreaMapRef', 'Area map ref'), txt('AreaReport', 'Area report'),
    num('SS132kV', '132kV SS', ['ss132kv', 'ss132']), num('SS400kV', '400kV SS', ['ss400kv', 'ss400']),
    txt('Zone', 'Zone'), txt('SubZone', 'Sub-zone', ['subzone']),
    num('BuiltPerc', 'Built %', ['built', 'builtperc']), num('UCPerc', 'Under construction %', ['underconstruction', 'ucperc']), num('VPerc', 'Vacant %', ['vacant', 'vperc']),
    txt('ProjectCategory', 'Project category', ['category']),
  ] },
  { entity: 'plot', list: 'plots', label: 'Plots', fields: [
    txt('MaalemDubaiRef', 'Maalem Dubai ref', ['maalemref', 'mpref', 'projectref', 'reference'], true),
    txt('DevPlotNum', 'Dev plot number', ['devplot', 'plotno', 'plotnumber', 'developerplot'], true),
    txt('DMPlotNum', 'DM plot number', ['dmplot', 'dubaimunicipalityplot']),
    { key: 'ConsultantID', label: 'Consultant name', type: 'text', ref: 'consultant', synonyms: ['consultant'] },
    txt('PlotOwnerName', 'Plot owner name', ['owner', 'plotowner']), txt('PlotProjectName', 'Plot project name'), txt('PlotStatus', 'Plot status', ['status']),
    txt('NOCRelease', 'NOC release', ['noc']), txt('LandUse', 'Land use'),
    num('PowerDensity', 'Power density'), num('GFA', 'GFA'), num('ExpPowerReq', 'Exp power req', ['exppower']),
    num('GenaralLoad', 'General load', ['generalload']), num('LocalizedCoolingLoad', 'Localized cooling load', ['coolingload', 'cooling']),
    num('DCP', 'DCP (kW)', ['dcpkw']), num('TotalConnectedLoad', 'Total connected load (kW)', ['tcl', 'totalconnectedloadkw']),
    { key: 'InitSubID', label: 'Init substation', type: 'text', ref: 'substation', synonyms: ['initsub', 'initialsubstation'] },
    { key: 'UltSubID', label: 'Ult substation', type: 'text', ref: 'substation', synonyms: ['ultsub', 'ultimatesubstation'] },
    { key: 'InitDevSubCommDate', label: 'Initial dev sub-station comm date', type: 'date', synonyms: ['initdate', 'initcommdate'] },
    { key: 'UltDevSubCommDate', label: 'Ult dev sub comm date', type: 'date', synonyms: ['ultdate', 'ultcommdate'] },
    num('DataCenterLoad', 'Data center load (kW)'), num('SolarLoad', 'Solar load (kW)'), num('IndustrialLoad', 'Industrial load (kW)'), num('LightingLoad', 'Lighting load (kW)'),
    num('EVChargerLoad', 'EV charger load (kW)'), num('AgritechLoad', 'Agritech load (kW)'), num('OtherLoads', 'Other loads (kW)'),
  ] },
  { entity: 'substation', list: 'substations', label: 'Substations', fields: [
    txt('SubstationName', 'Substation name', ['substation', 'name'], true),
    txt('SubstationSCADAName', 'SCADA name', ['scada', 'substationscadaname'], true),
    txt('BuiltBy', 'Built by', ['builder', 'constructedby']),
  ] },
  { entity: 'developer', list: 'developers', label: 'Developers', fields: [
    txt('DeveloperName', 'Developer name', ['developer', 'name'], true), txt('DeveloperURL', 'Developer URL', ['url', 'website']),
  ] },
  { entity: 'consultant', list: 'consultants', label: 'Consultants', fields: [
    txt('ConsultantName', 'Consultant name', ['consultant', 'name'], true), txt('ConsultantURL', 'Consultant URL', ['url', 'website']),
  ] },
]
