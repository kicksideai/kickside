// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Dialog from 'primevue/dialog'
import { ADD_TRIGGER_BODY, ADD_TRIGGER_PUBLISH_FIRST, ADD_TRIGGER_TITLE, AUTOMATION_MANAGER_TAG, canAddTrigger, automationManagerMount } from './add-trigger'

vi.mock('@iconify/vue', () => ({ Icon: { template: '<i />' } }))
const loadByTagName = vi.fn(async () => {})
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName }))
const AddTriggerPanel = (await import('./AddTriggerPanel.vue')).default
const mountPanel = () => mount(AddTriggerPanel, {
  props: { workflowId: 'wf-42', publishedVersion: 3 },
  global: { stubs: { teleport: true } },
})

describe('Workflow triggers panel', () => {
  beforeEach(() => {
    loadByTagName.mockReset()
    loadByTagName.mockResolvedValue(undefined)
  })

  it('uses plain language about the triggers already on this Workflow', () => {
    expect(ADD_TRIGGER_TITLE).toBe('Triggers')
    expect(ADD_TRIGGER_BODY).toBe('Automations that run this Workflow. Add one, or pause and edit the ones already here.')
    expect(ADD_TRIGGER_PUBLISH_FIRST).toBe('Publish this Workflow before adding a trigger')
  })

  it('requires an exact published revision, regardless of newer draft edits', () => {
    expect(canAddTrigger(0)).toBe(false)
    expect(canAddTrigger(Number.NaN)).toBe(false)
    expect(canAddTrigger(3)).toBe(true)
  })

  it('mounts the component-scoped Automation manager for this Workflow', () => {
    expect(automationManagerMount('wf-42', 3)).toEqual({
      tag: AUTOMATION_MANAGER_TAG,
      attrs: { 'component-id': 'wf-42', mode: 'component', input: JSON.stringify({ sink_port: 'kickside.workflows:run_sink', sink_config: { flow_ref: { kind: 'flow', id: 'wf-42', version: 3 } } }) },
    })
  })

  it('renders the manager scoped, parented, and destination-preselected to this Workflow', async () => {
    const wrapper = mountPanel()
    await flushPromises()
    expect(loadByTagName).toHaveBeenCalledWith(AUTOMATION_MANAGER_TAG, { timeoutMs: 8000 })
    expect(wrapper.text()).toContain(ADD_TRIGGER_TITLE)
    expect(wrapper.text()).toContain(ADD_TRIGGER_BODY)
    const manager = wrapper.find(AUTOMATION_MANAGER_TAG)
    expect(manager.exists()).toBe(true)
    expect(manager.element.parentElement?.classList.contains('wf-trigger-body')).toBe(true)
    // One value scopes the listed rows, parents what is created here, and
    // preselects this Workflow as the destination.
    expect(manager.attributes('component-id')).toBe('wf-42')
    expect(manager.attributes('mode')).toBe('component')
    const input = manager.attributes('input')
    if (!input) throw new Error('Destination input missing')
    expect(JSON.parse(input)).toEqual({ sink_port: 'kickside.workflows:run_sink', sink_config: { flow_ref: { kind: 'flow', id: 'wf-42', version: 3 } } })
    wrapper.unmount()
  })

  it('shows a directed failure instead of an empty modal when the registered component cannot load', async () => {
    loadByTagName.mockRejectedValueOnce(new Error('component tag not registered'))
    const wrapper = mountPanel()
    await flushPromises()

    expect(wrapper.find(AUTOMATION_MANAGER_TAG).exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').text()).toBe('Couldn’t load the triggers. Try again from Automations.')
    expect(wrapper.text()).not.toContain('Loading triggers…')
    wrapper.unmount()
  })

  it('closes through the PrimeVue Dialog visibility contract', async () => {
    const wrapper = mountPanel()
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    wrapper.getComponent(Dialog).vm.$emit('update:visible', false)
    await flushPromises()
    expect(wrapper.emitted('close')).toHaveLength(1)

    wrapper.unmount()
  })
})
