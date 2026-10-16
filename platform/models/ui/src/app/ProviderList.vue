<script setup lang="ts">
import type { Adapter, Preset, Profile } from '../types.ts'
import { Button } from './shared'
import ProviderRow from './ProviderRow.vue'
import { makeLookups } from './presenters.ts'

// Rail body: an "All providers" reset entry followed by one row per profile.
// Selecting a row filters the pool; row actions edit / discover / delete.
const props = defineProps<{
  profiles: Profile[]
  adapters: Adapter[]
  presets: Preset[]
  selectedId: string
  discovering: string
  busy: boolean
}>()
const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'edit', profile: Profile): void
  (e: 'discover', profile: Profile): void
  (e: 'delete', profile: Profile): void
  (e: 'add'): void
}>()

const lookups = makeLookups(() => props.adapters, () => props.profiles, () => props.presets)
</script>

<template>
  <div class="km-plist">
    <button class="km-plist-all" :class="{ on: selectedId === 'all' }" @click="emit('select', 'all')">
      All providers
    </button>

    <div v-if="!profiles.length" class="km-plist-empty">
      <p>No providers connected.</p>
      <Button small icon="tabler:plus" @click="emit('add')">Add provider</Button>
    </div>

    <ProviderRow
      v-for="profile in profiles"
      :key="profile.id"
      :profile="profile"
      :provider-icon="lookups.providerIcon(profile.provider_id)"
      :adapter-title="lookups.adapterTitle(profile.provider_id)"
      :selected="selectedId === profile.id"
      :discoverable="lookups.isDiscoverable(profile)"
      :discovering="discovering === profile.id"
      :busy="busy"
      @select="emit('select', profile.id)"
      @edit="emit('edit', profile)"
      @discover="emit('discover', profile)"
      @delete="emit('delete', profile)"
    />
  </div>
</template>
