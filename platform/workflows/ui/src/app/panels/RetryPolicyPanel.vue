<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import SelectButton from 'primevue/selectbutton'
import type { RetryPolicy, WfNode } from '../types'
import type { BlockExecution } from '../domain/node-policy'

const props = defineProps<{ node: WfNode; execution: BlockExecution }>()
const emit = defineEmits<{ (e: 'update-node', patch: Partial<WfNode>): void }>()
const policy = computed(() => props.node.retry_policy || props.execution.retry_policy || undefined)
const declared = computed(() => props.execution.retry_policy || undefined)
// Wippy errors constants; UNKNOWN is empty and is not a valid retry error type.
const errorKinds = ['NotFound', 'AlreadyExists', 'Invalid', 'PermissionDenied', 'Unavailable', 'Internal', 'Canceled', 'Conflict', 'Timeout', 'RateLimited']
const durations = [
  { field: 'initial_interval', label: 'Initial interval', default: '1s' },
  { field: 'maximum_interval', label: 'Maximum interval', default: '100 × initial interval' },
] as const
const timeouts = [
  { field: 'start_to_close_timeout', label: 'Per-attempt timeout' },
  { field: 'schedule_to_close_timeout', label: 'Total window' },
] as const
function updatePolicy(field: keyof RetryPolicy, value: unknown) {
  const next = { ...policy.value, [field]: value }
  if (value === undefined) delete next[field]
  emit('update-node', { retry_policy: next })
}
function durationText(value: unknown): string {
  return typeof value === 'number' ? `${value}ms` : String(value ?? '')
}
function inputValue(event: Event): string {
  return (event.target as HTMLInputElement).value.trim()
}
</script>

<template>
  <section class="wf-retries" aria-label="Retries">
    <div class="wf-retry-heading">
      <h3 class="wf-panel-label">Retries</h3>
      <Button v-if="!node.retry_policy" label="Override" aria-label="Override retry policy" size="small" text @click="emit('update-node', { retry_policy: { ...declared } })" />
      <Button v-else label="Reset" aria-label="Reset retry policy" size="small" text @click="emit('update-node', { retry_policy: false })" />
    </div>
    <p class="wf-panel-hint">{{ policy ? 'Maximum attempts includes the first attempt; 0 means unlimited.' : 'One attempt. Override the retry policy to retry failed attempts.' }}</p>
    <template v-if="policy">
      <div class="wf-retry-field">
        <label class="wf-retry-label" for="wf-retry-attempts">Maximum attempts</label>
        <InputNumber input-id="wf-retry-attempts" class="wf-input" input-class="wf-input" :model-value="policy.maximum_attempts ?? 0" aria-label="Maximum attempts" :use-grouping="false" :min="0" @update:model-value="(v) => updatePolicy('maximum_attempts', v ?? undefined)" />
        <p class="wf-panel-hint">Block default: {{ declared ? declared.maximum_attempts ?? 0 : 'one attempt' }}</p>
      </div>
      <div v-for="item in durations" :key="item.field" class="wf-retry-field">
        <label class="wf-retry-label" :for="`wf-retry-${item.field}`">{{ item.label }}</label>
        <InputText :id="`wf-retry-${item.field}`" class="wf-input" :model-value="durationText(policy[item.field])" :aria-label="item.label" :placeholder="item.default" @change="(e) => updatePolicy(item.field, inputValue(e) || undefined)" />
        <p class="wf-panel-hint">Block default: {{ durationText(declared?.[item.field]) || (declared ? item.default : 'no policy') }}</p>
      </div>
      <div class="wf-retry-field">
        <label class="wf-retry-label" for="wf-retry-backoff">Backoff coefficient</label>
        <InputNumber input-id="wf-retry-backoff" class="wf-input" input-class="wf-input" :model-value="policy.backoff_coefficient ?? 2" aria-label="Backoff coefficient" :min="1" :max-fraction-digits="6" :use-grouping="false" @update:model-value="(v) => updatePolicy('backoff_coefficient', v ?? undefined)" />
        <p class="wf-panel-hint">Block default: {{ declared ? declared.backoff_coefficient ?? 2 : 'no policy' }}</p>
      </div>
      <div class="wf-retry-field">
        <span id="wf-retry-kinds-label" class="wf-retry-label">Non-retryable error kinds</span>
        <SelectButton class="wf-retry-kinds" :model-value="policy.non_retryable_error_types || []" :options="errorKinds" multiple aria-labelledby="wf-retry-kinds-label" @update:model-value="(v) => updatePolicy('non_retryable_error_types', v ?? [])" />
        <p class="wf-panel-hint">Block default: {{ declared?.non_retryable_error_types?.join(', ') || 'none' }}</p>
      </div>
    </template>
    <div v-for="item in timeouts" :key="item.field" class="wf-retry-field">
      <div class="wf-retry-heading">
        <label class="wf-retry-label" :for="`wf-retry-${item.field}`">{{ item.label }}</label>
        <Button v-if="node[item.field] !== undefined && node[item.field] !== false" label="Reset" :aria-label="`Reset ${item.label.toLowerCase()}`" text size="small" @click="emit('update-node', { [item.field]: false })" />
      </div>
      <InputText :id="`wf-retry-${item.field}`" class="wf-input" :model-value="durationText(node[item.field] || execution[item.field])" :aria-label="item.label" placeholder="No timeout" @change="(e) => emit('update-node', { [item.field]: inputValue(e) || false })" />
      <p class="wf-panel-hint">Block default: {{ durationText(execution[item.field]) || 'no timeout' }}. Use durations such as 500ms or 30s.</p>
    </div>
  </section>
</template>
