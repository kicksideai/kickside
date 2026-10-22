import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@wippy-fe/proxy'
import ModelPicker from './ModelPicker.vue'

let propsRef: any

describe('model picker discovery lifecycle', () => {
  beforeEach(() => {
    propsRef = (globalThis as any).__props_ref__
    expect(propsRef).toBeDefined()
    propsRef.value = { value: '', capability: 'generate' }
    vi.mocked(api.get).mockReset()
  })

  it('refreshes on open so models installed after mount appear', async () => {
    let listCall = 0
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes('/classes')) return { data: { success: true, classes: [] } }
      listCall += 1
      return {
        data: {
          success: true,
          models: listCall === 1
            ? [{ name: 'initial', title: 'Initial model' }]
            : [{ name: 'installed', title: 'Installed later' }],
        },
      }
    })

    const wrapper = mount(ModelPicker)
    await flushPromises()
    const select = wrapper.findComponent({ name: 'Select' })
    expect(select.props('options')).toEqual([
      expect.objectContaining({ group: 'Models', items: [expect.objectContaining({ value: 'initial' })] }),
    ])

    select.vm.$emit('before-show')
    await flushPromises()

    expect(select.props('options')).toEqual([
      expect.objectContaining({ group: 'Models', items: [expect.objectContaining({ value: 'installed' })] }),
    ])
    expect(listCall).toBe(2)
    wrapper.unmount()
  })

  it('clears incompatible data and reloads when capability changes', async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes('/classes')) {
        return { data: { success: true, classes: [{ name: 'fast', capability: 'generate', models: [] }] } }
      }
      if (url.includes('capability=embed')) {
        return { data: { success: true, models: [{ name: 'embed-1', title: 'Embed One' }] } }
      }
      return { data: { success: true, models: [{ name: 'chat-1', title: 'Chat One' }] } }
    })

    const wrapper = mount(ModelPicker)
    await flushPromises()
    const select = wrapper.findComponent({ name: 'Select' })
    expect(select.props('options')).toEqual([
      expect.objectContaining({ group: 'Classes', items: [expect.objectContaining({ value: 'class:fast' })] }),
      expect.objectContaining({ group: 'Models', items: [expect.objectContaining({ value: 'chat-1' })] }),
    ])

    propsRef.value = { value: '', capability: 'embed' }
    await flushPromises()

    expect(select.props('options')).toEqual([
      expect.objectContaining({ group: 'Models', items: [expect.objectContaining({ value: 'embed-1' })] }),
    ])
    expect(api.get).toHaveBeenCalledWith('/api/v1/models/list?capability=embed')
    wrapper.unmount()
  })

  it('lists classes only in classes mode, keeping name labels resolvable', async () => {
    propsRef.value = { value: 'chat-1', capability: 'generate', mode: 'classes' }
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes('/classes')) {
        return { data: { success: true, classes: [{ name: 'fast', capability: 'generate', models: [{ name: 'chat-1', title: 'Chat One' }] }] } }
      }
      return { data: { success: true, models: [{ name: 'chat-1', title: 'Chat One' }] } }
    })

    const wrapper = mount(ModelPicker)
    await flushPromises()
    const select = wrapper.findComponent({ name: 'Select' })
    expect(select.props('options')).toEqual([
      expect.objectContaining({ group: 'Classes', items: [expect.objectContaining({ value: 'class:fast' })] }),
    ])
    // A legacy stored model name still renders its human title while the panel
    // only offers portable class refs to pick.
    expect(wrapper.text()).toContain('Chat One')
    wrapper.unmount()
  })
})
