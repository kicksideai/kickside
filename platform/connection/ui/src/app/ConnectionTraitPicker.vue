<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { api, loadByTagName } from '@wippy-fe/proxy'
import { apiError } from '../constants'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import { resolveConnectionState, CONNECTION_STATE_LABELS, type ConnectionState } from '../status'

interface Config { connection_id?: string }
interface Conn {
  component_id: string
  name?: string
  provider?: string
  connection_state?: string
  expires_at?: number | null
}
interface P { config?: Config | null; provider?: string; label?: string }
interface E { 'config-changed': Config }

const props = useProps<P>()
const emit = useEvents<E>()

const connections = ref<Conn[]>([])
const connectionId = ref('')
const loading = ref(false)
const error = ref('')

const provider = computed(() => props.value.provider || '')
const label = computed(() => props.value.label || (provider.value ? `${provider.value} connection` : 'Connection'))
const selected = computed(() => connections.value.find(c => c.component_id === connectionId.value))
// wc-connection-picker reads its selection from a JSON {connection_id} value/config string.
const pickerValue = computed(() => JSON.stringify({ connection_id: connectionId.value }))

watch(
  () => props.value.config,
  cfg => { connectionId.value = cfg?.connection_id || '' },
  { immediate: true },
)

watch(provider, () => loadConnections(), { immediate: true })

function connState(c?: Conn): ConnectionState | '' {
  if (!c) return ''
  return resolveConnectionState(c.connection_state, c.expires_at)
}

function statusLabel(c?: Conn): string {
  const status = connState(c)
  if (!status) return ''
  return CONNECTION_STATE_LABELS[status]
}

function publish() {
  emit('config-changed', { connection_id: connectionId.value || undefined })
}

function onPickerChange(e: Event) {
  const detail = (e as CustomEvent).detail as { connection_id?: string } | undefined
  connectionId.value = detail?.connection_id || ''
  publish()
}

async function loadConnections() {
  if (!provider.value) {
    connections.value = []
    return
  }
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get(`/api/v1/connections?provider=${encodeURIComponent(provider.value)}&limit=100`)
    connections.value = (data?.connections ?? []) as Conn[]
  } catch (e) {
    error.value = apiError(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadByTagName('wc-connection-picker', { timeoutMs: 8000 }).catch(() => {})
})
</script>

<template>
  <div class="connpick">
    <label class="connpick-field">
      <span>{{ label }}</span>
      <wc-connection-picker
        v-if="provider"
        source="/api/v1/connections"
        :providers="provider"
        reply-only="false"
        placeholder="Auto-select default"
        :value="pickerValue"
        @change="onPickerChange"
      ></wc-connection-picker>
    </label>

    <div v-if="selected" class="connpick-meta" :class="`state-${connState(selected)}`">
      {{ statusLabel(selected) }}
    </div>
    <p v-if="provider && !connections.length && !loading" class="connpick-hint">No {{ provider }} connection yet.</p>
    <p v-if="!provider" class="connpick-error">Connection provider is not configured for this capability.</p>
    <p v-if="error" class="connpick-error">{{ error }}</p>
  </div>
</template>
