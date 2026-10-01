export interface Substation { id: string; name: string; scada: string; builtBy: 'DEWA' | 'Developer'; showInSO: boolean; createdOn: string; createdBy: string; limit?: string }
export interface Party { id: string; name: string; createdBy: string; createdOn: string; url: string; showInSO: boolean }
export interface Plot { id: string; maalemRef: string; projectName: string; devPlot: string; dmPlot: string; developer: string; consultant: string; display: boolean }
export interface StandardLimit { id: string; amount: string; description: string; showInSO: boolean; createdOn: string; createdBy: string }

const by = 'Mariam Mohamed Alhosani'
const sub = (id: string, name: string, scada: string, builtBy: 'DEWA' | 'Developer', showInSO: boolean, createdOn: string): Substation =>
  ({ id, name, scada, builtBy, showInSO, createdOn, createdBy: by })

export const substations: Substation[] = [
  sub('1', 'AMWAJ', 'AMWAJ', 'Developer', true, '2025-09-10T13:01:25'),
  sub('2', 'Coast Line', 'COASTLIN', 'Developer', true, '2025-07-24T13:58:08'),
  sub('3', 'Dry Dock', 'DOCK', 'DEWA', true, '2025-11-13T12:26:45'),
  sub('4', 'HARTLAND', 'HARTLAND', 'Developer', false, '2025-06-17T13:03:30'),
  sub('5', 'Labour City', 'LABORCTY', 'Developer', true, '2025-08-21T11:19:22'),
  sub('6', 'MARINA HARBOR', 'MRNAHRBR', 'Developer', true, '2025-09-10T13:01:08'),
  sub('7', 'Mira', 'MIRA', 'Developer', true, '2025-09-24T10:23:39'),
  sub('8', 'Remraam', 'RMRM', 'Developer', true, '2025-11-13T11:53:05'),
  sub('9', 'Resorts', 'RSRT', 'Developer', false, '2025-07-18T10:52:25'),
  sub('10', 'SEYAHI STREET', 'SEYAHIST', 'Developer', true, '2025-09-10T13:01:47'),
  sub('11', 'Towers of Kifaf', 'TWRKIFAF', 'Developer', true, '2025-11-13T08:19:45'),
]

export const standardLimits: StandardLimit[] = [
  { id: '1', amount: '2 x 40 MVA', description: 'Standard 11/0.4 kV limit', showInSO: true, createdOn: '2025-07-18T10:00:00', createdBy: by },
  { id: '2', amount: '3 x 60 MVA', description: 'Extended limit for large developments', showInSO: false, createdOn: '2025-08-02T09:30:00', createdBy: by },
]

const party = (id: string, name: string, createdOn: string, createdBy = by): Party => ({ id, name, createdBy, createdOn, url: '', showInSO: true })

export const consultants: Party[] = [
  party('1', 'AECOM', '2025-09-10T11:03:45'),
  party('2', 'Arch-Group', '2025-07-29T13:49:43', 'Abdullah Moyikkal'),
  party('3', 'CDM Smith', '2025-06-26T09:09:07'),
  party('4', 'Green Concept Engineering', '2025-10-23T11:50:43'),
  party('5', 'KEO-VARIOUS', '2025-11-13T12:17:44'),
  party('6', 'Khatib & Alami', '2025-07-18T10:45:54'),
  party('7', 'Kifaf Development', '2025-10-23T12:09:11'),
  party('8', 'LACASA', '2025-08-21T10:59:08'),
  party('9', 'Parsons & DMF ENGINEERING', '2025-09-24T09:08:37'),
  party('10', 'Zutari Engineering International', '2025-07-24T13:54:31'),
]

export const developers: Party[] = [
  party('1', 'Al Wasl', '2025-10-23T12:14:29'),
  party('2', 'Dubai Holdings Real Estate (DHRE)', '2025-07-24T13:54:09'),
  party('3', 'Dubai Lifestyle City', '2025-08-21T10:58:22'),
  party('4', 'Dubai Properties Group', '2025-07-18T10:28:48'),
  party('5', 'Kifaf Development', '2025-10-23T12:08:54'),
  party('6', 'MERAAS', '2025-08-21T11:10:50'),
  party('7', 'SHAMAL ESTATES LLC', '2025-09-24T09:08:03'),
  party('8', 'Shamal-Meraas', '2025-09-10T11:00:45'),
  party('9', 'SOBHA', '2025-06-17T12:08:09'),
]

export const plots: Plot[] = [
  { id: '1', maalemRef: 'MP-00064-134', projectName: 'Al Kifaf Development', devPlot: 'DP-101', dmPlot: '6180001', developer: 'Al Wasl', consultant: 'AECOM', display: true },
  { id: '2', maalemRef: 'MP-00064-134', projectName: 'Al Kifaf Development', devPlot: 'DP-102', dmPlot: '6180002', developer: 'Al Wasl', consultant: 'AECOM', display: true },
  { id: '3', maalemRef: 'MP-00007-279', projectName: 'Dubai Harbour', devPlot: 'DH-17', dmPlot: '3270144', developer: 'Shamal-Meraas', consultant: 'AECOM', display: false },
  { id: '4', maalemRef: 'MP-00021-280', projectName: 'Cherrywood', devPlot: 'CW-02', dmPlot: '4510088', developer: 'SHAMAL ESTATES LLC', consultant: 'Parsons & DMF ENGINEERING', display: true },
  { id: '5', maalemRef: 'MP-00073-234', projectName: 'Port Views', devPlot: 'PV-09', dmPlot: '5520031', developer: 'Al Wasl', consultant: '', display: true },
]

export const fmtDate = (iso: string) => (iso ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) : '')
