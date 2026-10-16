<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, Position, getBezierPath, useVueFlow, type EdgeProps } from '@vue-flow/core'
import { completenessBadgePosition } from './mapping-edge-position'

interface MappingEdgeData {
  unmappedRequired?: string[]
  contractUnavailable?: boolean
}

const props = defineProps<EdgeProps<MappingEdgeData>>()
const { getViewport } = useVueFlow()
const path = computed(() => getBezierPath({
  sourceX: props.sourceX,
  sourceY: props.sourceY,
  sourcePosition: props.sourcePosition || Position.Bottom,
  targetX: props.targetX,
  targetY: props.targetY,
  targetPosition: props.targetPosition || Position.Top,
  curvature: props.curvature,
}))
const unmappedCount = computed(() => props.data?.unmappedRequired?.length || 0)
const contractUnavailable = computed(() => props.data?.contractUnavailable === true)
// The badge's translate lands inside VueFlow's zoom-scaled transform pane, so the
// perpendicular clearance completenessBadgePosition computes must be given the live zoom
// to stay a constant screen distance off the wire instead of ballooning outward on a
// tightly auto-fit graph (a small workflow can fit well above 1x zoom).
const badgePosition = computed(() => completenessBadgePosition(
  props.sourceX, props.sourceY, props.targetX, props.targetY, path.value[1], path.value[2], getViewport().zoom,
))
</script>

<template>
  <BaseEdge
    :id="id"
    :path="path[0]"
    :label="label"
    :label-x="path[1]"
    :label-y="path[2]"
    :label-style="labelStyle"
    :label-show-bg="labelShowBg"
    :label-bg-style="labelBgStyle"
    :label-bg-padding="labelBgPadding"
    :label-bg-border-radius="labelBgBorderRadius"
    :marker-start="markerStart"
    :marker-end="markerEnd"
    :interaction-width="interactionWidth"
  />
  <EdgeLabelRenderer v-if="unmappedCount || contractUnavailable">
    <span
      class="wf-edge-completeness-badge"
      :class="contractUnavailable && 'is-contract-unavailable'"
      :title="contractUnavailable ? 'This step’s input fields are unavailable' : `${unmappedCount} required field${unmappedCount === 1 ? '' : 's'} need mapping`"
      :style="{ transform: `translate(-50%, -50%) translate(${badgePosition.x}px, ${badgePosition.y}px)` }"
    >{{ contractUnavailable ? '!' : unmappedCount }}</span>
  </EdgeLabelRenderer>
</template>
