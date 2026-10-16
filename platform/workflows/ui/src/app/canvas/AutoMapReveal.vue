<script setup lang="ts">
import Button from 'primevue/button'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { AutoMappedEdge } from './canvas-connect'
import { AUTO_REVEAL_TITLE, AUTO_REVEAL_HINT, AUTO_TRACE_LABEL, autoRevealSummary } from './intent-copy'
import { useOverlayMeasure, type OverlayMeasure } from './use-overlay-measure'

// The auto-map affordance (W11.1 + owner amendment): the instant an obvious mapping applies,
// a calm reveal moment shows what the system did — source → target pills, one per field,
// visible without any interaction — then fades after ~2.6s to a small persistent trace. The
// trace expands the per-field WHY on hover and opens the full mapper on click. Reduced motion
// gets the same brief static display, no fade. Nothing here is a guess: every line is a name
// and type match the user can open and read.

const REVEAL_MS = 2600
const RELINGER_MS = 1200

const props = defineProps<{ entry: AutoMappedEdge }>()
const emit = defineEmits<{ (e: 'open', id: string): void; (e: 'dismiss', id: string): void; (e: 'measure', measure: OverlayMeasure): void }>()
const { overlayEl } = useOverlayMeasure((measure) => emit('measure', measure))

const phase = ref<'reveal' | 'trace'>('reveal')
const traceHover = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const fields = computed(() => props.entry.result.fields)
const summary = computed(() => autoRevealSummary(fields.value.length))

function arm(ms: number) {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { phase.value = 'trace' }, ms)
}
// Moving onto the reveal pins it (a user reaching for it shouldn't have it vanish); leaving
// re-arms a short linger before it settles into the trace.
function pin() { if (timer) { clearTimeout(timer); timer = null } }
function relinger() { if (phase.value === 'reveal') arm(RELINGER_MS) }

onMounted(() => arm(REVEAL_MS))
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
</script>

<template>
  <div ref="overlayEl" class="wf-automap" @pointerdown.stop>
    <!-- Reveal moment: the system did this, here's what it did. -->
    <Button
      v-if="phase === 'reveal'"
      class="wf-automap-card"
      severity="secondary"
      outlined
      :aria-label="`${AUTO_REVEAL_TITLE}. ${summary}. Open mapping`"
      @mouseenter="pin"
      @mouseleave="relinger"
      @click="emit('open', entry.id)"
    >
      <span class="wf-automap-hd">
        <Icon icon="tabler:wand" aria-hidden="true" />
        <span class="wf-automap-title">{{ AUTO_REVEAL_TITLE }}</span>
        <span class="wf-automap-count">{{ summary }}</span>
      </span>
      <span class="wf-automap-pairs">
        <span v-for="f in fields" :key="f.key" class="wf-automap-pair" :title="f.why">
          <code class="wf-automap-src">{{ f.sourceName }}</code>
          <Icon icon="tabler:arrow-right" aria-hidden="true" />
          <code class="wf-automap-tgt">{{ f.title }}</code>
        </span>
      </span>
      <span class="wf-automap-hint">{{ AUTO_REVEAL_HINT }}</span>
    </Button>

    <!-- Persistent trace: the WHY, on demand. -->
    <div
      v-else
      class="wf-automap-trace"
      :class="{ 'is-open': traceHover }"
      @mouseenter="traceHover = true"
      @mouseleave="traceHover = false"
      @focusin="traceHover = true"
      @focusout="traceHover = false"
    >
      <Button class="wf-automap-tracebtn" text rounded severity="secondary" :aria-label="AUTO_TRACE_LABEL" :title="AUTO_TRACE_LABEL" @click="emit('open', entry.id)">
        <Icon icon="tabler:wand" aria-hidden="true" />
        <span class="wf-automap-tracelbl">{{ AUTO_TRACE_LABEL }}</span>
      </Button>
      <Button class="wf-automap-tracex" text rounded severity="secondary" aria-label="Dismiss automatic mapping explanation" @click="emit('dismiss', entry.id)"><Icon icon="tabler:x" aria-hidden="true" /></Button>
      <div v-if="traceHover" class="wf-automap-why">
        <p v-for="f in fields" :key="f.key" class="wf-automap-whyline">{{ f.why }}</p>
      </div>
    </div>
  </div>
</template>
