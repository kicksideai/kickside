import { onBeforeUnmount, ref, shallowRef } from 'vue'
import type { PreviewReply, PreviewRequest, PreviewResult, TablePage } from './protocol'
export function usePreview() {
  const result = shallowRef<PreviewResult | null>(null)
  const loading = ref(false)
  const error = ref('')
  let worker: Worker | null = null
  let sequence = 0
  function clear() {
    sequence++
    worker?.terminate()
    worker = null
    result.value = null
    loading.value = false
    error.value = ''
  }
  function start() {
    clear()
    worker = new Worker(new URL('./preview.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<PreviewReply>) => {
      if (event.data.id !== sequence) return
      if ('error' in event.data) error.value = event.data.error
      else result.value = event.data.result
      loading.value = false
    }
    worker.onerror = (event: ErrorEvent) => {
      error.value = event.message || 'Preview worker failed'
      loading.value = false
    }
  }
  function send(request: PreviewRequest, transfer: Transferable[] = []) {
    if (!worker) throw new Error('Preview worker is not initialized')
    loading.value = true
    error.value = ''
    worker.postMessage(request, transfer)
  }
  function markdown(source: string) {
    start()
    send({ id: ++sequence, action: 'markdown', source })
  }
  function workbook(bytes: ArrayBuffer) {
    start()
    send({ id: ++sequence, action: 'workbook', bytes }, [bytes])
  }
  function page(table: number, value: TablePage) {
    send({ id: ++sequence, action: 'page', table, page: value })
  }
  onBeforeUnmount(clear)
  return { result, loading, error, clear, markdown, workbook, page }
}
