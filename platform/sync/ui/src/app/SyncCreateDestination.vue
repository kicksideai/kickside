<script setup lang="ts">
import { Icon } from '@iconify/vue'
import WcMount from '@widgets/app/WcMount.vue'
import PickerSelect from '@widgets/app/PickerSelect.vue'
import type { PickerItem } from '@widgets/app/ports'
import type { SinkRow } from './syncInput'

// The Destination stage: the sink picker plus its picker-mounted configuration
// (and optional option fields). Editing an installed sync shows it locked — the
// destination and its config are owned by the installed automation and cannot
// change in place.

const props = defineProps<{
  items: PickerItem[]
  sinkId: string
  editing: boolean
  selectedSink: SinkRow | null
  configTag: string
  configSchema: unknown
  pickerMeta: unknown
  config: Record<string, unknown>
  hasOptions: boolean
  optionsSchema: unknown
  lockedHint: string
  sourceContext?: Record<string, unknown>
  sourceSchema?: string
}>()
const emit = defineEmits<{
  (e: 'update:sinkId', v: string): void
  (e: 'update:config', cfg: Record<string, unknown>): void
  (e: 'binding', value: unknown): void
}>()

function onConfigChange(cfg: unknown) {
  if (cfg && typeof cfg === 'object') emit('update:config', cfg as Record<string, unknown>)
}
</script>

<template>
  <div class="kx-stage">
    <div class="kx-stage-head">
      <span class="kx-stage-ico"><Icon :icon="props.selectedSink?.icon || 'tabler:database'" aria-hidden="true" /></span>
      <span class="kx-stage-lbl">Destination</span>
    </div>
    <PickerSelect
      :items="props.items"
      :model-value="props.sinkId"
      :disabled="props.editing"
      placeholder="Pick a destination…"
      @update:model-value="(v: string) => emit('update:sinkId', v)"
    />
    <!-- The destination and its configuration form the durable destination map
         the backend refuses to move; the editor states that instead of offering
         fields whose edits would be rejected. -->
    <p v-if="props.editing" class="kx-stage-desc">{{ props.lockedHint }}</p>
    <template v-if="props.selectedSink && !props.editing">
      <p v-if="props.selectedSink.description" class="kx-stage-desc">{{ props.selectedSink.description }}</p>
      <div class="kx-stage-cfg">
        <WcMount
          :tag="props.configTag"
          :schema="props.configSchema"
          :config="props.config"
          :meta="props.pickerMeta"
          :provider="props.selectedSink.provider"
          :attrs="{'source-context': props.sourceContext, 'source-schema': props.sourceSchema, 'return-route': '/automations'}"
          @change="onConfigChange"
          @select="emit('binding', $event)"
        />
        <div v-if="props.hasOptions" class="kx-stage-opts">
          <span class="kx-opts-lbl">Options</span>
          <WcMount
            tag="wc-schema-form"
            :schema="props.optionsSchema"
            :config="props.config"
            @change="onConfigChange"
          />
        </div>
      </div>
    </template>
  </div>
</template>
