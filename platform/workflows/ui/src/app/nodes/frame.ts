// Shared contract for user-resizable notes and frames. The min geometry is the floor
// the NodeResizer enforces; PersistNoteSize is the canvas-provided commit path, keyed
// by PERSIST_NOTE_SIZE for provide/inject between the canvas and the resizable nodes.

import { computed, inject } from 'vue'
import type { OnResizeStart } from '@vue-flow/node-resizer'
import type { WfNoteData } from '../domain/graph-data'
import { noteHue } from './note-presentation'

export const NOTE_MIN_W = 200
export const NOTE_MIN_H = 120

export type PersistNoteSize = (id: string, x: number, y: number, width: number, height: number) => void

export const PERSIST_NOTE_SIZE = 'wfPersistNoteSize'

// The resize wiring shared by NoteNode and FrameNode: the color-derived hue and the
// resize-end commit through the canvas-injected persist path. `data` is a getter so the
// hue tracks color changes reactively.
export function useNoteResize(id: string, data: () => WfNoteData) {
  const hue = computed(() => noteHue(data().color))
  const persistSize = inject<PersistNoteSize | null>(PERSIST_NOTE_SIZE, null)
  function onResizeEnd(e: OnResizeStart) {
    const p = e.params
    persistSize?.(id, p.x, p.y, p.width, p.height)
  }
  return { hue, onResizeEnd }
}
