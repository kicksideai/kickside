import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import KnowledgeMemory from './knowledge-memory.vue'

beforeEach(() => {
  ;(globalThis as any).__props__ = { config: {} }
  ;(globalThis as any).__events__ = []
})

describe('KnowledgeMemory', () => {
  it('mounts and renders the capability fields at defaults', async () => {
    const w = mount(KnowledgeMemory)
    await flushPromises()

    expect(w.exists()).toBe(true)
    expect(w.text()).toContain('Memory knowledge base')
    expect(w.text()).toContain('Inject memory on activation')
    expect((w.find('input[name=token_threshold]').element as HTMLInputElement).value).toBe('64000')

    w.unmount()
  })

  it('emits config-changed with the full { context, agent_options } byte-shape on a toggle', async () => {
    const w = mount(KnowledgeMemory)
    await flushPromises()

    await w.find('input[name=read_enabled]').setValue(false)
    await flushPromises()

    expect((globalThis as any).__events__).toContainEqual({
      name: 'config-changed',
      detail: {
        context: {
          kb_ids: [],
          read_enabled: false,
          write_enabled: true,
          checkpoint_model: 'class:fast',
          checkpoint_prompt: '',
          recall_prompt: '',
          recall_limit: 5,
          recall_max_chars: 4000,
        },
        agent_options: {
          checkpoint: { token_threshold: 64000, model: 'class:fast', max_tokens: 1000 },
        },
      },
    })

    w.unmount()
  })

  it('reads the nested config shape (context + agent_options.checkpoint) and preserves it on edit', async () => {
    ;(globalThis as any).__props__ = {
      config: {
        context: { kb_ids: ['kb-9'], read_enabled: false, checkpoint_model: 'class:smart' },
        agent_options: { checkpoint: { token_threshold: 128000, model: 'class:smart', max_tokens: 1000 } },
      },
    }
    const w = mount(KnowledgeMemory)
    await flushPromises()

    expect((w.find('input[name=token_threshold]').element as HTMLInputElement).value).toBe('128000')
    expect((w.find('input[name=read_enabled]').element as HTMLInputElement).checked).toBe(false)

    await w.find('input[name=write_enabled]').setValue(false)
    await flushPromises()

    expect((globalThis as any).__events__).toContainEqual({
      name: 'config-changed',
      detail: {
        context: {
          kb_ids: ['kb-9'],
          read_enabled: false,
          write_enabled: false,
          checkpoint_model: 'class:smart',
          checkpoint_prompt: '',
          recall_prompt: '',
          recall_limit: 5,
          recall_max_chars: 4000,
        },
        agent_options: {
          checkpoint: { token_threshold: 128000, model: 'class:smart', max_tokens: 1000 },
        },
      },
    })

    w.unmount()
  })
})
