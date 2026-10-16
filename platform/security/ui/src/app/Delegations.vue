<script setup lang="ts">
import { computed, ref } from 'vue'
import WcMount from '@widgets/app/WcMount.vue'
import { Button, FormField, Notice, Spinner, TextInput } from './shared'
import { useDelegations } from './useDelegations'

const store = useDelegations()
const { delegations, loading, saving, error, confirmation, pending } = store
const user = ref('')
const root = ref('')
const allRoots = ref(false)
const groups = ref<{ id: string; label: string }[]>([])
const locked = computed(() => saving.value || !!pending.value)
const validRoot = computed(() => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(root.value.trim()))
const canSave = computed(() => !!user.value && groups.value.length > 0 && (allRoots.value || validRoot.value))

function choice(raw: unknown, kind: 'user' | 'group') {
  if (!raw || typeof raw !== 'object') return
  const value = raw as { type?: unknown; id?: unknown; label?: unknown }
  if (locked.value || value.type !== kind || typeof value.id !== 'string') return
  if (kind === 'user') user.value = value.id
  else if (value.id && !groups.value.some(group => group.id === value.id)) {
    groups.value.push({ id: value.id, label: typeof value.label === 'string' ? value.label : value.id })
  }
}
function pickerError(cause: unknown) {
  error.value = cause && typeof cause === 'object' && 'message' in cause
    ? String(cause.message) : 'Could not load the principal picker'
}
async function save() {
  if (!canSave.value) return
  await store.mutate('save', { principal: { kind: 'user', id: user.value },
    root: allRoots.value ? '*' : root.value.trim(), groups: groups.value.map(group => group.id) })
}

defineExpose({ load: store.load })
</script>

<template>
  <section class="ks-delegations" aria-label="Act-as grants">
    <div class="ks-builder-head">
      <h2 class="ks-builder-title">Act-as grants</h2>
      <Button variant="ghost" :disabled="loading || locked" @click="store.load">Refresh act-as grants</Button>
    </div>
    <p>Choose which operator groups may select an ordinary user account for execution. Account groups supply its access. An act-as grant also requires administration of the execution root and access to its declared resources.</p>
    <div v-if="error" role="alert"><Notice severity="danger" @dismiss="error = ''">{{ error }}</Notice></div>
    <Notice v-if="confirmation" data-test="delegation-confirmation" severity="success" @dismiss="confirmation = ''">{{ confirmation }}</Notice>
    <fieldset :disabled="locked" :inert="locked" class="ks-delegation-form">
      <FormField label="Execution account">
        <WcMount tag="wc-principal-picker" :attrs="{ kinds: 'user', placeholder: 'Choose execution account…' }" :config="{ principal_id: user }" @change="choice($event, 'user')" @error="pickerError" />
      </FormField>
      <FormField label="Operator groups" help="Only members of these groups receive selection permission. This does not change any account membership.">
        <WcMount tag="wc-principal-picker" :attrs="{ kinds: 'group', placeholder: 'Add operator group…' }" :config="{}" @change="choice($event, 'group')" @error="pickerError" />
      </FormField>
      <ul v-if="groups.length" aria-label="Selected operator groups">
        <li v-for="group in groups" :key="group.id">
          <span>{{ group.label }} <small>{{ group.id }}</small></span>
          <Button variant="ghost" small :aria-label="`Remove operator group ${group.label}`" @click="groups = groups.filter(value => value.id !== group.id)">Remove</Button>
        </li>
      </ul>
      <label class="ks-delegation-all"><input v-model="allRoots" type="checkbox" aria-label="All component roots">All component roots</label>
      <FormField v-if="!allRoots" label="Component root" help="The existing execution component UUID. Selection still requires administration of this root.">
        <TextInput v-model="root" aria-label="Component root" placeholder="Component UUID" />
        <small v-if="root.trim() && !validRoot" class="ks-field-err">Enter a component UUID or choose all component roots.</small>
      </FormField>
      <Button :disabled="!canSave || locked" :loading="saving" @click="save">Save act-as grant</Button>
    </fieldset>
    <div v-if="pending && !saving">
      <p>The result is unconfirmed. Retry the same request before editing this grant.</p>
      <Button @click="store.submit">Retry act-as request</Button>
    </div>
    <Spinner v-if="loading" label="Loading act-as grants…" />
    <table v-else-if="delegations.length" class="ks-delegation-table">
      <caption>Native act-as grants</caption>
      <thead><tr><th scope="col">Execution account</th><th scope="col">Component root</th><th scope="col">Operator groups</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
      <tbody>
        <tr v-for="grant in delegations" :key="grant.policy_id">
          <td>{{ grant.principal.id }}</td>
          <td>{{ grant.root === '*' ? 'All component roots' : grant.root }}</td>
          <td>{{ grant.groups.join(', ') }}</td>
          <td>{{ grant.active ? 'Active' : 'Revoked' }}</td>
          <td><Button v-if="grant.active" variant="danger" small :disabled="locked" :aria-label="`Revoke act-as grant for ${grant.principal.id} at ${grant.root}`" @click="store.mutate('revoke', { principal: grant.principal, root: grant.root })">Revoke</Button></td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="!error">No act-as grants.</p>
  </section>
</template>
