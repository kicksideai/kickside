<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { loadByTagName } from '@wippy-fe/proxy'

// The single bridge that mounts a registry-declared config web component by tag, so a
// source/sink/trait/manage component contributes its own panel into a host form. The
// element receives config/schema/meta as JSON attributes plus provider/label and
// reports edits through one `change` emit, forwarding both the `config-changed`
// (pickers, schema form) and `change` (value-convention pickers) conventions.
// Each prop writes to exactly one attribute of the same name; a target whose surface
// is `value` rather than `config` (a value-convention picker) takes it through the
// `attrs` passthrough, not through the `config` prop.
// Remounts only when the tag changes; every other prop re-sets its attribute in place
// on the live element (attributeChangedCallback propagates), so config/schema/meta
// edits never destroy the element's own internal state.
const props = defineProps<{
  tag: string
  config?: unknown
  schema?: unknown
  meta?: unknown
  provider?: string
  label?: string
  // Generic attribute passthrough for elements whose surface is attribute-shaped
  // (schedule-type, disabled, ...) rather than config/schema-shaped. Values are
  // stringified per the serialize rule; a nullish value removes the attribute.
  attrs?: Record<string, unknown>
}>()
// `change` forwards config edits; `created`/`close`/`error` forward the mounted
// view's lifecycle contract (a create form reports the new instance, a manage view
// its dismissal or failure) so a host reacts without reaching into the element.
const emit = defineEmits<{
  (e: 'change', value: unknown): void
  (e: 'created', value: unknown): void
  (e: 'close', value: unknown): void
  (e: 'error', value: unknown): void
}>()

const host = ref<HTMLElement | null>(null)
const failed = ref(false)
let el: HTMLElement | null = null
let mountGeneration = 0
// Attribute names applied through `attrs`, so a key dropped from the prop is
// removed from the live element instead of lingering.
const appliedAttrs = new Set<string>()

function onChange(e: Event) {
  // Only the mounted element's own report is its config contract; a nested
  // picker's bubbling `change` carries that picker's payload, not the host's.
  if (e.composedPath()[0] !== el) return
  // The report is consumed here. Shadow boundaries retarget a bubbling event
  // to each host, so letting it continue would replay it into every ancestor
  // mount as that ancestor's own report.
  e.stopPropagation()
  emit('change', (e as CustomEvent).detail)
}
// A lifecycle event is the mounted element's own report, consumed here: bubbling
// on, it would reach every ancestor host as that host's own created/close/error.
function consumed(e: Event): boolean {
  if (e.composedPath()[0] !== el) return false
  e.stopPropagation()
  return true
}
function onCreated(e: Event) {
  if (consumed(e)) emit('created', (e as CustomEvent).detail)
}
function onClose(e: Event) {
  if (consumed(e)) emit('close', (e as CustomEvent).detail)
}
function onError(e: Event) {
  if (consumed(e)) emit('error', (e as CustomEvent).detail)
}

// String values pass through; everything else is JSON. Returns null when a value
// cannot serialize, so the attribute is skipped.
function serialize(value: unknown): string | null {
  if (typeof value === 'string') return value
  try { return JSON.stringify(value ?? {}) } catch { return null }
}

// Push the current props onto the live element's attributes, one prop per attribute
// of the same name.
function applyAttrs() {
  if (!el) return
  const cfg = serialize(props.config)
  if (cfg !== null) el.setAttribute('config', cfg)
  if (props.schema !== undefined && props.schema !== null) {
    const s = serialize(props.schema); if (s !== null) el.setAttribute('schema', s)
  }
  if (props.meta !== undefined && props.meta !== null) {
    const m = serialize(props.meta); if (m !== null) el.setAttribute('meta', m)
  }
  if (props.provider) el.setAttribute('provider', props.provider)
  if (props.label) el.setAttribute('label', props.label)
  const next = props.attrs || {}
  for (const k of [...appliedAttrs]) {
    if (!(k in next) || next[k] == null) { el.removeAttribute(k); appliedAttrs.delete(k) }
  }
  for (const [k, v] of Object.entries(next)) {
    if (v == null) continue
    const s = typeof v === 'object' ? serialize(v) : String(v)
    if (s !== null) { el.setAttribute(k, s); appliedAttrs.add(k) }
  }
}

function detach(target: HTMLElement | null = el) {
  if (!target) return
  target.removeEventListener('config-changed', onChange)
  target.removeEventListener('change', onChange)
  target.removeEventListener('created', onCreated)
  target.removeEventListener('close', onClose)
  target.removeEventListener('error', onError)
  if (target === el) el = null
  appliedAttrs.clear()
}

async function ensureRegistered(tag: string) {
  if (customElements.get(tag)) return
  try { await loadByTagName(tag, { timeoutMs: 8000 }) } catch { /* createElement yields an inert element if undefined */ }
}

async function mount() {
  const generation = ++mountGeneration
  const targetHost = host.value
  const targetTag = props.tag
  failed.value = false
  if (!targetHost) return
  detach()
  targetHost.innerHTML = ''
  if (!targetTag) return
  try {
    await ensureRegistered(targetTag)
    // Dynamic registration can outlive a node selection or this component. Never let a
    // stale load append into the next config surface or overwrite its listener owner.
    if (generation !== mountGeneration || host.value !== targetHost || props.tag !== targetTag) return
    const nextEl = document.createElement(targetTag)
    nextEl.classList.add('kx-wcmount-surface')
    el = nextEl
    applyAttrs()
    nextEl.addEventListener('config-changed', onChange)
    nextEl.addEventListener('change', onChange)
    nextEl.addEventListener('created', onCreated)
    nextEl.addEventListener('close', onClose)
    nextEl.addEventListener('error', onError)
    nextEl.style.display = 'block'
    targetHost.appendChild(nextEl)
    failed.value = !customElements.get(targetTag)
  } catch {
    if (generation === mountGeneration) failed.value = true
  }
}

async function retry() {
  failed.value = false
  await nextTick()
  await mount()
}

onMounted(mount)
// Remount only on tag change; every other prop re-sets its attribute in place.
watch(() => props.tag, mount)
watch(() => [props.config, props.schema, props.meta, props.provider, props.label, props.attrs], applyAttrs, { deep: true })
onBeforeUnmount(() => { mountGeneration += 1; detach() })
</script>

<template>
  <div class="kx-wcmount">
    <div v-if="failed" class="kx-wcmount-fail" role="alert">
      <span>This setup panel couldn’t load.</span>
      <button type="button" @click="retry">Try again</button>
    </div>
    <div v-else ref="host"></div>
  </div>
</template>

<style scoped>
.kx-wcmount {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: clip;
  --p-border-radius: var(--wf-radius-sm, 8px);
  --p-content-border-radius: var(--wf-radius-sm, 8px);
}
.kx-wcmount :deep(.kx-wcmount-surface) {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  color: inherit;
}
.kx-wcmount-fail {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  font-size: 12px; color: var(--p-danger-600, var(--p-danger-500));
  padding: 9px 10px; border: 1px solid color-mix(in srgb, var(--p-danger-500) 32%, transparent);
  border-radius: 10px; background: color-mix(in srgb, var(--p-danger-500) 7%, transparent);
}
.kx-wcmount-fail > span { min-width: 0; flex: 1; }
.kx-wcmount-fail button {
  border: 1px solid currentColor; border-radius: 8px; padding: 5px 9px;
  background: transparent; color: inherit; font: inherit; font-weight: 600; cursor: pointer;
}
</style>
