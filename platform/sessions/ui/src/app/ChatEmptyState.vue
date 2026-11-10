<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { host } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh, useLayoutBus } from '@wippy-fe/webcomponent-vue'
import type { ChatAgent, ChatAgentGroup } from '../types.ts'
import { isRecord } from './hostRoute.ts'
import type { LayoutEvent } from './hostRoute.ts'
import { useSessionsApi } from './useSessionsApi.ts'

// The empty state of the host chat drawer (the `emptyState` of the `chat`
// panel), laid out as the old sidebar chat laid out its own: a heading, a line
// of help, "Select Agent" and a separate "Start Chat". The drawer's session
// selector stays above it. Start Chat hands the agent's start token to the
// host, and the chat coordinator shows the new session in the drawer.
//
// The agent list is a small disclosure inside this element, not a PrimeVue
// overlay: PrimeVue opens its panel in <body>, outside this shadow root, where
// the theme and the dark mode of this element do not reach it.

const api = useSessionsApi()
const bus = useLayoutBus()
const groups = ref<ChatAgentGroup[]>([])
const selected = ref<ChatAgent | null>(null)
const loading = ref(true)
const error = ref('')
const open = ref(false)
const query = ref('')
/**
 * A start is in flight. Both controls stay locked until the chat coordinator
 * reports that no start is pending (it finished, failed or was cancelled) or
 * until this element is removed, which the drawer does once a session exists.
 */
const starting = ref(false)
const root = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
let requestSequence = 0
let stopBus: (() => void) | undefined

const hasAgents = computed(() => groups.value.length > 0)

const visibleGroups = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return groups.value
  return groups.value
    .map(group => ({
      title: group.title,
      agents: group.agents.filter(agent =>
        agent.title.toLowerCase().includes(needle) || (agent.comment || '').toLowerCase().includes(needle)),
    }))
    .filter(group => group.agents.length > 0)
})

async function load() {
  const sequence = ++requestSequence
  loading.value = true
  error.value = ''
  try {
    const list = await api.chatAgents()
    if (sequence === requestSequence) groups.value = list
  } catch (cause) {
    if (sequence === requestSequence) error.value = (cause as Error).message || 'Could not load agents'
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

function toggleMenu() {
  if (starting.value || !hasAgents.value) return
  if (open.value) closeMenu()
  else open.value = true
}

function closeMenu(returnFocus = false) {
  if (!open.value) return
  open.value = false
  query.value = ''
  if (returnFocus) void nextTick(() => trigger.value?.focus())
}

function choose(agent: ChatAgent) {
  selected.value = agent
  closeMenu(true)
}

function startChat() {
  if (!selected.value || starting.value) return
  starting.value = true
  closeMenu()
  host.startChat(selected.value.start_token, { sidebar: true })
}

function onLayoutEvent(event: LayoutEvent) {
  if (event.channel !== 'kickside:chat-start' || !isRecord(event.payload)) return
  if (event.payload.pending === false) starting.value = false
}

// A press outside the menu closes it. `composedPath` because a press inside
// this shadow root is retargeted to the host element at the document.
function onDocumentPointerDown(event: Event) {
  if (open.value && root.value && !event.composedPath().includes(root.value)) closeMenu()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    event.stopPropagation()
    closeMenu(true)
  }
}

watch(open, (isOpen) => {
  if (isOpen) void nextTick(() => searchInput.value?.focus())
})

// Runs the first load, and again when the drawer is revealed after being hidden.
useHostVisibilityRefresh(load)
onMounted(() => {
  stopBus = bus?.subscribe(onLayoutEvent)
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
})
onBeforeUnmount(() => {
  stopBus?.()
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
})
</script>

<template>
  <section ref="root" class="kx-chat-start" aria-label="Start a chat" @keydown="onKeydown">
    <Icon class="kx-chat-start-icon" icon="tabler:message-circle" aria-hidden="true" />
    <h3 class="kx-chat-start-title">No chat session selected</h3>
    <p class="kx-chat-start-text">Please select a session from the dropdown above or start a new conversation.</p>
    <div class="kx-chat-start-controls">
      <div class="kx-chat-start-agent">
        <button
          ref="trigger"
          type="button"
          class="p-button p-button-secondary"
          aria-controls="chat-start-agents"
          :aria-expanded="open"
          :disabled="loading || starting || !hasAgents"
          @click="toggleMenu"
        >
          <Icon icon="wippy:agent" aria-hidden="true" />
          <span>{{ selected ? selected.title : 'Select Agent' }}</span>
          <Icon icon="tabler:caret-down-filled" class="kx-chat-start-caret" aria-hidden="true" />
        </button>
        <div v-if="open" id="chat-start-agents" class="kx-chat-start-menu">
          <div class="kx-chat-start-search">
            <label class="sr-only" for="chat-start-search">Search agents</label>
            <input
              id="chat-start-search"
              ref="searchInput"
              v-model="query"
              type="search"
              class="p-inputtext"
              placeholder="Search agents..."
              autocomplete="off"
            >
          </div>
          <div class="kx-chat-start-list">
            <template v-for="group in visibleGroups" :key="group.title">
              <div v-if="group.title" class="kx-chat-start-group">{{ group.title }}</div>
              <button
                v-for="agent in group.agents"
                :key="`${group.title}:${agent.name}`"
                type="button"
                class="kx-chat-start-item"
                :aria-current="selected?.name === agent.name ? 'true' : undefined"
                @click="choose(agent)"
              >
                <span class="kx-chat-start-item-title">
                  <Icon :icon="agent.icon || 'wippy:agent'" aria-hidden="true" />
                  <span>{{ agent.title || agent.name }}</span>
                </span>
                <span v-if="agent.comment" class="kx-chat-start-item-comment">{{ agent.comment }}</span>
              </button>
            </template>
            <p v-if="visibleGroups.length === 0" class="kx-chat-start-empty">No agents match.</p>
          </div>
        </div>
      </div>
      <button
        type="button"
        class="p-button p-button-primary"
        :disabled="!selected || starting"
        @click="startChat"
      >
        <Icon v-if="starting" icon="tabler:loader-2" class="spin" aria-hidden="true" />
        <span>Start Chat</span>
      </button>
    </div>
    <p v-if="error" class="kx-chat-start-note is-error" role="alert">
      {{ error }}
      <button type="button" class="kx-chat-start-retry" @click="load">Retry</button>
    </p>
    <p v-else-if="!loading && !hasAgents" class="kx-chat-start-note">
      <Icon icon="tabler:alert-circle" aria-hidden="true" />
      No agents available. Please contact your administrator.
    </p>
  </section>
</template>
