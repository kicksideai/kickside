import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { ComponentProps, MemoryConfig } from '../types'
import KnowledgeMemory from './knowledge-memory.vue'

declare global {
  var __props__: ComponentProps
  var __events__: { name: string; detail: MemoryConfig }[]
}

beforeEach(() => {
  globalThis.__props__ = { config: {} }
  globalThis.__events__ = []
})

describe('memory configuration decoding', () => {
  it('preserves nested JSON config and top-level precedence on edit', async () => {
    globalThis.__props__.config = JSON.stringify({
      context: { kb_ids: ['kb-1'], checkpoint_model: 'nested', recall_limit: 9 },
      checkpoint_model: 'flat',
      agent_options: { checkpoint: { model: 'option', token_threshold: 12000 } },
    })
    const wrapper = mount(KnowledgeMemory)
    await flushPromises()
    await wrapper.find('input[name=write_enabled]').setValue(false)
    expect(globalThis.__events__.slice(-1)[0]?.detail).toMatchObject({
      context: { kb_ids: ['kb-1'], checkpoint_model: 'flat', recall_limit: 9 },
      agent_options: { checkpoint: { model: 'flat', token_threshold: 12000 } },
    })
    wrapper.unmount()
  })

  it('uses safe defaults for invalid decoded fields', async () => {
    globalThis.__props__.config = JSON.stringify({
      context: { kb_ids: ['kb-1', 12], checkpoint_model: {}, recall_limit: 'invalid' },
      agent_options: { checkpoint: { token_threshold: {}, model: [] } },
    })
    const wrapper = mount(KnowledgeMemory)
    await flushPromises()
    await wrapper.find('input[name=write_enabled]').setValue(false)
    expect(globalThis.__events__.slice(-1)[0]?.detail).toMatchObject({
      context: { kb_ids: [], checkpoint_model: 'class:fast', recall_limit: 5 },
      agent_options: { checkpoint: { token_threshold: 64000 } },
    })
    wrapper.unmount()
  })

  it('keeps defaults for malformed JSON and non-object JSON', async () => {
    for (const config of ['{', 'null', '[]', '42']) {
      globalThis.__props__.config = config
      const wrapper = mount(KnowledgeMemory)
      await flushPromises()
      await wrapper.find('input[name=write_enabled]').setValue(false)
      expect(globalThis.__events__.slice(-1)[0]?.detail.context.kb_ids).toEqual([])
      expect(globalThis.__events__.slice(-1)[0]?.detail.agent_options.checkpoint.token_threshold).toBe(64000)
      wrapper.unmount()
    }
  })
})
