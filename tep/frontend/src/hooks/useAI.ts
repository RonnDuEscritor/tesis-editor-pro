import { useState, useCallback } from 'react'
import { useStore } from '@/store'

const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY as string

export type AIMode =
  | 'reformulate'
  | 'academic'
  | 'reduce'
  | 'correct_apa'
  | 'correct_vancouver'
  | 'expand'
  | 'summarize'
  | 'objectives'

const SYSTEM_PROMPT = `Eres un asesor académico especializado en redacción de tesis universitarias para estudiantes hispanohablantes de América Latina. 
Tu función es ayudar a mejorar la redacción, el estilo académico y el cumplimiento de normas APA 7 y Vancouver.
- Responde SIEMPRE en español neutro académico.
- Sé conciso y directo. No introduzcas, ve al grano.
- Usa terminología científica apropiada.
- Cuando corrijas, muestra el texto mejorado directamente, sin explicaciones largas a menos que se pidan.`

const MODE_PROMPTS: Record<AIMode, string> = {
  reformulate:         'Reformula el siguiente texto manteniendo su significado pero mejorando la claridad y fluidez académica:',
  academic:            'Transforma el siguiente texto a un registro académico formal apropiado para una tesis universitaria:',
  reduce:              'Reduce el siguiente texto eliminando redundancias y verborrea, conservando las ideas esenciales:',
  correct_apa:         'Revisa el siguiente texto e indica qué aspectos no cumplen con las normas APA 7ma edición. Luego proporciona la versión corregida:',
  correct_vancouver:   'Revisa el siguiente texto e indica qué aspectos no cumplen con las normas Vancouver. Luego proporciona la versión corregida:',
  expand:              'Amplía y desarrolla el siguiente texto de forma académica, añadiendo profundidad y argumentación:',
  summarize:           'Resume el siguiente texto en un párrafo académico conciso:',
  objectives:          'Reformula los siguientes objetivos de investigación siguiendo la estructura correcta para una tesis (verbo en infinitivo, alcance, contexto):',
}

export function useAI() {
  const [response, setResponse]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const { norma }                 = useStore()

  const ask = useCallback(async (text: string, mode: AIMode) => {
    if (!API_KEY || !API_KEY.startsWith('sk-ant-')) {
      setError('Falta la API key de Anthropic. Agrégala en VITE_ANTHROPIC_KEY en tu archivo .env')
      return
    }
    if (!text.trim()) {
      setError('Selecciona texto en el editor antes de usar el asesor de IA.')
      return
    }

    setLoading(true)
    setError(null)
    setResponse('')

    // Adjust prompt based on active norma
    let modeKey = mode
    if (mode === 'correct_apa' && norma === 'vancouver') modeKey = 'correct_vancouver'

    const userPrompt = `${MODE_PROMPTS[modeKey]}\n\n---\n${text}\n---`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key':    API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      'claude-sonnet-4-6',
          max_tokens: 1024,
          system:     SYSTEM_PROMPT,
          stream:     true,
          messages:   [{ role: 'user', content: userPrompt }],
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message ?? `Error ${res.status}`)
      }

      // Stream SSE response
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'content_block_delta' && data.delta?.text) {
              setResponse(prev => prev + data.delta.text)
            }
          } catch { /* skip malformed chunks */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [norma])

  return { ask, response, loading, error, reset: () => { setResponse(''); setError(null) } }
}
