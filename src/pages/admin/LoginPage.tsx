import { useEffect, useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/store/useAuthStore'
import imagotipo from '@/assets/imagotipo.png'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  // Redirigir cuando el store confirme la sesión
  useEffect(() => {
    if (user) navigate('/admin', { replace: true })
  }, [user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // No navegamos aquí — el useEffect de arriba lo hace cuando onAuthStateChanged dispara
    } catch {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #3730a3 40%, #4f46e5 70%, #818cf8 100%)' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <img src={imagotipo} alt="Viva Casa" className="w-16 object-contain" />
          <div className="text-center">
            <p className="text-white font-bold text-lg leading-tight">Viva Casa</p>
            <p className="text-white/70 text-sm">Leads Admin</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoFocus
            className="w-full bg-white/20 border-2 border-white/30 focus:border-white rounded-xl px-4 py-3 outline-none text-white placeholder-white/60 transition-colors"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            className="w-full bg-white/20 border-2 border-white/30 focus:border-white rounded-xl px-4 py-3 outline-none text-white placeholder-white/60 transition-colors"
          />
          {error && <p className="text-red-200 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 disabled:opacity-50 transition-colors mt-1"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
