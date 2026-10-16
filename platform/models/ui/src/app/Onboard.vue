<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { ClassGroup, ModelCard, Preset } from '../types.ts'
import { useComponentEvents } from '../constants.ts'
import ExternalProviderEditor from './ExternalProviderEditor.vue'
import { isBuiltInEditorTag, specForProviderTag } from '../providerSpecs.ts'
import { useModelsApi } from './useModelsApi.ts'
import { makeLookups, profileEndpoint, statusLabel, statusSeverity } from './presenters.ts'
import { usableFastModelContext } from '../modelReadiness.ts'
import { Avatar, Button, Notice, SelectField, Spinner } from './shared'
import ProviderProfileEditor from './ProviderProfileEditor.vue'

// kickside-onboard-models — a focused, onboarding-only screen over the model
// admin API. It is deliberately NOT the full Models surface: pick a provider,
// enter just the credential it needs, connect; then choose which model backs
// each capability class. The preset supplies endpoint defaults under the hood,
// so the form only ever asks for what the operator must type. It drives the host
// wizard with `done`/`back`. Admin is assumed (endpoints are admin-gated).
const emit = useComponentEvents()
const store = useModelsApi()
const { adapters, presets, profiles, models, classes, loading, saving, error } = store
const lookups = makeLookups(() => adapters.value, () => profiles.value, () => presets.value)

const COMPAT_EDITOR = 'kickside-model-provider-openai-compatible'
const COMPAT_PROVIDER = 'wippy.llm.openai_compat:provider'

type Stage = 'pick' | 'connect' | 'review'
const stage = ref<Stage>('pick')
const selectedPreset = ref<Preset | null>(null)
const connectMsg = ref('')
const connectFail = ref('')
// busy spans discovery so the form cannot be resubmitted.
const busy = ref(false)

// Presets shown as onboarding tiles. Niche variants (onboarding === false) stay
// out of the picker so the same provider never appears twice; they remain
// reachable from full Models settings.
const onboardingPresets = computed(() => presets.value.filter(p => p.onboarding !== false))

const selectedProviderId = computed(() => selectedPreset.value?.provider_id || COMPAT_PROVIDER)
const selectedAdapter = computed(() => lookups.adapterFor(selectedProviderId.value))
const selectedEditorTag = computed(
  () => selectedPreset.value?.profile_editor_tag || selectedAdapter.value?.profile_editor_tag || COMPAT_EDITOR,
)
const spec = computed(() => specForProviderTag(selectedEditorTag.value))
const useBuiltInEditor = computed(() => isBuiltInEditorTag(selectedEditorTag.value))

// Capability membership, derived from the model card's own capabilities.
function hasCap(m: ModelCard, cap: string): boolean {
  return (m.capabilities ?? []).some(c => c.toLowerCase() === cap)
}
function isEmbedOnly(m: ModelCard): boolean {
  const caps = (m.capabilities ?? []).map(c => c.toLowerCase())
  return caps.length > 0 && caps.every(c => c === 'embed' || c === 'embedding' || c === 'embeddings')
}
const generateModels = computed(() => models.value.filter(m => m.enabled !== false && !isEmbedOnly(m)))
const embedModels = computed(() => models.value.filter(m => m.enabled !== false
  && (hasCap(m, 'embed') || hasCap(m, 'embedding') || hasCap(m, 'embeddings'))))

// Class tiers, split by their DECLARED capability (model_class.capability), not by
// a hardcoded name — a deployment can add tiers of either kind and they slot in.
const generateClasses = computed(() => classes.value.filter(c => c.declared && c.capability !== 'embed'))
const embedClasses = computed(() => classes.value.filter(c => c.declared && c.capability === 'embed'))
function topModelFor(name: string): string {
  return classes.value.find(c => c.name === name)?.models?.[0]?.name ?? ''
}
function modelOptions(sectionModels: ModelCard[]): { label: string; value: string }[] {
  return sectionModels.map(m => ({ label: m.title || m.name, value: m.name }))
}

// One config section per declared capability kind, hidden when it has no tiers.
const sections = computed(() => [
  { key: 'generate', title: 'Default model per capability', classes: generateClasses.value, models: generateModels.value },
  { key: 'embed', title: 'Embeddings', classes: embedClasses.value, models: embedModels.value },
].filter(s => s.classes.length))

// The next onboarding step may use the normal agent/session path only after a
// persisted, enabled generation model is actually assigned to a declared class
// through an enabled provider profile. A click on Continue alone is not proof.
const configuredFastModel = computed(() => usableFastModelContext(profiles.value, models.value, classes.value))
const hasUsableConfiguredModel = computed(() => configuredFastModel.value !== null)

function finish() {
  emit('done', {
    status: hasUsableConfiguredModel.value ? 'completed' : 'skipped',
    model_configured: hasUsableConfiguredModel.value,
    ...(configuredFastModel.value ? { model: configuredFastModel.value } : {}),
  })
}

function skipModelSetup() {
  finish()
}

function showConnectFailure(message: string) {
  connectFail.value = message
  // Connection failures belong to the inline result. Keeping the store-level
  // copy as well made the review stage render the exact same error twice.
  error.value = ''
}

function goPick() {
  selectedPreset.value = null
  connectMsg.value = ''
  connectFail.value = ''
  stage.value = 'pick'
}
function pickPreset(preset: Preset) {
  selectedPreset.value = preset
  connectFail.value = ''
  stage.value = 'connect'
}
function cancelConnect() {
  if (profiles.value.length) stage.value = 'review'
  else goPick()
}

// the editor owns the field schema; onboarding renders it as-is.
async function connect(payload: Record<string, unknown>) {
  if (busy.value) return
  busy.value = true
  connectFail.value = ''
  try {
    payload.enabled = true
    const before = new Set(profiles.value.map(p => p.id))
    connectMsg.value = 'Saving connection…'
    const ok = await store.saveProfile('create', '', payload)
    if (!ok) { showConnectFailure(error.value || 'Could not save the connection.'); return }

    const created = profiles.value.find(p => !before.has(p.id))
    if (created) {
      connectMsg.value = 'Verifying key and importing models…'
      const r = await store.discover(created.id)
      await store.loadClasses()
      if (!r.ok) showConnectFailure(r.message)
      else { connectMsg.value = 'Selecting sensible defaults…'; await autoSelectDefaults(false) }
    }
    stage.value = 'review'
  } finally {
    busy.value = false
    connectMsg.value = ''
  }
}

// A full card overlay that sets the model's class list and priority exactly.
function cardWithClasses(m: ModelCard, classList: string[], priority: number): Record<string, unknown> {
  return {
    name: m.name,
    title: m.title || m.name,
    description: m.description || '',
    provider_id: m.provider_id,
    provider_profile_id: m.provider_profile_id || undefined,
    provider_model: m.provider_model || m.name,
    capabilities: [...(m.capabilities ?? [])],
    classes: classList,
    priority,
    max_tokens: Number(m.max_tokens ?? 0),
    output_tokens: Number(m.output_tokens ?? 0),
    dimensions: Number(m.dimensions ?? 0),
    pricing: m.pricing ?? {},
    options: m.options ?? {},
    metadata: m.metadata ?? {},
    source: m.source === 'registry' ? 'overlay' : (m.source || 'overlay'),
    enabled: true,
  }
}

// Authoritative tier assignment: after this, each named tier has exactly its
// chosen model as the top member. The class is removed from any other model that
// carried it, so re-picking never leaves a stale winner behind. One write per
// changed card, in a single reload.
async function applyAssignments(pairs: { cls: string; model: string }[]) {
  const chosen = new Map<string, string>()
  for (const p of pairs) if (p.model) chosen.set(p.cls, p.model)
  if (!chosen.size) return
  const tiers = new Set(chosen.keys())
  const final = new Map<string, Set<string>>()
  for (const m of models.value) {
    const s = new Set(m.class ?? [])
    for (const t of tiers) s.delete(t)
    final.set(m.name, s)
  }
  for (const [cls, model] of chosen) final.get(model)?.add(cls)

  const isChosen = new Set(chosen.values())
  const bodies: Record<string, unknown>[] = []
  for (const m of models.value) {
    const before = new Set(m.class ?? [])
    const after = final.get(m.name)!
    if (before.size === after.size && [...after].every(c => before.has(c))) continue
    const priority = isChosen.has(m.name) ? 1000 : Number(m.priority ?? 10)
    bodies.push(cardWithClasses(m, [...after], priority))
  }
  if (!bodies.length) return
  await store.saveCards(bodies)
  await store.loadClasses()
}

async function setClassModel(className: string, modelName: string) {
  if (!modelName) return
  await applyAssignments([{ cls: className, model: modelName }])
}

// Native first-party providers. Their catalogs are small and curated; aggregator
// providers (OpenAI-compatible: OpenRouter, …) carry hundreds of obscure
// models, so we never auto-pick from them while a native option exists.
const NATIVE_PROVIDERS = new Set([
  'wippy.llm.openai:provider',
  'wippy.llm.claude:provider',
  'wippy.llm.google.generative_ai:provider',
  'wippy.llm.google.vertex:provider',
  'wippy.llm.bedrock:provider',
])
function isNative(m: ModelCard): boolean {
  return NATIVE_PROVIDERS.has(m.provider_id || '')
}
// Non-text variants that must never back a generation tier (image/audio/video/
// music generators, Q&A-only, moderation, rerankers, …).
const NON_CHAT = /embed|whisper|tts|audio|image|imagen|dall-?e|lyria|veo|sora|music|\baqa\b|moderation|rerank|guard|realtime|transcribe|speech|\bsearch\b|vision-?only/i

// Capability proxy for ranking: completion price (cost tracks capability), then
// context window. Higher = more capable.
function capabilityScore(m: ModelCard): number {
  const pr = m.pricing as Record<string, unknown> | undefined
  const price = Number(pr?.completion ?? pr?.output ?? pr?.prompt ?? 0)
  if (Number.isFinite(price) && price > 0) return price
  return (Number(m.max_tokens) || 0) / 1e6
}

// Pool to auto-pick generation tiers from. Native /models APIs don't report
// capabilities (every native model lands as just "generate"), so a chat model is
// identified by excluding the non-text name patterns rather than by a tool_use
// flag. Native providers are preferred so aggregator noise never becomes a default.
function chatCandidates(): ModelCard[] {
  const chat = generateModels.value.filter(m => !NON_CHAT.test(m.name))
  const native = chat.filter(isNative)
  if (native.length) return native
  return chat.length ? chat : generateModels.value
}

// Suggest a generation model per tier: tiers are weight-ordered (lightest first),
// candidates ranked by score, spread by quantile so nano gets the cheapest and
// premium the most capable. A model already tagged with a tier wins over a guess.
function suggestGenerate(tiers: ClassGroup[]): Map<string, string> {
  const map = new Map<string, string>()
  const pool = chatCandidates()
  if (!pool.length || !tiers.length) return map
  const ranked = [...pool].sort((a, b) => capabilityScore(a) - capabilityScore(b))
  const last = ranked.length - 1
  tiers.forEach((c, i) => {
    const tagged = pool
      .filter(m => (m.class ?? []).includes(c.name))
      .sort((a, b) => capabilityScore(b) - capabilityScore(a))
    if (tagged.length) { map.set(c.name, tagged[0].name); return }
    const at = tiers.length <= 1 ? last : Math.round((i * last) / (tiers.length - 1))
    map.set(c.name, ranked[Math.min(at, last)].name)
  })
  return map
}

// Embeddings: prefer a native embedder, then the largest dimension count.
function suggestEmbed(): string {
  const pool = [...embedModels.value].sort((a, b) =>
    (isNative(b) ? 1 : 0) - (isNative(a) ? 1 : 0)
    || (Number(b.dimensions) || 0) - (Number(a.dimensions) || 0))
  return pool[0]?.name || ''
}

// Semi-automatic tier assignment. force=false fills only empty tiers (after a
// connect / on first open); force=true re-picks every tier (the manual button).
async function autoSelectDefaults(force = false) {
  const pairs: { cls: string; model: string }[] = []
  const gmap = suggestGenerate(generateClasses.value)
  for (const c of generateClasses.value) {
    if (!force && topModelFor(c.name)) continue
    const pick = gmap.get(c.name)
    if (pick) pairs.push({ cls: c.name, model: pick })
  }
  const embed = suggestEmbed()
  for (const c of embedClasses.value) {
    if (!force && topModelFor(c.name)) continue
    if (embed) pairs.push({ cls: c.name, model: embed })
  }
  await applyAssignments(pairs)
}

onMounted(async () => {
  await Promise.all([store.load(), store.loadClasses()])
  stage.value = profiles.value.length ? 'review' : 'pick'
  // First open with models imported but no tier configured yet: fill defaults so
  // the operator confirms rather than hand-picks every tier.
  if (profiles.value.length && generateModels.value.length
    && generateClasses.value.every(c => !topModelFor(c.name))) {
    await autoSelectDefaults(false)
  }
})
</script>

<template>
  <div class="ob">
    <Notice v-if="error && stage !== 'connect'" severity="danger" @dismiss="error = ''">{{ error }}</Notice>
    <Spinner v-if="loading && !profiles.length && !models.length" label="Loading…" />

    <template v-else>
      <div v-if="stage === 'pick' && !hasUsableConfiguredModel" class="ob-model-warning" role="note">
        <Icon icon="tabler:brain" aria-hidden="true" />
        <span><strong>KickSide works without an AI model, but it is better with one.</strong> Recommendations and AI-powered automations will be unavailable until you connect a provider. You can skip this step and finish it later under System → Models.</span>
      </div>

      <!-- Pick a provider -->
      <section v-if="stage === 'pick'" class="ob-stage">
        <div class="ob-grid">
          <button
            v-for="p in onboardingPresets"
            :key="p.id"
            type="button"
            class="ob-tile"
            @click="pickPreset(p)"
          >
            <span class="ob-tile-ico"><Icon :icon="p.icon || 'tabler:plug'" aria-hidden="true" /></span>
            <span class="ob-tile-name">{{ p.title }}</span>
            <span v-if="p.description" class="ob-tile-desc">{{ p.description }}</span>
          </button>
        </div>
        <div class="ob-foot">
          <button type="button" class="ob-btn ob-ghost" @click="emit('back', undefined)">‹ Back</button>
          <span class="ob-foot-sp" />
          <button v-if="profiles.length" type="button" class="ob-btn ob-ghost" @click="stage = 'review'">Skip — already connected</button>
          <button v-else type="button" class="ob-btn ob-ghost" @click="skipModelSetup">Skip for now</button>
        </div>
      </section>

      <!-- Connect: the provider's own profile-editor web component (correct
           schema: base URL editable, API key optional). -->
      <section v-else-if="stage === 'connect'" class="ob-stage">
        <!-- While connecting, the form is replaced so there is nothing to
             double-submit; the import can take ~30s. -->
        <div v-if="busy" class="ob-connecting">
          <Spinner :label="connectMsg || 'Connecting…'" />
          <p class="ob-connecting-note">Importing the provider's models — this can take up to a minute. Please don't close this.</p>
        </div>

        <template v-else>
          <ProviderProfileEditor
            v-if="useBuiltInEditor"
            :spec-key="spec.key"
            :preset="selectedPreset || undefined"
            :adapter="selectedAdapter || undefined"
            mode="create"
            :saving="busy"
            @save="connect"
            @cancel="cancelConnect"
          />
          <ExternalProviderEditor
            v-else
            :tag="selectedEditorTag"
            mode="create"
            :preset="selectedPreset || undefined"
            :adapter="selectedAdapter || undefined"
            :saving="busy"
            @save="connect"
            @cancel="cancelConnect"
          />
          <div v-if="connectFail" class="ob-result fail">
            <Icon icon="tabler:circle-x" aria-hidden="true" /><span>{{ connectFail }}</span>
          </div>
        </template>
      </section>

      <!-- Review: connected providers + per-class default model -->
      <section v-else class="ob-stage">
        <div v-if="connectFail" class="ob-result fail">
          <Icon icon="tabler:circle-x" aria-hidden="true" /><span>{{ connectFail }}</span>
        </div>

        <div class="ob-block">
          <div class="ob-block-head">
            <span>Connected</span>
            <Button variant="soft" small icon="tabler:plus" :disabled="saving" @click="goPick">Add provider</Button>
          </div>
          <div class="ob-providers">
            <div v-for="p in profiles" :key="p.id" class="ob-prov">
              <Avatar :icon="lookups.providerIcon(p.provider_id)" size="sm" />
              <div class="ob-prov-body">
                <div class="ob-prov-name">{{ p.name }}</div>
                <div class="ob-prov-sub">{{ profileEndpoint(p) }}</div>
              </div>
              <span class="ob-dot" :class="statusSeverity(p.status)" :title="statusLabel(p.status)" />
            </div>
          </div>
        </div>

        <div v-if="sections.length" class="ob-autobar">
          <span class="ob-auto-hint">Defaults are picked for you — adjust any below.</span>
          <Button variant="soft" small icon="tabler:wand" :disabled="saving" @click="autoSelectDefaults(true)">Auto-select</Button>
        </div>

        <div v-for="sec in sections" :key="sec.key" class="ob-block">
          <div class="ob-block-head"><span>{{ sec.title }}</span></div>
          <div class="ob-classes">
            <div v-for="c in sec.classes" :key="c.name" class="ob-class" :title="c.description || ''">
              <div class="ob-class-top">
                <span class="ob-class-ico"><Icon :icon="c.icon || 'tabler:layers-subtract'" aria-hidden="true" /></span>
                <span class="ob-class-name">{{ c.title || c.name }}</span>
              </div>
              <SelectField
                :model-value="topModelFor(c.name)"
                :options="modelOptions(sec.models)"
                :placeholder="sec.models.length ? 'Select a model' : 'No models yet'"
                :aria-label="`Model for ${c.title || c.name}`"
                @update:model-value="setClassModel(c.name, $event)"
              />
            </div>
          </div>
        </div>

        <div class="ob-foot">
          <button type="button" class="ob-btn ob-ghost" @click="emit('back', undefined)">‹ Back</button>
          <span class="ob-foot-sp" />
          <button v-if="hasUsableConfiguredModel" type="button" class="ob-btn ob-primary" :disabled="saving" @click="finish">Continue ›</button>
          <button v-else type="button" class="ob-btn ob-ghost" @click="skipModelSetup">Skip for now</button>
        </div>
      </section>
    </template>
  </div>
</template>
