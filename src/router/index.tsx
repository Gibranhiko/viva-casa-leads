import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { FormPage } from '@/pages/FormPage'
import { ConfirmationPage } from '@/pages/ConfirmationPage'
import { LoginPage } from '@/pages/admin/LoginPage'
import { LeadsPage } from '@/pages/admin/LeadsPage'
import { LeadDetailPage } from '@/pages/admin/LeadDetailPage'
import { useAuthStore } from '@/store/useAuthStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Cargando...</div>
  if (!user) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
        <Route path="/admin/leads/:id" element={<ProtectedRoute><LeadDetailPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
