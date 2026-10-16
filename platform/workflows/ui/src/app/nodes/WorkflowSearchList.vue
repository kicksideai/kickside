<script setup lang="ts">
// Shared search + list + row + empty-state chrome for a published-Workflow picker.
// EmbedWorkflowPicker and FlowPicker (the Call node's picker) both list published
// Workflows behind a search box; this owns the query state, filtering, loading/error
// states and the list scaffold, while each caller supplies its own row markup (slot),
// CSS classes and per-row emphasis so the two pickers keep their distinct identities.
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { FlowCandidate } from './flow-candidate'

const props = defineProps<{
  rows: FlowCandidate[]
  loading: boolean
  error: string
  matches: (item: FlowCandidate, query: string) => boolean
  placeholder: string
  emptyMessage: string
  rootClass: string
  searchClass?: string
  noteClass: string
  errorClass: string
  listClass: string
  rowClass: string
  rowExtraClass?: (item: FlowCandidate) => unknown
  isDisabled?: (item: FlowCandidate) => boolean
  // A row the caller marks as emphasized carries the default button emphasis; every other
  // row is the picker's quiet secondary. A picker with no emphasized row (the embed) leaves
  // this unset and gets the quiet form throughout.
  isEmphasized?: (item: FlowCandidate) => boolean
  quietRows?: boolean
  emptyClass: string
}>()
const emit = defineEmits<{ (e: 'select', item: FlowCandidate): void }>()

const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.rows
  return props.rows.filter((r) => props.matches(r, q))
})
function emphasized(item: FlowCandidate): boolean {
  return props.isEmphasized?.(item) === true
}
</script>

<template>
  <div :class="rootClass">
    <IconField class="wf-search" :class="searchClass">
      <InputIcon><Icon icon="tabler:search" aria-hidden="true" /></InputIcon>
      <InputText v-model="query" :placeholder="placeholder" :aria-label="placeholder" />
    </IconField>

    <slot name="before-list" />

    <div v-if="loading" :class="noteClass"><ProgressSpinner class="wf-status-spinner" stroke-width="4" aria-label="Loading Workflows" /><span>Loading Workflows…</span></div>
    <Message v-else-if="error" :class="errorClass" severity="error" :closable="false">{{ error }}</Message>
    <div v-else :class="listClass">
      <Button
        v-for="item in filtered"
        :key="item.id"
        type="button"
        :class="[rowClass, rowExtraClass?.(item)]"
        :severity="emphasized(item) ? undefined : 'secondary'"
        :text="quietRows === true"
        :outlined="quietRows !== true && !emphasized(item)"
        :disabled="isDisabled?.(item)"
        @click="emit('select', item)"
      >
        <slot name="row" :item="item" />
      </Button>
      <p v-if="!filtered.length" :class="emptyClass">
        {{ rows.length ? 'No matching Workflows.' : emptyMessage }}
      </p>
    </div>
  </div>
</template>
