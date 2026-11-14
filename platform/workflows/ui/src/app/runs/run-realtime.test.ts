import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { isWorkflowRunUpdate } from './run-overlay'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))

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
    const canvas = readFileSync(resolve(HERE, '../canvas/canvas-run.ts'), 'utf8')
    const embed = readFileSync(resolve(HERE, '../embed/EmbedWorkflow.vue'), 'utf8')
    for (const source of [canvas, embed]) {
      expect(source).toContain('kickside.thread.')
      expect(source).not.toContain('setTimeout(')
      expect(source).not.toMatch(/\bpoll(?:Run)?\s*\(/)
    }
  })
})
