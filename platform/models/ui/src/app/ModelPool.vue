<script setup lang="ts">
import { computed, toRef, watch } from 'vue'
import type { Adapter, ModelCard, ModelProbeState, Preset, Profile } from '../types.ts'
import { Button, EmptyState, IconButton, Pill, SearchField, SelectField } from './shared'
import ModelRow from './ModelRow.vue'
import { useModelFilters } from './useModelFilters.ts'
import { makeLookups } from './presenters.ts'

// Main pane: the searchable, filterable model pool. Filter state lives in the
// useModelFilters composable. Profile scoping is owned by the rail (selecting a
// provider there), so the pool exposes only the non-redundant facets: source,
// provider, capability, and class.
const props = defineProps<{
  models: ModelCard[]
  profiles: Profile[]
  adapters: Adapter[]
  presets: Preset[]
  selectedProfileId: string
  probingModel?: string
  probeState?: ModelProbeState
  probeDetailsModel?: string
  busy?: boolean
}>()
const emit = defineEmits<{
  (e: 'edit', model: ModelCard): void
  (e: 'delete', model: ModelCard): void
  (e: 'probe', model: ModelCard): void
  (e: 'toggle-probe-details', model: ModelCard): void
  (e: 'toggle-enabled', model: ModelCard): void
  (e: 'add'): void
}>()

const lookups = makeLookups(() => props.adapters, () => props.profiles, () => props.presets)
const f = useModelFilters(toRef(props, 'models'))

const sourceOptions = [
  { label: 'All sources', value: 'all' },
  { label: 'Built-in', value: 'registry' },
  { label: 'Discovered', value: 'discovered' },
  { label: 'Overlay', value: 'overlay' },
]
const providerOptions = computed(() => [
  { label: 'All providers', value: 'all' },
  ...f.providerOptions.value.map(id => ({ label: lookups.adapterTitle(id), value: id })),
])
const capabilityOptions = computed(() => [
  { label: 'All capabilities', value: 'all' },
  ...f.capabilityOptions.value.map(cap => ({ label: cap, value: cap })),
])
const classOptions = computed(() => [
  { label: 'All classes', value: 'all' },
  ...f.classOptions.value.map(cls => ({ label: cls, value: cls })),
])

const counts = computed(() => {
  let registry = 0, discovered = 0, overlay = 0
  for (const m of props.models) {
    if (m.source === 'registry') registry++
    else if (m.source === 'discovered') discovered++
    else overlay++
  }
  return { registry, discovered, overlay }
})

// The rail selection scopes the pool by profile.
watch(() => props.selectedProfileId, (id) => { f.state.profile = id || 'all' }, { immediate: true })
</script>

<template>
  <div class="km-pool">
    <header class="km-pool-head">
      <div class="km-pool-head-top">
        <div class="km-pool-title">
          <span>Model pool</span>
          <span class="km-pool-counts">
            <Pill severity="info">{{ counts.registry }} built-in</Pill>
            <Pill severity="success">{{ counts.discovered }} discovered</Pill>
            <Pill severity="warn">{{ counts.overlay }} overlay</Pill>
          </span>
        </div>
        <SearchField v-model="f.state.search" placeholder="Search models" />
      </div>

      <div class="km-pool-filters">
        <SelectField v-model="f.state.source" :options="sourceOptions" aria-label="Source" />
        <SelectField v-model="f.state.provider" :options="providerOptions" aria-label="Provider" />
        <SelectField v-model="f.state.capability" :options="capabilityOptions" aria-label="Capability" />
        <SelectField v-model="f.state.klass" :options="classOptions" aria-label="Class" />
        <IconButton
          v-if="f.activeCount.value"
          icon="tabler:filter-off"
          label="Clear filters"
          variant="bordered"
          @click="f.reset()"
        />
      </div>
    </header>

    <div v-if="!models.length" class="km-pool-body">
      <EmptyState
        icon="tabler:cpu"
        title="No models yet"
        hint="Connect a provider and discover its models, or add one manually."
        cta="Add provider"
        cta-icon="tabler:plus"
        @cta="emit('add')"
      />
    </div>

    <div v-else-if="!f.filtered.value.length" class="km-pool-body">
      <EmptyState icon="tabler:search-off" title="No models match" hint="Adjust the search or filters." />
    </div>

    <div v-else class="km-pool-table">
      <div class="km-pool-cols">
        <span></span>
        <span>Model</span>
        <span>Capabilities &amp; classes</span>
        <span class="km-pool-cols-r">Limits</span>
        <span></span>
      </div>

      <ModelRow
        v-for="model in f.visible.value"
        :key="model.name"
        :model="model"
        :provider-icon="lookups.providerIcon(model.provider_id)"
        :provider-title="lookups.adapterTitle(model.provider_id)"
        :profile-title="lookups.profileTitle(model.provider_profile_id)"
        :probing="probingModel === model.name"
        :probe-state="probeState"
        :probe-details-open="probeDetailsModel === model.name"
        :busy="busy"
        @edit="emit('edit', model)"
        @delete="emit('delete', model)"
        @probe="emit('probe', model)"
        @toggle-probe-details="emit('toggle-probe-details', model)"
        @toggle-enabled="emit('toggle-enabled', model)"
      />

      <div v-if="f.hasMore.value" class="km-pool-more">
        <Button variant="ghost" icon="tabler:chevron-down" @click="f.more()">
          Show more ({{ f.filtered.value.length - f.visible.value.length }})
        </Button>
      </div>
    </div>
  </div>
</template>
