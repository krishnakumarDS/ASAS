export interface Substation { id: string; name: string; scada: string; builtBy: 'DEWA' | 'Developer'; showInSO: boolean; createdOn: string; createdBy: string; limit?: string }
export interface Party { id: string; name: string; createdBy: string; createdOn: string; url: string; showInSO: boolean }
export interface Plot { id: string; maalemRef: string; projectName: string; devPlot: string; dmPlot: string; developer: string; consultant: string; display: boolean; createdOn?: string }
export interface StandardLimit { id: string; amount: string; description: string; showInSO: boolean; createdOn: string; createdBy: string }

// Generated sample data (fictional names and numbers).
export const substations: Substation[] = [
  {
    "id": "1",
    "name": "Al Barsha",
    "scada": "ALBARSHA",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2026-03-27T15:30:22",
    "createdBy": "Fatima Al Shamsi",
    "limit": "2 x 20 MVA"
  },
  {
    "id": "2",
    "name": "Jebel Ali North",
    "scada": "JEBELALI",
    "builtBy": "DEWA",
    "showInSO": true,
    "createdOn": "2025-04-14T16:13:03",
    "createdBy": "Hessa Al Ketbi",
    "limit": "3 x 40 MVA"
  },
  {
    "id": "3",
    "name": "Dubai South 2",
    "scada": "DUBAISOU",
    "builtBy": "DEWA",
    "showInSO": false,
    "createdOn": "2025-04-04T13:30:35",
    "createdBy": "Fatima Al Shamsi",
    "limit": "2 x 60 MVA"
  },
  {
    "id": "4",
    "name": "Business Bay",
    "scada": "BUSINESS",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2026-06-06T14:33:20",
    "createdBy": "Rashid Al Nuaimi",
    "limit": "4 x 60 MVA"
  },
  {
    "id": "5",
    "name": "Downtown 1",
    "scada": "DOWNTOWN",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2026-01-09T08:49:44",
    "createdBy": "Yusuf Al Marzooqi",
    "limit": "2 x 20 MVA"
  },
  {
    "id": "6",
    "name": "Deira Marina",
    "scada": "DEIRAMAR",
    "builtBy": "DEWA",
    "showInSO": true,
    "createdOn": "2025-08-28T11:58:45",
    "createdBy": "Mariam Al Hosani",
    "limit": "2 x 20 MVA"
  },
  {
    "id": "7",
    "name": "Mirdif East",
    "scada": "MIRDIFEA",
    "builtBy": "DEWA",
    "showInSO": true,
    "createdOn": "2025-07-23T11:47:12",
    "createdBy": "Rashid Al Nuaimi",
    "limit": "2 x 20 MVA"
  },
  {
    "id": "8",
    "name": "Al Quoz Industrial",
    "scada": "ALQUOZIN",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2026-09-01T08:47:37",
    "createdBy": "Hessa Al Ketbi",
    "limit": "2 x 60 MVA"
  },
  {
    "id": "9",
    "name": "Marina Walk",
    "scada": "MARINAWA",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2025-03-16T08:10:38",
    "createdBy": "Rashid Al Nuaimi",
    "limit": "4 x 60 MVA"
  },
  {
    "id": "10",
    "name": "Hatta Dam",
    "scada": "HATTADAM",
    "builtBy": "DEWA",
    "showInSO": false,
    "createdOn": "2026-03-11T12:09:59",
    "createdBy": "Khalid Al Mansoori",
    "limit": "4 x 60 MVA"
  },
  {
    "id": "11",
    "name": "Meydan Heights",
    "scada": "MEYDANHE",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2025-10-25T11:29:10",
    "createdBy": "Mariam Al Hosani",
    "limit": "3 x 40 MVA"
  },
  {
    "id": "12",
    "name": "Warsan 3",
    "scada": "WARSANXX",
    "builtBy": "Developer",
    "showInSO": false,
    "createdOn": "2025-11-04T12:52:24",
    "createdBy": "Omar Al Falasi",
    "limit": "2 x 60 MVA"
  },
  {
    "id": "13",
    "name": "Al Furjan",
    "scada": "ALFURJAN",
    "builtBy": "DEWA",
    "showInSO": true,
    "createdOn": "2025-08-12T14:36:21",
    "createdBy": "Aisha Al Suwaidi",
    "limit": "2 x 20 MVA"
  },
  {
    "id": "14",
    "name": "JVC Central",
    "scada": "JVCCENTR",
    "builtBy": "DEWA",
    "showInSO": true,
    "createdOn": "2026-03-27T08:13:55",
    "createdBy": "Khalid Al Mansoori",
    "limit": "4 x 60 MVA"
  },
  {
    "id": "15",
    "name": "Dubai Hills",
    "scada": "DUBAIHIL",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2025-08-19T10:28:54",
    "createdBy": "Mariam Al Hosani",
    "limit": "2 x 60 MVA"
  },
  {
    "id": "16",
    "name": "Silicon Oasis",
    "scada": "SILICONO",
    "builtBy": "DEWA",
    "showInSO": false,
    "createdOn": "2026-05-07T16:29:40",
    "createdBy": "Mariam Al Hosani",
    "limit": "3 x 40 MVA"
  },
  {
    "id": "17",
    "name": "Studio City",
    "scada": "STUDIOCI",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2026-09-09T17:57:08",
    "createdBy": "Fatima Al Shamsi",
    "limit": "2 x 60 MVA"
  },
  {
    "id": "18",
    "name": "Sports City",
    "scada": "SPORTSCI",
    "builtBy": "DEWA",
    "showInSO": true,
    "createdOn": "2026-06-21T11:26:09",
    "createdBy": "Sara Al Zarooni",
    "limit": "4 x 60 MVA"
  },
  {
    "id": "19",
    "name": "Arjan",
    "scada": "ARJANXXX",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2025-06-03T17:50:21",
    "createdBy": "Aisha Al Suwaidi",
    "limit": "4 x 60 MVA"
  },
  {
    "id": "20",
    "name": "Khawaneej",
    "scada": "KHAWANEE",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2025-06-23T09:43:05",
    "createdBy": "Aisha Al Suwaidi",
    "limit": "2 x 60 MVA"
  },
  {
    "id": "21",
    "name": "Nad Al Sheba",
    "scada": "NADALSHE",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2025-10-29T10:10:21",
    "createdBy": "Omar Al Falasi",
    "limit": "4 x 60 MVA"
  },
  {
    "id": "22",
    "name": "Ras Al Khor",
    "scada": "RASALKHO",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2025-08-27T16:09:05",
    "createdBy": "Sara Al Zarooni",
    "limit": "3 x 60 MVA"
  },
  {
    "id": "23",
    "name": "Al Awir",
    "scada": "ALAWIRXX",
    "builtBy": "DEWA",
    "showInSO": true,
    "createdOn": "2026-06-29T14:16:19",
    "createdBy": "Khalid Al Mansoori",
    "limit": "3 x 40 MVA"
  },
  {
    "id": "24",
    "name": "Creek Harbour",
    "scada": "CREEKHAR",
    "builtBy": "Developer",
    "showInSO": true,
    "createdOn": "2025-03-20T13:33:33",
    "createdBy": "Sara Al Zarooni",
    "limit": "4 x 60 MVA"
  }
]

export const standardLimits: StandardLimit[] = [
  {
    "id": "1",
    "amount": "2 x 20 MVA",
    "description": "Small commercial and mixed-use plots",
    "showInSO": true,
    "createdOn": "2025-11-10T10:16:39",
    "createdBy": "Yusuf Al Marzooqi"
  },
  {
    "id": "2",
    "amount": "2 x 40 MVA",
    "description": "Standard 11/0.4 kV residential cluster",
    "showInSO": true,
    "createdOn": "2025-12-09T13:30:52",
    "createdBy": "Aisha Al Suwaidi"
  },
  {
    "id": "3",
    "amount": "3 x 40 MVA",
    "description": "Medium density master communities",
    "showInSO": true,
    "createdOn": "2025-09-16T11:09:18",
    "createdBy": "Fatima Al Shamsi"
  },
  {
    "id": "4",
    "amount": "2 x 60 MVA",
    "description": "Large villa developments",
    "showInSO": false,
    "createdOn": "2025-11-01T08:40:59",
    "createdBy": "Yusuf Al Marzooqi"
  },
  {
    "id": "5",
    "amount": "3 x 60 MVA",
    "description": "Large mixed-use districts",
    "showInSO": true,
    "createdOn": "2025-03-30T10:11:00",
    "createdBy": "Fatima Al Shamsi"
  },
  {
    "id": "6",
    "amount": "4 x 60 MVA",
    "description": "Industrial and logistics parks",
    "showInSO": false,
    "createdOn": "2025-09-06T17:20:08",
    "createdBy": "Yusuf Al Marzooqi"
  }
]

export const consultants: Party[] = [
  {
    "id": "1",
    "name": "Almasa Engineering Consultants",
    "createdBy": "Ahmed Al Blooshi",
    "createdOn": "2026-01-06T13:37:59",
    "url": "",
    "showInSO": true
  },
  {
    "id": "2",
    "name": "Crescent Design Partners",
    "createdBy": "Aisha Al Suwaidi",
    "createdOn": "2025-12-31T10:01:01",
    "url": "",
    "showInSO": true
  },
  {
    "id": "3",
    "name": "Horizon MEP Consultants",
    "createdBy": "Sara Al Zarooni",
    "createdOn": "2026-03-05T08:17:11",
    "url": "",
    "showInSO": true
  },
  {
    "id": "4",
    "name": "Tamer & Partners",
    "createdBy": "Mariam Al Hosani",
    "createdOn": "2025-11-11T15:15:56",
    "url": "",
    "showInSO": true
  },
  {
    "id": "5",
    "name": "Nexa Infrastructure",
    "createdBy": "Yusuf Al Marzooqi",
    "createdOn": "2026-01-03T17:41:57",
    "url": "",
    "showInSO": true
  },
  {
    "id": "6",
    "name": "Bridgeway Engineering",
    "createdBy": "Ahmed Al Blooshi",
    "createdOn": "2025-04-13T17:07:58",
    "url": "",
    "showInSO": true
  },
  {
    "id": "7",
    "name": "Sahara Consulting Engineers",
    "createdBy": "Hessa Al Ketbi",
    "createdOn": "2025-07-26T12:18:20",
    "url": "",
    "showInSO": true
  },
  {
    "id": "8",
    "name": "Vertex Power Consultants",
    "createdBy": "Omar Al Falasi",
    "createdOn": "2025-08-01T16:36:51",
    "url": "",
    "showInSO": true
  },
  {
    "id": "9",
    "name": "Orbit Design Studio",
    "createdBy": "Rashid Al Nuaimi",
    "createdOn": "2026-09-05T08:44:28",
    "url": "",
    "showInSO": true
  },
  {
    "id": "10",
    "name": "Lumen Engineering",
    "createdBy": "Aisha Al Suwaidi",
    "createdOn": "2025-07-22T09:48:36",
    "url": "",
    "showInSO": true
  },
  {
    "id": "11",
    "name": "Pinnacle Technical Services",
    "createdBy": "Rashid Al Nuaimi",
    "createdOn": "2026-04-01T13:31:17",
    "url": "",
    "showInSO": true
  },
  {
    "id": "12",
    "name": "Coral Engineering",
    "createdBy": "Omar Al Falasi",
    "createdOn": "2026-08-05T12:47:08",
    "url": "",
    "showInSO": true
  }
]

export const developers: Party[] = [
  {
    "id": "1",
    "name": "Al Noor Properties",
    "createdBy": "Aisha Al Suwaidi",
    "createdOn": "2026-09-10T12:25:09",
    "url": "",
    "showInSO": false
  },
  {
    "id": "2",
    "name": "Gulf Crest Developments",
    "createdBy": "Sara Al Zarooni",
    "createdOn": "2025-03-23T09:07:45",
    "url": "",
    "showInSO": true
  },
  {
    "id": "3",
    "name": "Palm Horizon Holdings",
    "createdBy": "Aisha Al Suwaidi",
    "createdOn": "2026-05-27T14:37:45",
    "url": "",
    "showInSO": true
  },
  {
    "id": "4",
    "name": "Desert Rose Real Estate",
    "createdBy": "Omar Al Falasi",
    "createdOn": "2025-03-10T10:23:25",
    "url": "",
    "showInSO": true
  },
  {
    "id": "5",
    "name": "Skyline Meridian",
    "createdBy": "Hessa Al Ketbi",
    "createdOn": "2025-12-06T12:09:03",
    "url": "",
    "showInSO": true
  },
  {
    "id": "6",
    "name": "Marina Bay Developments",
    "createdBy": "Fatima Al Shamsi",
    "createdOn": "2025-11-23T12:39:45",
    "url": "",
    "showInSO": true
  },
  {
    "id": "7",
    "name": "Falcon Ridge Properties",
    "createdBy": "Rashid Al Nuaimi",
    "createdOn": "2025-10-23T08:48:47",
    "url": "",
    "showInSO": true
  },
  {
    "id": "8",
    "name": "Oasis Prime Estates",
    "createdBy": "Rashid Al Nuaimi",
    "createdOn": "2025-07-17T14:50:36",
    "url": "",
    "showInSO": true
  },
  {
    "id": "9",
    "name": "Pearl Coast Developments",
    "createdBy": "Omar Al Falasi",
    "createdOn": "2025-11-20T09:39:01",
    "url": "",
    "showInSO": true
  },
  {
    "id": "10",
    "name": "Amwaj Urban Group",
    "createdBy": "Hessa Al Ketbi",
    "createdOn": "2025-05-09T08:52:40",
    "url": "",
    "showInSO": true
  },
  {
    "id": "11",
    "name": "Zenith Gate Properties",
    "createdBy": "Khalid Al Mansoori",
    "createdOn": "2025-09-04T17:48:31",
    "url": "",
    "showInSO": true
  },
  {
    "id": "12",
    "name": "Harbour Crest LLC",
    "createdBy": "Khalid Al Mansoori",
    "createdOn": "2025-08-30T08:51:50",
    "url": "",
    "showInSO": true
  }
]

export const plots: Plot[] = [
  {
    "id": "1",
    "maalemRef": "MP-99846-100",
    "projectName": "Al Barsha Villas",
    "devPlot": "AB-22",
    "dmPlot": "3416960",
    "developer": "Marina Bay Developments",
    "consultant": "Bridgeway Engineering",
    "display": true
  },
  {
    "id": "2",
    "maalemRef": "MP-99846-100",
    "projectName": "Al Barsha Villas",
    "devPlot": "AB-23",
    "dmPlot": "4275602",
    "developer": "Marina Bay Developments",
    "consultant": "Bridgeway Engineering",
    "display": false
  },
  {
    "id": "3",
    "maalemRef": "MP-99846-100",
    "projectName": "Al Barsha Villas",
    "devPlot": "AB-24",
    "dmPlot": "2749787",
    "developer": "Marina Bay Developments",
    "consultant": "Bridgeway Engineering",
    "display": false
  },
  {
    "id": "4",
    "maalemRef": "MP-60271-004",
    "projectName": "Dubai South Logistics Park",
    "devPlot": "DS-30",
    "dmPlot": "2644342",
    "developer": "Pearl Coast Developments",
    "consultant": "Bridgeway Engineering",
    "display": true
  },
  {
    "id": "5",
    "maalemRef": "MP-60271-004",
    "projectName": "Dubai South Logistics Park",
    "devPlot": "DS-31",
    "dmPlot": "5956721",
    "developer": "Pearl Coast Developments",
    "consultant": "Bridgeway Engineering",
    "display": false
  },
  {
    "id": "6",
    "maalemRef": "MP-60271-004",
    "projectName": "Dubai South Logistics Park",
    "devPlot": "DS-32",
    "dmPlot": "5366559",
    "developer": "Pearl Coast Developments",
    "consultant": "Bridgeway Engineering",
    "display": false
  },
  {
    "id": "7",
    "maalemRef": "MP-60271-004",
    "projectName": "Dubai South Logistics Park",
    "devPlot": "DS-33",
    "dmPlot": "4531617",
    "developer": "Pearl Coast Developments",
    "consultant": "Bridgeway Engineering",
    "display": true
  },
  {
    "id": "8",
    "maalemRef": "MP-99326-006",
    "projectName": "Jebel Ali Towers",
    "devPlot": "JA-22",
    "dmPlot": "6099563",
    "developer": "Oasis Prime Estates",
    "consultant": "Coral Engineering",
    "display": true
  },
  {
    "id": "9",
    "maalemRef": "MP-99326-006",
    "projectName": "Jebel Ali Towers",
    "devPlot": "JA-23",
    "dmPlot": "5637427",
    "developer": "Oasis Prime Estates",
    "consultant": "Coral Engineering",
    "display": false
  },
  {
    "id": "10",
    "maalemRef": "MP-99326-006",
    "projectName": "Jebel Ali Towers",
    "devPlot": "JA-24",
    "dmPlot": "2792304",
    "developer": "Oasis Prime Estates",
    "consultant": "Coral Engineering",
    "display": true
  },
  {
    "id": "11",
    "maalemRef": "MP-61875-125",
    "projectName": "Business Bay Gardens",
    "devPlot": "BB-16",
    "dmPlot": "1453923",
    "developer": "Zenith Gate Properties",
    "consultant": "Orbit Design Studio",
    "display": true
  },
  {
    "id": "12",
    "maalemRef": "MP-61875-125",
    "projectName": "Business Bay Gardens",
    "devPlot": "BB-17",
    "dmPlot": "5059659",
    "developer": "Zenith Gate Properties",
    "consultant": "Orbit Design Studio",
    "display": true
  },
  {
    "id": "13",
    "maalemRef": "MP-79292-237",
    "projectName": "Downtown Edge Heights",
    "devPlot": "DE-20",
    "dmPlot": "4026122",
    "developer": "Falcon Ridge Properties",
    "consultant": "Nexa Infrastructure",
    "display": true
  },
  {
    "id": "14",
    "maalemRef": "MP-79292-237",
    "projectName": "Downtown Edge Heights",
    "devPlot": "DE-21",
    "dmPlot": "2239019",
    "developer": "Falcon Ridge Properties",
    "consultant": "Nexa Infrastructure",
    "display": true
  },
  {
    "id": "15",
    "maalemRef": "MP-08608-121",
    "projectName": "Deira Waterfront Square",
    "devPlot": "DW-09",
    "dmPlot": "5578108",
    "developer": "Amwaj Urban Group",
    "consultant": "Coral Engineering",
    "display": true
  },
  {
    "id": "16",
    "maalemRef": "MP-08608-121",
    "projectName": "Deira Waterfront Square",
    "devPlot": "DW-10",
    "dmPlot": "2443924",
    "developer": "Amwaj Urban Group",
    "consultant": "Coral Engineering",
    "display": false
  },
  {
    "id": "17",
    "maalemRef": "MP-08608-121",
    "projectName": "Deira Waterfront Square",
    "devPlot": "DW-11",
    "dmPlot": "2911448",
    "developer": "Amwaj Urban Group",
    "consultant": "Coral Engineering",
    "display": false
  },
  {
    "id": "18",
    "maalemRef": "MP-08608-121",
    "projectName": "Deira Waterfront Square",
    "devPlot": "DW-12",
    "dmPlot": "1010843",
    "developer": "Amwaj Urban Group",
    "consultant": "Coral Engineering",
    "display": true
  },
  {
    "id": "19",
    "maalemRef": "MP-87731-255",
    "projectName": "Mirdif Gate",
    "devPlot": "MG-33",
    "dmPlot": "5305420",
    "developer": "Al Noor Properties",
    "consultant": "Pinnacle Technical Services",
    "display": true
  },
  {
    "id": "20",
    "maalemRef": "MP-87731-255",
    "projectName": "Mirdif Gate",
    "devPlot": "MG-34",
    "dmPlot": "6156986",
    "developer": "Al Noor Properties",
    "consultant": "Pinnacle Technical Services",
    "display": true
  },
  {
    "id": "21",
    "maalemRef": "MP-87731-255",
    "projectName": "Mirdif Gate",
    "devPlot": "MG-35",
    "dmPlot": "1404625",
    "developer": "Al Noor Properties",
    "consultant": "Pinnacle Technical Services",
    "display": true
  },
  {
    "id": "22",
    "maalemRef": "MP-87731-255",
    "projectName": "Mirdif Gate",
    "devPlot": "MG-36",
    "dmPlot": "1946212",
    "developer": "Al Noor Properties",
    "consultant": "Pinnacle Technical Services",
    "display": true
  },
  {
    "id": "23",
    "maalemRef": "MP-87731-255",
    "projectName": "Mirdif Gate",
    "devPlot": "MG-37",
    "dmPlot": "5046631",
    "developer": "Al Noor Properties",
    "consultant": "Pinnacle Technical Services",
    "display": true
  },
  {
    "id": "24",
    "maalemRef": "MP-16370-292",
    "projectName": "Al Quoz Park",
    "devPlot": "AQ-07",
    "dmPlot": "1482075",
    "developer": "Oasis Prime Estates",
    "consultant": "Tamer & Partners",
    "display": true
  },
  {
    "id": "25",
    "maalemRef": "MP-16370-292",
    "projectName": "Al Quoz Park",
    "devPlot": "AQ-08",
    "dmPlot": "6484867",
    "developer": "Oasis Prime Estates",
    "consultant": "Tamer & Partners",
    "display": true
  },
  {
    "id": "26",
    "maalemRef": "MP-16370-292",
    "projectName": "Al Quoz Park",
    "devPlot": "AQ-09",
    "dmPlot": "2164879",
    "developer": "Oasis Prime Estates",
    "consultant": "Tamer & Partners",
    "display": false
  },
  {
    "id": "27",
    "maalemRef": "MP-16370-292",
    "projectName": "Al Quoz Park",
    "devPlot": "AQ-10",
    "dmPlot": "3354863",
    "developer": "Oasis Prime Estates",
    "consultant": "Tamer & Partners",
    "display": true
  },
  {
    "id": "28",
    "maalemRef": "MP-65131-284",
    "projectName": "Dubai Marina Heights",
    "devPlot": "DM-33",
    "dmPlot": "3502135",
    "developer": "Harbour Crest LLC",
    "consultant": "Coral Engineering",
    "display": false
  },
  {
    "id": "29",
    "maalemRef": "MP-65131-284",
    "projectName": "Dubai Marina Heights",
    "devPlot": "DM-34",
    "dmPlot": "2270689",
    "developer": "Harbour Crest LLC",
    "consultant": "Coral Engineering",
    "display": true
  },
  {
    "id": "30",
    "maalemRef": "MP-65131-284",
    "projectName": "Dubai Marina Heights",
    "devPlot": "DM-35",
    "dmPlot": "3523526",
    "developer": "Harbour Crest LLC",
    "consultant": "Coral Engineering",
    "display": false
  },
  {
    "id": "31",
    "maalemRef": "MP-65131-284",
    "projectName": "Dubai Marina Heights",
    "devPlot": "DM-36",
    "dmPlot": "3576573",
    "developer": "Harbour Crest LLC",
    "consultant": "Coral Engineering",
    "display": true
  },
  {
    "id": "32",
    "maalemRef": "MP-50199-020",
    "projectName": "Hatta Logistics Park",
    "devPlot": "HL-30",
    "dmPlot": "4425047",
    "developer": "Zenith Gate Properties",
    "consultant": "Vertex Power Consultants",
    "display": true
  },
  {
    "id": "33",
    "maalemRef": "MP-50199-020",
    "projectName": "Hatta Logistics Park",
    "devPlot": "HL-31",
    "dmPlot": "1359952",
    "developer": "Zenith Gate Properties",
    "consultant": "Vertex Power Consultants",
    "display": true
  },
  {
    "id": "34",
    "maalemRef": "MP-50199-020",
    "projectName": "Hatta Logistics Park",
    "devPlot": "HL-32",
    "dmPlot": "6367003",
    "developer": "Zenith Gate Properties",
    "consultant": "Vertex Power Consultants",
    "display": false
  },
  {
    "id": "35",
    "maalemRef": "MP-50199-020",
    "projectName": "Hatta Logistics Park",
    "devPlot": "HL-33",
    "dmPlot": "6708635",
    "developer": "Zenith Gate Properties",
    "consultant": "Vertex Power Consultants",
    "display": false
  },
  {
    "id": "36",
    "maalemRef": "MP-50199-020",
    "projectName": "Hatta Logistics Park",
    "devPlot": "HL-34",
    "dmPlot": "2598347",
    "developer": "Zenith Gate Properties",
    "consultant": "Vertex Power Consultants",
    "display": true
  },
  {
    "id": "37",
    "maalemRef": "MP-27869-135",
    "projectName": "Meydan Residences",
    "devPlot": "MR-02",
    "dmPlot": "3066874",
    "developer": "Pearl Coast Developments",
    "consultant": "",
    "display": true
  },
  {
    "id": "38",
    "maalemRef": "MP-27869-135",
    "projectName": "Meydan Residences",
    "devPlot": "MR-03",
    "dmPlot": "5250115",
    "developer": "Pearl Coast Developments",
    "consultant": "Pinnacle Technical Services",
    "display": true
  },
  {
    "id": "39",
    "maalemRef": "MP-14663-271",
    "projectName": "Warsan Waterfront",
    "devPlot": "WW-20",
    "dmPlot": "6881550",
    "developer": "Amwaj Urban Group",
    "consultant": "Bridgeway Engineering",
    "display": true
  },
  {
    "id": "40",
    "maalemRef": "MP-14663-271",
    "projectName": "Warsan Waterfront",
    "devPlot": "WW-21",
    "dmPlot": "2733908",
    "developer": "Amwaj Urban Group",
    "consultant": "Bridgeway Engineering",
    "display": false
  },
  {
    "id": "41",
    "maalemRef": "MP-14663-271",
    "projectName": "Warsan Waterfront",
    "devPlot": "WW-22",
    "dmPlot": "2350161",
    "developer": "Amwaj Urban Group",
    "consultant": "",
    "display": false
  },
  {
    "id": "42",
    "maalemRef": "MP-14663-271",
    "projectName": "Warsan Waterfront",
    "devPlot": "WW-23",
    "dmPlot": "4720719",
    "developer": "Amwaj Urban Group",
    "consultant": "Bridgeway Engineering",
    "display": false
  },
  {
    "id": "43",
    "maalemRef": "MP-14663-271",
    "projectName": "Warsan Waterfront",
    "devPlot": "WW-24",
    "dmPlot": "2868641",
    "developer": "Amwaj Urban Group",
    "consultant": "Bridgeway Engineering",
    "display": true
  },
  {
    "id": "44",
    "maalemRef": "MP-67493-254",
    "projectName": "Al Furjan Commercial District",
    "devPlot": "AF-38",
    "dmPlot": "4614655",
    "developer": "Oasis Prime Estates",
    "consultant": "Lumen Engineering",
    "display": true
  },
  {
    "id": "45",
    "maalemRef": "MP-67493-254",
    "projectName": "Al Furjan Commercial District",
    "devPlot": "AF-39",
    "dmPlot": "3502913",
    "developer": "Oasis Prime Estates",
    "consultant": "Lumen Engineering",
    "display": true
  },
  {
    "id": "46",
    "maalemRef": "MP-42123-222",
    "projectName": "Jumeirah Village Gardens",
    "devPlot": "JV-13",
    "dmPlot": "2952733",
    "developer": "Skyline Meridian",
    "consultant": "Nexa Infrastructure",
    "display": true
  },
  {
    "id": "47",
    "maalemRef": "MP-42123-222",
    "projectName": "Jumeirah Village Gardens",
    "devPlot": "JV-14",
    "dmPlot": "4386588",
    "developer": "Skyline Meridian",
    "consultant": "",
    "display": true
  },
  {
    "id": "48",
    "maalemRef": "MP-42123-222",
    "projectName": "Jumeirah Village Gardens",
    "devPlot": "JV-15",
    "dmPlot": "5726240",
    "developer": "Skyline Meridian",
    "consultant": "Nexa Infrastructure",
    "display": true
  },
  {
    "id": "49",
    "maalemRef": "MP-42123-222",
    "projectName": "Jumeirah Village Gardens",
    "devPlot": "JV-16",
    "dmPlot": "4780585",
    "developer": "Skyline Meridian",
    "consultant": "",
    "display": false
  },
  {
    "id": "50",
    "maalemRef": "MP-42123-222",
    "projectName": "Jumeirah Village Gardens",
    "devPlot": "JV-17",
    "dmPlot": "3600594",
    "developer": "Skyline Meridian",
    "consultant": "",
    "display": true
  },
  {
    "id": "51",
    "maalemRef": "MP-99003-126",
    "projectName": "Dubai Hills Business Hub",
    "devPlot": "DH-35",
    "dmPlot": "2953606",
    "developer": "Skyline Meridian",
    "consultant": "",
    "display": false
  },
  {
    "id": "52",
    "maalemRef": "MP-99003-126",
    "projectName": "Dubai Hills Business Hub",
    "devPlot": "DH-36",
    "dmPlot": "3655605",
    "developer": "Skyline Meridian",
    "consultant": "Tamer & Partners",
    "display": true
  },
  {
    "id": "53",
    "maalemRef": "MP-68576-097",
    "projectName": "Silicon Oasis Residences",
    "devPlot": "SO-18",
    "dmPlot": "3010219",
    "developer": "Skyline Meridian",
    "consultant": "",
    "display": true
  },
  {
    "id": "54",
    "maalemRef": "MP-68576-097",
    "projectName": "Silicon Oasis Residences",
    "devPlot": "SO-19",
    "dmPlot": "1631409",
    "developer": "Skyline Meridian",
    "consultant": "Sahara Consulting Engineers",
    "display": true
  },
  {
    "id": "55",
    "maalemRef": "MP-68576-097",
    "projectName": "Silicon Oasis Residences",
    "devPlot": "SO-20",
    "dmPlot": "2375218",
    "developer": "Skyline Meridian",
    "consultant": "",
    "display": false
  },
  {
    "id": "56",
    "maalemRef": "MP-68576-097",
    "projectName": "Silicon Oasis Residences",
    "devPlot": "SO-21",
    "dmPlot": "4055135",
    "developer": "Skyline Meridian",
    "consultant": "Sahara Consulting Engineers",
    "display": true
  },
  {
    "id": "57",
    "maalemRef": "MP-62867-294",
    "projectName": "Studio City Community",
    "devPlot": "SC-28",
    "dmPlot": "1773030",
    "developer": "Falcon Ridge Properties",
    "consultant": "Crescent Design Partners",
    "display": true
  },
  {
    "id": "58",
    "maalemRef": "MP-62867-294",
    "projectName": "Studio City Community",
    "devPlot": "SC-29",
    "dmPlot": "1618368",
    "developer": "Falcon Ridge Properties",
    "consultant": "Crescent Design Partners",
    "display": true
  },
  {
    "id": "59",
    "maalemRef": "MP-62867-294",
    "projectName": "Studio City Community",
    "devPlot": "SC-30",
    "dmPlot": "6286146",
    "developer": "Falcon Ridge Properties",
    "consultant": "Crescent Design Partners",
    "display": true
  },
  {
    "id": "60",
    "maalemRef": "MP-62867-294",
    "projectName": "Studio City Community",
    "devPlot": "SC-31",
    "dmPlot": "2247334",
    "developer": "Falcon Ridge Properties",
    "consultant": "Crescent Design Partners",
    "display": true
  },
  {
    "id": "61",
    "maalemRef": "MP-62867-294",
    "projectName": "Studio City Community",
    "devPlot": "SC-32",
    "dmPlot": "5887629",
    "developer": "Falcon Ridge Properties",
    "consultant": "",
    "display": true
  },
  {
    "id": "62",
    "maalemRef": "MP-98963-295",
    "projectName": "Sports City Villas",
    "devPlot": "SC-11",
    "dmPlot": "5408703",
    "developer": "Pearl Coast Developments",
    "consultant": "",
    "display": false
  },
  {
    "id": "63",
    "maalemRef": "MP-98963-295",
    "projectName": "Sports City Villas",
    "devPlot": "SC-12",
    "dmPlot": "1874409",
    "developer": "Pearl Coast Developments",
    "consultant": "Sahara Consulting Engineers",
    "display": true
  },
  {
    "id": "64",
    "maalemRef": "MP-98963-295",
    "projectName": "Sports City Villas",
    "devPlot": "SC-13",
    "dmPlot": "2873103",
    "developer": "Pearl Coast Developments",
    "consultant": "Sahara Consulting Engineers",
    "display": false
  },
  {
    "id": "65",
    "maalemRef": "MP-51671-286",
    "projectName": "Arjan Waterfront",
    "devPlot": "AW-10",
    "dmPlot": "6246857",
    "developer": "Zenith Gate Properties",
    "consultant": "",
    "display": false
  },
  {
    "id": "66",
    "maalemRef": "MP-51671-286",
    "projectName": "Arjan Waterfront",
    "devPlot": "AW-11",
    "dmPlot": "2793539",
    "developer": "Zenith Gate Properties",
    "consultant": "Horizon MEP Consultants",
    "display": false
  },
  {
    "id": "67",
    "maalemRef": "MP-71353-133",
    "projectName": "Al Khawaneej Gardens",
    "devPlot": "AK-11",
    "dmPlot": "6278472",
    "developer": "Palm Horizon Holdings",
    "consultant": "Orbit Design Studio",
    "display": false
  },
  {
    "id": "68",
    "maalemRef": "MP-71353-133",
    "projectName": "Al Khawaneej Gardens",
    "devPlot": "AK-12",
    "dmPlot": "6157059",
    "developer": "Palm Horizon Holdings",
    "consultant": "Orbit Design Studio",
    "display": false
  },
  {
    "id": "69",
    "maalemRef": "MP-71353-133",
    "projectName": "Al Khawaneej Gardens",
    "devPlot": "AK-13",
    "dmPlot": "5073931",
    "developer": "Palm Horizon Holdings",
    "consultant": "Orbit Design Studio",
    "display": false
  },
  {
    "id": "70",
    "maalemRef": "MP-71353-133",
    "projectName": "Al Khawaneej Gardens",
    "devPlot": "AK-14",
    "dmPlot": "1611138",
    "developer": "Palm Horizon Holdings",
    "consultant": "Orbit Design Studio",
    "display": true
  },
  {
    "id": "71",
    "maalemRef": "MP-71353-133",
    "projectName": "Al Khawaneej Gardens",
    "devPlot": "AK-15",
    "dmPlot": "1043683",
    "developer": "Palm Horizon Holdings",
    "consultant": "Orbit Design Studio",
    "display": true
  },
  {
    "id": "72",
    "maalemRef": "MP-08878-245",
    "projectName": "Nad Al Sheba Gardens",
    "devPlot": "NA-15",
    "dmPlot": "2794183",
    "developer": "Falcon Ridge Properties",
    "consultant": "Nexa Infrastructure",
    "display": false
  },
  {
    "id": "73",
    "maalemRef": "MP-08878-245",
    "projectName": "Nad Al Sheba Gardens",
    "devPlot": "NA-16",
    "dmPlot": "1741638",
    "developer": "Falcon Ridge Properties",
    "consultant": "Nexa Infrastructure",
    "display": true
  },
  {
    "id": "74",
    "maalemRef": "MP-08878-245",
    "projectName": "Nad Al Sheba Gardens",
    "devPlot": "NA-17",
    "dmPlot": "6111229",
    "developer": "Falcon Ridge Properties",
    "consultant": "Nexa Infrastructure",
    "display": true
  },
  {
    "id": "75",
    "maalemRef": "MP-08878-245",
    "projectName": "Nad Al Sheba Gardens",
    "devPlot": "NA-18",
    "dmPlot": "1120685",
    "developer": "Falcon Ridge Properties",
    "consultant": "Nexa Infrastructure",
    "display": true
  },
  {
    "id": "76",
    "maalemRef": "MP-08878-245",
    "projectName": "Nad Al Sheba Gardens",
    "devPlot": "NA-19",
    "dmPlot": "4385223",
    "developer": "Falcon Ridge Properties",
    "consultant": "Nexa Infrastructure",
    "display": true
  },
  {
    "id": "77",
    "maalemRef": "MP-38365-004",
    "projectName": "Ras Al Khor Meadows",
    "devPlot": "RA-04",
    "dmPlot": "4351001",
    "developer": "Zenith Gate Properties",
    "consultant": "Lumen Engineering",
    "display": false
  },
  {
    "id": "78",
    "maalemRef": "MP-38365-004",
    "projectName": "Ras Al Khor Meadows",
    "devPlot": "RA-05",
    "dmPlot": "1613538",
    "developer": "Zenith Gate Properties",
    "consultant": "",
    "display": false
  },
  {
    "id": "79",
    "maalemRef": "MP-38365-004",
    "projectName": "Ras Al Khor Meadows",
    "devPlot": "RA-06",
    "dmPlot": "2552917",
    "developer": "Zenith Gate Properties",
    "consultant": "Lumen Engineering",
    "display": false
  },
  {
    "id": "80",
    "maalemRef": "MP-79747-032",
    "projectName": "Al Awir Meadows",
    "devPlot": "AA-15",
    "dmPlot": "1867159",
    "developer": "Falcon Ridge Properties",
    "consultant": "",
    "display": false
  },
  {
    "id": "81",
    "maalemRef": "MP-79747-032",
    "projectName": "Al Awir Meadows",
    "devPlot": "AA-16",
    "dmPlot": "2778363",
    "developer": "Falcon Ridge Properties",
    "consultant": "Sahara Consulting Engineers",
    "display": true
  },
  {
    "id": "82",
    "maalemRef": "MP-79747-032",
    "projectName": "Al Awir Meadows",
    "devPlot": "AA-17",
    "dmPlot": "2928619",
    "developer": "Falcon Ridge Properties",
    "consultant": "Sahara Consulting Engineers",
    "display": true
  },
  {
    "id": "83",
    "maalemRef": "MP-81352-045",
    "projectName": "Dubai Creek Logistics Park",
    "devPlot": "DC-24",
    "dmPlot": "1817374",
    "developer": "Oasis Prime Estates",
    "consultant": "Pinnacle Technical Services",
    "display": true
  },
  {
    "id": "84",
    "maalemRef": "MP-81352-045",
    "projectName": "Dubai Creek Logistics Park",
    "devPlot": "DC-25",
    "dmPlot": "5420655",
    "developer": "Oasis Prime Estates",
    "consultant": "Pinnacle Technical Services",
    "display": false
  }
]

export const fmtDate = (iso: string) => (iso ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) : '')
