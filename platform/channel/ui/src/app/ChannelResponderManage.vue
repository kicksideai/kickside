<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { api, loadByTagName } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import WcMount from '@widgets/app/WcMount.vue'
import { errMsg } from '@widgets/app/errMsg'

interface Props { config?: unknown; value?: unknown }
interface Events {
  change: { id: string; state?: ResponderState }
  close: Record<string, never>
  error: { message: string; error: unknown }
}
interface TraitDetail { id: string; title?: string; description?: string; web_component?: string; provider?: string }

// A trait's declared title is optional; the primary label is never the bare
// registry id.
function traitLabel(t: TraitDetail): string {
  return (t.title || '').trim() || 'Unknown capability'
}
interface ResponderState {
  connection_id?: string
  channel_id?: string
  channel_name?: string
  agent_id?: string
  agent_name?: string
  title?: string
  paused?: boolean
  traits?: string[]
  trait_contexts?: Record<string, unknown>
  context?: string
  response_policy?: { mode?: string; wait_seconds?: number; assessor_model?: string; prompt?: string }
  session_policy?: { rotate_after_idle?: boolean; idle_seconds?: number; runtime_idle_seconds?: number }
  system_prompt?: string
}
interface DiscoverRow { id: string; label?: string; selectable?: unknown; drillable?: unknown }

// A stored responder predates channel_name (or the source connection renamed the
// channel since install): resolve it through the same connections +
// discover_resources catalog wc-channel-picker's interactive tree walks. One
// discover call per container, only drilling containers the flat batch didn't
// already nest a match into, stopping at the first row whose id matches.
async function discoverResources(connectionId: string, parentId?: string): Promise<DiscoverRow[]> {
  const body = parentId ? { parent_id: parentId } : {}
  const { data } = await api.post(`/api/v1/connections/${encodeURIComponent(connectionId)}/discover_resources`, body)
  return Array.isArray(data?.items) ? (data.items as DiscoverRow[]) : []
}
async function findChannelName(connectionId: string, channelId: string, rows: DiscoverRow[]): Promise<string | null> {
  for (const r of rows) {
    if (String(r.id ?? '') === channelId) return String(r.label || '').trim() || null
  }
  for (const r of rows) {
    const id = String(r.id ?? '')
    if (!id || r.selectable === true || r.drillable !== true) continue
    const found = await findChannelName(connectionId, channelId, await discoverResources(connectionId, id))
    if (found) return found
  }
  return null
}
async function resolveChannelName(connectionId: string, channelId: string): Promise<string | null> {
  if (!connectionId || !channelId) return null
  try {
    return await findChannelName(connectionId, channelId, await discoverResources(connectionId))
  } catch {
    return null
  }
}

const props = useProps<Props>()
const emit = useEvents<Events>()

const automationId = computed(() => {
  const candidates = [props.value.config, props.value.value]
  for (const raw of candidates) {
    if (raw && typeof raw === 'object' && typeof (raw as Record<string, unknown>).id === 'string') {
      return String((raw as Record<string, unknown>).id)
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed.id === 'string') return parsed.id
      } catch { /* ignore malformed host attribute */ }
    }
  }
  return ''
})
function hostConfig(): Record<string, unknown> {
  const raw = props.value.config
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
}
function hostAutomation(): Record<string, unknown> {
  const a = hostConfig().automation
  return a && typeof a === 'object' && !Array.isArray(a) ? a as Record<string, unknown> : {}
}

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const title = ref('')
const channelName = ref('')
const channelId = ref('')
const connectionId = ref('')
// Resolved through resolveChannelName() when the stored state has no
// channel_name; empty and not-resolving means resolution finished with no match.
const resolvedChannelName = ref('')
const resolvingChannel = ref(false)
// The displayed channel label, in the same priority order as the id resolution:
// the stored name, then the freshly resolved one — never the raw id as primary.
const channelLabel = computed(() => channelName.value || resolvedChannelName.value)
const agentId = ref('')
const agentName = ref('')
const paused = ref(false)
const traits = ref<string[]>([])
const traitContexts = ref<Record<string, unknown>>({})
const traitDetails = ref<TraitDetail[]>([])
const context = ref('')
const rotateAfterIdle = ref(true)
const idleMinutes = ref(120)
const runtimeIdleMinutes = ref(10)
const responseMode = ref<'immediate' | 'lazy'>('immediate')
const responseModeOptions = [
  { label: 'Immediate', value: 'immediate' },
  { label: 'Lazy', value: 'lazy' },
]
const lazyWaitSeconds = ref(8)
const lazyAssessorModel = ref('class:fast')
const lazyPrompt = ref('Only reply when the accumulated channel messages are relevant to the agent. Ignore noise, acknowledgements, and unrelated chatter.')
const systemPrompt = ref('')
const advancedOpen = ref(false)

const configurableTraits = computed(() =>
  traitDetails.value.filter(t => !!t.web_component && traits.value.includes(t.id)))
const lazyEnabled = computed(() => responseMode.value === 'lazy')

const validationError = computed(() => {
  if (!title.value.trim()) return 'Name is required.'
  if (!agentId.value) return 'An agent is required.'
  return ''
})
const valid = computed(() => !validationError.value)

function onAgentChange(e: Event) {
  const detail = (e as CustomEvent).detail as { selected?: unknown; labels?: unknown } | undefined
  const ids = detail && Array.isArray(detail.selected) ? (detail.selected as unknown[]).map(String) : []
  const labels = detail && Array.isArray(detail.labels) ? (detail.labels as unknown[]).map(String) : []
  agentId.value = ids[0] || ''
  agentName.value = (labels[0] || '').trim()
}

async function loadTraitDetails(ids: string[]) {
  if (!ids.length) { traitDetails.value = []; return }
  try {
    const { data } = await api.get(`/api/v1/agents/traits?ids=${ids.map(encodeURIComponent).join(',')}`)
    traitDetails.value = (data?.traits || []) as TraitDetail[]
  } catch (e) {
    traitDetails.value = []
    emit('error', { message: 'failed to load capabilities', error: e })
  }
}

function onTraitsChange(e: Event) {
  const detail = (e as CustomEvent).detail as { selected?: unknown } | undefined
  const ids = detail && Array.isArray(detail.selected) ? (detail.selected as unknown[]).map(String) : []
  traits.value = ids
  const keep: Record<string, unknown> = {}
  for (const id of ids) if (id in traitContexts.value) keep[id] = traitContexts.value[id]
  traitContexts.value = keep
  loadTraitDetails(ids)
}

function onTraitConfig(id: string, cfg: unknown) {
  traitContexts.value = { ...traitContexts.value, [id]: cfg }
}

function safeTraitContexts(): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const id of traits.value) {
    const v = traitContexts.value[id]
    if (v && typeof v === 'object') out[id] = v
  }
  return out
}

// Fire-and-forget: seed() is synchronous, so this resolves in the background and
// channelLabel/resolvingChannel pick the result up reactively once it lands.
async function hydrateChannelName() {
  if (channelName.value || !connectionId.value || !channelId.value) return
  resolvingChannel.value = true
  try {
    resolvedChannelName.value = (await resolveChannelName(connectionId.value, channelId.value)) || ''
  } finally {
    resolvingChannel.value = false
  }
}

function seed(state: ResponderState, publicState: Record<string, unknown>) {
  title.value = String(state.title || hostAutomation().title || '')
  channelName.value = String(state.channel_name || publicState.channel || '')
  channelId.value = String(state.channel_id || '')
  connectionId.value = String(state.connection_id || '')
  resolvedChannelName.value = ''
  hydrateChannelName()
  agentId.value = String(state.agent_id || '')
  agentName.value = String(state.agent_name || publicState.agent || '')
  paused.value = state.paused === true
  traits.value = Array.isArray(state.traits) ? state.traits.map(String) : []
  traitContexts.value = state.trait_contexts && typeof state.trait_contexts === 'object' ? state.trait_contexts : {}
  context.value = String(state.context || '')
  rotateAfterIdle.value = state.session_policy?.rotate_after_idle !== false
  idleMinutes.value = Math.max(1, Math.min(43200, Number(state.session_policy?.idle_seconds || 7200) / 60))
  runtimeIdleMinutes.value = Math.max(1, Math.min(1440, Number(state.session_policy?.runtime_idle_seconds || 600) / 60))
  responseMode.value = state.response_policy?.mode === 'lazy' ? 'lazy' : 'immediate'
  lazyWaitSeconds.value = Math.max(1, Math.min(120, Math.floor(Number(state.response_policy?.wait_seconds) || 8)))
  lazyAssessorModel.value = String(state.response_policy?.assessor_model || 'class:fast')
  lazyPrompt.value = String(state.response_policy?.prompt || 'Only reply when the accumulated channel messages are relevant to the agent. Ignore noise, acknowledgements, and unrelated chatter.')
  systemPrompt.value = String(state.system_prompt || '')
  advancedOpen.value = false
  loadTraitDetails(traits.value)
}

async function load() {
  if (!automationId.value) { error.value = 'Automation id is required.'; loading.value = false; return }
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.post(`/api/v1/automations/${encodeURIComponent(automationId.value)}/actions/read_config`, {})
    const state = data?.result?.state || {}
    const publicState = data?.result?.public_state || {}
    seed(state as ResponderState, publicState as Record<string, unknown>)
  } catch (e) {
    error.value = errMsg(e, 'failed to load responder')
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!valid.value) { error.value = validationError.value; return }
  saving.value = true
  error.value = ''
  try {
    const input = {
      title: title.value.trim(),
      agent_id: agentId.value,
      agent_name: agentName.value,
      target: 'channel',
      traits: [...traits.value],
      trait_contexts: safeTraitContexts(),
      context: context.value.trim(),
      session_policy: {
        rotate_after_idle: rotateAfterIdle.value,
        idle_seconds: Math.max(60, Math.min(30 * 24 * 60 * 60, Math.floor((Number(idleMinutes.value) || 120) * 60))),
        runtime_idle_seconds: Math.max(60, Math.min(24 * 60 * 60, Math.floor((Number(runtimeIdleMinutes.value) || 10) * 60))),
      },
      response_policy: {
        mode: responseMode.value,
        wait_seconds: Math.max(1, Math.min(120, Math.floor(Number(lazyWaitSeconds.value) || 8))),
        assessor_model: lazyAssessorModel.value || 'class:fast',
        prompt: lazyPrompt.value.trim(),
      },
      system_prompt: systemPrompt.value.trim(),
    }
    const { data } = await api.post(`/api/v1/automations/${encodeURIComponent(automationId.value)}/actions/configure`, { input })
    emit('change', { id: automationId.value, state: data?.result?.state })
    emit('close', {})
  } catch (e) {
    const msg = errMsg(e, 'save failed')
    error.value = msg
    emit('error', { message: msg, error: e })
  } finally {
    saving.value = false
  }
}

function cancel() { emit('close', {}) }

onMounted(() => {
  loadByTagName('wc-agent-picker', { timeoutMs: 8000 }).catch(() => {})
  loadByTagName('wc-model-picker', { timeoutMs: 8000 }).catch(() => {})
  loadByTagName('wc-multiselect', { timeoutMs: 8000 }).catch(() => {})
  load()
})
watch(automationId, load)

function onAssessorModelSelect(e: Event) {
  lazyAssessorModel.value = String((e as CustomEvent<string>).detail || 'class:fast')
}
</script>

<template>
  <form class="kx-cr" @submit.prevent="save">
    <div class="kx-cr-head">
      <span class="kx-cr-ico"><Icon icon="tabler:message-2-bolt" aria-hidden="true" /></span>
      <div class="kx-cr-title">
        <h2>Channel responder</h2>
        <span>
          <template v-if="channelLabel">{{ channelLabel }}</template>
          <template v-else-if="resolvingChannel">Resolving…</template>
          <template v-else-if="channelId">Unknown channel<span class="kx-id"> {{ channelId }}</span></template>
          <template v-else>Channel</template>
          <template v-if="paused"> · paused</template>
        </span>
      </div>
    </div>

    <div v-if="loading" class="kx-note">Loading responder settings…</div>

    <template v-else>
      <label class="kx-field">
        <span class="kx-field-lbl">Name</span>
        <input v-model="title" class="kx-input" type="text" placeholder="Support channel responder" />
      </label>

      <label class="kx-field">
        <span class="kx-field-lbl">Channel</span>
        <div class="kx-input kx-input-ro" role="textbox" aria-readonly="true">
          <template v-if="channelLabel">{{ channelLabel }}</template>
          <template v-else-if="resolvingChannel">Resolving…</template>
          <template v-else-if="channelId">Unknown channel<span class="kx-id"> {{ channelId }}</span></template>
          <template v-else>Channel</template>
        </div>
      </label>

      <div class="kx-field">
        <span class="kx-field-lbl">Agent</span>
        <wc-agent-picker
          placeholder="Pick an agent…"
          multi="false"
          :selected="agentId ? JSON.stringify([agentId]) : '[]'"
          @change="onAgentChange"
        ></wc-agent-picker>
      </div>

      <label class="kx-field">
        <span class="kx-field-lbl">System prompt</span>
        <textarea v-model="systemPrompt" class="kx-input kx-textarea kx-textarea-lg" rows="7" placeholder="Instructions applied to every channel turn."></textarea>
      </label>

      <div class="kx-adv">
        <button type="button" class="kx-adv-toggle" @click="advancedOpen = !advancedOpen">
          <Icon :icon="advancedOpen ? 'tabler:chevron-down' : 'tabler:chevron-right'" aria-hidden="true" />
          Advanced
          <span v-if="traits.length || context.trim() || rotateAfterIdle || runtimeIdleMinutes !== 10 || lazyEnabled" class="kx-adv-badge kx-tag-sm">{{ traits.length }}{{ context.trim() ? ' + context' : '' }}{{ rotateAfterIdle ? ' + chat cutoff' : '' }}{{ runtimeIdleMinutes !== 10 ? ' + runtime idle' : '' }}{{ lazyEnabled ? ' + lazy' : '' }}</span>
        </button>

        <div v-if="advancedOpen" class="kx-adv-body">
          <div class="kx-field">
            <span class="kx-field-lbl">Response mode</span>
            <Select
              v-model="responseMode"
              class="kx-select"
              :options="responseModeOptions"
              option-label="label"
              option-value="value"
              aria-label="Response mode"
            />
          </div>

          <label v-if="lazyEnabled" class="kx-field">
            <span class="kx-field-lbl">Quiet window seconds</span>
            <input v-model.number="lazyWaitSeconds" class="kx-input" type="number" min="1" max="120" step="1" />
          </label>

          <div v-if="lazyEnabled" class="kx-field">
            <span class="kx-field-lbl">Assessment model</span>
            <wc-model-picker :value="lazyAssessorModel" capability="generate" @select="onAssessorModelSelect"></wc-model-picker>
          </div>

          <label v-if="lazyEnabled" class="kx-field">
            <span class="kx-field-lbl">Lazy response prompt</span>
            <textarea v-model="lazyPrompt" class="kx-input kx-textarea" rows="4" placeholder="Tell the responder when to stay quiet and when to answer."></textarea>
          </label>

          <div class="kx-field">
            <span class="kx-field-lbl">Additional capabilities</span>
            <wc-multiselect
              source="/api/v1/agents/traits"
              response-key="traits"
              label-key="title"
              desc-key="description"
              placeholder="Add capabilities on top of the agent's own…"
              :selected="JSON.stringify(traits)"
              @change="onTraitsChange"
            ></wc-multiselect>
          </div>

          <div v-for="t in configurableTraits" :key="t.id" class="kx-field kx-trait-cfg">
            <span class="kx-field-lbl">{{ traitLabel(t) }}<span v-if="!t.title?.trim()" class="kx-id"> {{ t.id }}</span></span>
            <WcMount
              :tag="t.web_component || ''"
              :config="(traitContexts[t.id] as Record<string, unknown>) || {}"
              :provider="t.provider"
              @change="(cfg: unknown) => onTraitConfig(t.id, cfg)"
            />
          </div>

          <label class="kx-field">
            <span class="kx-field-lbl">Additional prompt context</span>
            <textarea v-model="context" class="kx-input kx-textarea" rows="3" placeholder="Stable prompt context for every reply in this channel."></textarea>
          </label>

          <label class="kx-check kx-check-control">
            <input v-model="rotateAfterIdle" type="checkbox" />
            <span>
              <strong>Start a new chat after quiet time</strong>
              <small>When the channel is quiet for the selected time, the next message starts a fresh chat history.</small>
              <span v-if="rotateAfterIdle" class="kx-inline-control" @click.stop>
                <span>After</span>
                <input v-model.number="idleMinutes" class="kx-input kx-number-sm" type="number" min="1" max="43200" step="1" @click.stop />
                <span>minutes</span>
              </span>
            </span>
          </label>

          <label class="kx-field">
            <span class="kx-field-lbl">Stop idle responder after</span>
            <span class="kx-inline-control kx-inline-control-standalone">
              <input v-model.number="runtimeIdleMinutes" class="kx-input kx-number-sm" type="number" min="1" max="1440" step="1" />
              <span>minutes without activity</span>
            </span>
            <small class="kx-field-help">Ends the live responder process; the next channel message starts it again.</small>
          </label>
        </div>
      </div>
    </template>

    <div v-if="error" class="kx-error">{{ error }}</div>

    <div class="kx-actions">
      <Button type="button" label="Cancel" severity="secondary" outlined @click="cancel" />
      <Button type="submit" label="Save" :loading="saving" :disabled="loading || saving || !valid" />
    </div>
  </form>
</template>
