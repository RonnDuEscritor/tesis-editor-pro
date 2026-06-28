import { useEffect, useState, useCallback } from 'react'
import type { Editor } from '@tiptap/core'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

export default function Toolbar() {
  const [editor, setEditor] = useState<Editor | null>(null)
  const { norma }           = useStore()

  useEffect(() => {
    const handler = (e: Event) => setEditor((e as CustomEvent).detail.editor)
    window.addEventListener('active-editor', handler)
    return () => window.removeEventListener('active-editor', handler)
  }, [])

  const Btn = ({ label, action, active = false, title = '', wide = false }: {
    label: string; action: () => void; active?: boolean; title?: string; wide?: boolean
  }) => (
    <button onClick={action} title={title}
      className={cn(
        'flex items-center justify-center rounded-md border transition-all text-xs font-medium',
        wide ? 'px-2 h-7' : 'w-7 h-7',
        active
          ? 'bg-brand-500 text-white border-brand-500'
          : 'bg-transparent text-brand-600 border-transparent hover:bg-brand-100 hover:text-brand-800'
      )}>
      {label}
    </button>
  )

  const Sep = () => <div className="w-px h-5 bg-brand-200 mx-1" />

  const isActive = useCallback((type: string, attrs?: Record<string,unknown>) => {
    return editor?.isActive(type, attrs) ?? false
  }, [editor])

  if (!editor) return (
    <div className="h-9 bg-white border-b border-brand-100 flex items-center px-3">
      <span className="text-xs text-brand-300 italic">Haz clic en una sección para editar</span>
    </div>
  )

  return (
    <div className="h-9 bg-white border-b border-brand-100 flex items-center px-2 gap-0.5 overflow-x-auto flex-shrink-0">

      {/* Text style */}
      <Btn label="N"  action={() => editor.chain().focus().toggleBold().run()}      active={isActive('bold')}      title="Negrita (Ctrl+B)" />
      <Btn label="C"  action={() => editor.chain().focus().toggleItalic().run()}    active={isActive('italic')}    title="Cursiva (Ctrl+I)" />
      <Btn label="S"  action={() => editor.chain().focus().toggleUnderline().run()} active={isActive('underline')} title="Subrayado (Ctrl+U)" />
      <Sep />

      {/* Headings */}
      <Btn label="H1" wide action={() => editor.chain().focus().toggleHeading({ level:1 }).run()} active={isActive('heading',{level:1})} title="Título 1" />
      <Btn label="H2" wide action={() => editor.chain().focus().toggleHeading({ level:2 }).run()} active={isActive('heading',{level:2})} title="Título 2" />
      <Btn label="H3" wide action={() => editor.chain().focus().toggleHeading({ level:3 }).run()} active={isActive('heading',{level:3})} title="Título 3" />
      <Btn label="¶"  action={() => editor.chain().focus().setParagraph().run()}                   active={isActive('paragraph')}        title="Párrafo" />
      <Btn label={'"'} action={() => editor.chain().focus().toggleBlockquote().run()}              active={isActive('blockquote')}       title="Cita bloque" />
      <Sep />

      {/* Lists */}
      <Btn label={<i className="ti ti-list" /> as unknown as string}         action={() => editor.chain().focus().toggleBulletList().run()}  active={isActive('bulletList')}  title="Lista" />
      <Btn label={<i className="ti ti-list-numbers" /> as unknown as string} action={() => editor.chain().focus().toggleOrderedList().run()} active={isActive('orderedList')} title="Lista numerada" />
      <Sep />

      {/* Alignment */}
      <Btn label={<i className="ti ti-align-left" /> as unknown as string}      action={() => editor.chain().focus().setTextAlign('left').run()}    active={isActive({textAlign:'left'})}    title="Izquierda" />
      <Btn label={<i className="ti ti-align-center" /> as unknown as string}    action={() => editor.chain().focus().setTextAlign('center').run()}  active={isActive({textAlign:'center'})}  title="Centrar" />
      <Btn label={<i className="ti ti-align-right" /> as unknown as string}     action={() => editor.chain().focus().setTextAlign('right').run()}   active={isActive({textAlign:'right'})}   title="Derecha" />
      <Btn label={<i className="ti ti-align-justified" /> as unknown as string} action={() => editor.chain().focus().setTextAlign('justify').run()} active={isActive({textAlign:'justify'})} title="Justificar" />
      <Sep />

      {/* Table */}
      <Btn label={<i className="ti ti-table" /> as unknown as string} wide
        action={() => editor.chain().focus().insertTable({ rows:3, cols:3, withHeaderRow:true }).run()}
        title="Insertar tabla académica" />

      {/* Undo/Redo */}
      <Sep />
      <Btn label={<i className="ti ti-arrow-back-up" /> as unknown as string} action={() => editor.chain().focus().undo().run()} title="Deshacer (Ctrl+Z)" />
      <Btn label={<i className="ti ti-arrow-forward-up" /> as unknown as string} action={() => editor.chain().focus().redo().run()} title="Rehacer (Ctrl+Y)" />

      {/* Norma indicator */}
      {norma !== 'libre' && (
        <>
          <Sep />
          <span className="text-xs text-brand-400 italic px-1">
            🔒 {norma === 'apa' ? 'APA 7 · Times NR 12pt · 2.0' : 'Vancouver · Arial 11pt · 1.5'}
          </span>
        </>
      )}
    </div>
  )
}
