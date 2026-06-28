import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, signOut } from '@/hooks/useAuth'
import { useProject } from '@/hooks/useProject'
import { TIPOS_TESIS, NORMAS } from '@/types'
import { relativeTime } from '@/lib/utils'
import type { PBProject, TipoTesis, NormaType } from '@/types'

export default function DashboardPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const { listProjects, createProject, deleteProject } = useProject()

  const [projects, setProjects] = useState<PBProject[]>([])
  const [loading, setLoading]   = useState(true)
  const [showNew, setShowNew]   = useState(false)
  const [creating, setCreating] = useState(false)

  // New project form
  const [title,   setTitle]  = useState('')
  const [tipo,    setTipo]   = useState<TipoTesis>(0)
  const [norma,   setNorma]  = useState<NormaType>('apa')

  useEffect(() => {
    listProjects().then(p => { setProjects(p); setLoading(false) }).catch(console.error)
  }, [listProjects])

  const handleCreate = async () => {
    if (!title.trim() || !user) return
    setCreating(true)
    try {
      const proj = await createProject(title.trim(), tipo, norma, user.id)
      navigate(`/editor/${proj.id}`)
    } catch (err) { console.error(err); setCreating(false) }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return
    await deleteProject(id)
    setProjects(p => p.filter(x => x.id !== id))
  }

  return (
    <div className="h-full flex flex-col bg-brand-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-brand-900 border-b border-brand-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <h1 className="font-serif text-brand-100 font-semibold text-base">TesisEditor Pro</h1>
            <p className="text-brand-500 text-xs">by RonnDu Corp.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-brand-400 text-xs">{user?.email}</span>
          <button onClick={signOut}
            className="text-xs text-brand-500 hover:text-brand-300 border border-brand-700 rounded-lg px-3 py-1.5 transition-colors">
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Top row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-brand-100 text-xl font-medium">Mis proyectos</h2>
              <p className="text-brand-500 text-xs mt-0.5">
                {projects.length} tesis {projects.length === 1 ? 'registrada' : 'registradas'}
              </p>
            </div>
            <button onClick={() => setShowNew(true)}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              <i className="ti ti-plus text-base" /> Nueva tesis
            </button>
          </div>

          {/* Project grid */}
          {loading ? (
            <div className="text-center py-16 text-brand-500 text-sm">Cargando proyectos…</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-brand-800 rounded-2xl">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-brand-400 text-sm mb-4">No tienes proyectos aún</p>
              <button onClick={() => setShowNew(true)}
                className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors">
                Crear mi primera tesis
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(p => (
                <div key={p.id} onClick={() => navigate(`/editor/${p.id}`)}
                  className="group bg-brand-900 border border-brand-800 hover:border-brand-500 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-brand-950/50 animate-fadeIn">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{['🔬','⚙️','📖'][p.tipo]}</span>
                    <button onClick={e => handleDelete(p.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-brand-600 hover:text-red-400 transition-all">
                      <i className="ti ti-trash text-sm" />
                    </button>
                  </div>
                  <h3 className="font-serif text-brand-100 font-medium text-sm mb-1 line-clamp-2">{p.title}</h3>
                  <p className="text-brand-500 text-xs mb-3">{TIPOS_TESIS[p.tipo].nombre}</p>
                  <div className="flex items-center justify-between text-xs text-brand-600">
                    <span className="bg-brand-800 rounded px-2 py-0.5">{NORMAS[p.norma].label}</span>
                    <span>{relativeTime(p.updated)}</span>
                  </div>
                  {(p.word_count ?? 0) > 0 && (
                    <p className="text-brand-600 text-xs mt-2">{(p.word_count ?? 0).toLocaleString('es')} palabras</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New project modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-900 border border-brand-700 rounded-2xl p-6 w-full max-w-md animate-fadeIn">
            <h3 className="font-serif text-brand-100 text-lg font-medium mb-5">Nueva tesis</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-brand-400 mb-1">Título de la tesis</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-brand-800 border border-brand-600 rounded-lg px-3 py-2 text-sm text-brand-100 outline-none focus:border-brand-400"
                  placeholder="ej: Análisis del impacto de…" autoFocus />
              </div>

              <div>
                <label className="block text-xs text-brand-400 mb-1">Tipo de tesis</label>
                <select value={tipo} onChange={e => setTipo(Number(e.target.value) as TipoTesis)}
                  className="w-full bg-brand-800 border border-brand-600 rounded-lg px-3 py-2 text-sm text-brand-100 outline-none focus:border-brand-400">
                  {TIPOS_TESIS.map((t, i) => (
                    <option key={i} value={i}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-brand-400 mb-1">Norma de citación</label>
                <div className="flex gap-2">
                  {(['libre','apa','vancouver'] as NormaType[]).map(n => (
                    <button key={n} onClick={() => setNorma(n)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                        norma === n
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-brand-800 text-brand-400 border-brand-700 hover:border-brand-500'
                      }`}>
                      {NORMAS[n].label}
                    </button>
                  ))}
                </div>
                <p className="text-brand-600 text-xs mt-1">{NORMAS[norma].desc}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNew(false)}
                className="flex-1 py-2 rounded-lg text-sm border border-brand-700 text-brand-400 hover:text-brand-200 transition-colors">
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={!title.trim() || creating}
                className="flex-1 py-2 rounded-lg text-sm bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors disabled:opacity-50">
                {creating ? 'Creando…' : 'Crear proyecto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
