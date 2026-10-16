<script setup lang="ts">
import { computed } from 'vue'
import { NodeResizer } from '@vue-flow/node-resizer'
import type { WfNoteData } from '../domain/graph-data'
import { noteColorClass } from './note-presentation'
import { NOTE_MIN_W, NOTE_MIN_H, useNoteResize } from './frame'

// A colored background region that groups nodes visually. Its fill is translucent so
// the canvas grid reads through, and its body is click-through — only the title strip
// and the resize handles are interactive, so nodes placed over the frame stay usable.
const props = defineProps<{ id: string; data: WfNoteData; selected?: boolean }>()
const { hue, onResizeEnd } = useNoteResize(props.id, () => props.data)
const title = computed(() => (props.data.text || '').split('\n')[0]?.trim() || '')
</script>

<template>
  <NodeResizer
    :min-width="NOTE_MIN_W"
    :min-height="NOTE_MIN_H"
    :is-visible="!!selected"
    :color="hue"
    @resize-end="onResizeEnd"
  />
  <div class="wf-frame" :class="[selected && 'wf-frame--selected', noteColorClass(data.color)]">
    <div class="wf-frame-title">{{ title || 'Frame' }}</div>
  </div>
</template>
