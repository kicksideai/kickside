<script setup lang="ts">
import { computed } from 'vue'
import Drawer from 'primevue/drawer'
import { Icon } from '@iconify/vue'
import type { SessionMessage } from '../types.ts'

// Right-docked slide-in drawer previewing a session's messages. Thin wrapper over
// PrimeVue's Drawer: a scrim click or Escape closes it (native to PrimeVue), and
// the body renders the message list.
//
// The theme's PrimeVuePlugin patches PrimeVue's shared Portal so the drawer's
// overlay teleports into this web component's shadow root by default, so the
// module's shadow-scoped `.kx-*` body styles reach the panel and the facade
// `--p-drawer-*` tokens theme its chrome.
const props = defineProps<{
  open: boolean
  title: string
  messages: SessionMessage[]
  loading: boolean
  error: string
}>()
const emit = defineEmits<{ close: [] }>()

function onVisible(v: boolean) {
  if (!v) emit('close')
}

// The message `data` is a JSON string for most kinds; extract human text where
// possible, otherwise fall back to the raw payload.
function bodyOf(m: SessionMessage): string {
  if (!m.data) return ''
  try {
    const parsed = JSON.parse(m.data)
    if (typeof parsed === 'string') return parsed
    if (parsed && typeof parsed === 'object') {
      const o = parsed as Record<string, unknown>
      const text = o.text ?? o.content ?? o.message
      if (typeof text === 'string') return text
      return JSON.stringify(parsed, null, 2)
    }
  } catch { /* not JSON */ }
  return m.data
}

const items = computed(() =>
  props.messages.map(m => ({
    id: m.message_id,
    role: (m.type || 'message').replace(/_/g, ' '),
    body: bodyOf(m),
    user: /user/i.test(m.type || ''),
  })),
)
</script>

<template>
  <Drawer
    :visible="open"
    position="right"
    :modal="true"
    :dismissable="true"
    :close-on-escape="true"
    :style="{ width: 'min(560px, calc(100vw - 36px))' }"
    :aria-label="`Messages — ${title}`"
    @update:visible="onVisible"
  >
    <template #header>
      <span class="kx-drawer-title">
        <Icon icon="tabler:messages" aria-hidden="true" />{{ title }}
      </span>
    </template>

    <div class="kx-drawer-b">
      <div v-if="loading" class="kx-drawer-state">
        <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading messages…
      </div>
      <div v-else-if="error" class="kx-drawer-state err">{{ error }}</div>
      <div v-else-if="!items.length" class="kx-drawer-state">No messages yet.</div>
      <ol v-else class="kx-msgs">
        <li v-for="m in items" :key="m.id" class="kx-msg" :class="{ 'kx-msg-user': m.user }">
          <span class="kx-msg-role">{{ m.role }}</span>
          <pre class="kx-msg-body">{{ m.body }}</pre>
        </li>
      </ol>
    </div>
  </Drawer>
</template>
