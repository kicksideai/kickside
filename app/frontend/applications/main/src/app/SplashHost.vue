<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useWippy, useApi } from '../composables/useWippy'
import { isComponentTag, type SplashInfo } from '../composables/useSurfaces'
import SplashWizardRail from './SplashWizardRail.vue'
import type { SplashOutcome } from './splashTypes'
import {
  handleInstrumentRecommendationRequest,
  type InstrumentModelContext,
  type InstrumentRecommendationRequest,
} from './instrumentRecommendations'

const props = defineProps<{ splash: SplashInfo; dismissError?: string; dismissing?: boolean }>()
const emit = defineEmits<{ (e: 'done'): void; (e: 'dismiss'): void; (e: 'navigate', detail: {path: string; startToken?: string}): void }>()

const wippy = useWippy()
const api = useApi()
const isDialog = computed(() => props.splash.presentation === 'dialog')
const dialogEl = ref<HTMLDialogElement | null>(null)
function dismissDialog() {
  if (isDialog.value && !props.dismissing) emit('dismiss')
}
function dialogControls(root: Element | ShadowRoot): HTMLElement[] {
  const controls: HTMLElement[] = []
  for (const child of root.children) {
    if (child instanceof HTMLElement && child.matches('button, input, select, textarea, a[href], summary, [tabindex], [contenteditable="true"]')
      && child.tabIndex >= 0 && !child.matches(':disabled') && child.checkVisibility({ visibilityProperty: true })) {
      controls.push(child)
    }
    const children = child instanceof HTMLSlotElement ? child.assignedElements({ flatten: true }) : []
    if (children.length) {
      for (const assigned of children) {
        if (assigned instanceof HTMLElement && assigned.tabIndex >= 0 && !assigned.matches(':disabled')
          && assigned.checkVisibility({ visibilityProperty: true })) controls.push(assigned)
        controls.push(...dialogControls(assigned.shadowRoot || assigned))
      }
    } else controls.push(...dialogControls(child.shadowRoot || child))
  }
  return controls
}
function handleDialogKeydown(event: KeyboardEvent) {
  if (!isDialog.value) return
  if (event.key === 'Escape') {
    if (event.composedPath().some(node => node instanceof Element && node.getAttribute('aria-expanded') === 'true')) event.preventDefault()
    return
  }
  if (event.key !== 'Tab') return
  const controls = dialogControls(dialogEl.value!)
  const first = controls[0]
  const last = controls[controls.length - 1]
  const active = event.composedPath()[0]
  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
const steps = computed(() => props.splash.steps ?? [])
const idx = ref(0)
const step = computed(() => steps.value[idx.value] ?? null)
const isLast = computed(() => idx.value >= steps.value.length - 1)
const hostEl = ref<HTMLElement | null>(null)
let mountedEl: HTMLElement | null = null
let mountAttempt = 0
const componentLoading = ref(false)
const componentLoadError = ref('')
const configuredModel = ref<InstrumentModelContext | null>(null)

const stepOutcomes = ref<Record<string, SplashOutcome>>({})

// Setting inputs collected by declarative field steps.
const nameInput = ref('')
const logoUrl = ref('')
const logoFile = ref<HTMLInputElement | null>(null)
const logoBusy = ref(false)
const logoErr = ref('')
const saveErr = ref('')

// Navigation layout, offered alongside branding on the logo step. Seeded from the
// current config so the toggle reflects reality; layoutKnown gates the write so an
// un-seeded default never clobbers an existing choice.
const layout = ref<'vertical' | 'horizontal'>('vertical')
let layoutKnown = false
function setLayout(v: 'vertical' | 'horizontal') { layout.value = v; layoutKnown = true }

// MCP agent-connection step: issue a Keeper MCP token (admin/root) so an external
// agent can connect to this workspace. Shown once.
const mcpToken = ref('')
const mcpBusy = ref(false)
const mcpErr = ref('')
const copied = ref('')

const brand = computed(() => props.splash.title || 'Welcome')
// Server-resolved MCP URL (env-derived). The SPA runs in a sandboxed iframe where
// window.location.origin is "null", so the URL must come from the backend.
const mcpUrl = ref('')
const mcpConfig = computed(() => JSON.stringify(
  { mcpServers: { kickside: { type: 'http', url: mcpUrl.value, headers: { Authorization: `Bearer ${mcpToken.value}` } } } },
  null, 2,
))

async function generateMcp() {
  if (mcpBusy.value) return
  mcpBusy.value = true
  mcpErr.value = ''
  try {
    // Resolve the env-derived server URL from the backend (config.url).
    if (!mcpUrl.value) {
      try {
        const { data: cfg } = await api.get('/api/v1/keeper/mcp/scopes')
        if (cfg?.config?.url) mcpUrl.value = cfg.config.url
      } catch { /* leave blank; surfaced below */ }
    }
    const label = `${(nameInput.value.trim() || brand.value)} agent`
    const { data } = await api.post('/api/v1/keeper/mcp/tokens', { label, preset: 'root' })
    if (data?.success && data.token?.token) mcpToken.value = data.token.token
    else mcpErr.value = data?.error || 'Could not issue a token.'
  } catch (e) {
    const resp = (e as { response?: { data?: { error?: string } } })?.response
    mcpErr.value = resp?.data?.error || 'Could not issue a token (admin only).'
  } finally {
    mcpBusy.value = false
  }
}
async function copyText(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = what
    setTimeout(() => { if (copied.value === what) copied.value = '' }, 1500)
  } catch { /* clipboard blocked */ }
}

function back() { if (idx.value > 0) idx.value-- }

function recordOutcome(status: SplashOutcome['status'], detail?: Record<string, unknown>) {
  const id = step.value?.id
  if (!id) return
  stepOutcomes.value = { ...stepOutcomes.value, [id]: { status, ...(detail ? { detail } : {}) } }
}

function advance() {
  if (isLast.value) emit('done')
  else idx.value++
}

async function next() {
  if (!(await persistStep())) return
  recordOutcome('completed')
  advance()
}

function skipStep() {
  saveErr.value = ''
  recordOutcome('skipped')
  advance()
}

type ComponentDoneDetail = {
  status?: 'completed' | 'skipped'
  model_configured?: boolean
  model?: InstrumentModelContext
  [key: string]: unknown
}
function componentStepDone(event: Event) {
  const detail = (event as CustomEvent<ComponentDoneDetail>).detail || {}
  if (step.value?.id === 'models') {
    configuredModel.value = detail?.model_configured === true && detail.model ? detail.model : null
  }
  const status = detail.status === 'skipped' || (step.value?.id === 'models' && detail.model_configured !== true)
    ? 'skipped'
    : 'completed'
  recordOutcome(status, detail)
  advance()
}

function instrumentRecommendations(event: Event) {
  const detail = (event as CustomEvent<InstrumentRecommendationRequest>).detail
  if (!detail) return
  void handleInstrumentRecommendationRequest(
    { api: api as any },
    step.value?.id === 'modules' ? configuredModel.value : null,
    detail,
  )
}

// Upload a chosen logo to the public branding fs; the returned URL is persisted
// as kickside.ui:logo_url when the step advances.
async function onLogoFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  logoErr.value = ''
  logoBusy.value = true
  try {
    const fd = new FormData()
    fd.append('logo', file)
    // The host axios instance defaults to application/json; FormData needs the
    // multipart content-type (axios fills in the boundary) or the backend rejects
    // it as non-multipart. Mirrors the Appearance + Uploads UIs.
    const { data } = await api.post('/api/v1/nav/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (data?.success && data.url) logoUrl.value = data.url
    else logoErr.value = data?.error || 'Upload failed'
  } catch {
    logoErr.value = 'Upload failed'
  } finally {
    logoBusy.value = false
    input.value = ''
  }
}

// Write the current step's setting before advancing. Keys route through the
// admin-gated PUT /nav/config; a denied or failed write remains on the step so
// the completion ledger never claims unsaved setup as successful.
async function persistStep(): Promise<boolean> {
  saveErr.value = ''
  const field = step.value?.field
  if (!field) return true
  const body: Record<string, string> = {}
  if (field === 'workspace_name') {
    if (!nameInput.value.trim()) {
      saveErr.value = 'Enter a workspace name to continue.'
      return false
    }
    body.title = nameInput.value.trim()
  }
  else if (field === 'logo') {
    if (logoUrl.value) body.logo_url = logoUrl.value
    if (layoutKnown) body.layout = layout.value
  }
  if (!Object.keys(body).length) return true
  try {
    const { data } = await api.put('/api/v1/nav/config', body)
    if (!data?.success) {
      saveErr.value = data?.error || 'Could not save.'
      return false
    }
  } catch {
    saveErr.value = 'Could not save.'
    return false
  }
  return true
}

// Mount the current step's own web component, if it declares one.
async function mountStep() {
  const attempt = ++mountAttempt
  if (mountedEl) { mountedEl.remove(); mountedEl = null }
  componentLoading.value = false
  componentLoadError.value = ''
  // A component can synchronously emit `done`, replacing this keyed content
  // node with the next component step. Even a post-flush watcher may observe
  // the old template ref during that nested update, so wait for Vue to bind the
  // new host before deciding the step has nowhere to mount.
  await nextTick()
  if (attempt !== mountAttempt) return
  const tag = step.value?.component_tag
  if (!tag || !isComponentTag(tag) || !hostEl.value) return
  componentLoading.value = true
  try {
    await wippy.loadByTagName(tag)
    // The user may have changed steps while the bundle was loading. Never mount
    // a stale component into the new step's host.
    if (attempt !== mountAttempt || tag !== step.value?.component_tag || !hostEl.value) return
    const el = document.createElement(tag)
    el.style.display = 'block'
    el.setAttribute('splash-id', props.splash.id)
    el.setAttribute('step-id', step.value?.id || '')
    el.addEventListener('done', componentStepDone)
    el.addEventListener('navigate', (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (!detail || typeof detail.path !== 'string' || !detail.path.startsWith('/')) return
      emit('navigate', detail)
    })
    el.addEventListener('back', () => back())
    el.addEventListener('instrumentRecommendations', instrumentRecommendations)
    hostEl.value.replaceChildren(el)
    mountedEl = el
  } catch {
    if (attempt === mountAttempt) {
      hostEl.value?.replaceChildren()
      componentLoadError.value = 'Setup choices could not be loaded. Retry, or go back and try again.'
    }
  } finally {
    if (attempt === mountAttempt) componentLoading.value = false
  }
}

// sp-content is keyed by step id, so Vue replaces the host node on navigation.
// Mount only after that DOM update; a pre-flush watch mounts into the outgoing
// node and Vue immediately discards the component, leaving a blank step.
watch(idx, () => { void mountStep() }, { flush: 'post' })
onMounted(async () => {
  if (isDialog.value) dialogEl.value!.showModal()
  if (steps.value.length) await mountStep()
  // Seed the layout toggle from the current config so it shows the real choice.
  try {
    const { data } = await api.get('/api/v1/nav/list')
    if (data?.layout === 'horizontal' || data?.layout === 'vertical') { layout.value = data.layout; layoutKnown = true }
  } catch { /* default stays vertical; only persisted if the user picks one */ }
})
onBeforeUnmount(() => {
  mountAttempt++
  if (mountedEl) mountedEl.remove()
})

// Only terminal outcomes are recapped. Merely visiting a step is not success.
const completedSteps = computed(() => steps.value
  .slice(0, idx.value)
  .filter(candidate => stepOutcomes.value[candidate.id])
  .map(candidate => ({ ...candidate, outcome: stepOutcomes.value[candidate.id] })))

const primaryReady = computed(() => {
  if (step.value?.field === 'workspace_name') return nameInput.value.trim().length > 0
  if (step.value?.field === 'mcp') return mcpToken.value.length > 0
  return true
})

function goTo(i: number) {
  // Only allow jumping back to a completed step; forward stays gated by the flow.
  if (i < idx.value) idx.value = i
}
</script>

<template>
  <component :is="isDialog ? 'dialog' : 'div'" ref="dialogEl"
    :class="isDialog ? 'sp-dialog' : 'sp-screen'" role="dialog" aria-modal="true"
    aria-labelledby="sp-title" @cancel.prevent="dismissDialog" @keydown.capture="handleDialogKeydown">
    <button v-if="isDialog" type="button" class="sp-close" aria-label="Close onboarding"
      :disabled="dismissing" autofocus @click="dismissDialog">
      <Icon icon="tabler:x" :width="20" :height="20" aria-hidden="true" />
    </button>
    <SplashWizardRail
      v-if="!isDialog"
      :brand="brand"
      :steps="steps"
      :index="idx"
      :outcomes="stepOutcomes"
      @go-to="goTo"
    />

    <!-- Right panel: the active step -->
    <main class="sp-main">
      <div class="sp-content au" :key="step?.id || idx">
        <div v-if="step?.field === 'done'" class="sp-done-hero">
          <Icon icon="tabler:check" :width="30" :height="30" aria-hidden="true" />
        </div>
        <div v-if="!isDialog" class="sp-eyebrow">Step {{ idx + 1 }} of {{ steps.length }}</div>
        <h1 id="sp-title" class="sp-h">{{ step?.title || brand }}</h1>
        <p v-if="step?.subtitle" class="sp-sub">{{ step.subtitle }}</p>

        <!-- A step's own web component, when declared. -->
        <div v-show="step?.component_tag" ref="hostEl" class="sp-step-host" />
        <div v-if="componentLoading" class="sp-component-state" role="status">Loading setup choices…</div>
        <div v-else-if="componentLoadError" class="sp-component-state sp-component-error" role="alert">
          <span>{{ componentLoadError }}</span>
          <div class="sp-component-actions">
            <button v-if="idx > 0" type="button" class="sp-btn sp-g" @click="back">‹ Back</button>
            <button type="button" class="sp-btn sp-p" @click="mountStep">Retry</button>
          </div>
        </div>

        <!-- Declarative field: workspace name -> kickside.ui:title -->
        <div v-if="step && !step.component_tag && step.field === 'workspace_name'" class="sp-field">
          <label class="lt-label" for="sp-ws-name">Workspace name</label>
          <input
            id="sp-ws-name"
            v-model="nameInput"
            class="lt-input sp-input-lg"
            :placeholder="step.placeholder || 'Name your workspace'"
            autofocus
            @keydown.enter.prevent="next"
          >
          <span class="lt-field-hint">You can change this anytime in Settings → Appearance.</span>
        </div>

        <!-- Declarative field: logo -> kickside.ui:logo_url (+ navigation layout) -->
        <div v-else-if="step && !step.component_tag && step.field === 'logo'" class="sp-field">
          <div class="sp-logo-row">
            <div class="sp-logo-prev">
              <img v-if="logoUrl" :src="logoUrl" alt="Logo preview">
              <span v-else class="sp-logo-ph">{{ brand.slice(0, 1) }}</span>
            </div>
            <div class="sp-logo-act">
              <!-- A <label> is not focusable and the input is hidden, so the picker
                   needs a real button to get a tab stop and a focus ring. -->
              <button type="button" class="ghost-action" :disabled="logoBusy" @click="logoFile?.click()">
                {{ logoBusy ? 'Uploading…' : (logoUrl ? 'Replace image' : 'Upload image') }}
              </button>
              <input ref="logoFile" type="file" accept="image/*" hidden @change="onLogoFile">
              <span class="lt-field-hint">PNG, JPG, WebP or GIF, up to 2 MB. A square image works best.</span>
              <p v-if="logoErr" class="sp-err">{{ logoErr }}</p>
            </div>
          </div>

          <div class="sp-layout">
            <span class="sp-layout-label">Navigation layout</span>
            <div class="sp-seg" role="group" aria-label="Navigation layout">
              <button type="button" class="sp-seg-btn" :class="layout === 'vertical' && 'on'" @click="setLayout('vertical')">
                <svg viewBox="0 0 24 18" width="26" height="20" fill="none" aria-hidden="true"><rect x="1" y="1" width="22" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="1" width="7" height="16" rx="2" fill="currentColor" opacity=".5"/></svg>
                Sidebar
              </button>
              <button type="button" class="sp-seg-btn" :class="layout === 'horizontal' && 'on'" @click="setLayout('horizontal')">
                <svg viewBox="0 0 24 18" width="26" height="20" fill="none" aria-hidden="true"><rect x="1" y="1" width="22" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="1" width="22" height="5" rx="2" fill="currentColor" opacity=".5"/></svg>
                Top bar
              </button>
            </div>
          </div>
        </div>

        <!-- Declarative field: connect an agent via an MCP root token -->
        <div v-else-if="step && !step.component_tag && step.field === 'mcp'" class="sp-field">
          <template v-if="!mcpToken">
            <button class="sp-btn sp-p" :disabled="mcpBusy" @click="generateMcp">
              {{ mcpBusy ? 'Issuing…' : 'Generate access token' }}
            </button>
            <p v-if="mcpErr" class="sp-err" style="margin-top:10px">{{ mcpErr }}</p>
            <span class="lt-field-hint">Issues an admin (root) MCP token so an agent like Claude can connect to this workspace's tools, knowledge and automations.</span>
          </template>
          <template v-else>
            <div class="sp-mcp-warn">
              <strong>Root access.</strong> This token can read and change everything in this workspace. Treat it like a password — never share it or commit it to a repo. Revoke it in Settings if exposed.
            </div>
            <div class="sp-mcp-row">
              <span class="sp-mcp-key">Server URL</span>
              <code class="sp-mcp-val">{{ mcpUrl }}</code>
              <button class="sp-mcp-copy" @click="copyText(mcpUrl, 'url')">{{ copied === 'url' ? 'Copied' : 'Copy' }}</button>
            </div>
            <div class="sp-mcp-row">
              <span class="sp-mcp-key">Token</span>
              <code class="sp-mcp-val">{{ mcpToken }}</code>
              <button class="sp-mcp-copy" @click="copyText(mcpToken, 'token')">{{ copied === 'token' ? 'Copied' : 'Copy' }}</button>
            </div>
            <div class="sp-mcp-cfg-head">
              <span>Client config (bearer auth)</span>
              <button class="sp-mcp-copy" @click="copyText(mcpConfig, 'cfg')">{{ copied === 'cfg' ? 'Copied' : 'Copy' }}</button>
            </div>
            <pre class="sp-mcp-cfg">{{ mcpConfig }}</pre>
            <span class="lt-field-hint">Save the token now — it isn't shown again. Revoke anytime in Settings.</span>
          </template>
        </div>

        <!-- Declarative field: final recap -->
        <div v-else-if="step && !step.component_tag && step.field === 'done'" class="sp-done">
          <ul v-if="completedSteps.length" class="sp-done-recap">
            <li v-for="s in completedSteps" :key="s.id" class="sp-done-item" :class="`is-${s.outcome.status}`">
              <span class="sp-done-check">
                <Icon :icon="s.outcome.status === 'skipped' ? 'tabler:minus' : 'tabler:check'" :width="13" :height="13" aria-hidden="true" />
              </span>
              <span class="sp-done-label">{{ s.title }}</span>
              <span v-if="s.outcome.status === 'skipped'" class="sp-done-status">Skipped</span>
            </li>
          </ul>
        </div>

        <p v-if="saveErr || dismissError" class="sp-err sp-save-err" role="alert">
          {{ saveErr || dismissError }}
        </p>

        <!-- Footer: declarative steps only; component steps own their controls. -->
        <div v-if="!step?.component_tag" class="sp-row">
          <button v-if="idx > 0" class="sp-btn sp-g" @click="back">‹ Back</button>
          <span v-else />
          <div class="sp-row-r">
            <button v-if="step?.optional && !isLast" class="sp-btn sp-g" @click="skipStep">Skip for now</button>
            <button class="sp-btn sp-p" :disabled="!primaryReady || dismissing" @click="next">
              {{ dismissing && isLast ? 'Saving…' : isLast ? 'Enter workspace' : 'Continue ›' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </component>
</template>

<style scoped src="./SplashHost.css"></style>
