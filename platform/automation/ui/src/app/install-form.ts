// The fallback install form: a type that contributes no create view is configured
// straight from its declared JSON-Schema inputs. Every rule here reads the
// declaration; none of it knows a single type by name.

import type { AutomationType, InputField } from './automation-types'

export function fieldsOf(t: AutomationType): Array<[string, InputField]> {
  const props = t.inputs?.properties || {}
  return Object.entries(props)
}

export function isRequired(t: AutomationType, key: string): boolean {
  return (t.inputs?.required || []).includes(key)
}

export function inputControlType(field: InputField): string {
  if (field.type === 'password' || field.format === 'password' || field.sensitive === true) return 'password'
  return 'text'
}

export function defaultsFor(t: AutomationType): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, field] of fieldsOf(t)) {
    if (field.default !== undefined) out[key] = field.default
    else if (field.type === 'boolean') out[key] = false
    else out[key] = ''
  }
  return out
}

export function validateInstall(t: AutomationType, form: Record<string, unknown>): string {
  for (const key of t.inputs?.required || []) {
    const v = form[key]
    if (v === '' || v === undefined || v === null) {
      const title = t.inputs?.properties?.[key]?.title || key
      return `${title} is required.`
    }
  }
  for (const [key, field] of fieldsOf(t)) {
    const value = form[key]
    if (value === '' || value === undefined) continue
    if (field.type !== 'object' && field.type !== 'array') continue
    let parsed = value
    if (typeof value === 'string') {
      try { parsed = JSON.parse(value) }
      catch { return `${field.title || key} must be a JSON ${field.type}.` }
    }
    if (field.type === 'array' ? !Array.isArray(parsed) : parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
      return `${field.title || key} must be a JSON ${field.type}.`
  }
  return ''
}

// Drop empty optional strings so the binding sees absent rather than "".
export function installInput(t: AutomationType, form: Record<string, unknown>): Record<string, unknown> {
  const input: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(form)) {
    if (value === '' && !isRequired(t, key)) continue
    const field = t.inputs?.properties?.[key]
    input[key] = (field?.type === 'object' || field?.type === 'array') && typeof value === 'string'
      ? JSON.parse(value) : value
  }
  return input
}

export function enumLabel(field: InputField, value: string): string {
  return field.enum_labels?.[value] || value
}

// PrimeVue Select options for an enum field: an optional leading blank entry (when
// the field isn't required) plus one { label, value } per declared enum value.
export function enumOptions(t: AutomationType, key: string, field: InputField): Array<{ label: string; value: string }> {
  const opts = (field.enum || []).map(opt => ({ label: enumLabel(field, opt), value: opt }))
  return isRequired(t, key) ? opts : [{ label: '—', value: '' }, ...opts]
}
