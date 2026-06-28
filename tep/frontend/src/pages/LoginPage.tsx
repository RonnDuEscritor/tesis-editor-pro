import { useState, FormEvent } from 'react'
import { signIn, signUp } from '@/hooks/useAuth'

export default function LoginPage() {
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [name, setName]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'login') await signIn(email, password)
      else                  await signUp(email, password, name)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error de autenticación')
    } finally { setLoading(false) }
  }

  return (
    <div className="h-full flex items-center justify-center bg-brand-950 p-4">
      <div className="w-full max-w-sm animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎓</div>
          <h1 className="font-serif text-2xl text-brand-100 font-semibold">TesisEditor Pro</h1>
          <p className="text-brand-400 text-xs mt-1 tracking-widest uppercase">by RonnDu Corp.</p>
        </div>

        {/* Card */}
        <div className="bg-brand-800 border border-brand-700 rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-brand-900 rounded-lg p-1 mb-6">
            {(['login','register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
                  mode===m ? 'bg-brand-500 text-white shadow' : 'text-brand-400 hover:text-brand-200'
                }`}>
                {m==='login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            {mode==='register' && (
              <div>
                <label className="block text-xs text-brand-400 mb-1">Nombre completo</label>
                <input value={name} onChange={e=>setName(e.target.value)} required
                  className="w-full bg-brand-900 border border-brand-600 rounded-lg px-3 py-2 text-sm text-brand-100 outline-none focus:border-brand-400"
                  placeholder="Tu nombre" />
              </div>
            )}
            <div>
              <label className="block text-xs text-brand-400 mb-1">Correo electrónico</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                className="w-full bg-brand-900 border border-brand-600 rounded-lg px-3 py-2 text-sm text-brand-100 outline-none focus:border-brand-400"
                placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-xs text-brand-400 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={e=>setPass(e.target.value)} required minLength={8}
                className="w-full bg-brand-900 border border-brand-600 rounded-lg px-3 py-2 text-sm text-brand-100 outline-none focus:border-brand-400"
                placeholder="Mínimo 8 caracteres" />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? 'Procesando…' : mode==='login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-brand-600 text-xs mt-4">
          TesisEditor Pro • RonnDu Corp. • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
