<script setup lang="ts">
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { NO_LABEL_KEY } from './workflow-labels'

// The workflow-list header chrome: one compact row — title on the left, then the single
// toolbar (search, label filter, flat/grouped toggle, Templates / Import, the muted workflow
// count, and the primary New action rightmost). The list-page description rides as a title
// tooltip so the toolbar keeps one row instead of stacking a second block. Search, the label
// filter and the view toggle are v-model bound; actions emit up.
const HEAD_HINT =
  'Build Workflows from steps, tools, and AI agents. Publish them to use them in Automations, other Workflows, or agents.'

const props = defineProps<{
  totalCount: number
  labelVocab: string[]
  q: string
  labelFilter: string | null
  groupBy: 'flat' | 'label'
}>()
const emit = defineEmits<{
  (e: 'update:q', v: string): void
  (e: 'update:labelFilter', v: string | null): void
  (e: 'update:groupBy', v: 'flat' | 'label'): void
  (e: 'import', invoker: HTMLElement | null): void
  (e: 'create', invoker: HTMLElement | null): void
}>()

const LABEL_ALL = '__all__'
const groupOptions = [
  { label: 'Flat', value: 'flat' },
  { label: 'Grouped', value: 'label' },
] as const
const labelOptions = computed(() => [
  { label: 'All labels', value: LABEL_ALL },
  ...props.labelVocab.map((label) => ({ label, value: label })),
  { label: 'No label', value: NO_LABEL_KEY },
])
function onLabelFilter(value: string | null) {
  emit('update:labelFilter', value === LABEL_ALL || value === null ? null : value)
}
function onGroupBy(value: 'flat' | 'label' | null) {
  if (value) emit('update:groupBy', value)
}
function buttonInvoker(event: Event): HTMLElement | null {
  return event.currentTarget instanceof HTMLElement ? event.currentTarget : null
}
</script>

<template>
  <header class="kx-head">
    <div class="kx-head-icon"><Icon icon="tabler:route" aria-hidden="true" /></div>
    <div class="kx-head-text">
      <h1 class="kx-title" :title="HEAD_HINT">Workflows</h1>
    </div>
    <div class="kx-head-actions">
      <IconField class="kx-search">
        <InputIcon><Icon icon="tabler:search" class="kx-search-ico" aria-hidden="true" /></InputIcon>
        <InputText :value="q" class="kx-search-input" type="text" placeholder="Search Workflows…" aria-label="Search Workflows" @input="emit('update:q', ($event.target as HTMLInputElement).value)" />
      </IconField>
      <div v-if="labelVocab.length" class="wf-label-filter">
        <Icon icon="tabler:tag" class="wf-label-filter-ico" aria-hidden="true" />
        <Select
          class="wf-label-select"
          :model-value="labelFilter === null ? LABEL_ALL : labelFilter"
          :options="labelOptions"
          option-label="label"
          option-value="value"
          aria-label="Filter by label"
          @update:model-value="onLabelFilter"
        />
      </div>
      <SelectButton
        class="kx-seg"
        :model-value="groupBy"
        :options="[...groupOptions]"
        option-label="label"
        option-value="value"
        aria-label="Group by label"
        :allow-empty="false"
        @update:model-value="onGroupBy"
      />
      <Button data-testid="import-workflow" severity="secondary" outlined title="Import a Workflow JSON file" @click="emit('import', buttonInvoker($event))">
        <Icon icon="tabler:file-import" aria-hidden="true" />
        <span>Import</span>
      </Button>
      <span class="kx-count">{{ totalCount }} Workflow{{ totalCount === 1 ? '' : 's' }}</span>
      <Button data-testid="create-workflow" @click="emit('create', buttonInvoker($event))">
        <Icon icon="tabler:plus" aria-hidden="true" />
        <span>New Workflow</span>
      </Button>
    </div>
  </header>
</template>
