// Shared port config-schema helpers. A port's `config_schema` is a FLAT field map
// ({ thread_id: { picker, title, ... } }); the single field that declares a picker
// drives instance selection (its picker web component renders the row, its key names
// where the chosen instance is stored), and every other field renders through the
// shared schema-form. One home for the convention — Data Sync, code execution, and
// the trigger config all read port config schemas through these helpers.

export interface IoFieldDef {
  picker?: string
  class?: string
  title?: string
  detail?: string
  delete_endpoint?: string
  required?: boolean
  [k: string]: unknown
}

export type IoSchema = Record<string, IoFieldDef> | undefined

export interface PortRowLike {
  config_schema?: IoSchema
}

export interface PrimaryPickerField {
  key: string
  tag: string
  threadClass?: string
  title: string
  schema: unknown
  detail: string
  deleteEndpoint: string
}

// One presentation row for the shared PickerSelect catalog control.
export interface PickerItem {
  id: string
  title: string
  icon?: string
  group?: string
  subtitle?: string
}

function isSelectorPicker(def: IoFieldDef | undefined): boolean {
  return !!(def && typeof def.picker === 'string' && def.picker && def.picker !== 'wc-schema-form')
}

export function ioFields(row: PortRowLike | null): IoSchema {
  return row?.config_schema as IoSchema
}

// The single picker field: its picker tag, storage key, and the optional
// field-declared surfaces (`detail` view tag for the selected instance, a
// `delete_endpoint` the picker uses to offer per-row deletion). The declared title is
// resolved here once so every consumer (gate label, picker prompt) reuses it. `logTag`
// names the consumer in misdeclaration logs.
export function primaryPicker(row: PortRowLike | null, logTag = 'ports'): PrimaryPickerField | null {
  const fields = ioFields(row)
  if (!fields) return null
  const pickerFields: Array<[string, IoFieldDef]> = []
  for (const [key, def] of Object.entries(fields)) {
    if (isSelectorPicker(def)) pickerFields.push([key, def])
  }
  if (pickerFields.length === 0) return null
  if (pickerFields.length > 1) {
    console.error(`${logTag}: port schema declares multiple picker fields`, pickerFields.map(([k]) => k))
  }
  const [key, def] = pickerFields[0]
  const threadClass = typeof def.class === 'string' ? def.class : ''
  const title = typeof def.title === 'string' ? def.title : ''
  const detail = typeof def.detail === 'string' ? def.detail : ''
  const deleteEndpoint = typeof def.delete_endpoint === 'string' ? def.delete_endpoint : ''
  // Wrapping into { properties } is only for handing the field to the
  // schema-form-shaped picker mount.
  return { key, tag: def.picker ?? '', threadClass, title, schema: { properties: { [key]: def } }, detail, deleteEndpoint }
}

// Every field except the declared primary, as a schema-form object schema.
export function schemaFormFields(row: PortRowLike | null, logTag = 'ports'): unknown | null {
  const fields = ioFields(row)
  if (!fields) return null
  const primaryKey = primaryPicker(row, logTag)?.key
  const props: Record<string, unknown> = {}
  for (const [key, def] of Object.entries(fields)) {
    if (key !== primaryKey) props[key] = def
  }
  return Object.keys(props).length ? { type: 'object', properties: props } : null
}

export function parseSchema(s: unknown): { properties?: Record<string, unknown>; required?: string[] } | null {
  if (!s) return null
  if (typeof s === 'string') { try { return JSON.parse(s) } catch { return null } }
  return s as { properties?: Record<string, unknown>; required?: string[] }
}

export function schemaHasProps(s: unknown): boolean {
  const p = parseSchema(s)
  return !!(p && p.properties && Object.keys(p.properties).length)
}
