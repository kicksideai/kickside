<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { api } from '@wippy-fe/proxy'
import WcMount from '@widgets/app/WcMount.vue'
import { errMsg } from '@widgets/app/errMsg'

const props = defineProps<{ target: string; parent: string; title: string }>()
const emit = defineEmits<{ queued: [value: { id: string }]; error: [value: { message: string; error: unknown }] }>()
interface Principal { kind: 'user'; id: string }
interface Operation {
  body: { type: string; input: { title: string; target: Record<string, unknown> }; parent_id: string; principal: Principal; component_id: string; request_id: string }
  wake: string
  installed: boolean
}
const selected = ref<Principal | null>(null), busy = ref(false), queued = ref(false), pending = ref(false), error = ref('')
let operation: Operation | null = null
let sequence = 0
const declaration = computed(() => {
  if (!props.parent) return { error: 'Choose an existing parent for this task' }
  try {
    const target = JSON.parse(props.target)
    if (!target || typeof target !== 'object' || Array.isArray(target)) return { error: 'Task target must be an object' }
    return { target: target as Record<string, unknown>, error: '' }
  } catch (cause) { return { error: errMsg(cause, 'Could not read the task target') } }
})
const canRun = computed(() => !!selected.value && !busy.value && !queued.value && !declaration.value.error)
function report(cause: unknown) { error.value = errMsg(cause, 'Could not queue the task'); emit('error', { message: error.value, error: cause }) }
function choose(value: unknown) {
  const choice = value as { principal?: Principal }
  if (busy.value || queued.value || operation || choice?.principal?.kind !== 'user' || !choice.principal.id) return
  selected.value = { kind: 'user', id: choice.principal.id }; error.value = ''
}
async function run() {
  if (!canRun.value || !selected.value || !declaration.value.target) return
  const version = sequence
  operation ||= { body: { type: 'kickside.automation.manual:task', input: { title: props.title, target: declaration.value.target },
    parent_id: props.parent, principal: { ...selected.value }, component_id: crypto.randomUUID(), request_id: crypto.randomUUID() },
    wake: crypto.randomUUID(), installed: false }
  const request = operation
  busy.value = true; error.value = ''; pending.value = false
  try {
    if (!request.installed) {
      const { data } = await api.post<{ success: boolean; id?: string; error?: unknown }>('/api/v1/automations/selected', request.body)
      if (version !== sequence) return
      if (!data.success) throw new Error(errMsg(data.error, 'Task installation is not confirmed'))
      if (data.id !== request.body.component_id) throw new Error('Task installation receipt does not match the request')
      request.installed = true
    }
    const { data } = await api.post<{ success: boolean; result?: { state: string }; error?: unknown }>(
      '/api/v1/automations/' + encodeURIComponent(request.body.component_id) + '/actions/run_now', { request_id: request.wake })
    if (version !== sequence) return
    if (!data.success) throw new Error(errMsg(data.error, 'Run admission is not confirmed'))
    if (data.result?.state === 'pending') { pending.value = true; return }
    if (data.result?.state !== 'succeeded') throw new Error('Run admission is not confirmed')
    queued.value = true; emit('queued', { id: request.body.component_id })
  } catch (cause) { if (version === sequence) report(cause) }
  finally { if (version === sequence) busy.value = false }
}
watch(() => [props.target, props.parent, props.title], () => {
  sequence += 1; operation = null; selected.value = null; busy.value = false; queued.value = false; pending.value = false; error.value = ''
})
onBeforeUnmount(() => { sequence += 1 })
</script>
<template>
  <section aria-label="Launch task" class="kx-manual-launcher">
    <WcMount tag="wc-run-as-picker" :attrs="{ root: '', value: selected?.id, disabled: busy || queued || !!operation }" @change="choose" @error="report" />
    <p v-if="!selected">Select the account that runs this task.</p>
    <button type="button" class="p-button" :disabled="!canRun" @click="run">{{ busy ? 'Queuing…' : pending ? 'Check run admission' : error ? 'Retry run' : 'Queue run' }}</button>
    <p v-if="declaration.error || error" role="alert">{{ declaration.error || error }}</p>
    <p v-if="pending" role="status">Run admission is pending.</p>
    <p v-if="queued" role="status">Run queued. Follow the task in Automations.</p>
  </section>
</template>
<style scoped>
.kx-manual-launcher { display: grid; gap: 0.75rem; }
p { margin: 0; }
</style>
