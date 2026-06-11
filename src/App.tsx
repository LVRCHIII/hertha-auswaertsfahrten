import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SupabaseConfigError } from './components/SupabaseConfigError'
import { Toaster } from './components/Toaster'
import { AuthProvider } from './contexts/AuthContext'
import { TextureOverlay } from './components/TextureOverlay'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { supabaseConfigError } from './lib/supabase'
import { FahrtAnlegenPage } from './pages/FahrtAnlegenPage'
import { FahrtDashboardPage } from './pages/FahrtDashboardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProfilPage } from './pages/ProfilPage'
import { RegisterPage } from './pages/RegisterPage'
import { SpieltagPage } from './pages/SpieltagPage'
import { DesignPreviewPage } from './pages/DesignPreviewPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/spieltag" element={<SpieltagPage />} />
          <Route path="/fahrten/neu" element={<FahrtAnlegenPage />} />
          <Route path="/fahrten/:id" element={<FahrtDashboardPage />} />
          <Route path="/profil" element={<ProfilPage />} />
        </Route>
        {import.meta.env.DEV ? <Route path="/design-preview" element={<DesignPreviewPage />} /> : null}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  if (supabaseConfigError) {
    return <SupabaseConfigError />
  }

  return (
    <ThemeProvider>
      <TextureOverlay />
      <ToastProvider>
        <Toaster />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
