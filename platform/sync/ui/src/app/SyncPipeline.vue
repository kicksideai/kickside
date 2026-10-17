<script setup lang="ts">
import { Icon } from '@iconify/vue'
import SyncCreateSource from './SyncCreateSource.vue'
import SyncCreateTransform from './SyncCreateTransform.vue'
import SyncCreateDestination from './SyncCreateDestination.vue'
import { LOCKED_HINT, type SyncForm } from './useSyncForm'

// The Source -> Transform -> Destination pipeline fields plus the reconciliation
// opt-in, rendered over one sync form. The create view and the manage view each
// own their submit contract around it.
const props = defineProps<{
  form: SyncForm
  destinationLocked?: boolean
  generationPolicy?: string | Record<string, unknown>
}>()
const f = props.form
</script>

<template>
  <label class="kx-field">
    <span class="kx-field-lbl">Name <span class="kx-req" aria-hidden="true">*</span></span>
    <input v-model="f.title.value" data-test="pl-title" class="kx-input" type="text" placeholder="Fireflies to Knowledge Base" />
  </label>

  <div class="kx-pipe">
    <SyncCreateSource
      :icon="f.selectedSource.value?.icon || 'tabler:plug'"
      :seed="f.triggerSeed.value"
      :editing="f.managed"
      @change="f.onTriggerChange"
    />

    <div class="kx-pipe-conn"><Icon icon="tabler:arrow-down" aria-hidden="true" /></div>

    <SyncCreateTransform
      :can-assist="f.canAssist.value"
      :detected="f.transformDetected.value"
      :transform="f.transform.value"
      :samples="f.assistSamples.value"
      :sample-error="f.sampleError.value"
      :source-schema="f.assistSourceSchema.value"
      :sink-schema="f.assistSinkSchema.value"
      :input-shape="f.assistInputShape.value"
      :hint="f.assistHint.value"
      :value="f.assistValue.value"
      :generation-policy="props.generationPolicy"
      @transform-confirmed="f.onAssistConfirmed"
    />

    <div class="kx-pipe-conn"><Icon icon="tabler:arrow-down" aria-hidden="true" /></div>

    <SyncCreateDestination
      :items="f.sinkItems.value"
      :sink-id="f.sinkId.value"
      :editing="f.managed || !!props.destinationLocked"
      :selected-sink="f.selectedSink.value"
      :config-tag="f.sinkConfigTag.value"
      :config-schema="f.sinkConfigSchema.value"
      :picker-meta="f.sinkPickerMeta.value"
      :config="f.sinkConfig.value"
      :has-options="f.sinkHasOptions.value"
      :options-schema="f.sinkOptionsSchema.value"
      :locked-hint="props.destinationLocked ? 'Selected by the owning component.' : LOCKED_HINT"
      @update:sink-id="(v: string) => { f.sinkId.value = v; f.onSinkChange() }"
      @update:config="(cfg: Record<string, unknown>) => { f.sinkConfig.value = { ...f.sinkConfig.value, ...cfg } }"
    />
  </div>

  <!-- Reconciliation is one Sync-owned capability, offered only when the source
       can enumerate its keys and the destination can delete by key. -->
  <div v-if="f.supportsReconcile.value || (f.managed && f.reconcileEnabled.value)" class="kx-runopts">
    <div class="kx-field">
      <label class="kx-reconcile-check">
        <input v-model="f.reconcileEnabled.value" class="kx-check" type="checkbox" :disabled="f.managed" />
        <span>Reconcile deleted source items</span>
      </label>
      <span class="kx-field-hint">
        {{ f.managed ? LOCKED_HINT : 'Periodically compares source keys with this sync’s owned destinations and removes items that disappeared from the source.' }}
      </span>
    </div>
  </div>
</template>
