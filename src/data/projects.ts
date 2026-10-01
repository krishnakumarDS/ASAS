export interface Project {
  id: string
  maalemRef: string
  name: string
  developer: string
  createdBy: string
  createdOn: string
  display: boolean
}

export const projects: Project[] = [
  { id: '1', maalemRef: 'MP-00064-134', name: 'Al Kifaf Development', developer: 'Al Wasl', createdBy: 'Mariam Mohamed', createdOn: '2025-10-23T12:16:33', display: false },
  { id: '2', maalemRef: 'MP-00005-164', name: 'Bluewaters', developer: 'Dubai Holdings Real Estate', createdBy: 'Mariam Mohamed', createdOn: '2025-07-24T13:56:52', display: false },
  { id: '3', maalemRef: 'MP-00021-280', name: 'Cherrywood', developer: 'SHAMAL ESTATES LLC', createdBy: 'Mariam Mohamed', createdOn: '2025-09-24T09:12:12', display: false },
  { id: '4', maalemRef: 'MP-00007-279', name: 'Dubai Harbour', developer: 'Shamal-Meraas', createdBy: 'Mariam Mohamed', createdOn: '2025-09-10T11:16:07', display: false },
  { id: '5', maalemRef: 'MP-00000-095', name: 'Dubai Lifestyle City', developer: 'Dubai Lifestyle City', createdBy: 'Mariam Mohamed', createdOn: '2025-08-21T11:02:06', display: false },
  { id: '6', maalemRef: 'MP-00002-091', name: 'Khawaneej Labour City', developer: 'MERAAS', createdBy: 'Mariam Mohamed', createdOn: '2025-08-21T11:14:40', display: false },
  { id: '7', maalemRef: 'MP-00000-114', name: 'Palma Rosa', developer: 'Dubai Properties Group', createdBy: 'Mariam Mohamed', createdOn: '2025-07-18T10:50:54', display: false },
  { id: '8', maalemRef: 'MP-00073-234', name: 'Port Views', developer: 'Al Wasl', createdBy: 'Mariam Mohamed', createdOn: '2025-11-13T12:20:16', display: false },
  { id: '9', maalemRef: 'MP-00058-011', name: 'Remraam Project (Al Remal)', developer: 'Dubai Properties Group', createdBy: 'Mariam Mohamed', createdOn: '2025-10-23T11:54:15', display: true },
  { id: '10', maalemRef: 'MP-22222-000', name: 'Sample Project', developer: 'Dubai Properties Group', createdBy: 'Majid Al Hammadi', createdOn: '2026-06-11T11:50:54', display: false },
]

export const consultantByProject: Record<string, string> = {
  '1': 'AECOM', '2': 'Zutari Engineering International', '3': 'Parsons & DMF ENGINEERING', '4': 'AECOM', '5': 'LACASA',
  '6': 'Khatib & Alami', '7': 'CDM Smith', '8': 'Arch-Group', '9': 'Kifaf Development', '10': 'KEO-VARIOUS',
}
