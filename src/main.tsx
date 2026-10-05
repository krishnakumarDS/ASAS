import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import { initUiScale } from './styles/scale'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PowerProvider from './PowerProvider'

initUiScale()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* HashRouter, not BrowserRouter: the Power Platform player serves the app under a deep,
        dynamic path with no server-side rewrite, so a refresh or deep link on a path-based
        route 404s. Keeping route state after "#" means every request hits the same document. */}
    <HashRouter>
      <ThemeProvider>
        <PowerProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </PowerProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)
