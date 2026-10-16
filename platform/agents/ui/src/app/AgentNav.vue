<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Vertical section nav for the agent editor's left pane: a list of clickable
// section items (icon + label + active indicator). Selection is owned by the
// parent (v-model), this only renders + emits.
interface NavItem { key: string; label: string; icon: string; meta?: string }
defineProps<{ items: NavItem[]; active: string }>()
const emit = defineEmits<{ (e: 'select', key: string): void }>()
</script>

<template>
  <nav class="kx-nav" role="tablist" aria-label="Agent sections">
    <button
      v-for="it in items"
      :key="it.key"
      type="button"
      role="tab"
      class="kx-nav-item"
      :class="active === it.key && 'kx-nav-item-on'"
      :aria-selected="active === it.key"
      @click="emit('select', it.key)"
    >
      <span class="kx-nav-ico"><Icon :icon="it.icon" aria-hidden="true" /></span>
      <span class="kx-nav-lbl">{{ it.label }}</span>
      <span v-if="it.meta" class="kx-nav-meta">{{ it.meta }}</span>
    </button>
  </nav>
</template>
