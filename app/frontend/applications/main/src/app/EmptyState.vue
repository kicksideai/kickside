<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  icon?: string
  title: string
  message?: string
  hint?: string
}>()
</script>

<template>
  <div class="h-full flex items-center justify-center p-8">
    <div class="text-center max-w-sm au">
      <div class="brand-mark mx-auto mb-6">
        <Icon :icon="icon || 'tabler:square-rounded'" class="w-7 h-7" aria-hidden="true" />
      </div>
      <h2 class="text-base font-semibold text-surface-900 dark:text-surface-0 mb-1.5 tracking-tight">{{ title }}</h2>
      <p v-if="message" class="text-sm text-surface-500 leading-relaxed">{{ message }}</p>
      <div v-if="hint" class="mt-5 inline-flex items-start gap-2 text-left rounded-lg px-3 py-2 text-xs text-surface-500"
           style="background: var(--kx-surface-2); border: 1px solid var(--p-content-border-color)">
        <Icon icon="tabler:bulb" class="w-4 h-4 text-primary shrink-0 mt-px" aria-hidden="true" />
        <span>{{ hint }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Decorative brand-tinted mark for empty states — uses the primary accent
   (brand-decorative) so the empty experience still reads as KickSide. */
.brand-mark {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: var(--p-primary-color);
  background: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);
  border: 1px solid color-mix(in srgb, var(--p-primary-color) 24%, var(--p-content-background) 76%);
}
</style>
