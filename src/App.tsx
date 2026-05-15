import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SupabaseConfigError } from './components/SupabaseConfigError'
import { AuthProvider } from './contexts/AuthContext'
import { supabaseConfigError } from './lib/supabase'
import { FahrtAnlegenPage } from './pages/FahrtAnlegenPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/fahrten/neu" element={<FahrtAnlegenPage />} />
        </Route>
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
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
