<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineEmits<{
  show: []
}>()
</script>

<template>
  <div class="right-flap-container fixed top-1/2 right-0 -translate-y-1/2 z-10">
    <div class="right-flap flex items-center justify-center bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 shadow-md rounded-l-md overflow-hidden">
      <button
        type="button"
        class="p-2 text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        aria-label="Open chat"
        title="Open chat"
        @click="$emit('show')"
      >
        <Icon icon="tabler:chevron-left" class="flap-icon" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.right-flap-container {
  width: 48px;
  height: 80px;
}

.right-flap {
  position: absolute;
  right: -8px;
  width: 40px;
  height: 80px;
  border-radius: 6px 0 0 6px;
  transform: translateX(28px);
  transition: transform 0.3s ease;
}

.right-flap-container:hover .right-flap {
  transform: translateX(0);
}

.flap-icon {
  width: 24px;
  height: 24px;
  font-size: 24px;
}
</style>
