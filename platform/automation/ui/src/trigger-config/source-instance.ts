// A source declares which of its config fields names the instance to bind to (the
// role:primary picker) and what the rest of its options are. Every rule here reads
// that declaration; the editor never knows a source by name.

import { primaryPicker, schemaFormFields, schemaHasProps } from '@widgets/app/ports'
import type { GroupedSource } from './spec'

export const SCHEMA_FORM_TAG = 'wc-schema-form'
export const COMPONENT_PICKER_TAG = 'wc-component-picker'
const SURFACE = 'trigger-config'

export type PrimaryField = ReturnType<typeof primaryPicker>

export function primaryField(source: GroupedSource | null): PrimaryField {
  return source ? primaryPicker({ config_schema: source.fields }, SURFACE) : null
}

// The instance the stored config selects, empty when nothing is chosen yet.
export function instanceValue(primary: PrimaryField, config: Record<string, unknown>): string {
  const key = primary?.key || ''
  return key ? String(config[key] || '') : ''
}

export function optionsSchemaOf(source: GroupedSource | null) {
  return source ? schemaFormFields({ config_schema: source.fields }, SURFACE) : null
}

export function hasOptions(source: GroupedSource | null, primary: PrimaryField): boolean {
  return !!primary && schemaHasProps(optionsSchemaOf(source))
}

// The component picker reads its stored thread class from the picker field. A
// source's catalog class groups ports for presentation and does not identify the
// thread components that the field selects.
export function pickerMetaOf(source: { class?: string; component?: unknown } | null, primary: PrimaryField) {
  if (primary?.tag !== COMPONENT_PICKER_TAG) return undefined
  const cls = primary.threadClass
  if (!cls) return undefined
  return {
    type: 'thread',
    thread_class: cls,
    title: primary?.title ?? '',
    component: source?.component,
    delete_endpoint: primary?.deleteEndpoint || '',
  }
}
