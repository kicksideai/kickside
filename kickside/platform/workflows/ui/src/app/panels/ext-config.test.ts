import { describe, expect, it } from 'vitest'
import { primaryPicker, schemaFormFields } from '@widgets/app/ports'
import { configRowFromSchema } from './ext-config'

describe('extension config schema adapter', () => {
  it('preserves picker fields for their own web component and leaves the rest for schema-form', () => {
    const row = configRowFromSchema({
      type: 'object',
      required: ['agent_id', 'prompt'],
      properties: {
        agent_id: { type: 'string', title: 'Agent', picker: 'wc-agent-picker' },
        prompt: { type: 'string', title: 'Prompt', format: 'textarea' },
      },
    })

    expect(primaryPicker(row, 'test')).toEqual({
      key: 'agent_id',
      tag: 'wc-agent-picker',
      title: 'Agent',
      schema: {
        properties: {
          agent_id: { type: 'string', title: 'Agent', picker: 'wc-agent-picker', required: true },
        },
      },
      detail: '',
      deleteEndpoint: '',
    })
    expect(schemaFormFields(row, 'test')).toEqual({
      type: 'object',
      properties: {
        prompt: { type: 'string', title: 'Prompt', format: 'textarea', required: true },
      },
    })
  })
})
