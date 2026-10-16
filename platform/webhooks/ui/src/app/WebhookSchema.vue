<script setup lang="ts">
import { computed } from 'vue'
import { schemaFields } from './schema'

// Read-only, first-class presentation of a webhook's payload schema: the shape
// every inbound request is validated against and the output face downstream
// data-flow transforms consume. Shared by the management detail modal and the
// data-flow source picker so both render the schema identically.
const props = defineProps<{ schema?: Record<string, unknown> | null }>()
const fields = computed(() => schemaFields(props.schema || {}))
</script>

<template>
  <div v-if="fields.length" class="wh-schema-fields">
    <div v-for="f in fields" :key="f.key" class="wh-field-row">
      <span class="wh-field-key">{{ f.key }}</span>
      <span class="wh-field-type">{{ f.type }}</span>
      <span v-if="f.required" class="wh-field-req">required</span>
      <span v-if="f.description" class="wh-field-desc" :title="f.description">{{ f.description }}</span>
    </div>
  </div>
  <div v-else class="wh-schema-any">Accepts any JSON object — no fields are required.</div>
</template>
