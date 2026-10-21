import { BarChart3, Building2, Handshake, HardHat, LayoutDashboard, LineChart, MapPinned, Network, TestTube, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem { id: string; label: string; icon: LucideIcon; path: string; flowTestOnly?: boolean }
export interface NavGroup { id: string; label: string; items: NavItem[] }

export const NAV_GROUPS: NavGroup[] = [
  { id: 'workspace', label: 'Workspace', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'projects', label: 'Projects', icon: Building2, path: '/projects' },
    { id: 'plots', label: 'Plots', icon: MapPinned, path: '/plots' },
  ] },
  { id: 'network', label: 'Network', items: [
    { id: 'substations', label: 'Substations', icon: Zap, path: '/substations' },
    { id: 'network', label: 'Network & heatmaps', icon: Network, path: '/network' },
  ] },
  { id: 'directory', label: 'Directory', items: [
    { id: 'developers', label: 'Developers', icon: HardHat, path: '/developers' },
    { id: 'consultants', label: 'Consultants', icon: Handshake, path: '/consultants' },
  ] },
  { id: 'insights', label: 'Insights', items: [
    { id: 'reports', label: 'Reports & decks', icon: BarChart3, path: '/reports' },
    { id: 'trends', label: 'Trends & forecast', icon: LineChart, path: '/trends' },
    { id: 'flow-test', label: 'Flow test', icon: TestTube, path: '/flow-test', flowTestOnly: true }, // developer tool: shown only to the user in constants/access.ts
  ] },
]
