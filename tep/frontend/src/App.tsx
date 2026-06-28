import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoginPage    from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import EditorPage   from '@/pages/EditorPage'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-brand-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-brand-400 text-sm">Cargando TesisEditor Pro…</span>
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="/login"         element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/"              element={user ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/editor/:id"    element={user ? <EditorPage />   : <Navigate to="/login" />} />
      <Route path="*"              element={<Navigate to="/" />} />
    </Routes>
  )
}
