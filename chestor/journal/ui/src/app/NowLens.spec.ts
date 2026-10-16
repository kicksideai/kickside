import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import NowLens from './NowLens.vue'
import type { WorkControlState } from './types'

vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', render: () => h('i') } }))

const NOW = 1_800_000_000

const control: WorkControlState = {
  now: NOW,
  leases: [{
    lease_id: 'lease-write', agent_id: 'codex-root', task_id: 'live-task',
    task_title: 'Cut call dispatch ownership', task_status: 'in_progress',
    capability: 'WRITE', issued_at: NOW - 60, expires_at: NOW + 1200, remaining_s: 1200,
  }],
  resumable: [{
    task_id: 'resume-task', task_title: 'Domain wave', task_status: 'in_progress', task_updated_at: NOW - 600,
    next: { tool: 'ActOnJournal', verb: 'open_branch', task_id: 'resume-task' },
  }],
  counts: { active: 1, write: 1, planning: 0, resumable: 1 },
  limit: 100,
  has_more: false,
}

describe('current work authority', () => {
  it('separates a live lease from resumable unleased work', async () => {
    const wrapper = mount(NowLens, {
      props: {
        spans: [], tasks: [], events: [], now: NOW, workControl: control,
        spanCounts: { open: 0, sealed: 0, total: 0 },
        taskBound: { loaded: 0, total: 0, hasMore: false },
      },
    })

    expect(wrapper.text()).toContain('1 live · 1 resumable')
    expect(wrapper.text()).toContain('Cut call dispatch ownership')
    expect(wrapper.text()).toContain('Codex root · in_progress')
    expect(wrapper.text()).toContain('Domain wave')
    expect(wrapper.text()).toContain('No live lease · open this branch to continue in place')

    await wrapper.findAll('.jr-authority-row')[1].trigger('click')
    expect(wrapper.emitted('task')).toEqual([['resume-task']])
  })
})
