import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { StepWelcome } from '@/steps/StepWelcome'
import { FormPage } from '@/pages/FormPage'
import { ConfirmationPage } from '@/pages/ConfirmationPage'
import { SellerFormPage } from '@/pages/SellerFormPage'
import { SellerConfirmationPage } from '@/pages/SellerConfirmationPage'
import { LoginPage } from '@/pages/admin/LoginPage'
import { LeadsPage } from '@/pages/admin/LeadsPage'
import { LeadDetailPage } from '@/pages/admin/LeadDetailPage'
import { SellerLeadsPage } from '@/pages/admin/SellerLeadsPage'
import { SellerLeadDetailPage } from '@/pages/admin/SellerLeadDetailPage'
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
        <Route path="/" element={<StepWelcome />} />
        <Route path="/comprar" element={<FormPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/vender" element={<SellerFormPage />} />
        <Route path="/vender/confirmation" element={<SellerConfirmationPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
        <Route path="/admin/leads/:id" element={<ProtectedRoute><LeadDetailPage /></ProtectedRoute>} />
        <Route path="/admin/vendedores" element={<ProtectedRoute><SellerLeadsPage /></ProtectedRoute>} />
        <Route path="/admin/vendedores/:id" element={<ProtectedRoute><SellerLeadDetailPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
