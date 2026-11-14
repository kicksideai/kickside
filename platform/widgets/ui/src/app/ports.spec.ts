import { describe, expect, it, vi } from 'vitest'
import { ioFields, parseSchema, primaryPicker, schemaFormFields, schemaHasProps } from './ports'

const webhookRow = {
  config_schema: {
    thread_id: {
      picker: 'wc-component-picker',
      required: true,
      title: 'Webhook',
      detail: 'kickside-webhook-detail',
      delete_endpoint: '/api/v1/webhooks',
    },
  },
}

const pollRow = {
  config_schema: {
    connection_id: { picker: 'wc-connection-picker', title: 'Connection' },
    content_scope: { type: 'string', title: 'Content scope', enum: ['summary', 'transcript'] },
  },
}

describe('ports.primaryPicker', () => {
  it('resolves the single picker field with its declared surfaces', () => {
    const p = primaryPicker(webhookRow)
    expect(p).toMatchObject({
      key: 'thread_id',
      tag: 'wc-component-picker',
      title: 'Webhook',
      detail: 'kickside-webhook-detail',
      deleteEndpoint: '/api/v1/webhooks',
    })
    expect(p?.schema).toEqual({ properties: { thread_id: webhookRow.config_schema.thread_id } })
  })

  it('returns null when no field declares a picker', () => {
    expect(primaryPicker({ config_schema: { note: { type: 'string' } } })).toBeNull()
  })

  it('takes the first picker field and logs when multiple are declared', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const p = primaryPicker({
      config_schema: {
        a: { picker: 'wc-a' },
        b: { picker: 'wc-b' },
      },
    }, 'spec')
    expect(p?.key).toBe('a')
    expect(err).toHaveBeenCalledWith('spec: port schema declares multiple picker fields', ['a', 'b'])
    err.mockRestore()
  })

  it('reads the port config schema', () => {
    expect(ioFields({ config_schema: pollRow.config_schema })).toEqual(pollRow.config_schema)
    expect(primaryPicker({ config_schema: pollRow.config_schema })?.key).toBe('connection_id')
  })
})

describe('ports.schemaFormFields', () => {
  it('yields every field except the primary as an object schema', () => {
    expect(schemaFormFields(pollRow)).toEqual({
      type: 'object',
      properties: { content_scope: pollRow.config_schema.content_scope },
    })
  })

  it('yields null when the primary is the only field', () => {
    expect(schemaFormFields(webhookRow)).toBeNull()
    expect(schemaFormFields(null)).toBeNull()
  })
})

describe('ports.parseSchema / schemaHasProps', () => {
  it('parses JSON strings and passes objects through', () => {
    expect(parseSchema('{"properties":{"a":{}}}')).toEqual({ properties: { a: {} } })
    expect(parseSchema('not json')).toBeNull()
    expect(schemaHasProps({ properties: { a: {} } })).toBe(true)
    expect(schemaHasProps({ properties: {} })).toBe(false)
    expect(schemaHasProps(undefined)).toBe(false)
  })
})
