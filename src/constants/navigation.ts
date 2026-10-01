import { BarChart3, Building2, Handshake, HardHat, LayoutDashboard, LineChart, MapPinned, Sparkles, Users, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem { id: string; label: string; icon: LucideIcon; path?: string; soon?: boolean }
export interface NavGroup { id: string; label: string; items: NavItem[] }

export const NAV_GROUPS: NavGroup[] = [
  { id: 'workspace', label: 'Workspace', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'projects', label: 'Projects', icon: Building2, path: '/projects' },
    { id: 'plots', label: 'Plots', icon: MapPinned, path: '/plots' },
  ] },
  { id: 'network', label: 'Network', items: [
    { id: 'substations', label: 'Substations', icon: Zap, path: '/substations' },
  ] },
  { id: 'directory', label: 'Directory', items: [
    { id: 'developers', label: 'Developers', icon: HardHat, path: '/developers' },
    { id: 'consultants', label: 'Consultants', icon: Handshake, path: '/consultants' },
  ] },
  { id: 'insights', label: 'Insights', items: [
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
    { id: 'trends', label: 'Trends & forecasts', icon: LineChart, soon: true },
    { id: 'workload', label: 'Workload', icon: Users, soon: true },
    { id: 'ai', label: 'AI assistant', icon: Sparkles, soon: true },
  ] },
]
