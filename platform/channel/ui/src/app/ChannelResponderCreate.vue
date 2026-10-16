<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Select from 'primevue/select'
import { api, loadByTagName } from '@wippy-fe/proxy'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import { useParentId } from '@widgets/app/useParentId'
import { useSubmitNonce } from '@widgets/app/useSubmitNonce'
import WcMount from '@widgets/app/WcMount.vue'
import { errMsg } from '@widgets/app/errMsg'

// The canonical channel-responder install form. It composes the two shared
// pickers -- a channel across every connection, and an agent -- names the
// automation, and POSTs it to the automations API; the runtime owns the session
// on trigger. Provider-agnostic: a trait's declared provider scopes its own
// connection field, so one form installs a Discord (or future Slack/Telegram)
// responder. This is the reference other automation install forms clone.
// `parent-id` is the workspace folder the "+" popup places the responder under
// (absent on the automations page = root).
interface Props { typeId?: string; parentId?: string; submitNonce?: string }
interface Events {
  'automation-installed': { success: boolean; id?: string; error?: string }
  'submit-state': { saving: boolean }
  // Workspace popup contract: close it + re-list, or dismiss.
  created: { id?: string }
  close: Record<string, never>
  error: { message: string; error: unknown }
}
interface ChannelSel { connection_id: string; channel_id: string; channel_name?: string }
interface InstallResponse { success?: boolean; id?: string; error?: string | { message?: string } }
interface TraitDetail { id: string; title?: string; description?: string; web_component?: string; provider?: string }

// A trait's declared title is optional; the primary label is never the bare
// registry id.
function traitLabel(t: TraitDetail): string {
  return (t.title || '').trim() || 'Unknown capability'
}

const props = useProps<Props>()
const emit = useEvents<Events>()

// The host sets the type-id attribute on mount; fall back to the canonical id so a
// flaky/late attribute read never posts an empty type ("type is required").
const CANONICAL_TYPE = 'kickside.channel.responder:channel_responder'
const DEFAULT_SYSTEM_PROMPT = 'You are responding in a channel. Keep responses concise and direct. No emojis. If you need external information, use available capabilities or tools before answering.'
const typeId = computed(() => props.value.typeId || CANONICAL_TYPE)
// useProps exposes host attributes camelCased (parent-id -> parentId).
const parentId = useParentId(props)
const inPopup = computed(() => !!parentId.value)

const title = ref('')
const channel = ref<ChannelSel | null>(null)
const channelName = ref('')
const agentId = ref('')
const agentName = ref('')
const saving = ref(false)
const systemPrompt = ref(DEFAULT_SYSTEM_PROMPT)
// Report submit progress so the shell footer button reflects it.
watch(saving, (s) => emit('submit-state', { saving: s }))
const error = ref('')
useSubmitNonce(props, install, saving)

// Advanced: extra traits (added on top of the agent's own), each configurable
// trait's per-trait context, and a free-text channel context.
const advancedOpen = ref(false)
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
const configurableTraits = computed(() =>
  traitDetails.value.filter(t => !!t.web_component && traits.value.includes(t.id)))
const lazyEnabled = computed(() => responseMode.value === 'lazy')

const validationError = computed(() => {
  if (!title.value.trim()) return 'Name is required.'
  if (!channel.value?.channel_id || !channel.value?.connection_id) return 'A channel is required.'
  if (!agentId.value) return 'An agent is required.'
  return ''
})
const valid = computed(() => !validationError.value)

function onChannelChange(e: Event) {
  const d = (e as CustomEvent).detail as ChannelSel | undefined
  if (d && d.channel_id) {
    channel.value = { connection_id: d.connection_id, channel_id: d.channel_id }
    channelName.value = (d.channel_name || '').trim()
  } else {
    channel.value = null
    channelName.value = ''
  }
}

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
    emit('error', { message: 'failed to load traits', error: e })
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

// Only object-valued contexts for currently-selected traits reach the payload.
function safeTraitContexts(): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const id of traits.value) {
    const v = traitContexts.value[id]
    if (v && typeof v === 'object') out[id] = v
  }
  return out
}

onMounted(() => {
  loadByTagName('wc-channel-picker', { timeoutMs: 8000 }).catch(() => {})
  loadByTagName('wc-agent-picker', { timeoutMs: 8000 }).catch(() => {})
  loadByTagName('wc-model-picker', { timeoutMs: 8000 }).catch(() => {})
  loadByTagName('wc-multiselect', { timeoutMs: 8000 }).catch(() => {})
})

function onAssessorModelSelect(e: Event) {
  lazyAssessorModel.value = String((e as CustomEvent<string>).detail || 'class:fast')
}

async function install() {
  if (!valid.value) { error.value = validationError.value; emit('automation-installed', { success: false, error: error.value }); return }
  saving.value = true
  error.value = ''
  try {
    const sel = channel.value as ChannelSel
    const payload = {
      type: typeId.value,
      parent_id: parentId.value || undefined,
      input: {
        title: title.value.trim(),
        connection_id: sel.connection_id,
        channel_id: sel.channel_id,
        channel_name: channelName.value,
        agent_id: agentId.value,
        agent_name: agentName.value,
        target: 'channel',
        system_prompt: systemPrompt.value.trim(),
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
      },
    }
    const { data } = await api.post('/api/v1/automations', payload)
    const result = data as InstallResponse
    if (!result?.success) {
      const apiError = typeof result?.error === 'string' ? result.error : result?.error?.message
      throw new Error(apiError || 'install failed')
    }
    emit('automation-installed', { success: true, id: result.id })
    emit('created', { id: result.id })
  } catch (e) {
    const msg = errMsg(e, 'install failed')
    error.value = msg
    emit('automation-installed', { success: false, error: msg })
  } finally {
    saving.value = false
  }
}

function onCancel() { emit('close', {}) }
</script>

<template>
  <form class="kx-cr" @submit.prevent="install">
    <div class="kx-cr-head">
      <span class="kx-cr-ico"><Icon icon="tabler:message-2-bolt" aria-hidden="true" /></span>
      <div class="kx-cr-title">
        <h2>Channel responder</h2>
        <span>Reply in a channel with one of your agents.</span>
      </div>
    </div>

    <label class="kx-field">
      <span class="kx-field-lbl">Name</span>
      <input v-model="title" class="kx-input" type="text" placeholder="Support channel responder" aria-label="Automation name" />
    </label>

    <div class="kx-field">
      <span class="kx-field-lbl">Channel</span>
      <wc-channel-picker
        placeholder="Select a channel…"
        @change="onChannelChange"
      ></wc-channel-picker>
    </div>

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


  </form>
</template>
