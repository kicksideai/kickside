<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Policy } from '../types.ts'
import Pill from './shared/Pill.vue'

const props = defineProps<{ policy: Policy, mode: 'palette' | 'selected' | 'locked' }>()
const emit = defineEmits<{ add: []; remove: [] }>()

const title = computed(() => props.policy.title && props.policy.title !== props.policy.id
  ? props.policy.title : 'Unnamed permission')

function onDragStart(e: DragEvent) {
  if (props.mode === 'locked' || !e.dataTransfer) return
  e.dataTransfer.setData('text/plain', props.policy.id)
  e.dataTransfer.effectAllowed = props.mode === 'palette' ? 'copy' : 'move'
}
</script>

<template>
  <div
    class="ks-pcard"
    :class="mode"
    :draggable="mode !== 'locked'"
    @dragstart="onDragStart"
    @dblclick="mode === 'palette' && emit('add')"
  >
    <div class="ks-pcard-row">
      <Icon v-if="mode === 'locked'" icon="tabler:lock" class="ks-pcard-grip locked" aria-hidden="true" />
      <Icon v-else icon="tabler:grip-vertical" class="ks-pcard-grip" aria-hidden="true" />
      <div class="ks-pcard-body">
        <div class="ks-pcard-head">
          <Pill v-if="policy.effect === 'allow' || policy.effect === 'deny'" :severity="policy.effect === 'allow' ? 'success' : 'danger'">{{ policy.effect === 'deny' ? 'Blocks' : 'Allows' }}</Pill>
          <span class="ks-pcard-title" :title="title">{{ title }}</span>
        </div>
        <div v-if="policy.comment" class="ks-pcard-comment">{{ policy.comment }}</div>
      </div>
      <button v-if="mode === 'palette'" class="ks-pcard-act add" :aria-label="`Add permission ${title}`" @click.stop="emit('add')">
        <Icon icon="tabler:plus" aria-hidden="true" />
      </button>
      <button v-else-if="mode === 'selected'" class="ks-pcard-act remove" :aria-label="`Remove permission ${title}`" @click.stop="emit('remove')">
        <Icon icon="tabler:x" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
