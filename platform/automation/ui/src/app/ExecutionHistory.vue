<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { api } from '@wippy-fe/proxy'
import Button from 'primevue/button'
import { relativeTime } from '@widgets/app/datetime'
import { errMsg } from '@widgets/app/errMsg'
import { resolvePrincipals, type Principal, type PrincipalRef } from '../../../../users/ui/src/principals'

interface Subject { kind: string; id: string }
interface Delivery {
  drive_key: string; round_token: string; source_port: string; item_key: string; identity_key: string
  state: string; round_at: string; evidence_status: 'recorded' | 'absent' | 'inferred' | 'unresolved'
  evidence?: { identity?: { principal: Subject; authorized_by?: Subject } }
  error?: unknown
}
interface Control {
  generation: number; request_id: string; state: string; created_at: string; completed_at?: string
  initiation?: { actor_id: string }
}
interface Page<T> { success: boolean; kind: string; entries: T[]; next_page_token?: string; error?: { message?: string } }
const props = defineProps<{ root: string }>()
const emit = defineEmits<{ (e: 'error', cause: { message: string; error: unknown }): void }>()
const deliveries = ref<Delivery[]>([]), controls = ref<Control[]>([]), principals = ref<Principal[]>([])
const deliveryCursor = ref(''), controlCursor = ref(''), busy = ref(false), error = ref('')
let sequence = 0

function clear() {
  deliveries.value = []; controls.value = []; principals.value = []
  deliveryCursor.value = ''; controlCursor.value = ''
}
function subject(ref?: Subject) {
  return principals.value.find(row => row.type === ref?.kind && row.id === ref?.id)?.label || 'Account unavailable'
}
function evidenceLabel(row: Delivery) {
  return { recorded: 'Recorded admission', absent: 'Identity evidence absent',
    inferred: 'Identity evidence inferred; unverified', unresolved: 'Identity unresolved' }[row.evidence_status]
}
function deliveryKey(row: Delivery) {
  return JSON.stringify([row.drive_key, row.round_token, row.source_port, row.item_key, row.identity_key])
}
function errorMessage(value: unknown) {
  return errMsg(value, typeof value === 'string' ? value : '')
}
async function page<T>(root: string, kind: string, cursor = '') {
  const { data } = await api.get<Page<T>>('/api/v1/automations/' + encodeURIComponent(root) + '/history',
    { params: { kind, page_size: 25, ...(cursor ? { page_token: cursor } : {}) } })
  if (!data.success || data.kind !== kind || !Array.isArray(data.entries)) throw new Error(data.error?.message || 'Could not read execution history')
  if (data.next_page_token && data.next_page_token === cursor) throw new Error('History page repeats its cursor')
  return data
}
async function labels(deliveryRows: Delivery[], controlRows: Control[]) {
  const refs = new Map<string, PrincipalRef>()
  function add(value?: Subject) {
    if (value && (value.kind === 'user' || value.kind === 'group')) {
      refs.set(value.kind + ':' + value.id, { type: value.kind, id: value.id })
    }
  }
  for (const row of deliveryRows) { add(row.evidence?.identity?.principal); add(row.evidence?.identity?.authorized_by) }
  for (const row of controlRows) { if (row.initiation) add({ kind: 'user', id: row.initiation.actor_id }) }
  return resolvePrincipals([...refs.values()])
}
function report(cause: unknown) {
  clear()
  error.value = errMsg(cause, 'Could not read execution history')
  emit('error', { message: error.value, error: cause })
}
async function read() {
  const version = ++sequence, root = props.root
  clear(); error.value = ''; busy.value = false
  if (!root) return
  busy.value = true
  try {
    const [deliveryPage, controlPage] = await Promise.all([page<Delivery>(root, 'deliveries'), page<Control>(root, 'controls')])
    const accounts = await labels(deliveryPage.entries, controlPage.entries)
    if (version !== sequence) return
    deliveries.value = deliveryPage.entries; controls.value = controlPage.entries; principals.value = accounts
    deliveryCursor.value = deliveryPage.next_page_token || ''; controlCursor.value = controlPage.next_page_token || ''
  } catch (cause) { if (version === sequence) report(cause) }
  finally { if (version === sequence) busy.value = false }
}
async function more(kind: 'deliveries' | 'controls') {
  if (busy.value) return
  const version = sequence, root = props.root
  const cursor = kind === 'deliveries' ? deliveryCursor.value : controlCursor.value
  if (!cursor) return
  busy.value = true; error.value = ''
  try {
    const next = await page<Delivery | Control>(root, kind, cursor)
    const deliveryRows = kind === 'deliveries' ? [...deliveries.value, ...next.entries as Delivery[]] : deliveries.value
    const controlRows = kind === 'controls' ? [...controls.value, ...next.entries as Control[]] : controls.value
    const accounts = await labels(deliveryRows, controlRows)
    if (version !== sequence) return
    deliveries.value = deliveryRows; controls.value = controlRows; principals.value = accounts
    if (kind === 'deliveries') deliveryCursor.value = next.next_page_token || ''
    else controlCursor.value = next.next_page_token || ''
  } catch (cause) { if (version === sequence) report(cause) }
  finally { if (version === sequence) busy.value = false }
}
watch(() => props.root, () => { void read() }, { immediate: true })
onBeforeUnmount(() => { sequence += 1 })
</script>

<template>
  <section aria-label="Execution history" class="kx-history">
    <p v-if="busy" role="status">Loading execution history…</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <template v-else>
      <div>
        <h3>Committed deliveries</h3>
        <p v-if="!busy && !deliveries.length">No retained deliveries.</p>
        <article v-for="row in deliveries" :key="deliveryKey(row)" class="kx-history-entry">
          <strong>{{ row.item_key }} · {{ row.state }}</strong>
          <p>Round starts {{ relativeTime(row.round_at, { future: true }) }}</p>
          <p>{{ evidenceLabel(row) }}</p>
          <dl v-if="row.evidence?.identity">
            <dt>Executor</dt><dd :title="row.evidence.identity.principal.id" aria-label="Historical executor">{{ subject(row.evidence.identity.principal) }}</dd>
            <template v-if="row.evidence.identity.authorized_by">
              <dt>Authorized by</dt><dd :title="row.evidence.identity.authorized_by.id" aria-label="Historical authorizer">{{ subject(row.evidence.identity.authorized_by) }}</dd>
            </template>
          </dl>
          <p v-if="errorMessage(row.error)">{{ errorMessage(row.error) }}</p>
        </article>
        <Button v-if="deliveryCursor" label="More deliveries" severity="secondary" :disabled="busy" @click="more('deliveries')" />
      </div>
      <div>
        <h3>Control requests</h3>
        <p>Control requests and delivery admission are independent records.</p>
        <p v-if="!busy && !controls.length">No retained control requests.</p>
        <article v-for="row in controls" :key="`${row.generation}:${row.request_id}`" class="kx-history-entry">
          <strong>{{ row.state }}</strong>
          <p>Requested {{ relativeTime(row.created_at, { future: true }) }}</p>
          <dl v-if="row.initiation">
            <dt>Initiated by</dt><dd :title="row.initiation.actor_id" aria-label="Control initiator">{{ subject({ kind: 'user', id: row.initiation.actor_id }) }}</dd>
          </dl>
          <p v-else>Initiator not recorded.</p>
        </article>
        <Button v-if="controlCursor" label="More control requests" severity="secondary" :disabled="busy" @click="more('controls')" />
      </div>
    </template>
  </section>
</template>

<style scoped>
.kx-history { display: grid; gap: 1.5rem; }
.kx-history-entry { padding-block: 0.75rem; border-block-end: 1px solid var(--p-content-border-color); }
h3, p { margin: 0 0 0.5rem; }
dl { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 0.25rem 0.75rem; }
dd { margin: 0; overflow-wrap: anywhere; }
</style>
