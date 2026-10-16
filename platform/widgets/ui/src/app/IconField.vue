<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { loadByTagName } from '@wippy-fe/proxy'

// Canonical v-model wrapper around the shared <wc-icon-picker> widget, owned by
// the widgets module. Mounts the element by tag (the host loads the bundle), binds
// the current icon as `value`, and relays its `select` event back as v-model.
// fallback is the glyph shown on the trigger when no value is set.
const props = defineProps<{ modelValue: string; fallback?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const host = ref<HTMLElement | null>(null)
let el: HTMLElement | null = null
function onSelect(e: Event) { emit('update:modelValue', ((e as CustomEvent).detail as string) || '') }

async function mount() {
  if (!host.value) return
  if (el) el.removeEventListener('select', onSelect)
  host.value.innerHTML = ''
  try { if (!customElements.get('wc-icon-picker')) await loadByTagName('wc-icon-picker', { timeoutMs: 8000 }) } catch { /* inert */ }
  // The bundle load awaits; the component can unmount meanwhile and the host ref goes null.
  if (!host.value) return
  el = document.createElement('wc-icon-picker')
  el.setAttribute('value', props.modelValue || '')
  if (props.fallback) el.setAttribute('fallback', props.fallback)
  el.addEventListener('select', onSelect)
  host.value.appendChild(el)
}

onMounted(mount)
watch(() => props.modelValue, (v) => { if (el && el.getAttribute('value') !== v) el.setAttribute('value', v || '') })
onBeforeUnmount(() => { if (el) el.removeEventListener('select', onSelect) })
</script>

<template>
  <div ref="host" class="wc-iconfield"></div>
</template>
