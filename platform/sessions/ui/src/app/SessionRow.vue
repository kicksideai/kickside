<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import type { ProviderBadge, Session } from '../types.ts'

const props = defineProps<{ session: Session, agent: string, favorite: boolean, active?: boolean, providers?: Record<string, ProviderBadge> }>()
const emit = defineEmits<{
  resume: []
  restart: []
  preview: []
  delete: []
  favorite: []
  rename: [title: string]
}>()

const editing = ref(false)
const draft = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const rowEl = ref<HTMLElement | null>(null)
const menuTrigger = ref<HTMLButtonElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const menuOpen = ref(false)

const title = computed(() => props.session.title?.trim() || 'Untitled chat')
const source = computed((): ProviderBadge => {
  const meta = props.session.meta
  const raw = meta && typeof meta === 'object' ? (meta as Record<string, unknown>).provider : undefined
  const provider = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  const providers = props.providers
  if (provider && providers && Object.hasOwn(providers, provider)) return providers[provider]
  if (provider) return { icon: 'tabler:plug-connected', label: provider }
  if ((props.session.kind || '').toUpperCase() === 'DM') return { icon: 'tabler:message-dots', label: 'Direct message' }
  return { icon: 'tabler:message-circle', label: 'Chat' }
})
const status = computed(() => (props.session.status || 'idle').toLowerCase())
const bad = computed(() => status.value === 'failed' || status.value === 'error')

// Token usage accumulated by the runtime in session.meta.tokens. Prefer the
// provider-reported total; otherwise sum the additive parts (cache_* are subsets
// of prompt and would double-count).
const tokens = computed(() => {
  const t = props.session.meta?.tokens
  if (!t || typeof t !== 'object') return null
  const n = (k: string) => (typeof t[k] === 'number' ? t[k] : 0)
  const total = n('total_tokens') || n('prompt_tokens') + n('completion_tokens') + n('thinking_tokens')
  if (!total) return null
  const parts: string[] = []
  if (n('prompt_tokens')) parts.push(`${n('prompt_tokens').toLocaleString()} in`)
  if (n('completion_tokens')) parts.push(`${n('completion_tokens').toLocaleString()} out`)
  if (n('thinking_tokens')) parts.push(`${n('thinking_tokens').toLocaleString()} thinking`)
  return {
    label: fmtCompact(total),
    title: `${total.toLocaleString()} tokens${parts.length ? ` (${parts.join(' · ')})` : ''}`,
  }
})

function fmtCompact(v: number): string {
  if (v >= 1e6) return `${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(v >= 1e4 ? 0 : 1)}k`
  return String(v)
}

const when = computed(() => {
  const raw = props.session.last_message_date || props.session.start_date
  if (!raw) return ''
  const t = new Date(raw).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const min = 60_000, hour = 3_600_000, day = 86_400_000
  if (diff < min) return 'just now'
  if (diff < hour) return `${Math.floor(diff / min)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`
  return new Date(raw).toLocaleDateString()
})

async function startEdit() {
  menuOpen.value = false
  draft.value = props.session.title || ''
  editing.value = true
  await nextTick()
  inputEl.value?.focus()
  inputEl.value?.select()
}
function commit() {
  const next = draft.value.trim()
  editing.value = false
  if (next && next !== (props.session.title || '')) emit('rename', next)
}
function cancel() { editing.value = false }

function onRowActivate() {
  if (!editing.value) emit('resume')
}

async function openMenu() {
  menuOpen.value = true
  await nextTick()
  menuEl.value?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus()
}

function closeMenu(restoreFocus = false) {
  menuOpen.value = false
  if (restoreFocus) nextTick(() => menuTrigger.value?.focus())
}

function toggleMenu() {
  if (menuOpen.value) closeMenu()
  else void openMenu()
}

function onMenuKeydown(event: KeyboardEvent) {
  const items = [...(menuEl.value?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') || [])]
  if (!items.length) return
  const current = Math.max(0, items.indexOf(document.activeElement as HTMLButtonElement))
  let next = current
  if (event.key === 'ArrowDown') next = (current + 1) % items.length
  else if (event.key === 'ArrowUp') next = (current - 1 + items.length) % items.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = items.length - 1
  else if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu(true)
    return
  } else return
  event.preventDefault()
  items[next]?.focus()
}

function runMenuAction(action: 'restart' | 'preview' | 'delete') {
  closeMenu()
  if (action === 'restart') emit('restart')
  else if (action === 'preview') emit('preview')
  else emit('delete')
}

function closeMenuOnOutsideClick(event: MouseEvent) {
  // The row lives in the host's shadow root, so the document-level event.target
  // is retargeted to the host; composedPath keeps the real in-tree nodes.
  if (menuOpen.value && rowEl.value && !event.composedPath().includes(rowEl.value)) closeMenu()
}

onMounted(() => document.addEventListener('click', closeMenuOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeMenuOnOutsideClick))
</script>

<template>
  <div
    ref="rowEl"
    class="kx-row"
    :class="{ 'kx-row-edit': editing, 'kx-row-active': active }"
  >
    <span class="kx-src" :title="source.label" :aria-label="source.label" role="img">
      <Icon :icon="source.icon" aria-hidden="true" />
    </span>
    <div v-if="editing" class="kx-row-main kx-row-main-edit">
      <input
        ref="inputEl"
        v-model="draft"
        class="kx-edit"
        aria-label="Rename chat"
        @keydown.enter.prevent="commit"
        @keydown.esc.prevent="cancel"
        @blur="commit"
      />
    </div>
    <button
      v-else
      type="button"
      class="kx-row-main"
      :aria-current="active ? 'page' : undefined"
      @click="onRowActivate"
    >
      <span class="kx-name" :title="title">{{ title }}</span>
      <span class="kx-row-meta">
        <span v-if="agent" class="kx-row-agent">{{ agent }}</span>
        <span v-if="when">{{ when }}</span>
        <span v-if="tokens" class="kx-tok" :title="tokens.title"><Icon icon="tabler:coins" aria-hidden="true" />{{ tokens.label }}</span>
        <span v-if="bad" class="kx-sub-bad">failed</span>
      </span>
    </button>

    <div class="kx-row-end">
      <Button
        type="button"
        severity="secondary"
        text
        class="kx-fav"
        :class="{ 'kx-fav-on': favorite }"
        :title="favorite ? 'Remove from favorites' : 'Add to favorites'"
        :aria-label="favorite ? 'Remove from favorites' : 'Add to favorites'"
        :aria-pressed="favorite"
        @click="emit('favorite')"
      >
        <template #icon="{ class: iconClass }"><Icon :icon="favorite ? 'tabler:star-filled' : 'tabler:star'" :class="iconClass" aria-hidden="true" /></template>
      </Button>
      <Button
        ref="menuTrigger"
        type="button"
        severity="secondary"
        text
        class="kx-menu-trigger"
        title="Session actions"
        aria-label="Session actions"
        aria-haspopup="menu"
        :aria-expanded="menuOpen"
        @click="toggleMenu"
        @keydown.arrow-down.prevent="openMenu"
      >
        <template #icon="{ class: iconClass }"><Icon icon="tabler:dots-vertical" :class="iconClass" aria-hidden="true" /></template>
      </Button>
      <div v-if="menuOpen" ref="menuEl" class="kx-row-menu" role="menu" aria-label="Session actions" @keydown="onMenuKeydown">
        <button type="button" class="kx-menu-item" role="menuitem" @click="runMenuAction('restart')">
          <Icon icon="tabler:refresh" aria-hidden="true" />
          <span>Restart as new chat</span>
        </button>
        <button type="button" class="kx-menu-item" role="menuitem" @click="runMenuAction('preview')">
          <Icon icon="tabler:eye" aria-hidden="true" />
          <span>Preview messages</span>
        </button>
        <button type="button" class="kx-menu-item" role="menuitem" :disabled="editing" @click="startEdit">
          <Icon icon="tabler:pencil" aria-hidden="true" />
          <span>Rename</span>
        </button>
        <button type="button" class="kx-menu-item kx-menu-item-danger" role="menuitem" @click="runMenuAction('delete')">
          <Icon icon="tabler:trash" aria-hidden="true" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>
