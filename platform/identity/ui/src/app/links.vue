<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { api } from '@wippy-fe/proxy'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import { useComponentEvents } from '../constants.ts'
import { formatDate } from '@widgets/app/datetime'

// Linked-accounts modal, opened from the profile dropdown. Generate a short link
// code, then prove ownership of an external account by DMing the bot
// "link <code>". Lists the user's linked accounts and lets them unlink. Owns its
// own modal chrome and emits `close` for the host to dismiss; talks to the
// kickside/identity API through the host's authenticated client.

interface ExternalLink {
  provider: string
  external_id: string
  display_name?: string
  created_at?: number | string
}

interface AgentOption {
  id: string
  title: string
}

// Matches kickside.dm:consts GREETER_AGENT_ID; the default starting agent.
const GREETER_AGENT_ID = 'kickside.dm.agents:greeter'

const emit = useComponentEvents()

const links = ref<ExternalLink[]>([])
const loading = ref(true)
const error = ref('')
const generating = ref(false)
const code = ref('')
const expiresIn = ref(0)
const unlinking = ref('')
const agents = ref<AgentOption[]>([])
const selectedAgent = ref(GREETER_AGENT_ID)

// Dialog owns its own scrim, close button, and Escape handling; closing it emits
// `close` for the host to dismiss the element.
const open = ref(true)

const agentOptions = computed(() => [
  { label: 'Greeter (default)', value: GREETER_AGENT_ID },
  ...agents.value.map((a) => ({ label: a.title, value: a.id })),
])

const keyOf = (l: ExternalLink) => `${l.provider}:${l.external_id}`
function emitClose() { emit('close', undefined) }
function onVisible(v: boolean) { if (!v) emitClose() }

async function loadLinks() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/api/v1/identity/links')
    if (!data?.success) throw new Error(data?.error || 'failed to load linked accounts')
    links.value = (data.links || []) as ExternalLink[]
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

async function loadAgents() {
  try {
    const { data } = await api.get('/api/v1/user-agents')
    if (!data?.success) return
    agents.value = ((data.agents || []) as Array<{ id: string; title?: string }>).map((a) => ({
      id: String(a.id),
      title: a.title || String(a.id),
    }))
  } catch {
    // Agent list is optional chrome; a failure leaves the greeter default.
  }
}

async function generate() {
  generating.value = true
  error.value = ''
  try {
    const body: Record<string, string> = {}
    if (selectedAgent.value && selectedAgent.value !== GREETER_AGENT_ID) {
      body.agent_id = `user_agent:${selectedAgent.value}`
    }
    const { data } = await api.post('/api/v1/identity/link-codes', body)
    if (!data?.success) throw new Error(data?.error || 'failed to generate code')
    code.value = String(data.code || '')
    expiresIn.value = Number(data.expires_in_seconds || 0)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    generating.value = false
  }
}

async function unlink(l: ExternalLink) {
  const id = keyOf(l)
  unlinking.value = id
  error.value = ''
  try {
    const { data } = await api.post('/api/v1/identity/unlink', { provider: l.provider, external_id: l.external_id })
    if (!data?.success) throw new Error(data?.error || 'failed to unlink')
    await loadLinks()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    unlinking.value = ''
  }
}

onMounted(async () => {
  await loadLinks()
  await loadAgents()
})
</script>

<template>
  <Dialog
    v-model:visible="open"
    modal
    header="Linked accounts"
    :dismissable-mask="true"
    :style="{ width: '520px', maxWidth: 'calc(100vw - 48px)' }"
    aria-label="Linked accounts"
    @update:visible="onVisible"
  >
      <div class="ks-body">
        <p class="ks-lead">Connect a chat account (Discord, …) to your identity so a bot answers as you.</p>

        <div class="ks-panel">
          <label class="ks-field">
            <span class="ks-field-label">Starting agent</span>
            <Select
              v-model="selectedAgent"
              class="ks-select"
              :options="agentOptions"
              option-label="label"
              option-value="value"
              aria-label="Starting agent"
            />
          </label>
          <div class="ks-row">
            <Button
              type="button"
              data-testid="identity-generate"
              :label="generating ? 'Generating…' : 'Generate link code'"
              :loading="generating"
              :disabled="generating"
              @click="generate" />
            <span v-if="code" class="ks-code">{{ code }}</span>
          </div>
          <p v-if="code" class="ks-hint">DM the bot <code>link {{ code }}</code> within {{ Math.round(expiresIn / 60) }} min.</p>
          <p v-else class="ks-hint">Generate a code, then send <code>link &lt;code&gt;</code> to the bot in a direct message.</p>
        </div>

        <div class="ks-panel">
          <div class="ks-row"><strong>Your linked accounts</strong></div>
          <p v-if="loading" class="ks-empty">Loading…</p>
          <p v-else-if="links.length === 0" class="ks-empty">No accounts linked yet.</p>
          <div v-else class="ks-list">
            <div v-for="l in links" :key="keyOf(l)" class="ks-item">
              <span class="ks-provider">{{ l.provider }}</span>
              <div class="ks-item-main">
                <span class="ks-item-name">{{ l.display_name || l.external_id }}</span>
                <span class="ks-item-sub">{{ l.external_id }}<template v-if="formatDate(l.created_at)"> · linked {{ formatDate(l.created_at) }}</template></span>
              </div>
              <div class="ks-spacer"></div>
              <Button
                type="button"
                class="ks-item-action"
                data-testid="identity-unlink"
                :data-link-key="keyOf(l)"
                :label="unlinking === keyOf(l) ? 'Removing…' : 'Unlink'"
                severity="danger"
                outlined
                :loading="unlinking === keyOf(l)"
                :disabled="unlinking === keyOf(l)"
                @click="unlink(l)" />
            </div>
          </div>
        </div>

        <p v-if="error" class="ks-error">{{ error }}</p>
      </div>
  </Dialog>
</template>
