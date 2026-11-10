<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import Select from 'primevue/select'
import { host } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh, useLayoutBus } from '@wippy-fe/webcomponent-vue'
import type { ChatAgent } from '../types.ts'
import { isRecord } from './hostRoute.ts'
import type { LayoutEvent } from './hostRoute.ts'
import { useSessionsApi } from './useSessionsApi.ts'

// The empty state of the host chat drawer (the `emptyState` of the `chat`
// panel). The drawer's session selector stays above it; this is the rest of
// the slot, so it offers what the selector cannot: starting a new chat with an
// agent. Choosing an agent hands its start token to the host, and the chat
// coordinator shows the new session in the drawer.

const api = useSessionsApi()
const bus = useLayoutBus()
const agents = ref<ChatAgent[]>([])
const selected = ref<ChatAgent | null>(null)
const loading = ref(true)
const error = ref('')
/**
 * A start is in flight. The picker stays locked until the chat coordinator
 * reports that no start is pending (it finished, failed or was cancelled) or
 * until this element is removed, which the drawer does once a session exists.
 */
const starting = ref(false)
let requestSequence = 0
let stopBus: (() => void) | undefined

async function load() {
  const sequence = ++requestSequence
  loading.value = true
  error.value = ''
  try {
    const list = await api.chatAgents()
    if (sequence === requestSequence) agents.value = list
  } catch (cause) {
    if (sequence === requestSequence) error.value = (cause as Error).message || 'Could not load agents'
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

function start(agent: ChatAgent | null) {
  if (!agent || starting.value) return
  starting.value = true
  host.startChat(agent.start_token, { sidebar: true })
  // The drawer swaps to the new session; if the start fails it stays here, and
  // an empty picker lets the same agent be chosen again.
  selected.value = null
}

function onLayoutEvent(event: LayoutEvent) {
  if (event.channel !== 'kickside:chat-start' || !isRecord(event.payload)) return
  if (event.payload.pending === false) starting.value = false
}

onMounted(() => { stopBus = bus?.subscribe(onLayoutEvent) })
onBeforeUnmount(() => stopBus?.())

// Runs the first load, and again when the drawer is revealed after being hidden.
useHostVisibilityRefresh(load)
</script>

<template>
  <section class="kx-chat-start" aria-label="Start a chat">
    <Icon class="kx-chat-start-icon" icon="tabler:message-circle" aria-hidden="true" />
    <h3 class="kx-chat-start-title">No chat session selected</h3>
    <p class="kx-chat-start-text">Select a session from the list above, or pick an agent to start a new conversation.</p>
    <label class="sr-only" for="chat-start-agent">Agent</label>
    <Select
      input-id="chat-start-agent"
      v-model="selected"
      class="kx-chat-start-select"
      overlay-class="kx-chat-start-select-overlay"
      :options="agents"
      option-label="title"
      :placeholder="loading ? 'Loading agents…' : starting ? 'Starting chat…' : 'Select agent'"
      :disabled="loading || starting || agents.length === 0"
      @update:model-value="start"
    >
      <template #option="{ option }">
        <span class="kx-chat-start-option">
          <span class="kx-chat-start-option-title">{{ option.title || option.name }}</span>
          <span v-if="option.comment" class="kx-chat-start-option-sub">{{ option.comment }}</span>
        </span>
      </template>
    </Select>
    <p v-if="error" class="kx-chat-start-note is-error" role="alert">
      {{ error }}
      <button type="button" class="kx-chat-start-retry" @click="load">Retry</button>
    </p>
    <p v-else-if="!loading && agents.length === 0" class="kx-chat-start-note">
      <Icon icon="tabler:alert-circle" aria-hidden="true" />
      No agents available. Please contact your administrator.
    </p>
  </section>
</template>
