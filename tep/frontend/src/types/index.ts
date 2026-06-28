// ── NORMAS ───────────────────────────────────────────────────
export type NormaType = 'libre' | 'apa' | 'vancouver'
export type TipoTesis = 0 | 1 | 2
export type RefType   = 'libro' | 'articulo' | 'tesis' | 'web' | 'capitulo'
export type IssueLevel = 'error' | 'warning' | 'info'

export interface NormaConfig {
  label: string; font: string; fontSize: string
  lineHeight: string; textAlign: string; cssClass: string; desc: string
  citationFormat: 'author-year' | 'numbered'
  bibSort: 'alpha' | 'appearance'
}

export const NORMAS: Record<NormaType, NormaConfig> = {
  libre: {
    label:'Libre', font:"'Inter',sans-serif", fontSize:'14px',
    lineHeight:'1.85', textAlign:'left', cssClass:'norma-libre', desc:'',
    citationFormat:'author-year', bibSort:'alpha',
  },
  apa: {
    label:'APA 7', font:"'Times New Roman',Times,serif", fontSize:'12pt',
    lineHeight:'2.0', textAlign:'left', cssClass:'norma-apa',
    desc:'Times New Roman 12pt · interlineado 2.0 · márgenes 2.54cm',
    citationFormat:'author-year', bibSort:'alpha',
  },
  vancouver: {
    label:'Vancouver', font:"'Arial',sans-serif", fontSize:'11pt',
    lineHeight:'1.5', textAlign:'justify', cssClass:'norma-vancouver',
    desc:'Arial 11pt · interlineado 1.5 · citas numéricas [N]',
    citationFormat:'numbered', bibSort:'appearance',
  },
}

// ── THESIS STRUCTURE ─────────────────────────────────────────
export interface TesisFase  { fase: string; isRoman: boolean; items: string[] }
export interface TesisTipo  { nombre: string; fases: TesisFase[] }

export const TIPOS_TESIS: TesisTipo[] = [
  { nombre:'Investigación científica', fases:[
    { fase:'Fase preliminar', isRoman:true, items:[
      'Portada oficial','Aprobación del jurado','Dedicatoria y agradecimientos',
      'Resumen / Abstract','Palabras clave / Keywords',
      'Índice general','Índice de tablas','Índice de figuras',
    ]},
    { fase:'Cuerpo de la tesis', isRoman:false, items:[
      'Introducción','Cap. I — El problema','Cap. II — Marco teórico',
      'Cap. III — Marco metodológico','Cap. IV — Análisis de resultados',
      'Cap. V — Discusión de resultados','Conclusiones y recomendaciones',
    ]},
    { fase:'Fase final', isRoman:false, items:['Referencias bibliográficas','Anexos'] },
  ]},
  { nombre:'Proyecto factible / técnico', fases:[
    { fase:'Fase preliminar', isRoman:true, items:[
      'Portada, aprobación, dedicatoria','Resumen / Abstract y palabras clave',
      'Índice general','Índice de tablas y figuras',
    ]},
    { fase:'Cuerpo del proyecto', isRoman:false, items:[
      'Introducción','Cap. I — Diagnóstico de la necesidad',
      'Cap. II — Fundamentación tecnológica','Cap. III — Diseño y arquitectura',
      'Cap. IV — Desarrollo e implementación',
      'Cap. V — Pruebas, evaluación y factibilidad','Conclusiones y recomendaciones',
    ]},
    { fase:'Fase final', isRoman:false, items:['Referencias bibliográficas','Anexos (código, manual)'] },
  ]},
  { nombre:'Revisión sistemática / documental', fases:[
    { fase:'Fase preliminar', isRoman:true, items:[
      'Portada, aprobación, dedicatoria','Resumen / Abstract y palabras clave',
      'Índice general','Índice de cuadros comparativos',
    ]},
    { fase:'Cuerpo analítico', isRoman:false, items:[
      'Introducción','Cap. I — Justificación y alcance crítico',
      'Cap. II — Metodología de búsqueda y selección',
      'Cap. III — Desarrollo categorial / ejes temáticos',
      'Cap. IV — Análisis comparativo / síntesis','Cap. V — Discusión teórica',
      'Conclusiones y líneas de investigación futuras',
    ]},
    { fase:'Fase final', isRoman:false, items:['Referencias bibliográficas (extensa)','Anexos (matrices)'] },
  ]},
]

// ── POCKETBASE RECORDS ───────────────────────────────────────
export interface PBProject {
  id: string; collectionId: string; collectionName: string
  created: string; updated: string
  user: string; title: string; tipo: TipoTesis; norma: NormaType
  institution?: string; author?: string; tutor?: string
  year?: number; word_count?: number
  settings?: { autoSaveInterval?: number; revisionEnabled?: boolean; aiEnabled?: boolean }
}

export interface PBSection {
  id: string; collectionId: string; collectionName: string
  created: string; updated: string
  project: string; name: string; fase: string
  order_index: number; is_roman: boolean
  content?: TiptapDoc | null; word_count: number
}

export interface PBReference {
  id: string; collectionId: string; collectionName: string
  created: string; updated: string
  project: string; author: string; initial?: string; year: string
  ref_type: RefType; title: string; publisher?: string
  journal?: string; volume?: string; issue?: string
  doi?: string; url?: string; pages?: string
}

export interface PBCitation {
  id: string; collectionId: string; collectionName: string
  created: string; updated: string
  project: string; section: string; reference: string
  page_ref?: string; order_of_appearance: number
}

export interface PBVersion {
  id: string; collectionId: string; collectionName: string
  created: string; updated: string
  project: string; label: string
  snapshot: Record<string, TiptapDoc | null>; auto: boolean
}

// ── TIPTAP ───────────────────────────────────────────────────
export interface TiptapDoc  { type: 'doc'; content: TiptapNode[] }
export interface TiptapNode {
  type: string; attrs?: Record<string, unknown>
  content?: TiptapNode[]; text?: string; marks?: TiptapMark[]
}
export interface TiptapMark { type: string; attrs?: Record<string, unknown> }

// ── REVISION ─────────────────────────────────────────────────
export interface RevisionIssue {
  id: string; sectionId?: string; sectionName?: string
  level: IssueLevel; code: string; message: string
}

// ── STORE ────────────────────────────────────────────────────
export interface AppState {
  project:         PBProject | null
  sections:        PBSection[]
  references:      PBReference[]
  citations:       PBCitation[]
  activeSectionId: string | null
  norma:           NormaType
  revisionIssues:  RevisionIssue[]
  isSaving:        boolean
  lastSaved:       Date | null
  aiPanelOpen:     boolean
  aiContext:       string
}
