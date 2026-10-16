// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', props: ['icon'], template: '<i :data-icon="icon" />' } }))
vi.mock('@widgets/app/WcMount.vue', () => ({ default: { name: 'WcMount', template: '<div />' } }))
const assistSchema = vi.hoisted(() => vi.fn())
const defaultDraft = () => ({
    schema: { type: 'object', properties: { email: { type: 'string' } }, required: ['email'] },
    notes: 'Added the required email field.',
  })
vi.mock('./assist-schema', () => ({
  assistSchema,
  isSchemaAssistOk: (value: unknown) => !!value && typeof value === 'object' && 'schema' in value,
}))

const SchemaEditor = (await import('./SchemaEditor.vue')).default

describe('SchemaEditor assist result', () => {
  beforeEach(() => assistSchema.mockReset().mockResolvedValue(defaultDraft()))
  it('renders the transient result as an alert with a separate, ordered action row', async () => {
    const wrapper = mount(SchemaEditor, {
      props: { modelValue: { type: 'object', properties: {} }, surface: 'workflow.start.input_schema' },
    })

    await wrapper.get('.wf-sed-intent').setValue('a lead with a required email')
    await wrapper.get('.wf-sed-go').trigger('click')
    await flushPromises()

    const result = wrapper.get('.wf-sed-draft')
    expect(result.text()).toContain('Added the required email field.')
    expect(result.attributes('role')).toBe('status')
    expect(result.get('.wf-sed-draft-copy').text()).toContain('Added the required email field.')
    const actions = result.get('.wf-sed-draft-actions')
    const buttons = actions.findAll('button')
    expect(buttons.map((button) => button.text())).toEqual(['Undo', 'Accept'])
    expect(buttons[0].classes()).toContain('wf-sed-undo')
    expect(buttons[1].classes()).toContain('wf-sed-accept')
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('removes the result state when the draft is accepted', async () => {
    const wrapper = mount(SchemaEditor, { props: { modelValue: { type: 'object', properties: {} } } })
    await wrapper.get('.wf-sed-intent').setValue('a lead with an email')
    await wrapper.get('.wf-sed-go').trigger('click')
    await flushPromises()
    await wrapper.get('.wf-sed-accept').trigger('click')
    expect(wrapper.find('.wf-sed-draft').exists()).toBe(false)
    const changes = wrapper.emitted('change') ?? []
    expect(changes[changes.length - 1]?.[0]).toEqual({
      type: 'object', properties: { email: { type: 'string' } }, required: ['email'],
    })
  })

  it('undoes a provisional draft without ever writing the rejected schema', async () => {
    const original = { type: 'object', properties: { id: { type: 'string' } } }
    const wrapper = mount(SchemaEditor, { props: { modelValue: original } })
    await wrapper.get('.wf-sed-intent').setValue('replace it with email')
    await wrapper.get('.wf-sed-go').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.get('.wf-sed-undo').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    expect((wrapper.get('.wf-sed-code').element as HTMLTextAreaElement).value).toContain('"id"')
  })

  it('does not apply an old assist result after the host switches schema identity', async () => {
    let resolveAssist!: (value: ReturnType<typeof defaultDraft>) => void
    assistSchema.mockImplementationOnce(() => new Promise((resolve) => { resolveAssist = resolve }))
    const wrapper = mount(SchemaEditor, {
      props: { resetKey: 'start-a', modelValue: { type: 'object', properties: { first: { type: 'string' } } } },
    })
    await wrapper.get('.wf-sed-intent').setValue('replace with email')
    await wrapper.get('.wf-sed-go').trigger('click')
    await wrapper.setProps({
      resetKey: 'start-b',
      modelValue: { type: 'object', properties: { second: { type: 'string' } } },
    })
    resolveAssist(defaultDraft())
    await flushPromises()

    expect(wrapper.find('.wf-sed-draft').exists()).toBe(false)
    expect((wrapper.get('.wf-sed-code').element as HTMLTextAreaElement).value).toContain('"second"')
    expect(wrapper.emitted('change')).toBeUndefined()
  })
})
