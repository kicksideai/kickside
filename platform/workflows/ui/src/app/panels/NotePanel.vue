<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { WfNote } from '../types'
import { NOTE_COLORS, noteColorClass } from '../nodes/note-presentation'

// The note / frame face of the inspector, extracted from NodeConfigPanel. A frame is a note
// with kind 'frame': same color swatches, but a single-line title instead of the markdown
// body.
const props = defineProps<{
  note: WfNote
}>()
const emit = defineEmits<{
  (e: 'update-note', patch: Partial<WfNote>): void
  (e: 'remove-note'): void
}>()

const isFrame = computed(() => props.note?.kind === 'frame')
const colorOptions = [...NOTE_COLORS]
const selectedColor = computed({
  get: () => props.note?.color || 'amber',
  set: (color: string) => emit('update-note', { color }),
})
const noteDraft = ref('')
watch(() => props.note?.id, () => { noteDraft.value = props.note?.text || '' }, { immediate: true })
</script>

<template>
  <div class="wf-panel-hdr wf-panel-hdr--note">
    <span class="wf-panel-hdr-kind">{{ isFrame ? 'Frame' : 'Note' }}</span>
  </div>
  <SelectButton
    v-model="selectedColor"
    class="wf-note-colors"
    :options="colorOptions"
    option-label="key"
    option-value="key"
    :aria-label="isFrame ? 'Frame color' : 'Note color'"
  >
    <template #option="{ option }">
      <span
        class="wf-note-color-dot"
        :class="noteColorClass(option.key).replace('wf-note--', 'wf-swatch--')"
        aria-hidden="true"
      ></span>
      <span class="wf-sr-only">{{ option.key }}</span>
    </template>
  </SelectButton>
  <template v-if="isFrame">
    <div class="wf-panel-label">Title</div>
    <InputText
      v-model="noteDraft"
      class="wf-input"
      placeholder="Frame title"
      aria-label="Frame title"
      @change="emit('update-note', { text: noteDraft })"
      @keydown.enter="emit('update-note', { text: noteDraft })"
    />
    <p class="wf-panel-hint">A colored background region — drag steps onto it to group them, and resize it from its corners.</p>
  </template>
  <template v-else>
    <Textarea
      v-model="noteDraft"
      class="wf-textarea"
      rows="6"
      placeholder="Write a note… markdown supported"
      aria-label="Note text"
      @change="emit('update-note', { text: noteDraft })"
    ></Textarea>
    <p class="wf-panel-hint">Markdown supported — headings, lists, links, and code.</p>
  </template>
  <div class="wf-panel-foot">
    <Button severity="danger" @click="emit('remove-note')"><Icon icon="tabler:trash" aria-hidden="true" /><span>Delete {{ isFrame ? 'frame' : 'note' }}</span></Button>
  </div>
</template>
