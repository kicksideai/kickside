// Pure keyboard mapping, dependency-free so it unit-tests and drives the canvas
// @keydown handler. Editing keys are ignored while a form field is focused (the
// chestor isEditingTarget pattern).

export type WfAction = 'undo' | 'redo' | 'delete' | 'escape' | 'palette' | 'fit' | 'zoom-selection' | null

export interface KeyLike {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  target?: { tagName?: string; isContentEditable?: boolean } | EventTarget | null
}

const EDITABLE = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

export function isEditingTarget(target: KeyLike['target']): boolean {
  const el = target as { tagName?: string; isContentEditable?: boolean } | null
  if (!el) return false
  if (el.isContentEditable) return true
  const tag = el.tagName
  return typeof tag === 'string' && EDITABLE.has(tag.toUpperCase())
}

export function resolveAction(e: KeyLike): WfAction {
  const mod = Boolean(e.ctrlKey || e.metaKey)
  if (mod && (e.key === 'k' || e.key === 'K')) return 'palette'
  if (isEditingTarget(e.target)) return null
  if (mod && (e.key === 'z' || e.key === 'Z')) return e.shiftKey ? 'redo' : 'undo'
  if (mod && (e.key === 'y' || e.key === 'Y')) return 'redo'
  // The canvas-tool convention pair: Shift+1 fits the graph, Shift+2 the selection.
  if (e.shiftKey && !mod && (e.key === '1' || e.key === '!')) return 'fit'
  if (e.shiftKey && !mod && (e.key === '2' || e.key === '@')) return 'zoom-selection'
  if (e.key === 'Delete' || e.key === 'Backspace') return 'delete'
  if (e.key === 'Escape') return 'escape'
  return null
}
