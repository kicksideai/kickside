<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import type { ComponentDeletionState } from './useComponentDeletion'
const props = defineProps<{state: ComponentDeletionState}>()
defineEmits<{retry: []}>()
const failed = computed(() => !props.state.deletion_job || ['dead', 'cancelled'].includes(props.state.deletion_job.status))
</script>

<template>
  <span v-if="state.deleting_at" class="component-deletion" role="status" @click.stop @keydown.stop>
    <template v-if="failed">
      <span>Deletion failed<span v-if="state.deletion_job?.last_error">: {{ state.deletion_job.last_error }}</span></span>
      <Button label="Retry deletion" severity="secondary" size="small" outlined @click.stop="$emit('retry')" />
    </template>
    <template v-else>
      <ProgressSpinner class="component-deletion-spinner" aria-label="Deletion in progress" />
      <span>Deleting…</span>
    </template>
  </span>
</template>

<style scoped>
.component-deletion { display: inline-flex; align-items: center; gap: .5rem; color: var(--p-text-muted-color); }
.component-deletion-spinner { width: 1rem; height: 1rem; margin: 0; }
</style>
