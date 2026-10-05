// Generated sample data for the dashboard (fictional numbers, same project names as the Projects list).

/** 24 weeks of history — the dashboard compares the last N weeks with the N before them. */
export const WEEKLY = {
  received: [49, 45, 45, 51, 52, 57, 53, 50, 56, 55, 54, 50, 52, 58, 56, 62, 58, 57, 54, 50, 53, 55, 52, 54],
  completed: [42, 41, 42, 48, 50, 54, 48, 48, 51, 49, 49, 47, 46, 50, 48, 57, 52, 51, 47, 47, 47, 53, 47, 46],
  compliance: [88, 88, 90, 88, 87, 90, 90, 91, 90, 88, 87, 85, 87, 86, 88, 89, 92, 93, 92, 95, 95, 97, 96, 95],
  reviewDays: [5.9, 5.7, 5.5, 5.4, 5.3, 5.4, 5.4, 5.5, 6.0, 6.0, 5.7, 5.7, 5.5, 5.2, 5.0, 5.1, 5.4, 5.1, 5.2, 4.9, 4.7, 4.8, 5.0, 5.0],
}

export const PERIODS = [{ key: '4', label: '4 weeks' }, { key: '12', label: '12 weeks' }] as const

export const pipeline = [
  { label: 'New', value: 16, color: 'info' as const },
  { label: 'Under review', value: 72, color: 'warning' as const },
  { label: 'Verify', value: 20, color: 'secondary' as const },
  { label: 'Completed', value: 54, color: 'success' as const },
]

export const byType = [
  { label: 'Power Supply Master Plans', value: 87, color: 'info' as const },
  { label: 'Power Supply NOCs', value: 50, color: 'warning' as const },
  { label: 'Infrastructure NOCs', value: 22, color: 'primary' as const },
]

export const CAPACITY = 45
export const engineers = [
  {
    "name": "Fatima Al Shamsi",
    "parts": [
      20,
      10,
      6
    ],
    "within": 26,
    "exceeding": 1
  },
  {
    "name": "Omar Al Falasi",
    "parts": [
      19,
      13,
      8
    ],
    "within": 22,
    "exceeding": 5
  },
  {
    "name": "Khalid Al Mansoori",
    "parts": [
      18,
      12,
      13
    ],
    "within": 34,
    "exceeding": 1
  },
  {
    "name": "Yusuf Al Marzooqi",
    "parts": [
      10,
      16,
      14
    ],
    "within": 23,
    "exceeding": 4
  },
  {
    "name": "Sara Al Zarooni",
    "parts": [
      18,
      15,
      4
    ],
    "within": 42,
    "exceeding": 1
  }
]

export const exceeding = [
  {
    "id": "6",
    "project": "Deira Waterfront Square",
    "type": "Infrastructure NOC",
    "engineer": "Sara Al Zarooni",
    "over": 4
  },
  {
    "id": "13",
    "project": "Al Furjan Commercial District",
    "type": "Power Supply Master Plan",
    "engineer": "Omar Al Falasi",
    "over": 2
  },
  {
    "id": "5",
    "project": "Downtown Edge Heights",
    "type": "Power Supply NOC",
    "engineer": "Fatima Al Shamsi",
    "over": 1
  },
  {
    "id": "23",
    "project": "Al Awir Meadows",
    "type": "Infrastructure NOC",
    "engineer": "Yusuf Al Marzooqi",
    "over": 5
  },
  {
    "id": "10",
    "project": "Hatta Logistics Park",
    "type": "Power Supply Master Plan",
    "engineer": "Omar Al Falasi",
    "over": 4
  }
]

export const active = [
  {
    "id": "9",
    "project": "Dubai Marina Heights",
    "type": "Infrastructure NOC",
    "category": "—",
    "engineer": "Yusuf Al Marzooqi",
    "days": 2,
    "ok": true
  },
  {
    "id": "22",
    "project": "Ras Al Khor Meadows",
    "type": "Power Supply NOC",
    "category": "—",
    "engineer": "Yusuf Al Marzooqi",
    "days": 2,
    "ok": true
  },
  {
    "id": "20",
    "project": "Al Khawaneej Gardens",
    "type": "Power Supply Master Plan",
    "category": "11kV Corridors",
    "engineer": "Fatima Al Shamsi",
    "days": 3,
    "ok": true
  },
  {
    "id": "6",
    "project": "Deira Waterfront Square",
    "type": "Power Supply Master Plan",
    "category": "Partial Master Plan",
    "engineer": "Sara Al Zarooni",
    "days": 6,
    "ok": true
  },
  {
    "id": "7",
    "project": "Mirdif Gate",
    "type": "Power Supply NOC",
    "category": "—",
    "engineer": "Fatima Al Shamsi",
    "days": 3,
    "ok": true
  },
  {
    "id": "1",
    "project": "Al Barsha Villas",
    "type": "Infrastructure NOC",
    "category": "—",
    "engineer": "Yusuf Al Marzooqi",
    "days": 3,
    "ok": true
  },
  {
    "id": "5",
    "project": "Downtown Edge Heights",
    "type": "Power Supply Master Plan",
    "category": "Single Plot",
    "engineer": "Fatima Al Shamsi",
    "days": 2,
    "ok": true
  }
]

export const activity = [
  {
    "kind": "ok",
    "text": "Dubai Marina Heights approved",
    "by": "Omar Al Falasi",
    "when": "12 min ago"
  },
  {
    "kind": "new",
    "text": "New submission: Arjan Waterfront",
    "by": "Pearl Coast Developments",
    "when": "38 min ago"
  },
  {
    "kind": "warn",
    "text": "Deira Waterfront Square passed its KPI date",
    "by": "System",
    "when": "1 h ago"
  },
  {
    "kind": "upload",
    "text": "Plot-wise load file uploaded for Mirdif Gate",
    "by": "Omar Al Falasi",
    "when": "2 h ago"
  },
  {
    "kind": "ok",
    "text": "Ras Al Khor Meadows NOC completed",
    "by": "Sara Al Zarooni",
    "when": "3 h ago"
  },
  {
    "kind": "new",
    "text": "New submission: Studio City Community",
    "by": "Pearl Coast Developments",
    "when": "Yesterday"
  }
]

export const hotspots = [
  {
    "zone": "Al Quoz",
    "load": 74
  },
  {
    "zone": "Mirdif",
    "load": 81
  },
  {
    "zone": "Meydan",
    "load": 94
  },
  {
    "zone": "Downtown",
    "load": 90
  }
]

export const examples = ['Which submissions are exceeding KPI?', 'Who has available workload?', 'Compare load growth by zone']
