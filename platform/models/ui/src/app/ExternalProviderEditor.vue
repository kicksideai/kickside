<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { loadByTagName } from '@wippy-fe/proxy'
import type { Adapter, Preset, Profile, TestState } from '../types.ts'

const props = defineProps<{
  tag: string
  mode: 'create' | 'edit'
  adapter?: Adapter
  preset?: Preset
  profile?: Profile | null
  saving?: boolean
  testState?: TestState
}>()
const emit = defineEmits<{
  save: [payload: Record<string, unknown>]
  cancel: []
  test: []
}>()

const host = ref<HTMLElement | null>(null)
const loading = ref(false)
const error = ref('')
let element: HTMLElement | null = null
let generation = 0

function relaySave(event: Event) { emit('save', (event as CustomEvent).detail || {}) }
function relayCancel() { emit('cancel') }
function relayTest() { emit('test') }

function unmount() {
  if (!element) return
  element.removeEventListener('save', relaySave)
  element.removeEventListener('cancel', relayCancel)
  element.removeEventListener('test', relayTest)
  element.remove()
  element = null
}

function assignProperties() {
  if (!element) return
  Object.assign(element, {
    mode: props.mode,
    adapter: props.adapter,
    preset: props.preset,
    profile: props.profile,
    saving: props.saving === true,
    testState: props.testState,
  })
}

async function mount() {
  const current = ++generation
  unmount()
  error.value = ''
  if (!host.value || !props.tag) return
  loading.value = true
  try {
    await loadByTagName(props.tag, { timeoutMs: 8000 })
    if (current !== generation || !host.value) return
    const next = document.createElement(props.tag)
    next.addEventListener('save', relaySave)
    next.addEventListener('cancel', relayCancel)
    next.addEventListener('test', relayTest)
    element = next
    assignProperties()
    host.value.replaceChildren(next)
  } catch (cause) {
    if (current === generation) error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    if (current === generation) loading.value = false
  }
}

onMounted(mount)
watch(() => props.tag, mount)
watch(() => [props.mode, props.adapter, props.preset, props.profile, props.saving, props.testState], assignProperties)
onBeforeUnmount(() => { generation++; unmount() })
</script>

<template>
  <div class="km-external-editor">
    <div v-if="loading" class="km-empty">Loading provider editor…</div>
    <div v-if="error" class="km-test-result fail">
      <span>Provider editor failed to load: {{ error }}</span>
      <button type="button" class="km-adv-toggle" @click="mount">Retry</button>
    </div>
    <div ref="host" v-show="!loading && !error" />
  </div>
</template>
