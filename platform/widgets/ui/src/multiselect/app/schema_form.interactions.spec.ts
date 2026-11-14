import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import * as wcVue from '@wippy-fe/webcomponent-vue'
import SchemaForm from './SchemaForm.vue'

function mountWith(schema: unknown, config: Record<string, unknown> = {}) {
  ;(globalThis as any).__props__ = { schema, config }
  return mount(SchemaForm)
}

describe('SchemaForm normalization', () => {
  it('renders a textarea for multi-line fields (format: textarea)', () => {
    const w = mountWith({
      type: 'object',
      properties: {
        message: { type: 'text', format: 'textarea', title: 'Message', required: true, rows: 9, description: 'What the agent should do.' },
      },
    })
    expect(w.find('textarea').exists()).toBe(true)
    expect(w.find('textarea').attributes('rows')).toBe('9')
    // The description renders as a hint (and as the textarea placeholder).
    expect(w.find('.sf-hint').text()).toContain('What the agent should do.')
    expect(w.find('textarea').attributes('placeholder')).toContain('What the agent should do.')
  })

  it('renders advanced fields inside a collapsed advanced section', () => {
    const w = mountWith({
      type: 'object',
      properties: {
        message: { type: 'text', title: 'Message' },
        model: { type: 'text', title: 'Model', group: 'advanced' },
        temperature: { type: 'number', title: 'Temperature', group: 'advanced' },
      },
    })

    expect(w.find('label.sf-field .sf-lbl').text()).toContain('Message')
    const advanced = w.find('details.sf-advanced')
    expect(advanced.exists()).toBe(true)
    expect(advanced.attributes('open')).toBeUndefined()
    expect(advanced.find('summary').text()).toContain('Advanced')
    expect(advanced.text()).toContain('Model')
    expect(advanced.text()).toContain('Temperature')
  })

  it('marks a field required from the per-field flag, not only a top-level array', () => {
    const w = mountWith({ type: 'object', properties: { message: { type: 'text', required: true, title: 'Message' } } })
    expect(w.find('.sf-req').exists()).toBe(true)
  })

  it('renders a select for enum and a number input for integer', () => {
    const w = mountWith({
      type: 'object',
      properties: {
        priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], title: 'Priority' },
        max_iterations: { type: 'integer', title: 'Max iterations', default: 8 },
      },
    })
    expect(w.findAll('select')).toHaveLength(1)
    expect(w.findAll('option')).toHaveLength(4)
    expect(w.find('input[type="number"]').exists()).toBe(true)
  })

  it('projects required and numeric/string bounds from the declared schema', () => {
    const w = mountWith({
      type: 'object', required: ['prompt', 'timeout'], properties: {
        prompt: { type: 'string', title: 'Prompt', minLength: 3, maxLength: 200 },
        timeout: { type: 'integer', title: 'Timeout', minimum: 1, maximum: 86400 },
      },
    })
    const prompt = w.get('input[type="text"]')
    expect(prompt.attributes()).toMatchObject({ required: '', minlength: '3', maxlength: '200' })
    const timeout = w.get('input[type="number"]')
    expect(timeout.attributes()).toMatchObject({ required: '', min: '1', max: '86400', step: '1' })
  })

  it('falls back to a single-line input for a plain field', () => {
    const w = mountWith({ type: 'object', properties: { title: { type: 'string', title: 'Title' } } })
    expect(w.find('input[type="text"]').exists()).toBe(true)
    expect(w.find('textarea').exists()).toBe(false)
    expect(w.find('.sf-req').exists()).toBe(false)
  })

  it('renders object config with the shared structured JSON editor', () => {
    const w = mountWith({
      type: 'object',
      properties: { form: { type: 'object', title: 'Form schema', rows: 8 } },
    }, { form: { type: 'object', properties: { answer: { type: 'string' } } } })
    const editor = w.get('textarea.sf-structured')
    expect((editor.element as HTMLTextAreaElement).value).toContain('"answer"')
    expect((editor.element as HTMLTextAreaElement).value).not.toContain('[object Object]')
    expect(editor.attributes('rows')).toBe('8')
  })

  it('mounts a declared picker instead of rendering a raw identifier input', () => {
    const w = mountWith({
      type: 'object',
      properties: {
        flow_ref: {
          type: 'string', title: 'Workflow', picker: 'wc-component-picker', class: 'workflow',
          source: '/api/v1/workflows/published',
        },
      },
    }, { flow_ref: 'wf-1' })
    const picker = w.findComponent({ name: 'WcMount' })
    expect(picker.exists()).toBe(true)
    expect(picker.props('tag')).toBe('wc-component-picker')
    expect(picker.props('schema')).toEqual({ properties: { flow_ref: expect.objectContaining({ source: '/api/v1/workflows/published' }) } })
    expect(picker.props('config')).toEqual({ thread_id: 'wf-1' })
    expect(w.find('input[type="text"]').exists()).toBe(false)
  })

  it('passes provider-neutral connection metadata to a declared connection picker', () => {
    const w = mountWith({
      type: 'object',
      properties: {
        connection_id: {
          type: 'string',
          title: 'Provider connection',
          picker: 'kickside-connection-trait-picker',
          provider: 'provider-fixture',
        },
      },
    })
    const picker = w.findComponent({ name: 'WcMount' })
    expect(picker.props('tag')).toBe('kickside-connection-trait-picker')
    expect(picker.props('provider')).toBe('provider-fixture')
    // The label is the field's own title -- there is no separate connection-label
    // vocabulary for a picker to read.
    expect(picker.props('label')).toBe('Provider connection')
  })

  it('renders picker: wc-schema-form as a plain field, never a nested schema-form', () => {
    // A port field may declare picker: wc-schema-form to mean "the generic form
    // renders me" (ports.ts isSelectorPicker excludes it from primary-picker
    // selection). Mounting it as a picker would nest a schema-form inside a
    // schema-form with the same field, recursing without bound.
    const w = mountWith({
      type: 'object',
      properties: {
        source_label: {
          type: 'string', title: 'Source label', picker: 'wc-schema-form',
          description: 'Optional origin tag stored with each embedded item.',
        },
      },
    }, { source_label: 'crm' })
    expect(w.findComponent({ name: 'WcMount' }).exists()).toBe(false)
    const input = w.find('input[type="text"]')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('crm')
  })

})


it('retains successive edits before the host sends updated config props', () => {
  const emit = vi.fn()
  const events = vi.spyOn(wcVue, 'useEvents').mockReturnValue(emit)
  const wrapper = mountWith({ properties: { a: { type: 'string' }, b: { type: 'string' } } }, { a: '', b: '' })
  const inputs = wrapper.findAll('input')
  inputs[0].setValue('one')
  inputs[1].setValue('two')
  expect(emit).toHaveBeenLastCalledWith('config-changed', { a: 'one', b: 'two' })
  wrapper.unmount()
  events.mockRestore()
})


it('hands a structured catalog reference to the shared picker and preserves its returned value', () => {
  const emit = vi.fn()
  const events = vi.spyOn(wcVue, 'useEvents').mockReturnValue(emit)
  const ref = { kind: 'flow', id: 'wf-42', version: 3 }
  const wrapper = mountWith({ properties: { flow_ref: { type: 'object', picker: 'wc-component-picker', source: '/api/v1/workflows/published', value_field: 'flow_ref' } } }, { flow_ref: ref })
  const picker = wrapper.getComponent({ name: 'WcMount' })
  expect(picker.props('config')).toEqual({ flow_ref: ref })
  expect(wrapper.find('textarea').exists()).toBe(false)
  const next = { kind: 'flow', id: 'wf-next', version: 5 }
  picker.vm.$emit('change', { flow_ref: next })
  expect(emit).toHaveBeenCalledWith('config-changed', { flow_ref: next })
  wrapper.unmount()
  events.mockRestore()
})
