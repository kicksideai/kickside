import { expect, it, vi } from 'vitest'
import { SyncEngine } from '../mapping/sync'
import type { ApplyResult } from '../types'
import type { Command } from '../api/commands'
import { workflowEdits } from './workflow-edits'

const result: ApplyResult = { events: [], head_seq: 1, can_undo: true, can_redo: false }
const update = (id: string, text: string): Command[] => [{ type: 'node.update', body: { id, config: { text } } }]
function deferred() {
  let resolve!: (value: ApplyResult) => void
  return { promise: new Promise<ApplyResult>(done => { resolve = done }), resolve: (value = result) => resolve(value) }
}
function engine() {
  const e = new SyncEngine()
  e.reset({ nodes: [{ id: 'n', kind: 'block', config: { text: '' } }, { id: 'm', kind: 'block', config: {} }] })
  return e
}
it('coalesces a synchronous burst into one latest save', async () => {
  const request = vi.fn(async (_commands: Command[]) => result)
  const save = workflowEdits({ engine: engine(), request, rebuild: vi.fn(), recover: vi.fn() })
  await Promise.all(Array.from({ length: 60 }, (_, n) => save(update('n', String(n)))))
  expect(request).toHaveBeenCalledTimes(1)
  expect(request).toHaveBeenCalledWith(update('n', '59'))
})
it('has one writer, one pending latest update per node, and does not resend in-flight echoes', async () => {
  const first = deferred()
  const request = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(result)
  const e = engine()
  const save = workflowEdits({ engine: e, request, rebuild: vi.fn(), recover: vi.fn() })
  const done = [save(update('n', 'first'))]
  await Promise.resolve()
  done.push(save(update('n', 'first')))
  for (let n = 0; n < 60; n++) done.push(save(update('n', String(n))))
  expect(request).toHaveBeenCalledTimes(1)
  expect(e.doc.nodes.n.config).toEqual({ text: '59' })
  first.resolve()
  await Promise.all(done)
  expect(request).toHaveBeenCalledTimes(2)
  expect(request.mock.calls[1][0]).toEqual(update('n', '59'))
})
it('does not merge node updates across structural commands', async () => {
  const request = vi.fn(async (_commands: Command[]) => result)
  const save = workflowEdits({ engine: engine(), request, rebuild: vi.fn(), recover: vi.fn() })
  await Promise.all([save(update('n', 'before')), save([{ type: 'node.remove', body: { id: 'n' } }]), save(update('n', 'after'))])
  expect(request.mock.calls.map(([commands]) => commands)).toEqual([update('n', 'before'), [{ type: 'node.remove', body: { id: 'n' } }], update('n', 'after')])
})
it('flush waits for the in-flight write and every pending edit', async () => {
  const first = deferred(), second = deferred()
  const request = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
  const save = workflowEdits({ engine: engine(), request, rebuild: vi.fn(), recover: vi.fn() })
  void save(update('n', 'first'))
  await Promise.resolve()
  void save(update('n', 'latest'))
  const flushed = vi.fn()
  const flush = save.flush().then(flushed)
  first.resolve()
  await Promise.resolve()
  expect(flushed).not.toHaveBeenCalled()
  second.resolve()
  await flush
  expect(save.pending).toBe(false)
  expect(flushed).toHaveBeenCalledTimes(1)
})
it('drains an edit queued by an acknowledgement continuation', async () => {
  const request = vi.fn(async (_commands: Command[]) => result)
  const save = workflowEdits({ engine: engine(), request, rebuild: vi.fn(), recover: vi.fn() })
  const first = save(update('n', 'first'))
  let second: Promise<void> | undefined
  void first.then(() => { second = save(update('n', 'next')) })
  await first
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  expect(request).toHaveBeenCalledTimes(2)
  await second
})
it('retains later edits after a save failure without hanging their callers or retrying the failed write', async () => {
  const request = vi.fn<(commands: Command[]) => Promise<ApplyResult>>().mockRejectedValue(new Error('offline'))
  const checkpoints = vi.fn()
  const save = workflowEdits({ engine: engine(), request, rebuild: vi.fn(), recover: vi.fn(async () => {}), checkpoint: checkpoints })
  await save(update('n', 'first'))
  const finished = vi.fn()
  void save(update('m', 'later')).then(finished)
  await Promise.resolve()
  expect(finished).toHaveBeenCalledTimes(1)
  expect(await save.flush()).toBe(false)
  expect(request).toHaveBeenCalledTimes(1)
  expect(checkpoints).toHaveBeenLastCalledWith([update('n', 'first'), update('m', 'later')])
})
