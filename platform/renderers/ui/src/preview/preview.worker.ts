import { PreviewProcessor } from './processor'
import type { PreviewReply, PreviewRequest } from './protocol'
const processor = new PreviewProcessor()
// Serialize commands so a page request cannot race the initial lazy parse.
let pending = Promise.resolve()
self.onmessage = (event: MessageEvent<PreviewRequest>) => {
  pending = pending.then(async () => {
    const request = event.data
    let reply: PreviewReply
    try { reply = { id: request.id, result: await processor.handle(request) } }
    catch (error: unknown) { reply = { id: request.id, error: error instanceof Error ? error.message : String(error) } }
    self.postMessage(reply)
  })
}
