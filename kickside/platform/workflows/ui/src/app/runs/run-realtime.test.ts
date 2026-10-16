import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { isWorkflowRunUpdate } from './run-overlay'

describe('workflow run realtime', () => {
  it('accepts the canonical per-thread append notification for one workflow', () => {
    expect(isWorkflowRunUpdate({
      topic: 'kickside.thread.wf-1',
      type: 'event',
      thread_id: 'wf-1',
      event_type: 'events.appended',
    }, 'wf-1')).toBe(true)
    expect(isWorkflowRunUpdate({ thread_id: 'wf-2', event_type: 'events.appended' }, 'wf-1')).toBe(false)
    expect(isWorkflowRunUpdate({ thread_id: 'wf-1', event_type: 'projection.advanced' }, 'wf-1')).toBe(false)
  })

  it('keeps both run surfaces event-driven', () => {
    const canvas = readFileSync(new URL('../canvas/canvas-run.ts', import.meta.url), 'utf8')
    const embed = readFileSync(new URL('../embed/EmbedWorkflow.vue', import.meta.url), 'utf8')
    for (const source of [canvas, embed]) {
      expect(source).toContain('kickside.thread.')
      expect(source).not.toContain('setTimeout(')
      expect(source).not.toMatch(/\bpoll(?:Run)?\s*\(/)
    }
  })
})
