<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { host } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import Tabs from 'primevue/tabs'
import type { Policy, Scope, ScopeDraft } from '../types.ts'
import { Button, EmptyState, FormField, IconButton, Notice, Pill, RailHeader, SearchField, Shell, Spinner, TextInput } from './shared'
import Delegations from './Delegations.vue'
import PolicyCard from './PolicyCard.vue'
import { useSecurityApi } from './useSecurityApi.ts'

// kickside-security — roles/scopes admin. Rail lists scopes (built-in groups +
// registry scopes read-only, DB-backed custom scopes editable). Selecting a
// custom scope (or New) opens the two-pane builder: drag public policies from the
// palette into the scope, reorder, remove. Saving writes the DB row; the projection
// service materializes it as a security.scope registry entry.
const store = useSecurityApi()
const { scopes, policies, loading, saving, error } = store

const railSearch = ref('')
const paletteSearch = ref('')
const selectedId = ref<string | null>(null)
const draft = ref<ScopeDraft | null>(null)

const activeTab = ref('scopes')
const delegationPanel = ref<InstanceType<typeof Delegations> | null>(null)
const delegationsOpened = ref(false)
async function selectTab(value: string | number) {
  activeTab.value = String(value)
  if (value !== 'delegations') return
  delegationsOpened.value = true
  await nextTick()
  await delegationPanel.value?.load()
}
useHostVisibilityRefresh(async () => {
  await store.load()
  if (activeTab.value === 'delegations') await delegationPanel.value?.load()
})

const policyById = computed<Record<string, Policy>>(() => {
  const m: Record<string, Policy> = {}
  for (const p of policies.value) m[p.id] = p
  return m
})

const filteredScopes = computed(() => {
  const q = railSearch.value.trim().toLowerCase()
  const match = (s: Scope) => !q || s.label.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
  return {
    custom: scopes.value.filter(s => s.source === 'custom' && match(s)),
    builtin: scopes.value.filter(s => s.source !== 'custom' && match(s)),
  }
})

const selectedScope = computed(() => scopes.value.find(s => s.id === selectedId.value) || null)
const readOnlyScope = computed(() => (selectedScope.value && selectedScope.value.source !== 'custom') ? selectedScope.value : null)

const palettePolicies = computed<Policy[]>(() => {
  if (!draft.value) return []
  // Exclude already-chosen extensions and, for an overlay, the locked base
  // policies (base can't be re-added).
  const chosen = new Set([...draft.value.policies, ...draft.value.base.map(p => p.id)])
  const q = paletteSearch.value.trim().toLowerCase()
  return policies.value.filter(p => !chosen.has(p.id)
    && (!q || (p.title || '').toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.comment || '').toLowerCase().includes(q)))
})

const draftPolicies = computed<Policy[]>(() =>
  draft.value ? draft.value.policies.map(id => policyById.value[id] || { id }) : [],
)

function selectScope(s: Scope) {
  selectedId.value = s.id
  draft.value = s.source === 'custom'
    ? { slug: s.slug || '', label: s.label, description: s.description, policies: s.policies.map(p => p.id), enabled: s.enabled, isNew: false, target: '', base: [] }
    : null
}

function newScope() {
  selectedId.value = null
  draft.value = { slug: '', label: '', description: '', policies: [], enabled: true, isNew: true, target: '', base: [] }
}

// Clone any scope (built-in, registry, or custom) into a NEW editable custom
// scope, pre-filled with its policies.
function copyScope(s: Scope) {
  selectedId.value = null
  draft.value = {
    slug: '',
    label: s.label ? `Copy of ${s.label}` : '',
    description: s.description,
    policies: [...s.policies.map(p => p.id), ...(s.overlay_policies ?? []).map(p => p.id)],
    enabled: true,
    isNew: true,
    target: '',
    base: [],
  }
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '')
}

// Extend a built-in/registry scope via an overlay: base policies stay locked
// (can't be removed), the admin adds extra policies that union onto the default.
function openOverlay(s: Scope) {
  selectedId.value = s.id
  draft.value = {
    slug: s.overlay_slug || sanitizeId(s.id),
    label: s.label || shortId(s.id),
    description: s.description,
    policies: (s.overlay_policies ?? []).map(p => p.id),
    enabled: true,
    isNew: !s.overlay_slug,
    target: s.id,
    base: s.policies,
  }
}

const isOverlay = computed(() => !!draft.value && draft.value.target !== '')

function addPolicy(id: string) {
  if (draft.value && !draft.value.policies.includes(id)) draft.value.policies.push(id)
}
function removePolicy(id: string) {
  if (draft.value) draft.value.policies = draft.value.policies.filter(p => p !== id)
}

function onPaneDrop(e: DragEvent) {
  const id = e.dataTransfer?.getData('text/plain')
  if (id) addPolicy(id)
}
function onRowDrop(e: DragEvent, targetId: string) {
  e.stopPropagation()
  const id = e.dataTransfer?.getData('text/plain')
  if (!id || !draft.value || id === targetId) return
  const arr = draft.value.policies
  const from = arr.indexOf(id)
  if (from !== -1) arr.splice(from, 1)
  const to = arr.indexOf(targetId)
  arr.splice(to === -1 ? arr.length : to, 0, id)
}

const slugError = computed(() => {
  // Overlay slugs are auto-derived from the target id; only validate a
  // user-entered slug on a new custom scope.
  if (!draft.value || !draft.value.isNew || draft.value.target !== '') return ''
  const s = draft.value.slug.trim()
  return (s && !/^[a-z0-9][\w.-]*$/i.test(s)) ? 'Slug must be alphanumeric (with _.-)' : ''
})
const canSave = computed(() => !!draft.value && draft.value.slug.trim() !== '' && !slugError.value && draft.value.policies.length > 0)

// Transient confirmation after a successful save — the save button's spinner
// alone left it ambiguous whether the change persisted.
const savedMsg = ref('')
let savedTimer: ReturnType<typeof setTimeout> | null = null
function flashSaved(msg: string) {
  savedMsg.value = msg
  if (savedTimer) clearTimeout(savedTimer)
  savedTimer = setTimeout(() => { savedMsg.value = '' }, 3000)
}

async function save() {
  if (!draft.value || !canSave.value) return
  const slug = draft.value.slug.trim()
  const target = draft.value.target
  const label = draft.value.label.trim() || slug
  const ok = await store.saveScope({
    slug,
    target,
    label: draft.value.label.trim(),
    description: draft.value.description.trim(),
    policies: draft.value.policies,
    enabled: draft.value.enabled,
  })
  if (ok) {
    selectedId.value = target || `kickside.security.scopes:${slug}`
    flashSaved(`Saved “${label}”. The role will be available when assigning users.`)
  }
}

async function askDelete() {
  if (!draft.value || draft.value.isNew) return
  const overlay = isOverlay.value
  const ok = await host.confirm({
    header: overlay ? 'Remove extension?' : 'Delete role?',
    message: overlay
      ? 'This removes the added permissions. Users keep the role’s original permissions.'
      : 'This removes the custom role and its permissions.',
    icon: 'tabler:trash',
    acceptLabel: overlay ? 'Remove extension' : 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
  })
  if (!ok) return
  const deleted = await store.deleteScope(draft.value.slug)
  if (deleted) { draft.value = null; selectedId.value = null }
}

function shortId(id: string): string {
  return id.includes(':') ? id.split(':').slice(-1)[0]! : id
}
</script>

<template>
  <div class="ks">
    <Tabs class="ks-tabs" :value="activeTab" @update:value="selectTab">
      <TabList :pt="{ tabList: { 'aria-label': 'Security administration' } }">
        <Tab value="scopes">Roles</Tab>
        <Tab value="delegations" data-tab="delegations">Run as</Tab>
      </TabList>
    </Tabs>
    <Delegations v-if="delegationsOpened" v-show="activeTab === 'delegations'" ref="delegationPanel" :scopes="scopes" />
    <Notice v-if="error" severity="danger" class="ks-top-notice" @dismiss="error = ''">{{ error }}</Notice>
    <Notice v-else-if="savedMsg" severity="success" class="ks-top-notice" @dismiss="savedMsg = ''">{{ savedMsg }}</Notice>

    <Spinner v-if="activeTab === 'scopes' && loading && !scopes.length" label="Loading security…" />

    <Shell v-else v-show="activeTab === 'scopes'">
      <template #rail>
        <RailHeader title="Roles" :count="scopes.length">
          <template #actions>
            <IconButton icon="tabler:plus" label="New role" :disabled="saving" @click="newScope" />
            <IconButton icon="tabler:refresh" label="Refresh" :disabled="loading" :spin="loading" @click="store.load" />
          </template>
        </RailHeader>

        <div class="ks-rail-search">
          <SearchField v-model="railSearch" placeholder="Find a role…" />
        </div>

        <div class="ks-rail-list">
          <div v-if="filteredScopes.custom.length" class="ks-rail-group">Custom</div>
          <button
            v-for="s in filteredScopes.custom"
            :key="s.id"
            class="ks-scope-row"
            :class="{ active: s.id === selectedId }"
            @click="selectScope(s)"
          >
            <span class="ks-scope-name">{{ s.label || shortId(s.id) }}</span>
          </button>

          <div class="ks-rail-group">Default</div>
          <button
            v-for="s in filteredScopes.builtin"
            :key="s.id"
            class="ks-scope-row"
            :class="{ active: s.id === selectedId }"
            @click="selectScope(s)"
          >
            <span class="ks-scope-name">{{ s.label || shortId(s.id) }}</span>
          </button>
        </div>
      </template>

      <!-- Builder: new/custom scope, or an overlay extending a platform scope -->
      <div v-if="draft" class="ks-builder">
        <div class="ks-builder-head">
          <div class="ks-builder-title">
            <Icon :icon="isOverlay ? 'tabler:stack-2' : 'tabler:shield-lock'" aria-hidden="true" />
            <span>{{ isOverlay ? `Extend ${draft.label || shortId(draft.target)}` : (draft.isNew ? 'New role' : draft.label || draft.slug) }}</span>
            <Pill v-if="isOverlay" severity="warn">Additional permissions</Pill>
          </div>
          <div class="ks-builder-acts">
            <Button v-if="!draft.isNew && !isOverlay && selectedScope" variant="soft" small icon="tabler:copy" :disabled="saving" @click="copyScope(selectedScope)">Duplicate</Button>
            <Button v-if="!draft.isNew" variant="danger" small icon="tabler:trash" :disabled="saving" @click="askDelete">{{ isOverlay ? 'Remove extension' : 'Delete' }}</Button>
            <Button variant="primary" small icon="tabler:device-floppy" :loading="saving" :disabled="!canSave" @click="save">{{ isOverlay ? 'Save extension' : 'Save role' }}</Button>
          </div>
        </div>

        <div v-if="isOverlay" class="ks-overlay-warn">
          <Icon icon="tabler:alert-triangle" aria-hidden="true" />
          <span>Adding permissions grants them to <b>everyone assigned {{ selectedScope?.label || shortId(draft.target) }}</b>. Original permissions cannot be removed here. To restrict access, create a new role with only the permissions needed.</span>
        </div>
        <p v-else class="ks-view-note">Choose the permissions this role grants, then assign it in System → Users. To restrict a Member, assign this role instead of Member; other assigned roles may still grant access.</p>

        <div class="ks-fields">
          <FormField v-if="!isOverlay" label="Role ID" :help="draft.isNew ? 'Unique identifier; cannot change later.' : undefined">
            <TextInput v-model="draft.slug" :disabled="!draft.isNew" placeholder="reviewer" />
            <span v-if="slugError" class="ks-field-err">{{ slugError }}</span>
          </FormField>
          <FormField v-else label="Role">
            <TextInput :model-value="selectedScope?.label || draft.target" disabled />
          </FormField>
          <FormField label="Name">
            <TextInput v-model="draft.label" placeholder="Reviewer" />
          </FormField>
          <FormField label="Description">
            <TextInput v-model="draft.description" placeholder="Read-only reviewer role" />
          </FormField>
        </div>

        <div class="ks-panes" :class="{ three: isOverlay }">
          <section v-if="isOverlay" class="ks-pane locked-pane">
            <header class="ks-pane-head">
              <span>Original permissions</span>
              <span class="ks-pane-sub">{{ draft.base.length }} · locked</span>
            </header>
            <div class="ks-pane-body">
              <PolicyCard v-for="p in draft.base" :key="p.id" :policy="p" mode="locked" />
              <div v-if="!draft.base.length" class="ks-pane-empty">No original permissions.</div>
            </div>
          </section>

          <section class="ks-pane">
            <header class="ks-pane-head">
              <span>Available permissions</span>
              <span class="ks-pane-sub">Click + to add</span>
            </header>
            <div class="ks-pane-search"><SearchField v-model="paletteSearch" placeholder="Search permissions…" /></div>
            <div class="ks-pane-body">
              <PolicyCard
                v-for="p in palettePolicies"
                :key="p.id"
                :policy="p"
                mode="palette"
                @add="addPolicy(p.id)"
              />
              <div v-if="!palettePolicies.length" class="ks-pane-empty">No matching permissions.</div>
            </div>
          </section>

          <section class="ks-pane drop" @dragover.prevent @drop="onPaneDrop">
            <header class="ks-pane-head">
              <span>{{ isOverlay ? 'Added by you' : 'In this role' }}</span>
              <span class="ks-pane-sub">{{ draft.policies.length }} {{ draft.policies.length === 1 ? 'permission' : 'permissions' }}</span>
            </header>
            <div class="ks-pane-body">
              <div
                v-for="p in draftPolicies"
                :key="p.id"
                @dragover.prevent
                @drop="onRowDrop($event, p.id)"
              >
                <PolicyCard :policy="p" mode="selected" @remove="removePolicy(p.id)" />
              </div>
              <div v-if="!draft.policies.length" class="ks-drop-hint">
                <Icon icon="tabler:drag-drop" aria-hidden="true" />
                <span>Use + on an available permission, or drag it here.</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Read-only view for a built-in / registry scope -->
      <div v-else-if="readOnlyScope" class="ks-view">
        <div class="ks-builder-head">
          <div class="ks-builder-title">
            <Icon icon="tabler:shield" aria-hidden="true" />
            <span>{{ readOnlyScope.label || shortId(readOnlyScope.id) }}</span>
          </div>
          <div class="ks-builder-acts">
            <Button variant="primary" small icon="tabler:stack-2" @click="openOverlay(readOnlyScope)">{{ readOnlyScope.overlay_slug ? 'Edit extension' : 'Add permissions' }}</Button>
            <Button variant="soft" small icon="tabler:copy" @click="copyScope(readOnlyScope)">Copy role</Button>
          </div>
        </div>
        <p class="ks-view-note">
          Included with the application. Adding permissions affects everyone with this role. For restricted access, create a new role with only the permissions needed and assign it in System → Users instead of this role. Other assigned roles may still grant access.
        </p>
        <div class="ks-pane-body ks-view-list">
          <PolicyCard v-for="p in readOnlyScope.policies" :key="p.id" :policy="p" mode="locked" />
          <div v-if="!readOnlyScope.policies.length" class="ks-pane-empty">No permissions in this role.</div>
        </div>

        <div v-if="readOnlyScope.overlay_policies && readOnlyScope.overlay_policies.length" class="ks-ext-block">
          <div class="ks-ext-head">
            <Icon icon="tabler:stack-2" aria-hidden="true" />
            <span>Additional permissions</span>
            <Pill severity="warn">{{ readOnlyScope.overlay_policies.length }}</Pill>
          </div>
          <div class="ks-pane-body ks-view-list">
            <PolicyCard v-for="p in readOnlyScope.overlay_policies" :key="p.id" :policy="p" mode="locked" />
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        icon="tabler:shield-lock"
        title="Roles"
        hint="Choose a role to view its permissions, or create one with the permissions your team needs. Assign roles in System → Users."
        cta="New role"
        cta-icon="tabler:plus"
        @cta="newScope"
      />
    </Shell>
  </div>
</template>
