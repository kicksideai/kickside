<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { host } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import type { ModelCard, ModelProbeState, Preset, Profile, TestState } from '../types.ts'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import Tabs from 'primevue/tabs'
import { Drawer, IconButton, Notice, RailHeader, Shell, Spinner } from './shared'
import ProviderList from './ProviderList.vue'
import ModelPool from './ModelPool.vue'
import ModelClasses from './ModelClasses.vue'
import ProviderPicker from './ProviderPicker.vue'
import ModelEditor from './ModelEditor.vue'
import ProviderProfileEditor from './ProviderProfileEditor.vue'
import ExternalProviderEditor from './ExternalProviderEditor.vue'
import { isBuiltInEditorTag, specKeyForTag } from '../providerSpecs.ts'
import { useModelsApi } from './useModelsApi.ts'
import { makeLookups } from './presenters.ts'

// kickside-models — the Models settings surface. A borderless rail + main shell:
// connected provider profiles in the rail (selecting one scopes the pool), the
// searchable model pool in the main pane, and a right-docked drawer for the
// add / edit flows. Adding a provider runs a two-stage drawer (pick a provider,
// then the spec-driven editor resolved from the provider's profile_editor_tag).
// All data flows through the models admin API.
const COMPAT_EDITOR = 'kickside-model-provider-openai-compatible'
const COMPAT_PROVIDER = 'wippy.llm.openai_compat:provider'

const store = useModelsApi()
const { adapters, presets, profiles, models, classes, loading, saving, discovering, probing, error } = store

// Main-pane view: the model pool or the registry-resolved class catalog.
const view = ref<'models' | 'classes'>('models')
const lookups = makeLookups(() => adapters.value, () => profiles.value)

const poolProfileId = ref('all')

type DrawerStage = 'none' | 'pick' | 'provider' | 'model'
const stage = ref<DrawerStage>('none')
const profileMode = ref<'create' | 'edit'>('create')
const selectedPreset = ref<Preset | null>(null)
const editingProfile = ref<Profile | null>(null)
const editingModel = ref<ModelCard | null>(null)

const testState = ref<TestState>({ status: 'idle' })
const probeState = ref<ModelProbeState>({ status: 'idle' })
const probeDetailsModel = ref('')

// Capability / class suggestion universe for the model editor, drawn from the
// live catalog so token inputs propose what already exists.
function unionValues(pick: (m: ModelCard) => string[] | undefined) {
  const set = new Set<string>()
  for (const m of models.value) for (const v of pick(m) ?? []) set.add(v)
  return Array.from(set).sort()
}
const capabilityUniverse = computed(() => unionValues(m => m.capabilities))
// Class suggestions are the full declared vocabulary (every model_class entry),
// unioned with any class already used by a model — not just assigned ones.
const classUniverse = computed(() => {
  const set = new Set<string>()
  for (const c of classes.value) if (c.name) set.add(c.name)
  for (const m of models.value) for (const v of m.class ?? []) set.add(v)
  return Array.from(set).sort()
})

const selectedProviderId = computed(
  () => editingProfile.value?.provider_id || selectedPreset.value?.provider_id || COMPAT_PROVIDER,
)
const selectedAdapter = computed(() => lookups.adapterFor(selectedProviderId.value))
const selectedEditorTag = computed(
  () => selectedPreset.value?.profile_editor_tag || selectedAdapter.value?.profile_editor_tag || COMPAT_EDITOR,
)
const profileSpecKey = computed(() => specKeyForTag(selectedEditorTag.value))
const useBuiltInEditor = computed(() => isBuiltInEditorTag(selectedEditorTag.value))

const drawerOpen = computed(() => stage.value !== 'none')
const drawerMeta = computed(() => {
  if (stage.value === 'pick') return { title: 'Add provider', icon: 'tabler:plug-connected', back: false }
  if (stage.value === 'provider') {
    return profileMode.value === 'edit'
      ? { title: editingProfile.value?.name || 'Edit provider', icon: 'tabler:plug-connected', back: false }
      : { title: selectedPreset.value?.title || 'Add provider', icon: 'tabler:plug-connected', back: true }
  }
  if (stage.value === 'model') return { title: editingModel.value?.title || editingModel.value?.name || 'Edit model', icon: 'tabler:adjustments', back: false }
  return { title: '', icon: '', back: false }
})

function closeDrawer() {
  if (saving.value) return
  stage.value = 'none'
  selectedPreset.value = null
  editingProfile.value = null
  editingModel.value = null
  testState.value = { status: 'idle' }
}

function openAdd() {
  profileMode.value = 'create'
  selectedPreset.value = null
  editingProfile.value = null
  stage.value = 'pick'
}

function pickPreset(preset: Preset) {
  selectedPreset.value = preset
  stage.value = 'provider'
}

function drawerBack() {
  selectedPreset.value = null
  stage.value = 'pick'
}

function openEditProfile(profile: Profile) {
  profileMode.value = 'edit'
  selectedPreset.value = null
  editingProfile.value = profile
  testState.value = { status: 'idle' }
  stage.value = 'provider'
}

async function onProfileTest() {
  if (!editingProfile.value) return
  testState.value = { status: 'testing' }
  const result = await store.testProfile(editingProfile.value.id)
  testState.value = { status: result.ok ? 'ok' : 'fail', message: result.message }
}

function openEditModel(model: ModelCard) {
  editingModel.value = model
  stage.value = 'model'
}

async function onProfileSave(payloadOrEvent: any) {
  const payload = payloadOrEvent?.detail ?? payloadOrEvent
  const ok = await store.saveProfile(profileMode.value, editingProfile.value?.id || '', payload)
  if (ok) closeDrawer()
}

async function onModelSave(payload: Record<string, unknown>) {
  const ok = await store.saveCard(payload)
  if (ok) closeDrawer()
}

function modelTogglePayload(model: ModelCard): Record<string, unknown> {
  return {
    name: model.name,
    title: model.title || model.name,
    description: model.description || '',
    provider_id: model.provider_id,
    provider_profile_id: model.provider_profile_id || undefined,
    provider_model: model.provider_model || model.name,
    capabilities: [...(model.capabilities ?? [])],
    classes: [...(model.class ?? [])],
    priority: Number(model.priority ?? 10),
    max_tokens: Number(model.max_tokens ?? 0),
    output_tokens: Number(model.output_tokens ?? 0),
    dimensions: Number(model.dimensions ?? 0),
    pricing: model.pricing ?? {},
    options: model.options ?? {},
    metadata: model.metadata ?? {},
    source: model.source === 'registry' ? 'overlay' : (model.source || 'overlay'),
    enabled: model.enabled === false,
  }
}

async function onModelToggle(model: ModelCard) {
  await store.saveCard(modelTogglePayload(model))
}

async function onModelProbe(model: ModelCard) {
  probeDetailsModel.value = ''
  probeState.value = { status: 'testing', model: model.name, message: `Probing ${model.title || model.name}` }
  const result = await store.testModel(model.name)
  probeState.value = {
    status: result.ok ? 'ok' : 'fail',
    model: model.name,
    message: result.message,
    data: result.data,
  }
}

function onProbeDetailsToggle(model: ModelCard) {
  if (probeState.value.model !== model.name) return
  if (probeState.value.status !== 'ok' && probeState.value.status !== 'fail') return
  probeDetailsModel.value = probeDetailsModel.value === model.name ? '' : model.name
}

async function askDeleteProfile(profile: Profile) {
  const ok = await host.confirm({
    header: 'Delete provider',
    message: `Remove “${profile.name}”? This cannot be undone.`,
    icon: 'tabler:trash',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
  })
  if (!ok) return
  await store.deleteProfile(profile.id)
}
async function askDeleteModel(model: ModelCard) {
  if (model.source === 'registry') return
  const label = model.title || model.name
  const ok = await host.confirm({
    header: 'Delete model',
    message: `Remove “${label}”? This cannot be undone.`,
    icon: 'tabler:trash',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
  })
  if (!ok) return
  await store.deleteCard(model.name)
}

// Classes are derived from the live catalog, so refresh them whenever the Classes
// view is shown.
watch(view, (v) => { if (v === 'classes') store.loadClasses() })

useHostVisibilityRefresh(async () => {
  await Promise.all([store.load(), store.loadClasses()])
})
</script>

<template>
  <div class="km">
    <Notice v-if="error" severity="danger" class="km-top-notice" @dismiss="error = ''">{{ error }}</Notice>

    <Spinner v-if="loading && !models.length && !profiles.length" label="Loading models…" />

    <Shell v-else>
      <template #rail>
        <RailHeader title="Providers" :count="profiles.length">
          <template #actions>
            <IconButton icon="tabler:plus" label="Add provider" :disabled="saving" @click="openAdd" />
            <IconButton icon="tabler:refresh" label="Refresh" :disabled="loading" :spin="loading" @click="store.load" />
          </template>
        </RailHeader>
        <div class="km-rail-body">
          <ProviderList
            :profiles="profiles"
            :adapters="adapters"
            :presets="presets"
            :selected-id="poolProfileId"
            :discovering="discovering"
            :busy="saving"
            @select="poolProfileId = $event"
            @add="openAdd"
            @edit="openEditProfile"
            @discover="store.discover($event.id)"
            @delete="askDeleteProfile"
          />
        </div>
      </template>

      <Tabs class="km-tabs" data-kx-separator="surface" :value="view" @update:value="view = String($event) as typeof view">
        <TabList aria-label="Model sections">
          <Tab value="models">Models<b>{{ models.length }}</b></Tab>
          <Tab value="classes">Classes<b>{{ classes.length }}</b></Tab>
        </TabList>
      </Tabs>

      <ModelPool
        v-if="view === 'models'"
        :selected-profile-id="poolProfileId"
        :models="models"
        :profiles="profiles"
        :adapters="adapters"
        :presets="presets"
        :probing-model="probing"
        :probe-state="probeState"
        :probe-details-model="probeDetailsModel"
        :busy="saving"
        @edit="openEditModel"
        @delete="askDeleteModel"
        @probe="onModelProbe"
        @toggle-probe-details="onProbeDetailsToggle"
        @toggle-enabled="onModelToggle"
        @add="openAdd"
      />
      <ModelClasses v-else :classes="classes" />
    </Shell>

    <Drawer
      :open="drawerOpen"
      :title="drawerMeta.title"
      :icon="drawerMeta.icon"
      :back="drawerMeta.back"
      @close="closeDrawer"
      @back="drawerBack"
    >
      <ProviderPicker v-if="stage === 'pick'" :presets="presets" @pick="pickPreset" />

      <ProviderProfileEditor
        v-else-if="stage === 'provider' && useBuiltInEditor"
        :spec-key="profileSpecKey"
        :mode="profileMode"
        :adapter="selectedAdapter || undefined"
        :preset="selectedPreset || undefined"
        :profile="editingProfile"
        :saving="saving"
        :test-state="testState"
        @save="onProfileSave"
        @cancel="closeDrawer"
        @test="onProfileTest"
      />

      <ExternalProviderEditor
        v-else-if="stage === 'provider'"
        :tag="selectedEditorTag"
        :mode="profileMode"
        :adapter="selectedAdapter || undefined"
        :preset="selectedPreset || undefined"
        :profile="editingProfile"
        :saving="saving"
        :test-state="testState"
        @save="onProfileSave"
        @cancel="closeDrawer"
        @test="onProfileTest"
      />

      <ModelEditor
        v-else-if="stage === 'model'"
        :model="editingModel"
        :profiles="profiles"
        :saving="saving"
        :capability-options="capabilityUniverse"
        :class-options="classUniverse"
        @save="onModelSave"
        @cancel="closeDrawer"
      />
    </Drawer>
  </div>
</template>
