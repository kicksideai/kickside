<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { Icon } from '@iconify/vue'
import type { WfNodeData } from '../domain/graph-data'
import {
  FAILED_PORT_GUTTER,
  nodeDimensionsForPorts,
  PORT_BASE_BOTTOM_PADDING,
  PORT_GAP,
  PORT_LABEL_MIN_WIDTH,
  PORT_ROW_HEIGHT,
  PORT_SIDE_INSET,
} from '../mapping/node-geometry'
import { hueClass } from '../domain/node-policy'

// One workflow step, rendered as a compact card: a hue-tinted icon well, the human
// kind label and the title — one line each, no raw registry id (that lives in the
// config panel and the hover tooltip). The kind hue arrives as a CSS var name so
// every accent is a color-mix off the host token — no literal colors here. The run
// overlay drives status presentation purely from data.runStatus. A block with named
// outgoing ports (Condition: True/False; a Flow: Finished/Failed) renders them
// labeled on the card.
//
// A boundary node (Start/Finish/Error) is the workflow's pinned interface contract: it
// renders locked, one-sided (Start emits, Finish/Error receive), with no delete
// affordance, in the calm "contract" palette — set apart from ordinary data steps.
const props = defineProps<{ data: WfNodeData; selected?: boolean }>()

// A single unnamed port keeps the classic bottom+right source handles; named ports
// render as labeled dots along the bottom edge.
const named = computed(() => props.data.outPorts.length > 1 || (props.data.outPorts[0]?.id ?? '') !== '')
const role = computed(() => props.data.boundaryRole)
// Start emits the run input (source only); Finish/Error resolve an output (target only).
const showTargets = computed(() => role.value !== 'start')
const showSources = computed(() => role.value !== 'finish' && role.value !== 'error')
const NAMED_HANDLE_STYLE = { position: 'relative', transform: 'none', left: 'auto', top: 'auto' }
const FAILED_HANDLE_STYLE = { position: 'relative', transform: 'none', left: 'auto', top: 'auto', width: '9px', height: '9px' }
// The one geometry contract drives the CSS grid as well as dagre, containers and drag
// clamps. Large outcome sets wrap downward instead of making the entire graph page-wide.
const geometry = computed(() => nodeDimensionsForPorts(props.data.outPorts, props.data.failedPort))
const nodeStyle = computed(() => ({
  width: `${geometry.value.width}px`,
  minHeight: `${geometry.value.height}px`,
  '--wfn-port-columns': String(geometry.value.columns),
  '--wfn-port-rows': String(geometry.value.rows),
  '--wfn-port-cell-width': `${geometry.value.cellWidth}px`,
  '--wfn-port-row-height': `${PORT_ROW_HEIGHT}px`,
  '--wfn-port-left': `${PORT_SIDE_INSET}px`,
  '--wfn-port-right': `${PORT_SIDE_INSET + (props.data.failedPort ? FAILED_PORT_GUTTER : 0)}px`,
  '--wfn-port-gap': `${PORT_GAP}px`,
  '--wfn-port-min-width': `${PORT_LABEL_MIN_WIDTH}px`,
  ...(named.value ? {
    paddingBottom: `${PORT_BASE_BOTTOM_PADDING + Math.max(0, geometry.value.rows - 1) * PORT_ROW_HEIGHT}px`,
  } : {}),
}))
</script>

<template>
  <div
    class="wfn"
    :class="[
      `wfn--${data.kind}`,
      hueClass(data.hueVar),
      selected && 'wfn--selected',
      `is-${data.runStatus}`,
      named && 'wfn--ports',
      data.failedPort && 'wfn--has-failport',
      data.pinned && 'wfn--pinned',
      data.failedWired && 'wfn--failwired',
      data.issue && 'wfn--issue',
      role && `wfn--boundary wfn--boundary-${role}`,
    ]"
    :style="nodeStyle"
    :title="data.issue || data.ref || data.title"
    role="group"
    :aria-label="`${data.kindLabel}: ${data.title}${data.runStatus !== 'idle' ? `, ${data.runStatus}` : ''}`"
  >
    <span v-if="data.issue" class="wfn-issue" :title="data.issue" aria-hidden="true"><Icon icon="tabler:alert-triangle" /></span>
    <template v-if="showTargets">
      <Handle id="in-top" type="target" :position="Position.Top" class="wfn-port" aria-label="Connect into step" title="Connect into step" />
      <Handle id="in-left" type="target" :position="Position.Left" class="wfn-port" aria-label="Connect into step" title="Connect into step" />
    </template>

    <span class="wfn-ring" aria-hidden="true"></span>

    <span v-if="data.pinned" class="wfn-lock" title="Workflow input/output step — locked and can’t be deleted"><Icon icon="tabler:lock" aria-hidden="true" /></span>

    <div class="wfn-well">
      <Icon :icon="data.icon" aria-hidden="true" />
      <span v-if="data.runStatus === 'completed'" class="wfn-status wfn-status--ok" aria-hidden="true"><Icon icon="tabler:check" /></span>
      <span v-else-if="data.runStatus === 'failed'" class="wfn-status wfn-status--fail" aria-hidden="true"><Icon icon="tabler:x" /></span>
    </div>
    <div class="wfn-body">
      <div class="wfn-kind">{{ data.kindLabel }}</div>
      <div class="wfn-title">{{ data.title }}</div>
      <div v-if="data.sub" class="wfn-sub">{{ data.sub }}</div>
    </div>

    <span v-if="data.runStatus === 'awaiting'" class="wfn-await">
      <span class="wfn-await-pulse" aria-hidden="true"></span>
      <span>{{ data.awaitingLabel || 'Waiting for review' }}</span>
    </span>

    <template v-if="showSources">
      <template v-if="named">
        <span class="wfn-portrow" role="group" aria-label="Outputs">
          <span v-for="p in data.outPorts" :key="p.id" class="wfn-portslot">
            <Handle :id="p.id" type="source" :position="Position.Bottom" class="wfn-port wfn-port--named" :class="`wfn-port--${p.id}`" :style="NAMED_HANDLE_STYLE" :aria-label="`Connect from ${p.label}`" :title="`Connect from ${p.label}`" />
            <span class="wfn-portlabel" :title="p.label">{{ p.label }}</span>
          </span>
        </span>
      </template>
      <template v-else>
        <Handle id="out-bottom" type="source" :position="Position.Bottom" class="wfn-port" aria-label="Connect from output" title="Connect from output" />
        <Handle id="out-right" type="source" :position="Position.Right" class="wfn-port" aria-label="Connect from output" title="Connect from output" />
      </template>
      <!-- Generalized Failed port: a danger-hued recovery route, additive to the success
           handles above. A quiet drag affordance until it is wired or explicitly opted in,
           then it shows its label. Drag from it to route a step failure downstream. -->
      <span v-if="data.failedPort" class="wfn-failport">
        <Handle id="failed" type="source" :position="Position.Right" class="wfn-port wfn-port--failed wfn-port--failaff" :style="FAILED_HANDLE_STYLE" aria-label="Connect from Failed" title="Connect from Failed" />
        <span v-if="data.failedWired" class="wfn-faillabel">Failed</span>
      </span>
    </template>
  </div>
</template>
