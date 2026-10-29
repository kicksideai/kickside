<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'

defineProps<{ dirty: boolean; saving: boolean; invalid?: boolean; saved?: boolean; disabled?: boolean }>()
defineEmits<{ discard: []; save: [] }>()
</script>

<template>
  <header class="ap-bar">
    <span v-if="dirty" class="ap-dirty" role="status">Unsaved changes</span>
    <span v-if="saved" class="ks-saved" role="status"><span class="ks-saved-tick" aria-hidden="true">✓</span> Saved</span>
    <Button type="button" label="Discard" severity="secondary" outlined :disabled="disabled || !dirty || saving" @click="$emit('discard')" />
    <Button type="button" :label="saving ? 'Saving…' : 'Save'" :loading="saving" :disabled="disabled || !dirty || saving || invalid" @click="$emit('save')">
      <template #icon><Icon v-if="!saving" icon="tabler:device-floppy" aria-hidden="true" /></template>
    </Button>
  </header>
</template>
