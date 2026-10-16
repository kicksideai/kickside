import { computed, ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { errMsg } from '@widgets/app/errMsg'
import { parseSchema, primaryPicker, schemaFormFields, schemaHasProps, type PickerItem } from '@widgets/app/ports'
import { buildSyncInput, type SinkRow, type SyncInput, type SyncTransform } from './syncInput'

// The Data Sync pipeline form state shared by the create view and the manage
// view: Source (the embedded trigger editor's spec), Transform, Destination and
// the reconciliation opt-in, with the catalog the stages read and the one
// validation gate. In a managed (installed) sync the destination and the
// reconcile declaration belong to the installed automation and stay locked.

// A source is a collection or events port descriptor. The trigger WC owns picking
// and configuring it; this form only reads the catalog rows back by the spec's
// port id for the UI hints that live OUTSIDE the trigger: output_schema (the
// transform assist's input shape) and the reconcile capability block.
export interface SourceRow {
  id: string
  binding?: string
  surface?: string
  class?: string
  title?: string
  name?: string
  icon?: string
  description?: string
  provider?: string
  group?: string
  output_schema?: unknown
  reconcile?: { pull_keys?: string }
}

const COMPONENT_PICKER_TAG = 'wc-component-picker'
const SCHEMA_FORM_TAG = 'wc-schema-form'
export const LOCKED_HINT = 'Locked after install — reinstall the data sync to change it.'

export function useSyncForm(options: { managed: boolean }) {
  const managed = options.managed
  const title = ref('')
  const sinkId = ref('')
  const sinkConfig = ref<Record<string, unknown>>({})
  const reconcileEnabled = ref(false)
  // A new sync starts running; a managed one keeps its live state.
  const enabled = ref(true)

  // The Trigger Spec v2 draft the embedded WC reports, with its validity and the
  // human gate message. The WC is the single owner of the spec's content; this
  // form only carries it into the declaration.
  const triggerSpec = ref<Record<string, unknown>>({ v: 2 })
  const triggerValid = ref(false)
  const triggerError = ref('')
  // The selected source's item shape, reported alongside the spec. It rides the
  // input as output_schema, where it becomes the "Data Sync Finished" port's face.
  const triggerOutputSchema = ref<unknown>(undefined)
  // The stored spec handed to the trigger editor on open; set once from the
  // loaded declaration so the WC's own edits are never fed back to it.
  const triggerSeed = ref<Record<string, unknown> | string>('')

  // Null until the builder confirms one, so the assist defaults to Auto (not Pass
  // through) on first open.
  const transform = ref<SyncTransform | null>(null)

  const sources = ref<SourceRow[]>([])
  const sinks = ref<SinkRow[]>([])

  const sourceBinding = computed(() => {
    const s = triggerSpec.value.source
    return typeof s === 'string' ? s : ''
  })
  const sourceRows = computed(() => sources.value.filter(s => s.id === sourceBinding.value))
  const selectedSource = computed(() => sourceRows.value[0] || null)
  const selectedSink = computed(() => sinks.value.find(s => s.id === sinkId.value) || null)

  // A source switch resets the reconcile choice while creating, because the
  // capability belongs to the selected source.
  function onSourceChange() {
    if (managed) return
    reconcileEnabled.value = false
  }
  function onSinkChange() {
    sinkConfig.value = {}
    reconcileEnabled.value = false
  }

  function onTriggerChange(detail: unknown) {
    const d = (detail ?? {}) as { spec?: unknown; valid?: unknown; error?: unknown; output_schema?: unknown }
    if (!d.spec || typeof d.spec !== 'object' || Array.isArray(d.spec)) return
    const prevBinding = sourceBinding.value
    triggerSpec.value = { ...(d.spec as Record<string, unknown>) }
    triggerValid.value = d.valid === true
    triggerError.value = typeof d.error === 'string' ? d.error : ''
    if (d.output_schema !== undefined) triggerOutputSchema.value = d.output_schema
    if (sourceBinding.value !== prevBinding) onSourceChange()
  }

  // Reconcile is only meaningful for a pulled source whose key set can be
  // enumerated: the source declares reconcile.pull_keys and the destination
  // declares delete.
  const sourceReconcile = computed(() => {
    for (const row of sourceRows.value) {
      const rec = row.reconcile
      if (rec && typeof rec.pull_keys === 'string' && rec.pull_keys) return rec
    }
    return null
  })
  const supportsReconcile = computed(() => {
    if (!sourceReconcile.value || !selectedSink.value) return false
    if (!sourceRows.value.some(r => r.surface === 'collection')) return false
    const ops = selectedSink.value.operations || {}
    return !!ops.delete
  })

  const sinkItems = computed<PickerItem[]>(() => sinks.value.map(s => ({
    id: s.id, title: s.title || s.name || s.id, icon: s.icon || 'tabler:database',
    group: s.group || 'Destinations', subtitle: s.description,
  })))

  const sinkPrimary = computed(() => primaryPicker(selectedSink.value, 'SyncForm'))
  // The sink's primary picker scopes the same way the trigger WC's instance picker
  // does: when it is the generic component picker, its listing is scoped to the
  // consuming class via { type, thread_class }.
  const sinkPickerMeta = computed(() => {
    if (sinkPrimary.value?.tag !== COMPONENT_PICKER_TAG) return undefined
    const cls = String(selectedSink.value?.class || '')
    if (!cls) return undefined
    return { type: 'thread', thread_class: cls, title: sinkPrimary.value?.title ?? '', component: selectedSink.value?.component, delete_endpoint: sinkPrimary.value?.deleteEndpoint || '' }
  })
  const sinkConfigTag = computed(() => sinkPrimary.value?.tag || SCHEMA_FORM_TAG)
  // Every field besides the declared picker, as a schema-form object schema. With a
  // picker they render as Options beside it; without one they are the whole form.
  const sinkOptionsSchema = computed(() => schemaFormFields(selectedSink.value, 'SyncForm'))
  const sinkConfigSchema = computed(() => sinkPrimary.value?.schema ?? sinkOptionsSchema.value)
  const sinkHasOptions = computed(() => !!sinkPrimary.value && schemaHasProps(sinkOptionsSchema.value))
  const sinkConfigured = computed(() => {
    if (!selectedSink.value) return false
    if (sinkPrimary.value) return Object.keys(sinkConfig.value).length > 0
    return true
  })

  // Transform auto-detect: does the source's output_schema already satisfy the
  // destination's write input? Drives the hint shown under the Transform stage.
  const sourceItemSchema = computed(() => {
    for (const row of sourceRows.value) {
      if (row.output_schema != null) return parseSchema(row.output_schema)
    }
    return null
  })
  // A sink endpoint's write input is always { content } unless the sink declares
  // a richer input_schema.
  const assistSinkSchemaObj = computed<{ properties?: Record<string, unknown>; required?: string[] } | null>(() =>
    parseSchema(selectedSink.value?.input_schema)
    ?? (selectedSink.value ? { properties: { content: { type: 'string' } }, required: ['content'] } : null))
  const transformDetected = computed<{ needed: boolean; reason: string } | null>(() => {
    if (!sourceBinding.value || !selectedSink.value) return null
    const inp = assistSinkSchemaObj.value
    if (!inp || !inp.properties) return { needed: false, reason: 'Destination accepts the item as-is — no transform needed.' }
    // Only the fields the destination declares required must reach it: from the
    // item, or from a destination config field declaring it `supplies` them.
    const itemKeys = new Set(Object.keys(sourceItemSchema.value?.properties || {}))
    const supplied = new Set<string>()
    const suppliers = new Map<string, string>()
    const fields = (selectedSink.value?.config_schema || {}) as Record<string, unknown>
    for (const [key, field] of Object.entries(fields)) {
      const def = (field || {}) as { supplies?: unknown; title?: unknown }
      if (typeof def.supplies !== 'string') continue
      suppliers.set(def.supplies, typeof def.title === 'string' && def.title ? def.title : key)
      const value = sinkConfig.value[key]
      if (value !== undefined && value !== null && value !== '') supplied.add(def.supplies)
    }
    const missing = (inp.required || []).filter(k => !itemKeys.has(k) && !supplied.has(k))
    if (missing.length === 0) return { needed: false, reason: 'Fields line up — pass through works.' }
    // A managed sync's destination is locked, so only a create form offers its fields.
    const fillable = managed ? [] : missing.map(k => suppliers.get(k)).filter((t): t is string => !!t)
    const fill = fillable.length ? `, or fill ${fillable.join(', ')} below` : ''
    return { needed: true, reason: `Destination needs ${missing.join(', ')}, not in the source — map it with an Expression or LLM${fill}.` }
  })

  // The assist negotiates a mapping from the real source output_schema to the
  // sink's write input; custom-element attributes are strings, so the schemas are
  // handed over as JSON.
  const canAssist = computed(() => !!sourceBinding.value && !!selectedSink.value)
  const assistSourceSchema = computed(() => JSON.stringify(sourceItemSchema.value ?? {}))
  const assistSinkSchema = computed(() => JSON.stringify(assistSinkSchemaObj.value ?? {}))
  // The shape the assist validates each output into: the sink's declared input shape.
  const assistInputShape = computed(() => selectedSink.value?.input_shape ?? '')
  const assistHint = computed(() => {
    if (!canAssist.value) return ''
    const s = selectedSource.value?.title || selectedSource.value?.name || 'source'
    const d = selectedSink.value?.title || selectedSink.value?.name || 'destination'
    return `Map ${s} items into ${d} input.`
  })
  const assistValue = computed(() => (transform.value ? JSON.stringify(transform.value) : ''))
  function onAssistConfirmed(e: Event) {
    const t = (e as CustomEvent).detail?.transform as SyncTransform | undefined
    if (t && typeof t.kind === 'string') transform.value = t
  }

  const validationError = computed(() => {
    if (!title.value.trim()) return 'Name is required.'
    // The trigger WC validates the whole source/instance/cadence/history section
    // with the same rules the platform resolver applies.
    if (!triggerValid.value) return triggerError.value || 'Source is required.'
    if (!sinkId.value) return 'Destination is required.'
    if (!sinkConfigured.value) return 'Destination configuration is required.'
    const t = transform.value
    if (!t) return 'Transform selection is required.'
    if (t.kind === 'expr' && !t.expr.trim()) return 'Expression is required.'
    if (t.kind === 'llm' && !t.prompt.trim()) return 'Prompt is required.'
    if (t.kind === 'code' && !t.code.trim()) return 'Code is required.'
    return ''
  })

  // The catalogs both ends are picked from.
  async function loadCatalog(): Promise<string> {
    try {
      const [sRes, kRes] = await Promise.all([
        api.get<{ sources?: SourceRow[] }>('/api/v1/automations/sources'),
        api.get<{ sinks?: SinkRow[] }>('/api/v1/automations/sinks'),
      ])
      sources.value = sRes.data?.sources || []
      sinks.value = kRes.data?.sinks || []
      if (!managed && sinks.value.length === 1) sinkId.value = sinks.value[0].id
      return ''
    } catch (e) {
      return errMsg(e, 'failed to load catalog')
    }
  }

  // Seed every stage from an installed sync's stored declaration.
  function seed(stored: SyncInput) {
    title.value = stored.title
    triggerSeed.value = stored.trigger
    triggerSpec.value = stored.trigger
    triggerOutputSchema.value = stored.output_schema
    transform.value = stored.transform
    sinkId.value = stored.sink_port
    sinkConfig.value = stored.sink_config
    reconcileEnabled.value = stored.reconcile != null
    enabled.value = stored.enabled
  }

  function currentInput(): SyncInput {
    return buildSyncInput({
      // The trigger spec rides verbatim as input.trigger: the trigger service
      // validates and normalizes it server-side.
      title: title.value,
      trigger: triggerSpec.value,
      sinkPort: sinkId.value,
      sinkConfig: sinkConfig.value,
      transform: transform.value,
      outputSchema: triggerOutputSchema.value,
      reconcile: (managed ? reconcileEnabled.value : supportsReconcile.value && reconcileEnabled.value) ? true : undefined,
      enabled: enabled.value,
    })
  }

  return {
    managed,
    title, sinkId, sinkConfig, reconcileEnabled, triggerSeed, transform,
    sources, sinks, selectedSource, selectedSink, supportsReconcile,
    sinkItems, sinkPickerMeta, sinkConfigTag, sinkConfigSchema, sinkOptionsSchema, sinkHasOptions,
    transformDetected, canAssist, assistSourceSchema, assistSinkSchema, assistInputShape, assistHint, assistValue,
    validationError,
    onTriggerChange, onAssistConfirmed, onSinkChange, loadCatalog, seed, currentInput,
  }
}

export type SyncForm = ReturnType<typeof useSyncForm>
