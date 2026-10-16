// Every action of sp_UC000420_Api (see sql/sp_UC000420_Api.sql) with a sample JSON for the flow test page.
// IDs and the project reference are placeholders: replace them with real values from your database.
// Keys are the procedure parameter names with the leading capital(s) lower-cased; filters are optional.
export const SAMPLES: Record<string, object> = {
  SearchConsultants: {
    "pageSize": 5,
    "pageNumber": 1
  },
  SearchConsultants_Count: {},
  SearchConsultants_SO: {
    "pageSize": 5,
    "pageNumber": 1
  },
  SearchDevelopers: {
    "pageSize": 5,
    "pageNumber": 1
  },
  SearchDevelopers_Count: {},
  SearchDevelopers_SO: {
    "pageSize": 5,
    "pageNumber": 1
  },
  SearchPlots: {
    "pageSize": 5,
    "pageNumber": 1
  },
  SearchPlots_Count: {},
  SearchPlots_SO: {
    "pageSize": 5,
    "pageNumber": 1
  },
  SearchProjects: {
    "pageSize": 5,
    "pageNumber": 1
  },
  SearchProjects_Count: {},
  SearchProjects_SO: {
    "pageSize": 5,
    "pageNumber": 1
  },
  SearchSubstations: {
    "pageSize": 5,
    "pageNumber": 1
  },
  SearchSubstations_Count: {},
  SearchSubstations_SO: {
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewConAndDevStats: {},
  ViewConDetails_SO: {
    "consultantID": 1
  },
  ViewConDevelopers: {
    "consultantID": 1,
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewConsIssues: {
    "consultantID": 1,
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewConsProjects: {
    "consultantID": 1,
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewDevConsultants: {
    "developerID": 1,
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewDevDetails_SO: {
    "developerID": 1
  },
  ViewDevIssues: {
    "developerID": 1,
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewDevProjects: {
    "developerID": 1,
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewFilesAreaMap: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewFilesAreaReport: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewFilesIssues: {
    "issueID": 1,
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewFilesPlot: {
    "consultantID": 1,
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewFilesPresentation: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewFilesProjectLayout: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewFilesProjHistory: {
    "pHID": 1,
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewFilesZoning: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewPlotDetails: {
    "rowID": 1
  },
  ViewPlotSubstations: {
    "rowID": 1
  },
  ViewProjDetails: {
    "maalemDubaiRef": "MP-99846-100"
  },
  ViewProjDetails_SO: {
    "maalemDubaiRef": "MP-99846-100"
  },
  ViewProjExistingKVSS: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewProjFiles_SO: {
    "maalemDubaiRef": "MP-99846-100"
  },
  ViewProjFutureYears: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewProjHistory: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewProjIssues: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewProjPPR: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewProjRemarks: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewProjStats: {
    "maalemDubaiRef": "MP-99846-100"
  },
  ViewProjSubstations_SO: {
    "maalemDubaiRef": "MP-99846-100",
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewSettings_TCL: {
    "pageSize": 5,
    "pageNumber": 1
  },
  ViewSubDetails_SO: {
    "substationId": 1
  },
  ViewSubstation_Details: {
    "substationId": 1
  },
  ViewSubstationLimitDetails: {
    "substationId": 1
  },
  ViewSubstation_Limits: {
    "substationId": 1
  },
  ViewSubStats: {
    "subId": 1
  },
  Nope: {},
}

export const ACTIONS = Object.keys(SAMPLES)
export const sampleJson = (action: string) => JSON.stringify(SAMPLES[action] ?? {}, null, 2)

/* ---------- CRUD (sp_UC000420_Crud): action = <entity>.<operation> ---------- */
/** id = the key of the row used by get / update / setActive / delete: a whole number (RowID, DeveloperID, …) for every table except project, whose id is its reference (MP-xxxxx-xxx). create = sample fields for a new row. */
export const CRUD_ENTITIES: Record<string, { id: string | number; create: object; update: object }> = {
  consultant: { id: 1, create: { consultantName: 'ZZ Test Consultant', consultantURL: 'https://example.com' }, update: { consultantURL: 'https://example.org' } },
  developer: { id: 1, create: { developerName: 'ZZ Test Developer', developerURL: 'https://example.com' }, update: { developerURL: 'https://example.org' } },
  project: { id: 'MP-TEST-001', create: { maalemDubaiRef: 'MP-TEST-001', projectName: 'ZZ Test Project', developerID: 1 }, update: { projectName: 'ZZ Test Project (edited)' } },
  plot: { id: 1, create: { maalemDubaiRef: 'MP-TEST-001', consultantID: 1, devPlotNum: 'ZZ-001', dmPlotNum: '000-0000' }, update: { plotStatus: 'Test' } },
  substation: { id: 1, create: { substationName: 'ZZ Test Substation', substationSCADAName: 'ZZTEST', builtBy: 'DEWA' }, update: { substationSCADAName: 'ZZTEST2' } },
  consultantIssue: { id: 1, create: { consultantID: 1, maalemDubaiRef: 'MP-TEST-001', description: 'Test issue' }, update: { description: 'Test issue (edited)' } },
  developerIssue: { id: 1, create: { developerID: 1, maalemDubaiRef: 'MP-TEST-001', description: 'Test issue' }, update: { description: 'Test issue (edited)' } },
  existingKVSS: { id: 1, create: { maalemDubaiRef: 'MP-TEST-001', substationID: 1, status: 'Existing' }, update: { status: 'Existing (edited)' } },
  projectIssue: { id: 1, create: { maalemDubaiRef: 'MP-TEST-001', description: 'Test issue' }, update: { description: 'Test issue (edited)' } },
  issueFile: { id: 1, create: { issueID: 1, fileID: 1 }, update: { fileID: 2 } },
  substationLimitLookup: { id: 1, create: { limitAmount: 20, limitDesc: '2 x 20 MVA' }, update: { limitDesc: '2 x 20 MVA (edited)' } },
  ppr: { id: 1, create: { maalemDubaiRef: 'MP-TEST-001', substationID: 1 }, update: { substationID: 2 } },
  pprFile: { id: 1, create: { pprID: 1, fileID: 1 }, update: { fileID: 2 } },
  projectConsultant: { id: 1, create: { maalemDubaiRef: 'MP-TEST-001', consultantID: 1 }, update: { consultantID: 2 } },
  projectHistory: { id: 1, create: { maalemDubaiRef: 'MP-TEST-001', historyDate: '2026-10-15', ptpLetterReceived: 'Test', mpLetterRef: 'REF-001' }, update: { mpLetterRef: 'REF-002' } },
  projectHistoryFile: { id: 1, create: { projectHistID: 1, fileID: 1 }, update: { fileID: 2 } },
  projectFutureYear: { id: 1, create: { maalemDubaiRef: 'MP-TEST-001', projectYear: 2030, remark: 'Test', substationID: 1, status: 'Planned' }, update: { remark: 'Test (edited)' } },
  projectRemark: { id: 1, create: { maalemDubaiRef: 'MP-TEST-001', remarks: 'Test remark' }, update: { remarks: 'Test remark (edited)' } },
  substationLimit: { id: 1, create: { substationID: 1, limitID: 1 }, update: { limitID: 2 } },
}
export const CRUD_ENTITY_NAMES = Object.keys(CRUD_ENTITIES)
export const CRUD_OPS = ['list', 'get', 'create', 'update', 'setActive', 'delete', 'createMany', 'setActiveMany', 'deleteMany'] as const
export const crudSample = (entity: string, op: string): string => {
  const e = CRUD_ENTITIES[entity]
  if (!e) return '{}'
  const user = 'test'
  const body: Record<string, object> = {
    list: { pageSize: 5, pageNumber: 1 },
    get: { id: e.id },
    create: { ...e.create, user },
    update: { id: e.id, ...e.update, user },
    setActive: { id: e.id, isActive: false, user },
    delete: { id: e.id, user },
    createMany: { rows: [e.create, e.create], user },
    setActiveMany: { ids: [e.id], isActive: false, user },
    deleteMany: { ids: [e.id], user },
  }
  return JSON.stringify(body[op] ?? {}, null, 2)
}
