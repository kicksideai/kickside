// @vitest-environment happy-dom
import { beforeEach, expect, it, vi } from 'vitest'
import { WorkflowEditJournal } from './workflow-edit-journal'
import { workflowEdits } from './workflow-edits'
import { SyncEngine } from '../mapping/sync'
import type { Command } from '../api/commands'
import type { ApplyResult } from '../types'
const update = (text: string): Command[] => [{ type: 'node.update', body: { id: 'n', config: { text } } }]
function engine(text = '') {
  const e = new SyncEngine()
  e.reset({ nodes: [{ id: 'n', kind: 'block', config: { text } }] })
  return e
}
beforeEach(() => localStorage.clear())
it('restores only the latest desired node config after unload, and skips an already committed save', async () => {
  const journal = new WorkflowEditJournal('actor', 'wf', localStorage)
  const save = workflowEdits({ engine: engine(), request: () => new Promise<ApplyResult>(() => {}), rebuild: vi.fn(), recover: vi.fn(), checkpoint: batches => journal.write(batches) })
  void save(update('first'))
  await Promise.resolve()
  void save(update('intermediate'))
  void save(update('latest'))
  const reloaded = new WorkflowEditJournal('actor', 'wf', localStorage)
  expect(reloaded.read(engine().doc)).toEqual([update('latest')])
  expect(reloaded.read(engine('latest').doc)).toEqual([])
  expect(new WorkflowEditJournal('other-actor', 'wf', localStorage).read(engine().doc)).toEqual([])
})
it('retains unsaved edits on a server failure and surfaces it without retries', async () => {
  const journal = new WorkflowEditJournal('actor', 'wf', localStorage)
  const cause = new Error('offline')
  const request = vi.fn().mockRejectedValue(cause), recover = vi.fn(async () => {})
  const save = workflowEdits({ engine: engine(), request, recover, rebuild: vi.fn(), checkpoint: batches => journal.write(batches) })
  await save(update('latest'))
  expect(await save.flush()).toBe(false)
  expect(request).toHaveBeenCalledTimes(1)
  expect(recover).toHaveBeenCalledWith(cause)
  expect(journal.read(engine().doc)).toEqual([update('latest')])
})
it('rejects invalid stored commands without discarding the recovery record', () => {
  const journal = new WorkflowEditJournal('actor', 'wf', localStorage)
  const key = localStorage.key(0) ?? 'kickside.workflow-edits.v1:actor:wf'
  localStorage.setItem(key, '[[{"type":"unsupported","body":{}}]]')
  expect(() => journal.read(engine().doc)).toThrow(/invalid/i)
  expect(localStorage.getItem(key)).toContain('unsupported')
})
it('does not dispatch a write when its durable checkpoint cannot be stored', async () => {
  const cause = new Error('storage quota exceeded')
  const request = vi.fn(), recover = vi.fn(async () => {})
  const save = workflowEdits({ engine: engine(), request, recover, rebuild: vi.fn(), checkpoint: () => { throw cause } })
  await save(update('latest'))
  expect(request).not.toHaveBeenCalled()
  expect(recover).toHaveBeenCalledWith(cause)
  expect(await save.flush()).toBe(false)
  expect(save.pending).toBe(true)
})
it('removes the journal only after a successful response', async () => {
  const journal = new WorkflowEditJournal('actor', 'wf', localStorage)
  let ack!: (value: ApplyResult) => void
  const save = workflowEdits({ engine: engine(), request: () => new Promise<ApplyResult>(resolve => { ack = resolve }), rebuild: vi.fn(), recover: vi.fn(), checkpoint: batches => journal.write(batches) })
  const done = save(update('latest'))
  expect(journal.read(engine().doc)).toEqual([update('latest')])
  await Promise.resolve()
  ack({ events: [{ seq: 1, type: 'kickside.workflows.events:node.updated', body: update('latest')[0].body }], head_seq: 1, can_undo: true, can_redo: false })
  await done
  expect(localStorage.length).toBe(0)
})
it('does not replay an acknowledged add when later edits are already reflected in state', () => {
  const journal = new WorkflowEditJournal('actor', 'wf', localStorage)
  journal.write([[{ type: 'node.add', body: { id: 'n', kind: 'block', config: { text: 'first' } } }], update('latest')])
  expect(journal.read(engine('latest').doc)).toEqual([])
})
