<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { loadByTagName } from '@wippy-fe/proxy'
import { apiError } from '../constants'
import { useConnectionOAuth } from './useConnectionOAuth.ts'
import type { Provider, CredentialField, CredentialOption } from './connection-picker.types.ts'

const dialogPt = {
  header: { class: 'kx-modal-head' },
  content: { class: 'kx-dialog-content' },
  footer: { class: 'kx-modal-foot' },
}

// Connect-an-app dialog, two-pane (matches the knowledge / automations popup):
//   Left  — a searchable, category-grouped catalog of providers.
//   Right — the selected provider's configuration: its own setup web component,
//           or the generic form (name + credentials, or OAuth permissions).
// OAuth providers open consent in a popup window; the self-contained
// oauth_callback page completes the exchange and postMessages back.
const props = defineProps<{
  providers: Provider[]
  // If set, pre-select this provider's setup directly.
  provider?: string
  // If set, re-authorize this existing connection (grant more scopes) rather than
  // creating a new one — carries the component_id so init updates it in place.
  reauth?: { componentId: string; name?: string }
}>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'connected'): void }>()

const open = ref(true)
const search = ref('')
const selected = ref<Provider | null>(null)
const customHost = ref<HTMLElement | null>(null)
let customEl: HTMLElement | null = null
let customMountVersion = 0
const customUiLoading = ref(false)
const customUiError = ref('')

// configure-step state
const connName = ref('')
const selectedScopes = ref<Set<string>>(new Set())
const credentialValues = ref<Record<string, string | boolean>>({})
const searchInput = ref<HTMLInputElement | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)


const isReauth = computed(() => !!props.reauth)
const hasCustomUi = computed(() => !!(selected.value && selected.value.create_ui_id))
const isCredentialProvider = computed(() => !!(selected.value?.credential_schema && !selected.value?.oauth_provider))
const credentialFields = computed(() => selected.value?.credential_schema?.fields ?? [])
const key = (p: Provider) => p.provider ?? ''
const label = (p: Provider) => p.title ?? p.name ?? p.oauth_provider ?? 'Provider'
const icon = (p: Provider) => p.icon || 'tabler:plug'
const scopeCount = computed(() => selectedScopes.value.size)

const headTitle = computed(() => {
  if (!selected.value) return 'Connect an app'
  return `${isReauth.value ? 'Reconnect' : 'Connect'} ${label(selected.value)}`
})
const headSub = computed(() => {
  if (!selected.value) return 'Pick a service — your agents and automations can then use it.'
  return selected.value.description || 'Configure and connect this service.'
})

// Category comes from the provider's registry entry (meta.group). The SPA holds
// no provider-specific knowledge; a new provider declares its own group.
function category(p: Provider): string {
  const g = (p.group ?? '').trim()
  return g || 'Other'
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.providers
  return props.providers.filter(p =>
    label(p).toLowerCase().includes(q)
    || (p.description ?? '').toLowerCase().includes(q)
    || key(p).toLowerCase().includes(q)
    || category(p).toLowerCase().includes(q))
})

// Group order is derived from the providers themselves: categories sorted
// alphabetically, with the catch-all 'Other' always last. No fixed list.
const groups = computed(() => {
  const buckets = new Map<string, Provider[]>()
  for (const p of filtered.value) {
    const c = category(p)
    if (!buckets.has(c)) buckets.set(c, [])
    buckets.get(c)!.push(p)
  }
  for (const list of buckets.values()) list.sort((a, b) => label(a).localeCompare(label(b)))
  return [...buckets.entries()].sort(([a], [b]) => {
    if (a === 'Other') return 1
    if (b === 'Other') return -1
    return a.localeCompare(b)
  })
})

function pick(p: Provider) {
  if (connecting.value || (selected.value && key(selected.value) === key(p))) return
  // Switching providers: drop any in-flight popup + previously mounted custom UI.
  resetOAuthAttempt()
  unmountCustomUi()
  selected.value = p
  connName.value = 'My ' + label(p)
  selectedScopes.value = new Set(p.default_scopes ?? [])
  credentialValues.value = {}
  for (const field of p.credential_schema?.fields ?? []) {
    credentialValues.value[field.key] = field.type === 'checkbox' ? false : ''
  }
  connectError.value = ''
  pendingAuthUrl.value = ''
}
function isDefault(p: Provider, s: string) { return (p.default_scopes ?? []).includes(s) }
function toggleScope(s: string, required: boolean) {
  if (required) return
  const next = new Set(selectedScopes.value)
  next.has(s) ? next.delete(s) : next.add(s)
  selectedScopes.value = next
}

function optionValue(option: string | CredentialOption): string {
  return typeof option === 'string' ? option : (option.value ?? option.label ?? '')
}

// PrimeVue Select options for a credential field of type "select": a leading
// blank entry plus one { label, value } per declared option.
function credentialSelectOptions(field: CredentialField): Array<{ label: string; value: string }> {
  return [
    { label: '', value: '' },
    ...(field.options || []).map(option => ({
      label: typeof option === 'string' ? option : (option.label || option.value || ''),
      value: optionValue(option),
    })),
  ]
}

function credentialInputType(field: CredentialField): string {
  if (field.type === 'password') return 'password'
  if (field.type === 'url') return 'url'
  if (field.type === 'email') return 'email'
  return 'text'
}

function credentialPrivateContext(): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {}
  for (const field of credentialFields.value) {
    const raw = credentialValues.value[field.key]
    out[field.key] = typeof raw === 'string' ? raw.trim() : Boolean(raw)
  }
  return out
}

function credentialValidationError(): string {
  for (const field of credentialFields.value) {
    const value = credentialValues.value[field.key]
    if (field.required && (value === undefined || value === false || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label || field.key} is required`
    }
  }
  return ''
}

const oauth = useConnectionOAuth({
  provider: selected,
  reauth: () => props.reauth,
  open,
  connName,
  selectedScopes,
  isCredentialProvider,
  key,
  label,
  credentialPrivateContext,
  credentialValidationError,
  emitConnected: () => emit('connected'),
})
const {
  connecting, connectError, pendingAuthUrl, loadGrantedScopes,
  resetOAuthAttempt, doConnect, openBlockedPopup, dispose: disposeOAuth,
} = oauth

// Modular per-plugin UI: if the provider ships a custom setup web component
// (meta.component.create.view), mount it instead of the generic form. The WC
// gets provider-id (+ component-id on reauth) and signals completion via a
// `connection-saved`/`oauth-result` DOM event.
async function mountCustomUi() {
  const p = selected.value
  if (!p || !p.create_ui_id || !customHost.value) return
  const version = ++customMountVersion
  customUiLoading.value = true
  customUiError.value = ''
  try {
    await loadByTagName(p.create_ui_id, { timeoutMs: 8000 })
    if (version !== customMountVersion || selected.value !== p || !customHost.value) return
    const el = document.createElement(p.create_ui_id)
    el.setAttribute('provider-id', key(p))
    if (props.reauth) el.setAttribute('component-id', props.reauth.componentId)
    el.addEventListener('connection-saved', onCustomDone)
    el.addEventListener('oauth-result', onCustomDone)
    customHost.value.replaceChildren(el)
    customEl = el
  } catch (e) {
    if (version === customMountVersion) customUiError.value = 'Failed to load setup UI: ' + apiError(e)
  } finally {
    if (version === customMountVersion) customUiLoading.value = false
  }
}
function onCustomDone(ev: Event) {
  const d = (ev as CustomEvent).detail
  if (d && d.success === false) { connectError.value = d.error || 'Setup failed'; return }
  emit('connected'); open.value = false
}
function unmountCustomUi() {
  customMountVersion++
  customUiLoading.value = false
  customUiError.value = ''
  if (customEl) {
    customEl.removeEventListener('connection-saved', onCustomDone)
    customEl.removeEventListener('oauth-result', onCustomDone)
    customEl.remove()
    customEl = null
  }
}

function focusStep() {
  nextTick(() => {
    if (!selected.value) { searchInput.value?.focus(); return }
    if (hasCustomUi.value) { mountCustomUi(); return }
    nameInput.value?.focus()
  })
}

onMounted(() => {
  let pickedDirectly = false
  if (props.provider) {
    const direct = props.providers.find(p => key(p) === props.provider)
    if (direct) {
      pickedDirectly = true
      pick(direct)
      if (props.reauth) {
        if (props.reauth.name) connName.value = props.reauth.name
        loadGrantedScopes(direct, props.reauth.componentId)
      }
    }
  }
  // pick() changes selected, whose watcher schedules the mount. Calling
  // focusStep here as well started two competing provider-bundle loads.
  if (!pickedDirectly) focusStep()
})
watch(selected, focusStep)
onUnmounted(() => {
  disposeOAuth()
  unmountCustomUi()
})
watch(open, v => { if (!v) emit('close') })
</script>

<template>
  <Dialog
    v-model:visible="open"
    :modal="true"
    :dismissable-mask="true"
    :close-on-escape="!connecting"
    :closable="!connecting"
    class="kx-modal kx-modal-2p"
    :pt="dialogPt"
    :aria-label="headTitle"
  >
    <template #header>
      <span class="kx-modal-head-icon"><Icon :icon="selected ? icon(selected) : 'tabler:plug-connected'" aria-hidden="true" /></span>
      <span class="kx-modal-head-text">
        <span class="kx-modal-head-title">{{ headTitle }}</span>
        <span class="kx-modal-head-sub">{{ headSub }}</span>
      </span>
    </template>

    <div class="kx-2p">
        <!-- Left: provider catalog -->
        <div class="kx-2p-l">
          <div class="kx-cat-search" role="search">
            <Icon icon="tabler:search" aria-hidden="true" />
            <input ref="searchInput" v-model="search" type="text" placeholder="Search apps…" aria-label="Search apps" />
          </div>

          <div v-if="!filtered.length" class="kx-cat-empty">
            {{ search ? `No apps match “${search}”` : 'No providers available. Install a provider module to add one.' }}
          </div>

          <template v-for="[cat, list] in groups" :key="cat">
            <div class="kx-cat-grp-lbl">{{ cat }}</div>
            <div class="kx-cat">
              <button
                v-for="p in list"
                :key="key(p)"
                type="button"
                :data-provider-key="key(p)"
                class="kx-cat-card"
                :class="{ sel: selected && key(selected) === key(p) }"
                :disabled="connecting"
                @click="pick(p)"
              >
                <span class="kx-cat-ico"><Icon :icon="icon(p)" aria-hidden="true" /></span>
                <span class="kx-cat-text">
                  <span class="kx-cat-name">{{ label(p) }}</span>
                  <span class="kx-cat-desc">{{ p.description || `Set up ${label(p)}` }}</span>
                </span>
                <Icon v-if="selected && key(selected) === key(p)" icon="tabler:check" class="kx-cat-check" aria-hidden="true" />
              </button>
            </div>
          </template>
        </div>

        <!-- Right: configuration for the selected provider -->
        <div class="kx-2p-r">
          <div class="kx-2p-r-head">{{ selected ? 'Configure' : '' }}</div>
          <div class="kx-2p-r-body">
            <!-- nothing selected yet -->
            <div v-if="!selected" class="kx-cfg-empty">
              <Icon icon="tabler:plug" aria-hidden="true" />
              <span>Select a service on the left to set it up.</span>
            </div>

            <!-- provider-supplied custom setup UI -->
            <div v-else-if="hasCustomUi" class="kx-engine-wrap">
              <div ref="customHost" class="kx-engine-host"></div>
              <div v-if="customUiLoading" class="kx-cfg-state kx-engine-state" role="status">
                <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" />
                Loading setup…
              </div>
              <div v-else-if="customUiError" class="kx-engine-error" role="alert">
                <span>{{ customUiError }}</span>
                <button type="button" @click="mountCustomUi">Retry</button>
              </div>
            </div>

            <!-- generic form: name + credentials / OAuth permissions -->
            <div v-else class="kx-form">
              <p class="kx-2p-r-note">
                <template v-if="isCredentialProvider">Enter credentials for <strong>{{ label(selected) }}</strong>. The connection is checked before it is saved.</template>
                <template v-else-if="isReauth">Re-authorizing <strong>{{ label(selected) }}</strong> — adjust the permissions below and reconnect to update this connection.</template>
                <template v-else>A popup opens for <strong>{{ label(selected) }}</strong> authorization. Choose what to grant, then connect.</template>
              </p>

              <label class="kx-field">
                <span class="kx-field-lbl">Connection name</span>
                <input ref="nameInput" v-model="connName" type="text" class="kx-input" aria-label="Connection name" :disabled="connecting" @keydown.enter.prevent="doConnect" />
              </label>

              <!-- credential fields -->
              <label v-for="field in credentialFields" :key="field.key" class="kx-field">
                <span class="kx-field-lbl">{{ field.label || field.key }}<span v-if="field.required" class="kx-field-hint-inline"> — required</span></span>
                <Select
                  v-if="field.type === 'select'"
                  class="kx-select"
                  :model-value="credentialValues[field.key]"
                  :options="credentialSelectOptions(field)"
                  option-label="label"
                  option-value="value"
                  :disabled="connecting"
                  :aria-label="field.label || field.key"
                  @update:model-value="credentialValues[field.key] = $event"
                />
                <span v-else-if="field.type === 'checkbox'" class="kx-check">
                  <input v-model="credentialValues[field.key]" type="checkbox" :disabled="connecting" />
                  <span>{{ credentialValues[field.key] ? 'Enabled' : 'Disabled' }}</span>
                </span>
                <input
                  v-else
                  v-model="credentialValues[field.key]"
                  :type="credentialInputType(field)"
                  class="kx-input"
                  :placeholder="field.placeholder || ''"
                  :aria-label="field.label || field.key"
                  :disabled="connecting"
                  @keydown.enter.prevent="doConnect"
                />
                <span v-if="field.help" class="kx-field-hint-inline">{{ field.help }}</span>
              </label>

              <!-- OAuth permissions -->
              <div v-if="!isCredentialProvider && selected.available_scopes?.length" class="kx-field">
                <span class="kx-field-lbl">Permissions <span class="kx-field-hint-inline">— {{ scopeCount }} selected</span></span>
                <div class="kx-scopes" :class="connecting && 'kx-disabled'">
                  <label v-for="s in selected.available_scopes" :key="s.scope" class="kx-scope">
                    <input
                      type="checkbox"
                      :checked="selectedScopes.has(s.scope)"
                      :disabled="isDefault(selected, s.scope) || connecting"
                      @change="toggleScope(s.scope, isDefault(selected, s.scope))"
                    />
                    <span class="kx-scope-txt">
                      <span class="kx-scope-nm">{{ s.name || s.scope }}<span v-if="isDefault(selected, s.scope)" class="kx-field-hint-inline"> — required</span></span>
                      <span v-if="s.description" class="kx-scope-desc">{{ s.description }}</span>
                    </span>
                  </label>
                </div>
              </div>

              <!-- waiting / popup-blocked states -->
              <div v-if="pendingAuthUrl" class="kx-cfg-state warn">
                <span>Your browser blocked the popup.</span>
                <button @click="openBlockedPopup">Open authorization</button>
              </div>
              <div v-else-if="connecting" class="kx-cfg-state">
                <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" />
                {{ isCredentialProvider ? 'Checking connection…' : 'Complete sign-in in the popup window…' }}
              </div>

              <div v-if="connectError" class="kx-err inline">{{ connectError }}</div>
            </div>
          </div>
        </div>
      </div>

    <template #footer>
      <Button label="Cancel" severity="secondary" outlined :disabled="connecting" @click="open = false" />
      <Button
        v-if="selected && !hasCustomUi"
        data-connect
        :loading="connecting"
        :disabled="connecting"
        :label="connecting ? (isCredentialProvider ? 'Checking…' : 'Waiting…') : (selected.credential_schema?.submit_label || (isReauth ? 'Reconnect' : 'Connect'))"
        @click="doConnect"
      >
        <template #icon><Icon icon="tabler:plug-connected" aria-hidden="true" /></template>
      </Button>
    </template>
  </Dialog>
</template>
