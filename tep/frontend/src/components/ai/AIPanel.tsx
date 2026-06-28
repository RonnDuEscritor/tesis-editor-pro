import { useState, useEffect } from 'react'
import { useAI, type AIMode } from '@/hooks/useAI'
import { cn } from '@/lib/utils'

const MODES: { id: AIMode; label: string; icon: string; desc: string }[] = [
  { id:'reformulate',   label:'Reformular',      icon:'ti-refresh',       desc:'Mejora fluidez y claridad' },
  { id:'academic',      label:'Hacer académico',  icon:'ti-school',        desc:'Eleva el registro formal' },
  { id:'reduce',        label:'Reducir',          icon:'ti-scissors',      desc:'Elimina redundancias' },
  { id:'expand',        label:'Expandir',         icon:'ti-arrows-maximize', desc:'Añade profundidad' },
  { id:'summarize',     label:'Resumir',          icon:'ti-text-size',     desc:'Párrafo conciso' },
  { id:'objectives',    label:'Objetivos',        icon:'ti-target',        desc:'Estructura correcta' },
  { id:'correct_apa',   label:'Corregir norma',   icon:'ti-file-check',    desc:'Revisa APA/Vancouver' },
]

interface AIPanelProps { onClose: () => void }

export default function AIPanel({ onClose }: AIPanelProps) {
  const { ask, response, loading, error, reset } = useAI()
  const [selectedMode, setMode] = useState<AIMode>('reformulate')
  const [customText,   setText] = useState('')
  const [copied,       setCopied] = useState(false)

  // Get selected text from active editor
  useEffect(() => {
    const getSelection = () => {
      const sel = window.getSelection()
      if (sel && sel.toString().trim()) {
        setText(sel.toString().trim())
      }
    }
    document.addEventListener('mouseup', getSelection)
    return () => document.removeEventListener('mouseup', getSelection)
  }, [])

  const handleAsk = () => {
    reset()
    ask(customText, selectedMode)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-80 min-w-80 flex flex-col bg-brand-900 border-l border-brand-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-700/40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-brand-400"><i className="ti ti-brain text-base" /></span>
          <span className="font-medium text-brand-100 text-sm">Asesor Académico IA</span>
        </div>
        <button onClick={onClose} className="text-brand-500 hover:text-brand-300 transition-colors">
          <i className="ti ti-x text-sm" />
        </button>
      </div>

      {/* Mode selector */}
      <div className="p-3 border-b border-brand-700/40 flex-shrink-0">
        <p className="text-xs text-brand-500 mb-2">¿Qué quieres hacer?</p>
        <div className="grid grid-cols-2 gap-1.5">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs border transition-all text-left',
                selectedMode === m.id
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-brand-800/50 text-brand-400 border-brand-700 hover:border-brand-500 hover:text-brand-200'
              )}>
              <i className={`ti ${m.icon} text-sm flex-shrink-0`} />
              <div>
                <div className="font-medium leading-tight">{m.label}</div>
                <div className="text-xs opacity-60">{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-b border-brand-700/40 flex-shrink-0">
        <p className="text-xs text-brand-500 mb-1">
          Texto a procesar <span className="text-brand-600">(selecciona en el editor o escribe aquí)</span>
        </p>
        <textarea value={customText} onChange={e => setText(e.target.value)}
          rows={4} placeholder="Selecciona texto en el editor o pégalo aquí…"
          className="w-full bg-brand-800/60 border border-brand-700 rounded-lg px-3 py-2 text-xs text-brand-200 outline-none focus:border-brand-500 resize-none placeholder:text-brand-600" />
        <button onClick={handleAsk} disabled={loading || !customText.trim()}
          className="w-full mt-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-lg py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2">
          {loading ? (
            <><span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />Procesando…</>
          ) : (
            <><i className="ti ti-sparkles text-sm" />Analizar con IA</>
          )}
        </button>
      </div>

      {/* Response */}
      <div className="flex-1 overflow-y-auto p-3">
        {error && (
          <div className="bg-red-900/30 border border-red-700/30 rounded-lg p-3 text-xs text-red-400 mb-3">
            {error}
          </div>
        )}

        {(response || loading) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-brand-500">Respuesta del asesor:</p>
              {response && !loading && (
                <button onClick={copy}
                  className="text-xs text-brand-500 hover:text-brand-300 flex items-center gap-1 transition-colors">
                  <i className={`ti ${copied ? 'ti-check' : 'ti-copy'} text-sm`} />
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              )}
            </div>
            <div className={cn(
              'bg-brand-800/40 border border-brand-700/50 rounded-lg p-3 text-xs text-brand-200 leading-relaxed whitespace-pre-wrap',
              loading && !response && 'ai-cursor'
            )}>
              {response || (loading ? '' : '')}
            </div>
          </div>
        )}

        {!response && !loading && !error && (
          <div className="text-center py-8 text-brand-600">
            <i className="ti ti-brain text-3xl block mb-2 opacity-30" />
            <p className="text-xs">Selecciona un modo, escribe o selecciona texto, y presiona Analizar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
