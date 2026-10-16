// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import type { WfDoc } from '../types'
import ConnectionEditorDialog from './ConnectionEditorDialog.vue'
import { buildConnectionEdgeOptions } from './connection-editor'

vi.mock('@iconify/vue', () => ({
  Icon: { template: '<span aria-hidden="true" />' },
}))

const sources = [
  { key: 'search-output', nodeId: 'search', handle: 'out-bottom', label: 'Search — Output' },
  { key: 'search-failed', nodeId: 'search', handle: 'failed', label: 'Search — Failed' },
  { key: 'notify-output', nodeId: 'notify', handle: 'out-bottom', label: 'Notify — Output' },
]
const targets = [
  { nodeId: 'search', label: 'Search' },
  { nodeId: 'notify', label: 'Notify' },
  { nodeId: 'finish', label: 'Finish' },
]
const edges = [
  { id: 'edge-1', label: 'Search — Output to Notify' },
]

function mountDialog(disabled = false) {
  return mount(ConnectionEditorDialog, {
    props: { sources, targets, edges, targetHandle: 'in-top', disabled },
    global: { stubs: { teleport: true } },
  })
}

describe('ConnectionEditorDialog', () => {
  it('moves focus to the source selector when the dialog opens', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const wrapper = mount(ConnectionEditorDialog, {
      attachTo: host,
      props: { sources, targets, edges, targetHandle: 'in-top' },
      global: { stubs: { teleport: true } },
    })

    try {
      await flushPromises()
      const source = wrapper.get('[role="combobox"]')
      expect(source.attributes('autofocus')).toBeDefined()
      ;(wrapper.findComponent(Dialog).vm as unknown as { onAfterEnter: () => void }).onAfterEnter()
      await flushPromises()
      expect(document.activeElement).toBe(source.element)
      expect(wrapper.findComponent(Dialog).props('closeOnEscape')).toBe(true)
    } finally {
      wrapper.unmount()
      host.remove()
    }
  })

  it('labels missing endpoints without exposing raw node ids', () => {
    const doc = {
      nodes: {
        branch: {
          id: 'branch',
          kind: 'branch',
          title: 'Branch',
        },
        finish: {
          id: 'finish',
          kind: 'finish',
          title: 'Finish',
        },
      },
      edges: {
        missingTarget: {
          id: 'missing-target',
          source_id: 'branch',
          target_id: '4bbf09ff-d469-489f-8463-8a9d299cbf2b',
        },
        missingSource: {
          id: 'missing-source',
          source_id: '339dbe1b-d22f-4be3-a97a-aeef34be88d5',
          target_id: 'finish',
        },
      },
    } as Pick<WfDoc, 'nodes' | 'edges'>

    const options = buildConnectionEdgeOptions(doc)

    expect(options).toEqual([
      {
        id: 'missing-target',
        label: 'Branch — Output to Missing destination step',
      },
      {
        id: 'missing-source',
        label: 'Missing source step — Output to Finish',
      },
    ])
    expect(options.map((option) => option.label).join(' ')).not.toMatch(
      /4bbf09ff|339dbe1b/,
    )
  })

  it('exposes required-field errors instead of emitting an incomplete connection', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    const create = wrapper.findAllComponents(Button).find((button) => button.text() === 'Create connection')!
    await create.trigger('click')

    const selects = wrapper.findAllComponents(Select)
    expect(wrapper.emitted('create')).toBeUndefined()
    expect(selects[0].props('invalid')).toBe(true)
    expect(selects[1].props('invalid')).toBe(true)
    expect(wrapper.findAll('[role="alert"]').map((alert) => alert.text())).toEqual([
      'Choose a source step and output.',
      'Choose a destination step.',
    ])
  })

  it('creates a connection with the selected handles and excludes the source from targets', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    const selects = wrapper.findAllComponents(Select)
    selects[0].vm.$emit('update:modelValue', 'search-output')
    await flushPromises()

    expect(selects[1].props('options')).toEqual([
      { nodeId: 'notify', label: 'Notify' },
      { nodeId: 'finish', label: 'Finish' },
    ])
    selects[1].vm.$emit('update:modelValue', 'notify')
    await flushPromises()
    await wrapper.findAllComponents(Button).find((button) => button.text() === 'Create connection')!.trigger('click')

    expect(wrapper.emitted('create')?.[0]).toEqual([{
      source: 'search',
      sourceHandle: 'out-bottom',
      target: 'notify',
      targetHandle: 'in-top',
    }])
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('provides a named keyboard-operable delete action for every connection', async () => {
    const wrapper = mountDialog()
    await flushPromises()
    const remove = wrapper.get('[aria-label="Delete Search — Output to Notify"]')
    expect(remove.element.tagName).toBe('BUTTON')
    await remove.trigger('click')
    expect(wrapper.emitted('remove')?.[0]).toEqual(['edge-1'])
  })

  it('disables all mutation actions while viewing a run', async () => {
    const wrapper = mountDialog(true)
    await flushPromises()
    expect(wrapper.get('[aria-label="Delete Search — Output to Notify"]').attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('button').find((button) => button.text() === 'Create connection')!.attributes('disabled')).toBeDefined()
  })
})
