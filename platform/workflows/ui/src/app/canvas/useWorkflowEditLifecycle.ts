import { onBeforeUnmount, onMounted } from 'vue'
import type { workflowEdits } from './workflow-edits'

type Edits = ReturnType<typeof workflowEdits>
const writers = new Map<string, Edits>()
export async function finishPreviousWorkflowWriter(key: string): Promise<void> {
  const writer = writers.get(key)
  if (writer) await writer.flush()
}
export function registerWorkflowWriter(key: string, edits: Edits): void {
  writers.set(key, edits)
}

export function useWorkflowEditLifecycle(edits: Edits, key: () => string) {
  const flush = () => { void edits.flush() }
  const hidden = () => { if (document.visibilityState === 'hidden') flush() }
  onMounted(() => {
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', hidden)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('pagehide', flush)
    document.removeEventListener('visibilitychange', hidden)
    // SPA unmount leaves the writer alive until its final acknowledgement.
    // A new canvas for the same owner waits for it before reading its journal.
    void edits.flush().then(() => {
      if (writers.get(key()) === edits) writers.delete(key())
    })
  })
}
