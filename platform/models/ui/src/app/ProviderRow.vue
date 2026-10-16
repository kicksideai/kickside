<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Profile } from '../types.ts'
import { Avatar, IconButton, Pill } from './shared'
import { hasCredential, profileEndpoint, statusLabel, statusSeverity } from './presenters.ts'
import { formatDateTime } from '@widgets/app/datetime'

// Provider profile entry in the rail. The body selects the profile (filtering the
// pool) and tooltips its endpoint; a key glyph marks stored credentials. Hover
// reveals discover / edit / delete; discover is disabled — and explains why — for
// providers without automatic discovery.
const props = defineProps<{
  profile: Profile
  providerIcon: string
  adapterTitle: string
  selected: boolean
  discoverable: boolean
  discovering: boolean
  busy: boolean
}>()
const emit = defineEmits<{
  (e: 'select'): void
  (e: 'edit'): void
  (e: 'discover'): void
  (e: 'delete'): void
}>()

const discoverLabel = computed(() => {
  if (!props.discoverable) return 'Automatic model discovery is not available for this provider'
  const at = formatDateTime(props.profile.last_discovered_at)
  return at ? `Discover models (last ${at})` : 'Discover models'
})
</script>

<template>
  <div class="km-prow" :class="{ on: selected }">
    <button class="km-prow-main" :title="profileEndpoint(profile)" @click="emit('select')">
      <Avatar :icon="providerIcon" size="sm" />
      <span class="km-prow-text">
        <span class="km-prow-name">
          <span>{{ profile.name }}</span>
          <Icon v-if="hasCredential(profile)" icon="tabler:key" class="km-prow-cred" title="Credentials stored" aria-hidden="true" />
          <span class="km-prow-dot" :class="statusSeverity(profile.status)" :title="statusLabel(profile.status)" aria-hidden="true" />
        </span>
        <span class="km-prow-sub">{{ adapterTitle }}</span>
      </span>
      <Pill v-if="!profile.enabled" severity="warn">off</Pill>
    </button>
    <div class="km-prow-acts">
      <IconButton
        icon="tabler:radar-2"
        :label="discoverLabel"
        size="sm"
        :disabled="!discoverable || discovering || busy"
        :spin="discovering"
        @click="emit('discover')"
      />
      <IconButton icon="tabler:edit" label="Edit provider" size="sm" :disabled="busy" @click="emit('edit')" />
      <IconButton icon="tabler:trash" label="Delete provider" size="sm" variant="danger" :disabled="busy" @click="emit('delete')" />
    </div>
    <div v-if="profile.message" class="km-prow-msg">{{ profile.message }}</div>
  </div>
</template>
