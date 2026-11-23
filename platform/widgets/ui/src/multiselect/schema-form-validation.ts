// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { jsonEqual } from '../app/json-equal'

export interface SchemaField {
  type?: string
  title?: string
  description?: string
  enum?: Array<string | number | boolean | null>
  default?: unknown
  format?: string
  rows?: number
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
  items?: SchemaField
  group?: string
  required?: boolean
  picker?: string
  provider?: string
  class?: string
  source?: string
  value_field?: string
}

export interface SchemaFormValidity {
  valid: boolean
  errors: Record<string, string>
}

export function fieldError(field: SchemaField, value: unknown, required: boolean): string {
  if (value == null || (value === '' && required)) return required ? 'A value is required.' : ''
  if (field.enum) return field.enum.some(option => option === value) ? '' : 'Choose one of the available values.'

  switch (field.type) {
    case 'integer':
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value) || (field.type === 'integer' && !Number.isInteger(value))) {
        return field.type === 'integer' ? 'Enter a whole number.' : 'Enter a number.'
      }
      if (field.minimum !== undefined && value < field.minimum) return `Enter at least ${field.minimum}.`
      if (field.maximum !== undefined && value > field.maximum) return `Enter at most ${field.maximum}.`
      return ''
    case 'boolean':
      return typeof value === 'boolean' ? '' : 'Choose on or off.'
    case 'array':
      if (!Array.isArray(value)) return 'Enter a JSON array.'
      if (field.minItems !== undefined && value.length < field.minItems) return `Use at least ${field.minItems} entries.`
      if (field.maxItems !== undefined && value.length > field.maxItems) return `Use at most ${field.maxItems} entries.`
      if (field.uniqueItems && value.some((item, index) => value.slice(0, index).some(other => jsonEqual(item, other)))) {
        return 'Remove duplicate entries.'
      }
      if (field.items) {
        for (const [index, item] of value.entries()) {
          const message = fieldError(field.items, item, true)
          if (message) return `Entry ${index + 1}: ${message}`
        }
      }
      return ''
    case 'object':
      return typeof value === 'object' && !Array.isArray(value) ? '' : 'Enter a JSON object.'
  }

  if (typeof value !== 'string') return 'Enter text.'
  if (field.minLength !== undefined && value.length < field.minLength) return `Enter at least ${field.minLength} characters.`
  if (field.maxLength !== undefined && value.length > field.maxLength) return `Enter at most ${field.maxLength} characters.`
  if (field.pattern) {
    try { if (!new RegExp(field.pattern).test(value)) return 'Use the required format.' }
    catch { return 'The declared format is unavailable.' }
  }
  if (field.format === 'date' && value) {
    const date = new Date(value + 'T00:00:00Z')
    if (!Number.isFinite(date.getTime()) || date.toISOString().split('T')[0] !== value) return 'Enter a valid date.'
  }
  return ''
}
