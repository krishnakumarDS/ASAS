import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import AppLayout from './components/layout/AppLayout'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PartiesListPage from './pages/PartiesListPage'
import PartyDetailPage from './pages/PartyDetailPage'
import PlotFormPage from './pages/PlotFormPage'
import PlotsPage from './pages/PlotsPage'
import PlotWizardPage from './pages/PlotWizardPage'
import ProjectFilesPage from './pages/ProjectFilesPage'
import ProjectFormPage from './pages/ProjectFormPage'
import ProjectsPage from './pages/ProjectsPage'
import { ReportFormPage, ReportsPage } from './pages/ReportsPage'
import StandardLimitsPage from './pages/StandardLimitsPage'
import SubstationFormPage from './pages/SubstationFormPage'
import SubstationsPage from './pages/SubstationsPage'
import EmptyState from './components/common/EmptyState'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const loc = useLocation()
  return user ? <>{children}</> : <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectFormPage />} />
          <Route path="projects/:id/files/:tab" element={<ProjectFilesPage />} />
          <Route path="substations" element={<SubstationsPage />} />
          <Route path="substations/limits" element={<StandardLimitsPage />} />
          <Route path="substations/:id" element={<SubstationFormPage />} />
          <Route path="plots" element={<PlotsPage />} />
          <Route path="plots/new" element={<PlotWizardPage />} />
          <Route path="plots/new/single" element={<PlotFormPage />} />
          <Route path="plots/:id" element={<PlotFormPage />} />
          <Route path="consultants" element={<PartiesListPage kind="consultant" />} />
          <Route path="consultants/:id" element={<PartyDetailPage kind="consultant" />} />
          <Route path="developers" element={<PartiesListPage kind="developer" />} />
          <Route path="developers/:id" element={<PartyDetailPage kind="developer" />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:key" element={<ReportFormPage />} />
          <Route path="*" element={<EmptyState title="Page not found" description="The page you’re looking for doesn’t exist." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
