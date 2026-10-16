<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { ModelCard, ModelProbeState } from '../types.ts'
import { Avatar, Button, IconButton, Pill } from './shared'
import { capIcon, fmtTokens, optionString, sourceLabel, sourceSeverity } from './presenters.ts'

// One model in the pool table: a provider brand avatar, identity (title + provider
// and id as subtext), capability / class chips (icon-tagged, capped with an
// overflow count), context / output limits, and row actions. Registry models
// cannot be deleted, only overlaid.
const props = defineProps<{
  model: ModelCard
  providerIcon: string
  providerTitle: string
  profileTitle: string
  probing?: boolean
  probeState?: ModelProbeState
  probeDetailsOpen?: boolean
  busy?: boolean
}>()
const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'probe'): void
  (e: 'toggle-probe-details'): void
  (e: 'toggle-enabled'): void
}>()

const CAP_LIMIT = 5
const caps = computed(() => props.model.capabilities ?? [])
const shownCaps = computed(() => caps.value.slice(0, CAP_LIMIT))
const extraCaps = computed(() => Math.max(0, caps.value.length - CAP_LIMIT))
const isReasoning = computed(() => (
  caps.value.includes('reasoning') ||
  caps.value.includes('extended_thinking') ||
  optionString(props.model, 'reasoning_model_request') === 'true'
))
const canProbe = computed(() => (
  props.model.enabled !== false &&
  (caps.value.includes('generate') || caps.value.includes('tool_use'))
))
const rowProbe = computed(() => (
  props.probeState?.model === props.model.name ? props.probeState : null
))
const probeStatus = computed(() => rowProbe.value?.status || 'idle')
const hasProbeResult = computed(() => probeStatus.value === 'ok' || probeStatus.value === 'fail')
const probeIcon = computed(() => {
  if (probeStatus.value === 'ok') return 'tabler:circle-check'
  if (probeStatus.value === 'fail') return 'tabler:circle-x'
  return 'tabler:activity-heartbeat'
})
const probeSeverity = computed(() => {
  if (probeStatus.value === 'ok') return 'success'
  if (probeStatus.value === 'fail') return 'danger'
  return undefined
})
const probeButtonLabel = computed(() => {
  if (props.probing) return `Checking ${props.model.title || props.model.name}`
  if (probeStatus.value === 'ok') return 'Model check succeeded. View details'
  if (probeStatus.value === 'fail') return 'Model check failed. View details'
  return 'Run model check'
})
const probeTokens = computed(() => {
  const t = rowProbe.value?.data?.tokens
  if (!t) return [] as { label: string; value: number }[]
  const order = ['prompt_tokens', 'completion_tokens', 'total_tokens', 'thinking_tokens']
  const seen = new Set<string>()
  const out: { label: string; value: number }[] = []
  const add = (k: string) => {
    const v = (t as Record<string, number>)[k]
    if (typeof v === 'number' && v > 0 && !seen.has(k)) {
      seen.add(k)
      out.push({ label: k.replace(/_tokens$/, '').replace(/_input$/, '').replace(/_/g, ' '), value: v })
    }
  }
  order.forEach(add)
  Object.keys(t).forEach(add)
  return out
})
function onProbeAction() {
  if (hasProbeResult.value) emit('toggle-probe-details')
  else emit('probe')
}
</script>

<template>
  <div class="km-mrow" :class="{ 'km-mrow-off': model.enabled === false }">
    <Avatar :icon="providerIcon" />

    <div class="km-mrow-id">
      <div class="km-mrow-title">
        <span class="km-mrow-title-text">{{ model.title || model.name }}</span>
        <Pill :severity="sourceSeverity(model.source)">{{ sourceLabel(model.source) }}</Pill>
        <Pill v-if="model.enabled === false" severity="secondary" icon="tabler:ban">disabled</Pill>
      </div>
      <div class="km-mrow-sub">
        <span class="km-mrow-prov">{{ providerTitle || '—' }}</span>
        <template v-if="model.provider_profile_id"> · {{ profileTitle }}</template>
        <span class="km-mrow-mono"> · {{ model.name }}</span>
      </div>
    </div>

    <div class="km-mrow-tags">
      <span v-if="(model.class || []).length" class="km-tag-group km-tag-classes">
        <Pill v-for="cls in model.class || []" :key="`k-${cls}`" severity="" icon="tabler:category-2">{{ cls }}</Pill>
      </span>
      <span class="km-tag-group km-tag-caps">
        <Pill v-if="isReasoning" severity="info" icon="tabler:bulb">reasoning</Pill>
        <Pill v-for="cap in shownCaps" :key="`c-${cap}`" severity="secondary" :icon="capIcon(cap) || undefined">{{ cap }}</Pill>
        <Pill v-if="extraCaps" severity="secondary">+{{ extraCaps }}</Pill>
      </span>
    </div>

    <div class="km-mrow-limits">
      <span><b>{{ fmtTokens(model.max_tokens) }}</b> ctx</span>
      <span><b>{{ fmtTokens(model.output_tokens) }}</b> out</span>
    </div>

    <div class="km-mrow-limit-chips" aria-label="Token limits">
      <span><b>{{ fmtTokens(model.max_tokens) }}</b> ctx</span>
      <span><b>{{ fmtTokens(model.output_tokens) }}</b> out</span>
    </div>

    <div class="km-mrow-acts">
      <IconButton
        v-if="canProbe"
        :icon="probeIcon"
        :label="probeButtonLabel"
        size="sm"
        :severity="probeSeverity"
        :active="hasProbeResult && probeDetailsOpen"
        :spin="probing"
        :disabled="probing || (!hasProbeResult && busy)"
        @click="onProbeAction"
      />
      <IconButton
        :icon="model.enabled === false ? 'tabler:circle-check' : 'tabler:circle-minus'"
        :label="model.enabled === false ? 'Enable model' : 'Disable model'"
        size="sm"
        :variant="model.enabled === false ? 'bordered' : 'danger'"
        :disabled="busy"
        @click="emit('toggle-enabled')"
      />
      <IconButton icon="tabler:adjustments" label="Edit model" size="sm" @click="emit('edit')" />
      <IconButton
        v-if="model.source !== 'registry'"
        icon="tabler:trash"
        label="Delete model"
        size="sm"
        variant="danger"
        @click="emit('delete')"
      />
    </div>

    <div
      v-if="probeDetailsOpen && hasProbeResult"
      class="km-mrow-probe"
      :class="probeStatus"
    >
      <div class="km-mrow-probe-head">
        <Icon :icon="probeStatus === 'ok' ? 'tabler:circle-check' : 'tabler:circle-x'" aria-hidden="true" />
        <span class="km-mrow-probe-msg">{{ rowProbe?.message }}</span>
        <span v-if="rowProbe?.data && rowProbe.data.elapsed_ms != null" class="km-probe-time">{{ rowProbe.data.elapsed_ms }} ms</span>
        <Button icon="tabler:activity-heartbeat" variant="ghost" small :disabled="probing || busy" @click="emit('probe')">
          Run again
        </Button>
      </div>

      <div v-if="rowProbe?.data" class="km-mrow-probe-body">
        <div class="km-probe-grid">
          <div class="km-probe-kv"><span>Model</span><code>{{ rowProbe.data.model }}</code></div>
          <div v-if="rowProbe.data.provider_model" class="km-probe-kv"><span>Provider model</span><code>{{ rowProbe.data.provider_model }}</code></div>
          <div v-if="rowProbe.data.provider_id" class="km-probe-kv"><span>Provider</span><code>{{ rowProbe.data.provider_id }}</code></div>
          <div v-if="rowProbe.data.provider_profile_id" class="km-probe-kv"><span>Profile</span><code>{{ rowProbe.data.provider_profile_id }}</code></div>
          <div v-if="rowProbe.data.finish_reason" class="km-probe-kv"><span>Finish</span><code>{{ rowProbe.data.finish_reason }}</code></div>
          <div v-if="rowProbe.data.max_tokens != null" class="km-probe-kv"><span>Probe budget</span><code>{{ rowProbe.data.max_tokens }} tok</code></div>
          <div class="km-probe-kv"><span>Reasoning</span><code>{{ rowProbe.data.reasoning ? 'yes' : 'no' }}</code></div>
        </div>
        <div v-if="probeTokens.length" class="km-probe-tokens">
          <span class="km-probe-tokens-l">Tokens</span>
          <span v-for="tk in probeTokens" :key="tk.label" class="km-probe-tok"><b>{{ tk.value }}</b> {{ tk.label }}</span>
        </div>
        <div v-if="rowProbe.data.output" class="km-probe-out">
          <span>Output</span>
          <pre>{{ rowProbe.data.output }}</pre>
        </div>
        <div v-if="rowProbe.data.error" class="km-probe-out">
          <span>Error</span>
          <pre>{{ rowProbe.data.error }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
