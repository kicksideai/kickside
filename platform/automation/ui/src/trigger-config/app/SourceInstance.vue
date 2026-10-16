<script setup lang="ts">
import { computed } from 'vue'
import WcMount from '@widgets/app/WcMount.vue'
import type { GroupedSource } from '../spec'
import {
  SCHEMA_FORM_TAG, hasOptions, instanceValue, optionsSchemaOf, pickerMetaOf, primaryField,
} from '../source-instance'

// Which instance of the selected source this trigger binds to, plus whatever else
// that source declares as options. A singleton source declares no primary field:
// its one instance resolves server-side, so there is nothing to pick.
const props = defineProps<{
  source: GroupedSource
  config: Record<string, unknown>
  locked?: boolean
}>()
const emit = defineEmits<{ change: [unknown] }>()

const primary = computed(() => primaryField(props.source))
const instanceTag = computed(() => primary.value?.tag || SCHEMA_FORM_TAG)
const instanceSchema = computed(() => primary.value?.schema)
const pickerMeta = computed(() => pickerMetaOf(props.source, primary.value))
const optionsSchema = computed(() => optionsSchemaOf(props.source))
const showOptions = computed(() => hasOptions(props.source, primary.value))
const detailTag = computed(() => primary.value?.detail || '')
const detailConfig = computed(() => {
  const key = primary.value?.key || ''
  const id = instanceValue(primary.value, props.config)
  return key && id ? { [key]: id } : null
})
</script>

<template>
  <div v-if="primary || showOptions" class="kx-tc-field" data-test="tc-instance" :class="locked && 'kx-tc-locked'">
    <span v-if="primary?.title" class="kx-tc-lbl">{{ primary.title }}</span>
    <WcMount
      v-if="primary"
      :tag="instanceTag"
      :schema="instanceSchema"
      :config="config"
      :meta="pickerMeta"
      :provider="source.provider"
      @change="emit('change', $event)"
    />
    <div v-if="showOptions" class="kx-tc-opts">
      <span class="kx-tc-lbl">Options</span>
      <WcMount
        tag="wc-schema-form"
        :schema="optionsSchema"
        :config="config"
        @change="emit('change', $event)"
      />
    </div>
  </div>
  <div v-if="detailTag && detailConfig" class="kx-tc-detail" data-test="tc-detail">
    <WcMount :tag="detailTag" :config="detailConfig" />
  </div>
</template>
