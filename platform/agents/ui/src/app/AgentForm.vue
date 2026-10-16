<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, defineComponent, shallowRef, type Slot, type VNode } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import ToggleSwitch from 'primevue/toggleswitch'
import { loadByTagName } from '@wippy-fe/proxy'
import WcMount from '@widgets/app/WcMount.vue'
import AgentNav from './AgentNav.vue'
import ToolReference from './ToolReference.vue'
import IconField from '@widgets/app/IconField.vue'
import AnchoredPanel from '@widgets/app/AnchoredPanel.vue'
import { useAgentCapabilities } from './useAgentCapabilities.ts'
import { useAgentRouting } from './useAgentRouting.ts'
import { useAgentFormPersistence } from './useAgentFormPersistence.ts'
import { ARTIFACTS_TRAIT, FILE_MANAGER_TRAIT, REDIRECT_TRAIT, type Agent, type Form, type Model, type Tool, type Trait } from './agent-form.types.ts'

// Reuse the same editor chrome in standalone and host-provided modal layouts.
const chromeSlot = shallowRef<Slot>()
const DefineChrome = defineComponent({
  setup(_, { slots }) { chromeSlot.value = slots.default; return () => undefined },
})
const ReuseChrome = defineComponent({
  render() { return chromeSlot.value ? (chromeSlot.value() as VNode[]) : null },
})

// The full agent editor, ported from the monolith's create/edit flow: a tabbed
// form (General / Prompt / Model / Capabilities) over the new module's
// /user-agents API. Self-contained — it loads the agent on edit and saves —
// driven by option lists the host passes in. Universal --p-* theme only.
const props = defineProps<{
  open: boolean
  // When embedded, the form fills its host (a workspace popup provides the backdrop,
  // panel chrome and close) instead of rendering its own full-screen mask + modal.
  embedded?: boolean
  agentId: string | null
  traits: Trait[]
  tools: Tool[]
  models: Model[]
  agents: Agent[]
  // Workspace "+" folder to place a newly created agent under (create mode only).
  parentId?: string | null
}>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved', id: string): void }>()

// Left-pane section nav (built in navItems below). Identity lives at the top of
// the left pane (always visible); the nav drives the right-pane content.
// Delegates + redirects are merged into one Routing section.
const sectionTitle = computed(() => {
  switch (tab.value) {
    case 'model': return 'Model'
    case 'caps': return 'Capabilities'
    case 'routing': return 'Routing'
    default: return 'Prompt'
  }
})

// The redirect (control-change) capability: enabling it = handing the chat to
// another agent. Configured here, stored in trait_contexts for the capability's build
// func; selecting targets auto-enables the capability.
const tab = ref('prompt')
// Routing section toggles between its two subsections in the right pane.
// Model classes (e.g. class:fast) are aggregated from the class arrays the models
// declare, ordered by a sensible default first; the agent may target a class or a
// specific model.
const CLASS_ORDER = ['fast', 'nano', 'balanced', 'premium']
const modelClasses = computed<string[]>(() => {
  const seen = new Set<string>()
  for (const m of props.models) for (const c of (m.class || [])) seen.add(c)
  return [...seen].sort((a, b) => {
    const ia = CLASS_ORDER.indexOf(a), ib = CLASS_ORDER.indexOf(b)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b)
  })
})
function defaultModel(): string {
  if (modelClasses.value.includes('fast')) return 'class:fast'
  if (modelClasses.value.length) return 'class:' + modelClasses.value[0]
  return props.models[0]?.name || ''
}

function blank(includeCreateDefaults = true): Form {
  return {
    title: '', description: '', icon: 'tabler:robot', prompt: '', public: false,
    model: defaultModel(), temperature: null, max_tokens: 8000, thinking_effort: null,
    traits: includeCreateDefaults ? [ARTIFACTS_TRAIT, FILE_MANAGER_TRAIT] : [], trait_contexts: {}, trait_agent_options: {}, tools: [], delegates: [], memory_target_id: '', memory_provider_id: '',
  }
}
const form = ref<Form>(blank())

const isEdit = computed(() => !!props.agentId)

// Non-embedded Dialog visibility: bound to `open`; the Dialog's dismiss paths
// (mask click, Escape, header/programmatic close) flip it false, which we relay as
// the existing `close` emit so callers are unchanged.
const dialogVisible = computed({
  get: () => props.open,
  set: (v: boolean) => { if (!v) emit('close') },
})
const agentNameInput = ref<HTMLInputElement | null>(null)
function focusAgentName() {
  void nextTick(() => agentNameInput.value?.focus({ preventScroll: true }))
}

// Temperature is stored 0–2 but shown as a 0–100% slider, matching the source UX.
const tempPct = computed({
  get: () => Math.round((form.value.temperature ?? 0.5) * 50),
  set: (v: number) => { form.value.temperature = Math.max(0, Math.min(2, (Number(v) || 0) / 50)) },
})
// Temperature is opt-in: most current models reject the parameter, so nothing
// is sent unless the toggle is on.
const temperatureOn = computed({
  get: () => form.value.temperature !== null,
  set: (on: boolean) => { form.value.temperature = on ? (form.value.temperature ?? 0.5) : null },
})
const selectedModels = computed(() => form.value.model.startsWith('class:')
  ? props.models.filter(model => model.class?.includes(form.value.model.slice(6)))
  : props.models.filter(model => model.name === form.value.model))
const tokenCeiling = computed(() => {
  const budgets = selectedModels.value.map(model => model.output_tokens)
    .filter((limit): limit is number => typeof limit === 'number' && Number.isFinite(limit) && limit > 0)
  return budgets.length ? Math.min(...budgets) : 128000
})
const temperatureApplies = computed(() => !thinkingOn.value &&
  (selectedModels.value.length === 0 || selectedModels.value.some(model => !model.capabilities?.includes('reasoning'))))
const temperatureBlockedReason = computed(() => thinkingOn.value
  ? 'Extended thinking sets its own temperature.'
  : 'The selected models reason instead of sampling, so temperature is not applied.')
const tokensError = computed(() => !Number.isInteger(form.value.max_tokens) || form.value.max_tokens < 1 || form.value.max_tokens > tokenCeiling.value)
const valid = computed(() => form.value.title.trim().length > 0 && !!form.value.model && !tokensError.value)

const persistence = useAgentFormPersistence({
  form, valid, tab, blank,
  agentId: () => props.agentId,
  parentId: () => props.parentId,
  models: () => props.models,
  redirectTrait: REDIRECT_TRAIT,
  emitSaved: id => emit('saved', id),
})
const { loading, saving, error, loadAgent, save } = persistence

// The models list arrives asynchronously (the host loads it after mount), so blank()'s
// defaultModel() ran with an empty list and the create form had no model -> a required
// field was silently unset and the Create button stayed disabled while the picker showed
// "Default model". Re-apply the default once models load, only while still unset.
watch(() => props.models, () => {
  if (!isEdit.value && !form.value.model) form.value.model = defaultModel()
}, { immediate: true })

// Shared pickers: register the custom elements, apply their selections.
onMounted(() => {
  loadByTagName('wc-model-picker', { timeoutMs: 8000 }).catch(() => {})
  loadByTagName('wc-agent-picker', { timeoutMs: 8000 }).catch(() => {})
})
function onModelSelect(e: Event) { form.value.model = (e as CustomEvent<string>).detail }

// ── thinking effort ──
const thinkingOn = computed({
  get: () => form.value.thinking_effort !== null,
  set: (on: boolean) => { form.value.thinking_effort = on ? (form.value.thinking_effort ?? 50) : null },
})

const capabilities = useAgentCapabilities({ form, traits: () => props.traits, redirectTrait: REDIRECT_TRAIT })
const {
  collapsedTraits, isTraitCollapsed, toggleTraitCollapsed, showAdvancedTools,
  selectableTraits, traitOn, activeTraits, traitMountConfig, onTraitConfig,
  tintOf, badgesOf, traitQuery, traitMenuOpen, traitAddRoot, traitSearchInput,
  traitActiveIndex, traitListboxId, addableTraits, activeTraitOptionId,
  setTraitOptionRef, onTraitQueryInput, onTraitQueryKeydown, addTrait,
  toggleTrait, onToolsChange,
} = capabilities

const routing = useAgentRouting({
  form,
  agentId: () => props.agentId,
  agents: () => props.agents,
  redirectTrait: REDIRECT_TRAIT,
})
const {
  routeView, pickIds, onDelegatesChange, redirectTargets, redirectSelectedIds,
  setRedirects, onRedirectsChange, redirectLabel, setRedirectCommentById,
} = routing

// React to both open and agentId, immediately: embedded hosts (wc-agent-edit) mount
// with open already true, so an open-only transition never fires and the edit form
// would stay blank; agentId also arrives asynchronously from host attributes.
watch(() => [props.open, props.agentId], ([open]) => {
  if (!open) return
  tab.value = 'prompt'
  routeView.value = 'delegates'
  error.value = ''
  if (props.agentId) loadAgent(props.agentId)
  else form.value = blank()
}, { immediate: true })

// Nav items with live counts so the left rail shows what's configured at a glance.
const navItems = computed(() => [
  { key: 'prompt', label: 'Prompt', icon: 'tabler:keyboard', meta: form.value.prompt.trim() ? '•' : '' },
  { key: 'model', label: 'Model', icon: 'tabler:cpu', meta: '' },
  { key: 'caps', label: 'Capabilities', icon: 'tabler:puzzle', meta: activeTraits.value.length ? String(activeTraits.value.length) : '' },
  { key: 'routing', label: 'Routing', icon: 'tabler:arrows-split-2', meta: (form.value.delegates.length + redirectTargets.value.length) ? String(form.value.delegates.length + redirectTargets.value.length) : '' },
])

</script>

<template>
  <!-- Author the editor chrome once; render it below in the Dialog (standalone) or
       bare (embedded, host owns the frame). -->
  <DefineChrome>
    <div class="kx-modal-head">
        <span class="kx-modal-head-icon"><Icon :icon="form.icon || 'tabler:robot'" aria-hidden="true" /></span>
        <span class="kx-modal-head-text">
          <span class="kx-modal-head-title">{{ isEdit ? 'Edit agent' : 'New agent' }}</span>
          <span class="kx-modal-head-sub">{{ form.title.trim() || 'Configure persona, model and capabilities.' }}</span>
        </span>
        <button class="kx-modal-x" aria-label="Close" @click="emit('close')"><Icon icon="tabler:x" aria-hidden="true" /></button>
      </div>

      <div v-if="loading" class="kx-2p">
        <div class="kx-loading"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…</div>
      </div>

      <div v-else class="kx-2p">
        <!-- Left: identity (always visible) + section nav -->
        <div class="kx-2p-l">
          <div class="kx-form">
            <div class="kx-field">
              <span class="kx-field-lbl">Name</span>
              <div class="kx-name-row">
                <IconField class="kx-name-icon" v-model="form.icon" fallback="tabler:robot" />
                <input ref="agentNameInput" v-model="form.title" class="kx-input" data-agent-name aria-label="Agent name" placeholder="e.g. Research assistant" />
              </div>
            </div>

            <label class="kx-field">
              <span class="kx-field-lbl">Description <span class="kx-field-hint-inline">— shown in pickers</span></span>
              <textarea v-model="form.description" class="kx-input kx-textarea kx-textarea-sm" rows="2" placeholder="What this agent is for." />
            </label>

          </div>

          <AgentNav :items="navItems" :active="tab" @select="tab = $event" />
        </div>

        <!-- Right: the selected section -->
        <div class="kx-2p-r">
          <div class="kx-2p-r-head">{{ sectionTitle }}</div>
          <div class="kx-2p-r-body">
            <!-- Prompt -->
            <div v-if="tab === 'prompt'" class="kx-form kx-form-grow">
              <label class="kx-field kx-field-grow">
                <span class="kx-field-lbl">System prompt <span class="kx-field-hint-inline">— the agent's persona and instructions</span></span>
                <textarea v-model="form.prompt" class="kx-input kx-textarea kx-textarea-lg" placeholder="You are a helpful assistant that…" />
              </label>
              <p class="kx-sec-foot">Keep the prompt clear and operational. Capabilities and routing are configured in their own sections.</p>
            </div>

            <!-- Model -->
            <div v-else-if="tab === 'model'" class="kx-form">
              <div class="kx-field">
                <span class="kx-field-lbl">Model</span>
                <wc-model-picker :value="form.model || ''" @select="onModelSelect" />
              </div>

              <label class="kx-field">
                <span class="kx-field-lbl">Max tokens <span class="kx-field-hint-inline">— response length cap</span></span>
                <input v-model.number="form.max_tokens" type="number" min="1" :max="tokenCeiling" step="1" class="kx-input" :class="tokensError && 'kx-input-err'" />
                <span v-if="tokensError" class="kx-field-err">Must be between 1 and {{ tokenCeiling }}.</span>
              </label>

              <div class="kx-field">
                <div class="kx-toggle">
                  <ToggleSwitch v-model="thinkingOn" input-id="agent-thinking" />
                  <label for="agent-thinking" class="kx-toggle-copy">
                    <span class="kx-field-lbl">Extended thinking</span>
                  </label>
                </div>
                <div v-if="thinkingOn" class="kx-think">
                  <span class="kx-field-hint-inline">Effort: {{ form.thinking_effort }}%</span>
                  <input v-model.number="form.thinking_effort" type="range" min="0" max="100" step="5" class="kx-range" />
                </div>
              </div>

              <div class="kx-field">
                <div v-if="temperatureApplies" class="kx-toggle">
                  <ToggleSwitch v-model="temperatureOn" input-id="agent-temperature" />
                  <label for="agent-temperature" class="kx-toggle-copy">
                    <span class="kx-field-lbl">Custom temperature</span>
                  </label>
                </div>
                <p v-else class="kx-sec-foot">{{ temperatureBlockedReason }}</p>
                <div v-if="temperatureApplies && temperatureOn" class="kx-think">
                  <span class="kx-field-hint-inline">{{ tempPct }}% · higher is more creative · unsupported on most current models</span>
                  <input v-model.number="tempPct" type="range" min="0" max="100" step="1" class="kx-range" />
                </div>
              </div>
            </div>

            <!-- Capabilities -->
            <div v-else-if="tab === 'caps'" class="kx-form">
              <!-- Traits drive the agent. Add from a filtered dropdown; the active
                   list tints each capability's icon by its strongest effect (tools /
                   behavior / memory) and badges what it contributes. Configurable
                   traits expand their settings inline. -->
              <div class="kx-group">
                <div class="kx-group-head">
                  <span class="kx-group-title">Capabilities</span>
                  <span class="kx-group-meta">{{ activeTraits.length }} active</span>
                </div>

                <div ref="traitAddRoot" class="kx-tadd">
                  <input
                    ref="traitSearchInput"
                    v-model="traitQuery"
                    class="kx-input kx-tadd-input"
                    type="text"
                    role="combobox"
                    aria-label="Search capabilities to add"
                    aria-autocomplete="list"
                    :aria-expanded="traitMenuOpen"
                    :aria-controls="traitListboxId"
                    :aria-activedescendant="traitMenuOpen ? activeTraitOptionId : undefined"
                    placeholder="Search capabilities to add…"
                    @focus="traitMenuOpen = true"
                    @input="onTraitQueryInput"
                    @keydown="onTraitQueryKeydown"
                  />
                  <AnchoredPanel v-model:open="traitMenuOpen" :anchor="traitAddRoot">
                    <div :id="traitListboxId" class="kx-tadd-menu" role="listbox" aria-label="Available capabilities">
                      <button
                        v-for="(t, index) in addableTraits"
                        :key="t.id"
                        :id="`agent-capability-option-${index}`"
                        :ref="el => setTraitOptionRef(el, index)"
                        type="button"
                        class="kx-tadd-opt"
                        :class="index === traitActiveIndex && 'kx-tadd-opt-active'"
                        tabindex="-1"
                        role="option"
                        :aria-selected="false"
                        @mouseenter="traitActiveIndex = index"
                        @click="addTrait(t.id)"
                      >
                        <span class="kx-trait-ico" :class="`kx-tint-${tintOf(t)}`"><Icon :icon="t.icon || 'tabler:puzzle'" aria-hidden="true" /></span>
                        <span class="kx-tadd-opt-text">
                          <span class="kx-trait-name">{{ t.title || t.id }}</span>
                          <span v-if="t.description" class="kx-trait-desc">{{ t.description }}</span>
                        </span>
                        <span class="kx-trait-badges">
                          <span v-for="b in badgesOf(t)" :key="b.key" class="kx-badge kx-tag-caps" :class="`kx-badge-${b.key}`">{{ b.label }}</span>
                        </span>
                      </button>
                      <div v-if="!addableTraits.length" class="kx-tadd-empty">No matching capabilities.</div>
                    </div>
                  </AnchoredPanel>
                </div>

                <ul v-if="activeTraits.length" class="kx-traits">
                  <li v-for="t in activeTraits" :key="t.id" class="kx-trait">
                    <div class="kx-trait-row">
                      <span class="kx-trait-ico" :class="`kx-tint-${tintOf(t)}`"><Icon :icon="t.icon || 'tabler:puzzle'" aria-hidden="true" /></span>
                      <span class="kx-trait-text">
                        <span class="kx-trait-name">{{ t.title || t.id }}</span>
                        <span v-if="t.description" class="kx-trait-desc">{{ t.description }}</span>
                      </span>
                      <span class="kx-trait-badges">
                        <span v-for="b in badgesOf(t)" :key="b.key" class="kx-badge kx-tag-caps" :class="`kx-badge-${b.key}`">{{ b.label }}</span>
                      </span>
                      <span class="kx-trait-actions">
                        <button
                          v-if="t.web_component"
                          type="button"
                          class="kx-trait-fold"
                          :aria-expanded="!isTraitCollapsed(t.id)"
                          :title="isTraitCollapsed(t.id) ? 'Show settings' : 'Hide settings'"
                          :aria-label="isTraitCollapsed(t.id) ? 'Show settings' : 'Hide settings'"
                          @click="toggleTraitCollapsed(t.id)"
                        >
                          <Icon :icon="isTraitCollapsed(t.id) ? 'tabler:chevron-right' : 'tabler:chevron-down'" aria-hidden="true" />
                        </button>
                        <button type="button" class="kx-trait-x" :aria-label="`Remove ${t.title || t.id} capability`" @click="toggleTrait(t.id)"><Icon icon="tabler:x" aria-hidden="true" /></button>
                      </span>
                    </div>
                    <div v-if="t.web_component && !isTraitCollapsed(t.id)" class="kx-trait-cfg">
                      <WcMount
                        :tag="t.web_component"
                        :config="traitMountConfig(t.id)"
                        :provider="t.provider"
                        @change="(cfg: any) => onTraitConfig(t.id, cfg)"
                      />
                    </div>
                  </li>
                </ul>
                <p v-else class="kx-sec-foot">No capabilities yet. Add one above to give this agent what it can do.</p>
              </div>

              <!-- Full declared documentation and capability/tool combinations. -->
              <div class="kx-group">
                <button type="button" class="kx-group-toggle" :aria-expanded="showAdvancedTools" @click="showAdvancedTools = !showAdvancedTools">
                  <Icon :icon="showAdvancedTools ? 'tabler:chevron-down' : 'tabler:chevron-right'" class="kx-adv-caret" aria-hidden="true" />
                  <span class="kx-group-title">Tools and combinations</span>
                  <span class="kx-group-meta">{{ form.tools.length }} selected</span>
                </button>
                <template v-if="showAdvancedTools">
                  <p class="kx-sec-foot">Capabilities add the tools they need automatically. Pick individual tools only for fine-grained control.</p>
                  <ToolReference
                    :tools="tools"
                    :traits="traits"
                    :selectable-ids="selectableTraits.map(trait => trait.id)"
                    :selected="form.tools"
                    :active-traits="form.traits"
                    @change="onToolsChange"
                    @add-capability="addTrait"
                  />
                </template>
              </div>
            </div>

            <!-- Routing — delegates + redirects merged, segmented toggle. -->
            <div v-else-if="tab === 'routing'" class="kx-form">
              <div class="kx-seg" role="tablist">
                <button type="button" role="tab" class="kx-seg-btn" :class="routeView === 'delegates' && 'kx-seg-btn-on'" :aria-selected="routeView === 'delegates'" @click="routeView = 'delegates'">
                  <Icon icon="tabler:arrow-ramp-right-3" aria-hidden="true" /> Delegates
                  <span v-if="form.delegates.length" class="kx-seg-count">{{ form.delegates.length }}</span>
                </button>
                <button type="button" role="tab" class="kx-seg-btn" :class="routeView === 'redirects' && 'kx-seg-btn-on'" :aria-selected="routeView === 'redirects'" @click="routeView = 'redirects'">
                  <Icon icon="tabler:arrows-split-2" aria-hidden="true" /> Redirects
                  <span v-if="redirectTargets.length" class="kx-seg-count">{{ redirectTargets.length }}</span>
                </button>
              </div>

              <!-- Delegates — search-based add via the shared multi-select. -->
              <template v-if="routeView === 'delegates'">
                <p class="kx-sec-foot">When this agent decides a task belongs to another, it can hand off while keeping the chat. Pick the agents it may delegate to.</p>
                <wc-agent-picker
                  placeholder="Search agents to delegate to…"
                  :selected="JSON.stringify(form.delegates)"
                  @change="onDelegatesChange(pickIds($event))"
                ></wc-agent-picker>
              </template>

              <!-- Redirects — search-based target select; each selected target
                   reveals an inline comment injected into the prompt. -->
              <template v-else>
                <p class="kx-sec-foot">A redirect is not a delegate: it <strong>transfers the whole chat</strong> — the target agent takes over and this one stops. Pick the agents it may hand off to, and note when (injected into the prompt).</p>
                <wc-agent-picker
                  placeholder="Search agents to redirect to…"
                  :selected="JSON.stringify(redirectSelectedIds)"
                  @change="onRedirectsChange(pickIds($event))"
                ></wc-agent-picker>
                <div v-if="redirectTargets.length" class="kx-redirect-comments">
                  <div v-for="t in redirectTargets" :key="t.agent_id" class="kx-redirect-comment-row">
                    <span class="kx-redirect-comment-name"><Icon icon="tabler:arrows-split-2" aria-hidden="true" /> {{ redirectLabel(t.agent_id) }}</span>
                    <input
                      :value="t.comment"
                      class="kx-input kx-redirect-comment"
                      placeholder="When to redirect here (injected into the prompt)…"
                      @input="setRedirectCommentById(t.agent_id, ($event.target as HTMLInputElement).value)"
                    />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="kx-modal-foot">
        <div v-if="error" class="kx-err inline kx-foot-err">{{ error }}</div>
        <Button type="button" label="Cancel" severity="secondary" outlined :disabled="saving" @click="emit('close')" />
        <Button
          type="button"
          data-testid="agent-form-save"
          :label="saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save changes' : 'Create agent')"
          :loading="saving"
          :disabled="saving || !valid"
          @click="save">
          <template #icon="{ class: iconClass }">
            <Icon :icon="isEdit ? 'tabler:device-floppy' : 'tabler:plus'" :class="iconClass" aria-hidden="true" />
          </template>
        </Button>
      </div>
  </DefineChrome>

  <!-- Standalone: PrimeVue Dialog owns the mask + panel, rendered inside this
       component's shadow root by default (via the theme's PrimeVuePlugin). Its own
       header/footer are off; the editor's own head/body/foot chrome fills the
       content region. -->
  <Dialog
    v-if="!embedded"
    v-model:visible="dialogVisible"
    modal
    block-scroll
    :show-header="false"
    :dismissable-mask="true"
    :draggable="false"
    :pt="{ root: { class: 'kx-modal kx-modal-agent', role: 'dialog', 'aria-modal': 'true', 'aria-label': isEdit ? 'Edit agent' : 'New agent' }, content: { class: 'kx-modal-content' } }"
    @show="focusAgentName"
  >
    <ReuseChrome />
  </Dialog>

  <!-- Embedded: the host popup provides the backdrop, panel chrome and close, so
       the editor renders bare (no Dialog) — preserved exactly as before. -->
  <div v-else-if="open" class="kx-embed">
    <div class="kx-modal kx-modal-agent kx-modal-embed" role="dialog" aria-modal="true">
      <ReuseChrome />
    </div>
  </div>
</template>
