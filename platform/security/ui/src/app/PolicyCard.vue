<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { Policy } from '../types.ts'
import Pill from './shared/Pill.vue'

// A policy card showing title (or short id) + comment. Used in the palette
// (mode=palette, "+" to add, draggable), inside a scope (mode=selected, "x" to
// remove, draggable to reorder), or as a locked base policy in an overlay
// (mode=locked, read-only). The chevron expands an advanced view: effect,
// actions, resources.
const props = defineProps<{ policy: Policy, mode: 'palette' | 'selected' | 'locked' }>()
const emit = defineEmits<{ add: []; remove: [] }>()

const expanded = ref(false)

function onDragStart(e: DragEvent) {
  if (props.mode === 'locked' || !e.dataTransfer) return
  e.dataTransfer.setData('text/plain', props.policy.id)
  e.dataTransfer.effectAllowed = props.mode === 'palette' ? 'copy' : 'move'
}

function shortId(id: string): string {
  return id.includes(':') ? id.split(':').slice(-1)[0]! : id
}

function asList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (typeof v === 'string' && v) return [v]
  return []
}

const actions = computed(() => asList(props.policy.actions))
const resources = computed(() => asList(props.policy.resources))
</script>

<template>
  <div
    class="ks-pcard"
    :class="[mode, { expanded }]"
    :draggable="mode !== 'locked'"
    @dragstart="onDragStart"
    @dblclick="mode === 'palette' && emit('add')"
  >
    <div class="ks-pcard-row">
      <Icon v-if="mode === 'locked'" icon="tabler:lock" class="ks-pcard-grip locked" aria-hidden="true" />
      <Icon v-else icon="tabler:grip-vertical" class="ks-pcard-grip" aria-hidden="true" />
      <div class="ks-pcard-body">
        <div class="ks-pcard-head">
          <span class="ks-pcard-title" :title="policy.title || shortId(policy.id)">{{ policy.title || shortId(policy.id) }}</span>
          <Pill v-if="policy.effect" :severity="policy.effect === 'allow' ? 'success' : policy.effect === 'deny' ? 'danger' : 'secondary'">{{ policy.effect }}</Pill>
        </div>
        <div v-if="policy.comment" class="ks-pcard-comment">{{ policy.comment }}</div>
      </div>
      <button
        class="ks-pcard-act detail"
        :class="{ open: expanded }"
        :aria-label="`${expanded ? 'Hide' : 'Show'} details for ${policy.title || shortId(policy.id)}`"
        :aria-expanded="expanded"
        @click.stop="expanded = !expanded"
      >
        <Icon icon="tabler:chevron-right" aria-hidden="true" />
      </button>
      <button v-if="mode === 'palette'" class="ks-pcard-act add" :aria-label="`Add permission ${policy.title || shortId(policy.id)}`" @click.stop="emit('add')">
        <Icon icon="tabler:plus" aria-hidden="true" />
      </button>
      <button v-else-if="mode === 'selected'" class="ks-pcard-act remove" :aria-label="`Remove permission ${policy.title || shortId(policy.id)}`" @click.stop="emit('remove')">
        <Icon icon="tabler:x" aria-hidden="true" />
      </button>
    </div>

    <div v-if="expanded" class="ks-pcard-detail">
      <div class="ks-pcard-kv"><span>Policy ID</span><code>{{ policy.id }}</code></div>
      <div v-if="policy.surface || policy.intent" class="ks-pcard-kv">
        <span>Surface</span><code>{{ policy.surface || policy.intent }}</code>
      </div>
      <div class="ks-pcard-kv">
        <span>Effect</span><code class="ks-eff-code" :class="policy.effect">{{ policy.effect || '—' }}</code>
      </div>
      <div class="ks-pcard-kv">
        <span>Actions</span>
        <div class="ks-pcard-tags">
          <code v-for="a in actions" :key="a">{{ a }}</code>
          <span v-if="!actions.length" class="ks-pcard-none">—</span>
        </div>
      </div>
      <div class="ks-pcard-kv">
        <span>Resources</span>
        <div class="ks-pcard-tags">
          <code v-for="r in resources" :key="r">{{ r }}</code>
          <span v-if="!resources.length" class="ks-pcard-none">—</span>
        </div>
      </div>
    </div>
  </div>
</template>
