<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { SyncTransform } from './syncInput'

// The Transform stage IS the reusable kickside-transform-assist web component: it
// negotiates a source->sink mapping against real schemas and reports the
// confirmed transform config whole. This stage only mounts it (once both ends are
// picked) and forwards its confirm event to the parent, which owns the
// transform value and the auto-detect hint shown above it.

const TRANSFORM_ASSIST_TAG = 'kickside-transform-assist'

const props = defineProps<{
  canAssist: boolean
  detected: { needed: boolean; reason: string } | null
  transform: SyncTransform | null
  sourceSchema: string
  sinkSchema: string
  inputShape: string
  hint: string
  value: string
  generationPolicy?: string | Record<string, unknown>
}>()
const emit = defineEmits<{
  (e: 'transform-confirmed', ev: Event): void
}>()

function onConfirmed(e: Event) { emit('transform-confirmed', e) }
</script>

<template>
  <div class="kx-stage kx-stage-mid">
    <div class="kx-stage-head">
      <span class="kx-stage-ico"><Icon icon="tabler:transform" aria-hidden="true" /></span>
      <span class="kx-stage-lbl">Transform</span>
    </div>
    <p v-if="!props.canAssist" class="kx-stage-desc" data-test="pl-transform-hint">Pick a source and destination to define the transform.</p>
    <template v-else>
      <div v-if="props.detected && (!props.transform || props.transform.kind === 'none')" class="kx-detect" :class="props.detected.needed && 'kx-detect-warn'">
        <Icon :icon="props.detected.needed ? 'tabler:alert-triangle' : 'tabler:circle-check'" aria-hidden="true" />
        <span>{{ props.detected.reason }}</span>
      </div>
      <component
        :is="TRANSFORM_ASSIST_TAG"
        data-test="pl-transform"
        :source-schema="props.sourceSchema"
        :sink-schema="props.sinkSchema"
        :input-shape="props.inputShape"
        :hint="props.hint"
        :value="props.value"
        :generation-policy="props.generationPolicy"
        @transform-confirmed="onConfirmed"
      />
    </template>
  </div>
</template>
