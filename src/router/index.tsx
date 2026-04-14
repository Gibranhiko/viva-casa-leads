import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { FormPage } from '@/pages/FormPage'
import { ConfirmationPage } from '@/pages/ConfirmationPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
