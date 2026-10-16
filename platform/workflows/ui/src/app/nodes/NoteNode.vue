<script setup lang="ts">
import { onMounted } from 'vue'
import { loadByTagName } from '@wippy-fe/proxy'
import { NodeResizer } from '@vue-flow/node-resizer'
import type { WfNoteData } from '../domain/graph-data'
import { noteColorClass } from './note-presentation'
import { NOTE_MIN_W, NOTE_MIN_H, useNoteResize } from './frame'

// A colored sticky note that sits behind the steps to group and annotate work.
// Its body renders markdown; content and color are set from the config panel.
const props = defineProps<{ id: string; data: WfNoteData; selected?: boolean }>()
const { hue, onResizeEnd } = useNoteResize(props.id, () => props.data)

onMounted(() => { void loadByTagName('wc-render-markdown', { timeoutMs: 8000 }).catch(() => { /* no-op */ }) })
</script>

<template>
  <NodeResizer
    :min-width="NOTE_MIN_W"
    :min-height="NOTE_MIN_H"
    :is-visible="!!selected"
    :color="hue"
    @resize-end="onResizeEnd"
  />
  <div class="wf-note" :class="[selected && 'wf-note--selected', noteColorClass(data.color)]">
    <wc-render-markdown v-if="props.data.text" class="wf-note-md" :source="props.data.text"></wc-render-markdown>
    <div v-else class="wf-note-empty">Empty note — write markdown in the panel</div>
  </div>
</template>
