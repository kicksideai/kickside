<script setup lang="ts">
import { computed } from 'vue'
import Drawer from 'primevue/drawer'
import { Icon } from '@iconify/vue'
import IconButton from './IconButton.vue'

// Right-docked slide-in drawer hosting the add / edit surfaces. Thin wrapper over
// PrimeVue's Drawer so the rest of the module keeps a stable API: a scrim click or
// Escape closes it (native to PrimeVue), an optional back affordance steps within a
// multi-stage flow, and the footer slot, when present, stays pinned below the body.
//
// The theme's PrimeVuePlugin patches PrimeVue's shared Portal so the drawer's
// overlay teleports into this web component's shadow root by default, so the
// module's shadow-scoped `.km-*` body styles reach the panel and the facade
// `--p-drawer-*` tokens theme its chrome.
const props = defineProps<{ open: boolean; title: string; icon?: string; wide?: boolean; back?: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'back'): void }>()

const width = computed(() => (props.wide ? 'min(720px, calc(100vw - 36px))' : 'min(560px, calc(100vw - 36px))'))

function onVisible(v: boolean) {
  if (!v) emit('close')
}
</script>

<template>
  <Drawer
    :visible="open"
    position="right"
    :modal="true"
    :pt="{ content: { class: 'km-drawer-content' } }"
    :dismissable="true"
    :close-on-escape="true"
    :style="{ width }"
    :aria-label="title"
    @update:visible="onVisible"
  >
    <template #header>
      <IconButton v-if="back" icon="tabler:chevron-left" label="Back" @click="emit('back')" />
      <span class="km-drawer-title"><Icon v-if="icon" :icon="icon" aria-hidden="true" />{{ title }}</span>
    </template>

    <slot />

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Drawer>
</template>
