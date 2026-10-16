<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { api } from '@wippy-fe/proxy'
import WcMount from '@widgets/app/WcMount.vue'
import { errMsg } from '@widgets/app/errMsg'
import { resolvePrincipals, type PrincipalRef } from '../../../../users/ui/src/principals'

interface Principal { kind: string; id: string }
interface Identity { principal: Principal; authorized_by?: Principal; identity_generation: number }
const props = defineProps<{ root: string }>()
const emit = defineEmits<{ (e: 'changed'): void; (e: 'error', value: { message: string; error: unknown }): void }>()
const stored = ref<Identity | null>(null), selected = ref<Principal | null>(null)
const busy = ref(false), pending = ref(false), error = ref(''), saved = ref(false)
const requested = ref(false)
const executorLabel = ref(''), authorizerLabel = ref('')
let sequence = 0
let request: { id: string; principal: Principal; generation: number } | null = null
const canSave = computed(() => !!stored.value && !!selected.value && !busy.value && !pending.value
  && requested.value)
function report(cause: unknown) { error.value = errMsg(cause, 'Could not change the run-as account'); emit('error', { message: error.value, error: cause }) }
async function receipt(root: string) {
  const { data } = await api.get<{ success: boolean; identity: Identity }>('/api/v1/automations/' + encodeURIComponent(root) + '/identity')
  if (!data.success || !data.identity?.principal?.id
    || !Number.isInteger(data.identity.identity_generation) || data.identity.identity_generation < 0) throw new Error('Could not read the run-as account')
  const identity = data.identity
  const accounts = [identity.principal, identity.authorized_by].filter((value): value is Principal => !!value)
  const refs: PrincipalRef[] = accounts.filter(value => value.kind === 'user' || value.kind === 'group')
    .map(value => ({ type: value.kind as PrincipalRef['type'], id: value.id }))
  const labels = await resolvePrincipals(refs)
  function label(principal?: Principal) {
    return labels.find(value => value.type === principal?.kind && value.id === principal?.id)?.label || 'Account unavailable'
  }
  return { identity, executor: label(identity.principal), authorizer: label(identity.authorized_by) }
}
function accept(value: Awaited<ReturnType<typeof receipt>>) {
  stored.value = value.identity; selected.value = value.identity.principal
  executorLabel.value = value.executor; authorizerLabel.value = value.authorizer
}
async function read() {
  const version = ++sequence
  stored.value = null; selected.value = null; pending.value = false; error.value = ''; saved.value = false; requested.value = false; request = null
  if (!props.root) { busy.value = false; return }
  busy.value = true
  try {
    const value = await receipt(props.root)
    if (version !== sequence) return
    accept(value)
  } catch (cause) { if (version === sequence) report(cause) }
  finally { if (version === sequence) busy.value = false }
}
function choose(value: unknown) {
  const choice = value as { principal?: Principal }
  if (!choice?.principal || choice.principal.kind !== 'user' || !choice.principal.id || busy.value || pending.value) return
  selected.value = { kind: 'user', id: choice.principal.id }; request = null; error.value = ''; saved.value = false; requested.value = true
}
async function save() {
  if (!canSave.value || !stored.value || !selected.value) return
  const version = sequence
  const root = props.root
  request ||= { id: crypto.randomUUID(), principal: { ...selected.value }, generation: stored.value.identity_generation }
  const operation = request
  busy.value = true; error.value = ''; saved.value = false
  try {
    const { data } = await api.post<{ success: boolean; state: string; identity_generation?: number; error?: { message?: string } }>(
      '/api/v1/automations/' + encodeURIComponent(root) + '/identity', {
        principal: operation.principal, request_id: operation.id, expected_identity_generation: operation.generation,
      })
    if (version !== sequence) return
    if (!data.success) throw new Error(data.error?.message || 'Could not save the run-as account')
    if (data.state === 'pending') { pending.value = true; return }
    if (data.state !== 'succeeded' || !Number.isInteger(data.identity_generation)) throw new Error('Identity change is not confirmed')
    const value = await receipt(root)
    if (version !== sequence) return
    if (value.identity.identity_generation < data.identity_generation!) throw new Error('Execution account confirmation is stale')
    accept(value)
    saved.value = true; request = null; requested.value = false; emit('changed')
  } catch (cause) { if (version === sequence) report(cause) }
  finally { if (version === sequence) busy.value = false }
}
watch(() => props.root, () => { void read() }, { immediate: true })
onBeforeUnmount(() => { sequence += 1 })
</script>

<template>
  <section aria-label="Execution account" class="kx-identity-editor">
    <p v-if="busy && !stored" role="status">Loading run-as account…</p>
    <template v-if="stored">
      <dl>
        <dt>Runs as</dt><dd aria-label="Runs as">{{ executorLabel }}</dd>
        <template v-if="stored.authorized_by">
          <dt>Authorized by</dt><dd aria-label="Authorized by">{{ authorizerLabel }}</dd>
        </template>
      </dl>
      <WcMount tag="wc-run-as-picker" :attrs="{ root, value: selected?.id, disabled: busy || pending }" @change="choose"
        @error="report" />
      <button type="button" class="p-button p-button-secondary" :disabled="!canSave" @click="save">Save run-as account</button>
    </template>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-if="saved" role="status">Run-as account saved</p>
    <div v-if="pending" role="status">
      Identity change is pending.
      <button type="button" class="p-button p-button-secondary" @click="read">Check account</button>
    </div>
  </section>
</template>

<style scoped>
.kx-identity-editor { display: grid; gap: 0.75rem; }
p { margin: 0; }
</style>
