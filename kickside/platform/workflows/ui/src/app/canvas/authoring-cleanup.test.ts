// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Dialog from 'primevue/dialog'

vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))
vi.mock('../panels/SchemaEditor.vue', () => ({ default: { template: '<div class="schema-editor-stub" />' } }))
vi.mock('./use-overlay-measure', async () => {
  const { ref } = await import('vue')
  return { useOverlayMeasure: () => ({ overlayEl: ref(null) }) }
})

const RunWithInputDialog = (await import('./RunWithInputDialog.vue')).default
const AutoMapReveal = (await import('./AutoMapReveal.vue')).default

describe('common workflow authoring cleanup', () => {
  it('does not show a JSON editor when a workflow takes no input', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const wrapper = mount(RunWithInputDialog, {
      attachTo: host,
      props: {
        schema: { type: 'object', properties: {} }, modelValue: {}, resetKey: 1,
        hasFields: false, valid: true, errorMessage: '', canRun: true,
      },
    })

    try {
      await flushPromises()
      expect(document.body.querySelector('.schema-editor-stub')).toBeNull()
      expect(document.body.querySelector('.wf-sim-note')?.textContent).toContain('needs no input')
    } finally {
      wrapper.unmount()
      host.remove()
    }
  })

  it('closes the run dialog through the PrimeVue Dialog visibility contract', async () => {
    const wrapper = mount(RunWithInputDialog, { props: {
      schema: { type: 'object', properties: {} }, modelValue: {}, resetKey: 1,
      hasFields: false, valid: true, errorMessage: '', canRun: true,
    }, global: { stubs: { teleport: true } } })
    await flushPromises()
    wrapper.getComponent(Dialog).vm.$emit('update:visible', false)
    await flushPromises()
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('opens an automatic mapping explanation through its PrimeVue button', async () => {
    const wrapper = mount(AutoMapReveal, { props: { entry: {
      id: 'edge-1', sourceId: 'start', targetId: 'search',
      result: { status: 'auto', transform: '{ query: output.query }', unresolved: [], fields: [
        {
          key: 'query', title: 'Query', expr: 'output.query', sourceName: 'query',
          sourceType: 'string', targetType: 'string', required: true,
          match: 'exact', typed: true, why: 'same name and type',
        },
      ] },
    } } })
    const card = wrapper.get('.wf-automap-card')
    expect(card.element.tagName).toBe('BUTTON')
    await card.trigger('click')
    expect(wrapper.emitted('open')?.[0]).toEqual(['edge-1'])
    expect(card.attributes('disabled')).toBeUndefined()
  })
})
