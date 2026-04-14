import { AppRouter } from '@/router'
import { useAuth } from '@/hooks/useAuth'

function App() {
  // Inicializa el listener de auth globalmente para toda la app
  useAuth()
  return <AppRouter />
}

export default App
