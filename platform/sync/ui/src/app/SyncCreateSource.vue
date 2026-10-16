<script setup lang="ts">
import { Icon } from '@iconify/vue'
import WcMount from '@widgets/app/WcMount.vue'

// The Source stage IS the embedded <kickside-trigger-config> editor: it owns the
// source catalog, the instance picker + option fields, the cadence, and the
// history import, and reports the whole trigger spec per edit. This stage only
// mounts the WC and forwards its `change` event to the parent, which owns the
// spec, its validity, and the derived hints (output_schema, reconcile).

const TRIGGER_CONFIG_TAG = 'kickside-trigger-config'

const props = defineProps<{
  icon: string
  seed: Record<string, unknown> | string
  editing: boolean
}>()
const emit = defineEmits<{ (e: 'change', detail: unknown): void }>()

function onChange(detail: unknown) { emit('change', detail) }
</script>

<template>
  <div class="kx-stage">
    <div class="kx-stage-head">
      <span class="kx-stage-ico"><Icon :icon="props.icon" aria-hidden="true" /></span>
      <span class="kx-stage-lbl">Source</span>
    </div>
    <!-- The embedded trigger editor owns the whole Source stage: catalog,
         instance + options, cadence, history. A data sync always feeds off a
         source, so the source family is the only one offered. -->
    <div class="kx-stage-cfg" data-test="pl-trigger">
      <WcMount
        :tag="TRIGGER_CONFIG_TAG"
        :attrs="{ allowed: 'source', reconfigure: props.editing ? 'true' : null, value: props.seed }"
        @change="onChange"
      />
    </div>
  </div>
</template>
