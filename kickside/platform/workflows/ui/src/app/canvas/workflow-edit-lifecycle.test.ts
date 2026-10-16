// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { expect, it, vi } from 'vitest'
import { useWorkflowEditLifecycle, registerWorkflowWriter, finishPreviousWorkflowWriter } from './useWorkflowEditLifecycle'
import { workflowEdits } from './workflow-edits'
import { SyncEngine } from '../mapping/sync'
import type { ApplyResult } from '../types'

it('flushes on pagehide, hidden, and unmount, and waits for the previous writer on remount', async () => {
  let acknowledge!: (value: ApplyResult) => void
  const writer = workflowEdits({ engine: new SyncEngine(), request: () => new Promise<ApplyResult>(resolve => { acknowledge = resolve }), rebuild: vi.fn(), recover: vi.fn() })
  const flush = vi.spyOn(writer, 'flush')
  const wrapper = mount(defineComponent({ setup() {
    registerWorkflowWriter('lifecycle', writer)
    useWorkflowEditLifecycle(writer, () => 'lifecycle')
    return () => h('div')
  } }))
  void writer([{ type: 'node.update', body: { id: 'n', config: { prompt: 'latest' } } }])
  await Promise.resolve()
  window.dispatchEvent(new Event('pagehide'))
  expect(flush).toHaveBeenCalledTimes(1)
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
  document.dispatchEvent(new Event('visibilitychange'))
  expect(flush).toHaveBeenCalledTimes(2)
  wrapper.unmount()
  expect(flush).toHaveBeenCalledTimes(3)
  const resumed = vi.fn()
  const resume = finishPreviousWorkflowWriter('lifecycle').then(resumed)
  await Promise.resolve()
  expect(resumed).not.toHaveBeenCalled()
  acknowledge({ events: [], head_seq: 0, can_undo: false, can_redo: false })
  await resume
  expect(resumed).toHaveBeenCalledTimes(1)
  const count = flush.mock.calls.length
  window.dispatchEvent(new Event('pagehide'))
  expect(flush).toHaveBeenCalledTimes(count)
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
})
