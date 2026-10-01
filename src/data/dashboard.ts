import type { ChartColor } from '../components/charts'

type Slice = { label: string; value: number; color: ChartColor }
export const kpis = [
  { key: 'new', label: 'New projects (today)', value: '18', delta: '12%', up: true, hint: 'vs yesterday', tone: 'info', icon: 'file' },
  { key: 'review', label: 'Under review', value: '86', delta: '8%', up: true, hint: 'vs yesterday', tone: 'warning', icon: 'clock' },
  { key: 'done', label: 'Completed', value: '43', delta: '15%', up: true, hint: 'vs yesterday', tone: 'success', icon: 'check' },
  { key: 'exceed', label: 'Exceeding KPI', value: '12', delta: '20%', up: false, hint: 'vs yesterday', tone: 'error', icon: 'alert' },
  { key: 'active', label: 'Total active projects', value: '256', delta: '', up: true, hint: 'Across all submissions', tone: 'secondary', icon: 'building', to: '/projects' },
  { key: 'time', label: 'Avg. review time', value: '4.6', unit: 'days', delta: '0.4 d', up: false, hint: 'vs last 7 days', tone: 'info', icon: 'timer' },
] as const

export const byType: Slice[] = [
  { label: 'Power Supply Master Plans', value: 78, color: 'info' },
  { label: 'Power Supply NOCs', value: 46, color: 'warning' },
  { label: 'Infrastructure NOCs', value: 32, color: 'primary' },
]
export const kpiCompliance: Slice[] = [
  { label: 'Within KPI', value: 144, color: 'primary' },
  { label: 'Exceeding KPI', value: 12, color: 'error' },
]
export const byStatus: Slice[] = [
  { label: 'New', value: 18, color: 'info' },
  { label: 'Under review', value: 86, color: 'warning' },
  { label: 'Completed', value: 43, color: 'primary' },
]
export const engineers = [
  { name: 'Fatima Ali', parts: [20, 14, 8], within: 38, exceeding: 4 },
  { name: 'Omar Khalid', parts: [13, 12, 11], within: 30, exceeding: 6 },
  { name: 'Ahmed Hassan', parts: [10, 13, 11], within: 27, exceeding: 7 },
  { name: 'Yusuf Rahman', parts: [10, 7, 7], within: 24, exceeding: 0 },
  { name: 'Sara Mohamed', parts: [8, 6, 6], within: 20, exceeding: 0 },
]
export const pmpCategories = [
  { label: 'Full Master Plan', value: 24 }, { label: 'Partial Master Plan', value: 20 }, { label: 'Plot-wise Load Details', value: 16 },
  { label: 'Single Plot', value: 8 }, { label: '11kV Corridors', value: 5 }, { label: '132kV Sub-Corridors', value: 3 },
]
export const insights = [
  { tone: 'green', text: 'Partial Master Plans increased by 18% compared to last month.' },
  { tone: 'red', text: '5 submissions are exceeding KPI, mostly in Verify stage.' },
  { tone: 'blue', text: 'Fatima Ali has the highest workload (27%).' },
  { tone: 'green', text: 'Infrastructure NOCs are increasing this week.' },
]
export const examples = ['Show projects affecting Substation X', 'Which submissions are exceeding KPI?', 'Who has available workload?', 'Compare load increase trends']

export const active = [
  { id: '1', project: 'Dubai Hills Estate – Phase 2', type: 'Power Supply Master Plan', category: 'Full Master Plan', engineer: 'Ahmed Hassan', days: 4, ok: true },
  { id: '8', project: 'Al Furjan West – Villa', type: 'Power Supply NOC', category: '—', engineer: 'Fatima Ali', days: 7, ok: false },
  { id: '3', project: 'Jumeirah Village Circle', type: 'Power Supply NOC', category: 'Partial Master Plan', engineer: 'Omar Khalid', days: 3, ok: true },
  { id: '5', project: 'Meydan One – District 1', type: 'Infrastructure NOC', category: '—', engineer: 'Sara Mohamed', days: 2, ok: true },
  { id: '2', project: 'Dubai South – Logistics City', type: 'Power Supply Master Plan', category: 'Plot-wise Load Details', engineer: 'Yusuf Rahman', days: 9, ok: false },
]
export const exceeding = [
  { id: '8', project: 'Al Furjan West – Villa', type: 'Power Supply NOC', engineer: 'Fatima Ali', over: 2 },
  { id: '5', project: 'Meydan One – District 1', type: 'Infrastructure NOC', engineer: 'Sara Mohamed', over: 4 },
  { id: '4', project: 'Palm Jebel Ali – District 3', type: 'Power Supply Master Plan', engineer: 'Omar Khalid', over: 1 },
  { id: '7', project: 'Dubai Creek Harbour', type: 'Power Supply NOC', engineer: 'Ahmed Hassan', over: 2 },
  { id: '6', project: 'The Valley – Cluster 5', type: 'Infrastructure NOC', engineer: 'Fatima Ali', over: 3 },
]
