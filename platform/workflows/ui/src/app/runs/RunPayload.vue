<script setup lang="ts">
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { stringifyPayload, truncatePayload } from './run-detail'

// A read-only payload block for the run inspector: a labeled, collapsible section that
// pretty-prints a value and copies it to the clipboard. A string is prose (an agent's
// answer) rendered as markdown; anything else is structured data rendered as JSON, with
// large payloads truncated to a leading slice behind an expand affordance. This is the
// one payload surface the drawer reuses for input, output, error detail and trace — the
// editable SchemaEditor is the write surface; this is its read-only counterpart.
const props = withDefaults(defineProps<{
  value: unknown
  label: string
  icon?: string
  open?: boolean
  maxLines?: number
}>(), { icon: 'tabler:code', open: true, maxLines: 40 })

const isString = computed(() => typeof props.value === 'string')
const text = computed(() => stringifyPayload(props.value))
const trunc = computed(() => truncatePayload(text.value, props.maxLines))

const collapsed = ref(!props.open)
const expanded = ref(false)
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(text.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1400)
  } catch { /* clipboard unavailable — no-op, the value stays selectable */ }
}
</script>

<template>
  <Panel v-model:collapsed="collapsed" class="wf-payload" toggleable>
    <template #header>
      <span class="wf-payload-title">
        <Icon :icon="icon" aria-hidden="true" />
        <span>{{ label }}</span>
      </span>
    </template>
    <template #icons>
      <Button class="wf-payload-copy" severity="secondary" outlined size="small" :title="copied ? 'Copied' : 'Copy to clipboard'" @click="copy">
        <Icon :icon="copied ? 'tabler:check' : 'tabler:copy'" aria-hidden="true" />
        <span>{{ copied ? 'Copied' : 'Copy' }}</span>
      </Button>
    </template>
    <wc-render-markdown v-if="isString" class="wf-run-md" :source="String(value)"></wc-render-markdown>
    <template v-else>
      <pre class="wf-run-output wf-mono">{{ expanded || !trunc.truncated ? text : trunc.preview }}</pre>
      <Button v-if="trunc.truncated" class="wf-payload-more" severity="secondary" outlined size="small" @click="expanded = !expanded">
        <Icon :icon="expanded ? 'tabler:chevrons-up' : 'tabler:chevrons-down'" aria-hidden="true" />
        <span>{{ expanded ? 'Show less' : `Show ${trunc.hiddenLines} more lines` }}</span>
      </Button>
    </template>
  </Panel>
</template>
