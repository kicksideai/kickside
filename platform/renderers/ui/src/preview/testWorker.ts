// Execute the worker's real processor in unit tests, which have no browser Worker.
import { PreviewProcessor } from './processor'
import './markdownPreview'
import 'xlsx'
import type { PreviewReply, PreviewRequest } from './protocol'
export class TestPreviewWorker {
  onmessage: ((event: MessageEvent<PreviewReply>) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  private readonly processor = new PreviewProcessor()
  private active = true
  private pending = Promise.resolve()
  postMessage(request: PreviewRequest) {
    this.pending = this.pending.then(async () => {
      let reply: PreviewReply
      try { reply = { id: request.id, result: await this.processor.handle(request) } }
      catch (error: unknown) { reply = { id: request.id, error: error instanceof Error ? error.message : String(error) } }
      if (this.active) this.onmessage?.({ data: structuredClone(reply) } as MessageEvent<PreviewReply>)
    })
  }
  terminate() { this.active = false }
}
