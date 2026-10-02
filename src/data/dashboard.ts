// Sample data for the dashboard (illustrative until the TMS/SAP feeds are connected).

/** 24 weeks of history — the dashboard compares the last N weeks with the N before them. */
export const WEEKLY = {
  received:  [44, 41, 47, 45, 50, 48, 52, 49, 55, 53, 51, 58, 54, 57, 60, 56, 59, 63, 61, 58, 66, 64, 62, 68],
  completed: [38, 37, 40, 41, 43, 42, 46, 44, 48, 47, 46, 50, 49, 51, 53, 50, 54, 55, 54, 53, 58, 57, 56, 60],
  compliance: [88, 89, 88, 90, 89, 91, 90, 91, 92, 91, 90, 92, 93, 92, 91, 93, 92, 94, 93, 92, 93, 94, 92, 93],
  reviewDays: [5.8, 5.7, 5.9, 5.5, 5.4, 5.5, 5.2, 5.3, 5.1, 5.0, 5.1, 4.9, 4.8, 4.9, 4.7, 4.8, 4.6, 4.7, 4.6, 4.5, 4.6, 4.4, 4.5, 4.4],
}

export const PERIODS = [{ key: '4', label: '4 weeks' }, { key: '12', label: '12 weeks' }] as const

export const pipeline = [
  { label: 'New', value: 18, color: 'info' as const },
  { label: 'Under review', value: 86, color: 'warning' as const },
  { label: 'Verify', value: 24, color: 'secondary' as const },
  { label: 'Completed', value: 43, color: 'success' as const },
]

export const byType = [
  { label: 'Power Supply Master Plans', value: 78, color: 'info' as const },
  { label: 'Power Supply NOCs', value: 46, color: 'warning' as const },
  { label: 'Infrastructure NOCs', value: 32, color: 'primary' as const },
]

export const CAPACITY = 45
export const engineers = [
  { name: 'Fatima Ali', parts: [20, 14, 8], within: 38, exceeding: 4 },
  { name: 'Omar Khalid', parts: [13, 12, 11], within: 30, exceeding: 6 },
  { name: 'Ahmed Hassan', parts: [10, 13, 11], within: 27, exceeding: 7 },
  { name: 'Yusuf Rahman', parts: [10, 7, 7], within: 24, exceeding: 0 },
  { name: 'Sara Mohamed', parts: [8, 6, 6], within: 20, exceeding: 0 },
]

export const exceeding = [
  { id: '8', project: 'Al Furjan West – Villa', type: 'Power Supply NOC', engineer: 'Fatima Ali', over: 2 },
  { id: '5', project: 'Meydan One – District 1', type: 'Infrastructure NOC', engineer: 'Sara Mohamed', over: 4 },
  { id: '4', project: 'Palm Jebel Ali – District 3', type: 'Power Supply Master Plan', engineer: 'Omar Khalid', over: 1 },
  { id: '7', project: 'Dubai Creek Harbour', type: 'Power Supply NOC', engineer: 'Ahmed Hassan', over: 2 },
  { id: '6', project: 'The Valley – Cluster 5', type: 'Infrastructure NOC', engineer: 'Fatima Ali', over: 3 },
]

export const active = [
  { id: '1', project: 'Dubai Hills Estate – Phase 2', type: 'Power Supply Master Plan', category: 'Full Master Plan', engineer: 'Ahmed Hassan', days: 4, ok: true },
  { id: '8', project: 'Al Furjan West – Villa', type: 'Power Supply NOC', category: '—', engineer: 'Fatima Ali', days: 7, ok: false },
  { id: '3', project: 'Jumeirah Village Circle', type: 'Power Supply NOC', category: 'Partial Master Plan', engineer: 'Omar Khalid', days: 3, ok: true },
  { id: '5', project: 'Meydan One – District 1', type: 'Infrastructure NOC', category: '—', engineer: 'Sara Mohamed', days: 2, ok: true },
  { id: '2', project: 'Dubai South – Logistics City', type: 'Power Supply Master Plan', category: 'Plot-wise Load Details', engineer: 'Yusuf Rahman', days: 9, ok: false },
  { id: '9', project: 'Dubai Silicon Oasis – Block C', type: 'Infrastructure NOC', category: '—', engineer: 'Fatima Ali', days: 5, ok: true },
]

export const activity = [
  { kind: 'ok', text: 'Dubai Hills Estate – Phase 2 approved', by: 'Ahmed Hassan', when: '12 min ago' },
  { kind: 'new', text: 'New submission: Port Views – Block B', by: 'Al Wasl', when: '38 min ago' },
  { kind: 'warn', text: 'Meydan One – District 1 passed its KPI date', by: 'System', when: '1 h ago' },
  { kind: 'upload', text: 'Plot-wise load file uploaded for Cherrywood', by: 'Omar Khalid', when: '2 h ago' },
  { kind: 'ok', text: 'Jumeirah Village Circle NOC completed', by: 'Omar Khalid', when: '3 h ago' },
  { kind: 'new', text: 'New submission: Dubai Harbour – Marina Walk', by: 'Shamal-Meraas', when: 'Yesterday' },
]

export const hotspots = [
  { zone: 'Downtown', load: 91 },
  { zone: 'Warsan', load: 90 },
  { zone: 'Deira', load: 67 },
  { zone: 'Mirdif', load: 69 },
]

export const examples = ['Which submissions are exceeding KPI?', 'Who has available workload?', 'Compare load growth by zone']
