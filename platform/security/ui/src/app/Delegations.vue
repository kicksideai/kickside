<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api, host } from '@wippy-fe/proxy'
import Chip from 'primevue/chip'
import RadioButton from 'primevue/radiobutton'
import WcMount from '@widgets/app/WcMount.vue'
import type { Scope } from '../types.ts'
import { Button, FormField, IconButton, Notice, Pill, Spinner } from './shared'
import { type Delegation, useDelegations } from './useDelegations'

// Run-as permissions: which groups may pick an account in a component's "Run as"
// setting. The component then executes with that account's access. Each grant is
// scoped to one component or to every component the operator administers.
const props = defineProps<{ scopes: Scope[] }>()

const store = useDelegations()
const { delegations, loading, saving, error, confirmation, pending } = store
const formOpen = ref(false)
const user = ref('')
const root = ref('')
const anyComponent = ref(true)
const componentScopeId = useId()
const groups = ref<{ id: string; label: string }[]>([])
const locked = computed(() => saving.value || !!pending.value)
const canSave = computed(() => !!user.value && groups.value.length > 0 && (anyComponent.value || !!root.value))

const groupLabel = computed<Record<string, string>>(() => {
  const m: Record<string, string> = {}
  for (const s of props.scopes) m[s.id] = s.label || s.id
  return m
})

// Account names come from the users-owned principal directory, resolved in one call
// for every account the grant list references.
const accountLabel = ref<Record<string, string>>({})
watch(delegations, async (rows) => {
  const ids = [...new Set(rows.map(row => row.principal.id))].filter(id => !accountLabel.value[id])
  if (!ids.length) return
  try {
    const { data } = await api.post('/api/v1/principals/resolve', { refs: ids.map(id => ({ type: 'user', id })) })
    const next = { ...accountLabel.value }
    for (const p of Array.isArray(data?.principals) ? data.principals : []) {
      if (p && typeof p.id === 'string' && typeof p.label === 'string') next[p.id] = p.label
    }
    accountLabel.value = next
  }
  catch (cause) {
    error.value = cause && typeof cause === 'object' && 'message' in cause ? String(cause.message) : 'Could not resolve account names'
  }
})

const active = computed(() => delegations.value.filter(grant => grant.active))
const revoked = computed(() => delegations.value.filter(grant => !grant.active))

function choice(raw: unknown, kind: 'user' | 'group') {
  if (!raw || typeof raw !== 'object') return
  const value = raw as { type?: unknown; id?: unknown; label?: unknown }
  if (locked.value || value.type !== kind || typeof value.id !== 'string') return
  if (kind === 'user') user.value = value.id
  else if (value.id && !groups.value.some(group => group.id === value.id)) {
    groups.value.push({ id: value.id, label: typeof value.label === 'string' ? value.label : value.id })
  }
}
function componentChoice(raw: unknown) {
  const id = raw && typeof raw === 'object' ? (raw as { thread_id?: unknown }).thread_id : undefined
  if (!locked.value && typeof id === 'string') root.value = id
}
function pickerError(cause: unknown) {
  error.value = cause && typeof cause === 'object' && 'message' in cause
    ? String(cause.message) : 'Could not load the picker'
}
function openForm() {
  user.value = ''
  root.value = ''
  anyComponent.value = true
  groups.value = []
  formOpen.value = true
}
async function save() {
  if (!canSave.value) return
  await store.mutate('save', { principal: { kind: 'user', id: user.value },
    root: anyComponent.value ? '*' : root.value, groups: groups.value.map(group => group.id) })
  if (!error.value && !pending.value) formOpen.value = false
}

async function revoke(grant: Delegation) {
  const ok = await host.confirm({
    header: 'Revoke run-as permission?',
    message: `Members of ${grant.groups.map(id => groupLabel.value[id] || id).join(', ')} can no longer choose ${accountLabel.value[grant.principal.id] || grant.principal.id} in the Run as setting.`,
    icon: 'tabler:user-off',
    acceptLabel: 'Revoke',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
  })
  if (ok) await store.mutate('revoke', { principal: grant.principal, root: grant.root })
}

defineExpose({ load: store.load })
</script>

<template>
  <section class="ks-runas" aria-label="Run-as permissions">
    <header class="ks-runas-head">
      <div>
        <h2 class="ks-runas-title">Run-as permissions</h2>
        <p class="ks-runas-lede">
          Agents, automations and workflows run with the access of the account set in their
          <b>Run as</b> setting. A permission lets members of a group choose a specific account there,
          typically a bot account, so the component works with that account's access instead of their own.
        </p>
      </div>
      <div class="ks-runas-acts">
        <IconButton icon="tabler:refresh" label="Refresh" :disabled="loading || locked" :spin="loading" @click="store.load" />
        <Button v-if="!formOpen" variant="primary" small icon="tabler:plus" :disabled="locked" @click="openForm">New permission</Button>
      </div>
    </header>

    <div v-if="error" role="alert"><Notice severity="danger" @dismiss="error = ''">{{ error }}</Notice></div>
    <Notice v-if="confirmation" data-test="delegation-confirmation" severity="success" @dismiss="confirmation = ''">{{ confirmation }}</Notice>

    <form v-if="formOpen" class="ks-runas-form" @submit.prevent="save">
      <div class="ks-runas-form-head">
        <span>New run-as permission</span>
        <IconButton icon="tabler:x" label="Cancel" :disabled="locked" @click="formOpen = false" />
      </div>
      <fieldset :disabled="locked" :inert="locked">
        <ol class="ks-runas-steps">
          <li>
            <FormField label="Account to run as" help="The account whose access the component uses. Its group memberships decide what the component can do.">
              <WcMount tag="wc-principal-picker" :attrs="{ kinds: 'user', placeholder: 'Choose an account…' }" :config="{ principal_id: user }" @change="choice($event, 'user')" @error="pickerError" />
            </FormField>
          </li>
          <li>
            <FormField label="Who may choose it" help="Members of these groups see this account in the Run as setting. Nobody's group membership changes.">
              <WcMount tag="wc-principal-picker" :attrs="{ kinds: 'group', placeholder: 'Add a group…' }" :config="{}" @change="choice($event, 'group')" @error="pickerError" />
            </FormField>
            <div v-if="groups.length" class="ks-runas-chips" aria-label="Selected groups">
              <Chip v-for="group in groups" :key="group.id" :label="group.label" :removable="!locked"
                :pt="{ removeIcon: { 'aria-label': `Remove group ${group.label}` } }"
                @remove="groups = groups.filter(value => value.id !== group.id)" />
            </div>
          </li>
          <li>
            <fieldset>
              <legend class="km-field-label">On which components</legend>
              <div class="ks-runas-component-options">
                <label class="ks-runas-component-option" :for="`${componentScopeId}-any`">
                  <RadioButton v-model="anyComponent" :input-id="`${componentScopeId}-any`" :name="componentScopeId" :value="true" :disabled="locked" />
                  Any component
                </label>
                <label class="ks-runas-component-option" :for="`${componentScopeId}-one`">
                  <RadioButton v-model="anyComponent" :input-id="`${componentScopeId}-one`" :name="componentScopeId" :value="false" :disabled="locked" />
                  One component
                </label>
              </div>
              <small class="km-field-help">The person choosing the account must also be able to manage the component.</small>
            </fieldset>
            <WcMount v-if="!anyComponent" class="ks-runas-component" tag="wc-component-picker" :attrs="{ source: '/api/v1/security/delegations/roots', title: 'Component', placeholder: 'Choose a component you manage…' }" :config="root ? { thread_id: root } : {}" @change="componentChoice" @error="pickerError" />
          </li>
        </ol>
      </fieldset>
      <div class="ks-runas-form-foot">
        <Button variant="ghost" small :disabled="locked" @click="formOpen = false">Cancel</Button>
        <Button variant="primary" small icon="tabler:device-floppy" :disabled="!canSave || locked" :loading="saving" @click="save">Save permission</Button>
      </div>
    </form>

    <div v-if="pending && !saving" class="ks-runas-pending">
      <span>The result is unconfirmed. Retry the same request before editing this permission.</span>
      <Button small @click="store.submit">Retry</Button>
    </div>

    <Spinner v-if="loading && !delegations.length" label="Loading run-as permissions…" />
    <div v-else-if="active.length || revoked.length" class="ks-runas-list">
      <article v-for="grant in [...active, ...revoked]" :key="grant.policy_id" class="ks-runas-grant" :class="{ revoked: !grant.active }">
        <Icon class="ks-runas-grant-icon" icon="tabler:user-shield" aria-hidden="true" />
        <div class="ks-runas-grant-body">
          <div class="ks-runas-grant-line">
            <span v-if="grant.active" class="ks-runas-who">{{ grant.groups.map(id => groupLabel[id] || id).join(', ') }}</span>
            <span class="ks-runas-verb">{{ grant.active ? 'can run as' : 'Permission to run as' }}</span>
            <span class="ks-runas-who">{{ accountLabel[grant.principal.id] || grant.principal.id }}</span>
          </div>
          <div class="ks-runas-grant-meta">
            <span v-if="grant.root === '*'">on any component they manage</span>
            <span v-else-if="grant.root_label">on <b>{{ grant.root_label }}</b></span>
            <span v-else>on component <code>{{ grant.root }}</code></span>
          </div>
        </div>
        <Pill v-if="!grant.active" severity="secondary">revoked</Pill>
        <Button v-else variant="ghost" small icon="tabler:user-off" :disabled="locked" :aria-label="`Revoke run-as permission for ${accountLabel[grant.principal.id] || grant.principal.id}`" @click="revoke(grant)">Revoke</Button>
      </article>
    </div>
    <div v-else-if="!error && !formOpen" class="ks-runas-empty">
      <Icon icon="tabler:user-shield" aria-hidden="true" />
      <b>No run-as permissions yet</b>
      <span>Until a group gets a permission, the Run as setting offers only <b>Me</b>.</span>
    </div>
  </section>
</template>
