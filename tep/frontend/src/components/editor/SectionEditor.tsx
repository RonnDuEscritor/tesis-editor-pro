import { useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { Extension } from '@tiptap/core'
import { useStore } from '@/store'
import { countWords } from '@/lib/utils'
import type { PBSection, TiptapDoc } from '@/types'

// ── CITE CHIP EXTENSION ──────────────────────────────────────
const CiteChipExtension = Extension.create({
  name: 'citeChip',
  addKeyboardShortcuts() { return {} },
})

interface SectionEditorProps {
  section: PBSection
  pageNum: string
  tesisTitulo: string
  normaClass: string
}

export default function SectionEditor({ section, pageNum, tesisTitulo, normaClass }: SectionEditorProps) {
  const { activeSectionId, setActiveSection, saveSectionContent } = useStore()
  const isActive = activeSectionId === section.id

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: { depth: 50 } }),
      Underline,
      TextAlign.configure({ types: ['heading','paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
      CharacterCount,
      Placeholder.configure({
        placeholder: `Escribe aquí el contenido de "${section.name}"…`,
        emptyEditorClass: 'is-editor-empty',
      }),
      CiteChipExtension,
    ],
    content: section.content as TiptapDoc ?? undefined,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() as TiptapDoc
      const wc   = countWords(json as unknown as import('@/types').TiptapNode)
      saveSectionContent(section.id, json, wc)
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
        'data-section-id': section.id,
      },
    },
  })

  // ── Listen for insert-cite event from ReferencesPanel ────
  const handleInsertCite = useCallback((e: Event) => {
    const { refId, citeText, sectionId } = (e as CustomEvent).detail
    if (sectionId !== section.id || !editor) return
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'text',
        text: citeText,
        marks: [{ type: 'textStyle', attrs: { class: 'cite-chip', 'data-ref-id': refId } }],
      })
      .insertContent(' ')
      .run()
  }, [editor, section.id])

  useEffect(() => {
    window.addEventListener('insert-cite', handleInsertCite)
    return () => window.removeEventListener('insert-cite', handleInsertCite)
  }, [handleInsertCite])

  // ── Expose editor to toolbar ──────────────────────────────
  useEffect(() => {
    if (isActive && editor) {
      window.dispatchEvent(new CustomEvent('active-editor', { detail: { editor, sectionId: section.id } }))
    }
  }, [isActive, editor, section.id])

  const handleFocus = () => setActiveSection(section.id)

  return (
    <div id={`section-${section.id}`}
      className={`a4-page ${normaClass} transition-shadow ${isActive ? 'ring-1 ring-brand-400/30' : ''}`}>

      {/* Page header */}
      <div className="page-header">
        <span>{tesisTitulo}</span>
        <span>TesisEditor Pro</span>
      </div>

      {/* Section anchor label */}
      <span className="section-anchor-label">{section.fase} › {section.name}</span>

      {/* Tiptap editor */}
      <EditorContent
        editor={editor}
        onClick={handleFocus}
        onFocus={handleFocus}
      />

      {/* Word count badge */}
      <div className="absolute bottom-2 right-4 text-xs text-gray-300 select-none">
        {section.word_count > 0 && `${section.word_count} pal.`}
      </div>

      {/* Page footer */}
      <div className="page-footer">
        <span>{pageNum}</span>
      </div>
    </div>
  )
}
