<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { host } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import WcMount from '@widgets/app/WcMount.vue'
import type { Credential } from '../types.ts'
import { fetchCredentials, updateCredential, deleteCredential, errMsg } from '../api.ts'
import { useMcpCredentialCreate } from './useMcpCredentialCreate.ts'
import { credentialStatusLabel, entryLabel } from './labels.ts'

const dialogPt = {
  header: { class: 'kx-dialog-header' },
  content: { class: 'kx-dialog-content' },
  footer: { class: 'kx-dialog-footer' },
}

// The MCP credentials surface: mint an MCP endpoint configured like an agent — it
// runs AS you, optionally confined to a whitelist of components you pick (no uuids),
// with public traits and their per-trait context — then hand the token to an agent.
// Canonical WC: proxy api/host, host.toast/confirm, --p-* theme, pickers mounted by tag.
const loading = ref(false)
const error = ref('')
const creds = ref<Credential[]>([])
const query = ref('')
const traitCatalogRefreshKey = ref(0)
let credentialsLoadSequence = 0
let visibilityRefreshInitialized = false


const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return creds.value
  return creds.value.filter(c => (c.label || '').toLowerCase().includes(q))
})

const createFlow = useMcpCredentialCreate({ credentials: creds, reload: () => load() })
const {
  createOpen, saving, formError, minted, form, whitelist, crumbs,
  children, browsing, serverMcpUrl, browserOrigin, mcpUrl, snippet, claudeCodeCmd,
  traitPickerValue,
  openCreate, closeCreate, browse, crumbTo, crumbRoot, openFolder, currentFolder,
  inWhitelist, atRoot, scopeActive, scopeLabel, addScope, toggleWhitelist,
  removeWhitelist, classIcon, onTraitPickerChange, submit,
} = createFlow

async function load() {
  const sequence = ++credentialsLoadSequence
  loading.value = true
  error.value = ''
  try {
    const next = await fetchCredentials()
    if (sequence === credentialsLoadSequence) {
      creds.value = next.credentials
      if (next.mcpUrl) serverMcpUrl.value = next.mcpUrl
    }
  } catch (e) {
    if (sequence === credentialsLoadSequence) {
      creds.value = []
      error.value = errMsg(e, 'could not load credentials')
    }
  } finally {
    if (sequence === credentialsLoadSequence) loading.value = false
  }
}

function relTime(unix?: number | null): string {
  if (!unix) return ''
  const s = Math.max(0, Math.round(Date.now() / 1000 - unix))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60); if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24); if (d < 30) return `${d}d ago`
  return new Date(unix * 1000).toLocaleDateString()
}

// ─── rename ─────────────────────────────────────────────────────────────
const renaming = ref<Credential | null>(null)
const renameLabel = ref('')
const renameSaving = ref(false)
function openRename(c: Credential) { renaming.value = c; renameLabel.value = c.label || '' }
function closeRename() { renaming.value = null; renameLabel.value = '' }
async function saveRename() {
  const c = renaming.value
  if (!c) return
  const label = renameLabel.value.trim()
  if (!label) return
  renameSaving.value = true
  try {
    await updateCredential(c.credential_id, { label })
    host.toast({ severity: 'success', summary: 'Renamed', detail: label })
    closeRename()
    await load()
  } catch (e) {
    error.value = errMsg(e, 'rename failed')
  } finally { renameSaving.value = false }
}

async function copy(text: string, what: string) {
  try { await navigator.clipboard.writeText(text); host.toast({ severity: 'success', summary: 'Copied', detail: what }) }
  catch { host.toast({ severity: 'warn', summary: 'Copy failed', detail: 'Select and copy manually.' }) }
}

async function askDelete(c: Credential) {
  const ok = await host.confirm({
    message: `Delete “${c.label || c.token_prefix}”? This permanently removes the credential and its token. This can't be undone.`,
    header: 'Delete credential', icon: 'tabler:trash',
    acceptLabel: 'Delete', rejectLabel: 'Cancel', acceptClass: 'p-button-danger',
  })
  if (!ok) return
  try {
    await deleteCredential(c.credential_id)
    host.toast({ severity: 'success', summary: 'Deleted', detail: c.label || c.token_prefix })
    await load()
  } catch (e) {
    error.value = errMsg(e, 'delete failed')
    host.toast({ severity: 'error', summary: 'Delete failed', detail: error.value })
  }
}

// The rename overlay is visibility-driven off the credential being renamed;
// PrimeVue Dialog owns scrim, focus, and Escape for both overlays.
const renameOpen = computed({
  get: () => renaming.value !== null,
  set: (v: boolean) => { if (!v) closeRename() },
})

useHostVisibilityRefresh(async () => {
  if (visibilityRefreshInitialized) traitCatalogRefreshKey.value += 1
  visibilityRefreshInitialized = true
  await load()
})
</script>

<template>
  <div class="kx">
    <header class="kx-head">
      <div class="kx-head-icon"><Icon icon="tabler:plug-connected" aria-hidden="true" /></div>
      <div class="kx-head-text">
        <h1 class="kx-title">MCP credentials</h1>
        <p class="kx-head-sub">Tokens an agent can use to act as you, optionally scoped to components you pick.</p>
      </div>
      <div class="kx-head-actions">
        <div class="kx-search">
          <Icon icon="tabler:search" class="kx-search-ico" aria-hidden="true" />
          <input v-model="query" class="kx-search-input" type="text" placeholder="Search credentials…" aria-label="Search credentials" />
        </div>
        <Button type="button" label="New credential" @click="openCreate">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>
    </header>

    <!-- The endpoint is one URL for every client; Claude connects to it with no
         token at all (OAuth consent mints the credential), so it stays visible
         here rather than only inside the one-time minted modal. -->
    <div class="kx-connect-strip">
      <Icon icon="tabler:world" aria-hidden="true" />
      <span class="kx-connect-lbl">Endpoint</span>
      <code class="kx-connect-url">{{ mcpUrl }}</code>
      <Button type="button" severity="secondary" outlined size="small" title="Copy endpoint URL" aria-label="Copy endpoint URL" @click="copy(mcpUrl, 'endpoint URL')">
              <template #icon="{ class: iconClass }"><Icon icon="tabler:copy" :class="iconClass" aria-hidden="true" /></template>
            </Button>
      <span class="kx-connect-hint">Claude (claude.ai): Settings → Connectors → Add custom connector → paste this URL — sign-in happens here via OAuth, no token needed. Tokens below are for clients without OAuth.</span>
    </div>

    <div v-if="error" class="kx-err">{{ error }}</div>

    <div class="kx-body">
      <div v-if="loading && !creds.length" class="kx-loading"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…</div>

      <div v-else-if="!creds.length" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:plug-connected" aria-hidden="true" /></div>
        <div class="kx-empty-title">No credentials yet</div>
        <div class="kx-empty-sub">Mint a token an agent can use to act as you — scoped to the components and capabilities you choose.</div>
        <div class="kx-empty-actions"><Button type="button" label="New credential" @click="openCreate">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
        </Button></div>
      </div>

      <div v-else-if="!filtered.length" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:mood-empty" aria-hidden="true" /></div>
        <div class="kx-empty-title">No matches</div>
        <div class="kx-empty-actions"><Button type="button" severity="secondary" outlined label="Clear search" @click="query = ''">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:x" :class="iconClass" aria-hidden="true" /></template>
        </Button></div>
      </div>

      <div v-else class="kx-grid">
        <div v-for="c in filtered" :key="c.credential_id" class="kx-card">
          <div class="kx-card-head">
            <span class="kx-ficon"><Icon icon="tabler:plug-connected" aria-hidden="true" /></span>
            <div class="kx-card-id">
              <div class="kx-card-name" :title="c.label || '(unlabeled)'">{{ c.label || '(unlabeled)' }}</div>
              <div class="kx-card-meta">
                <span class="kx-chip kx-tag-sm" :class="(c.whitelist_component_ids?.length || 0) > 0 ? 'kx-scope' : 'kx-ver'">
                  <Icon :icon="(c.whitelist_component_ids?.length || 0) > 0 ? 'tabler:lock' : 'tabler:world'" aria-hidden="true" />
                  {{ (c.whitelist_component_ids?.length || 0) > 0 ? `${c.whitelist_component_ids!.length} scoped` : 'full account' }}
                </span>
                <span v-if="(c.allowed_trait_ids?.length || 0) > 0" class="kx-chip kx-tag-sm kx-ver"><Icon icon="tabler:puzzle" aria-hidden="true" /> {{ c.allowed_trait_ids!.length }} {{ c.allowed_trait_ids!.length === 1 ? 'capability' : 'capabilities' }}</span>
                <span class="kx-chip kx-tag-sm kx-status" :class="c.status === 'active' ? 'kx-status-on' : 'kx-status-off'">{{ credentialStatusLabel(c.status) }}</span>
              </div>
            </div>
            <div class="kx-card-actions" @click.stop>
              <Button type="button" severity="secondary" outlined size="small" title="Rename" aria-label="Rename" @click="openRename(c)">
                <template #icon="{ class: iconClass }"><Icon icon="tabler:pencil" :class="iconClass" aria-hidden="true" /></template>
              </Button>
              <Button type="button" severity="danger" outlined size="small" title="Delete" aria-label="Delete" @click="askDelete(c)">
                <template #icon="{ class: iconClass }"><Icon icon="tabler:trash" :class="iconClass" aria-hidden="true" /></template>
              </Button>
            </div>
          </div>
          <div class="kx-card-desc">
            <code>{{ c.token_prefix }}…</code>
            <span v-if="c.last_used_at"> · used {{ relTime(c.last_used_at) }}</span>
            <span v-if="c.expires_at"> · expires {{ new Date(c.expires_at * 1000).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / minted-token modal -->
    <Dialog
      v-model:visible="createOpen" modal
      class="kx-dialog kx-modal-xl" aria-label="New MCP credential"
      :pt="dialogPt"
    >
      <template #header>
        <span class="kx-modal-head-icon"><Icon icon="tabler:plug-connected" aria-hidden="true" /></span>
        <span class="kx-modal-head-text">
          <span class="kx-modal-head-title">{{ minted ? 'Credential created' : 'New credential' }}</span>
          <span class="kx-modal-head-sub">{{ minted ? 'Copy the token now — it is shown once.' : 'Scope it, name it, pick its capabilities.' }}</span>
        </span>
      </template>

      <!-- form -->
        <div v-if="!minted" class="kx-modal-body">
          <!-- name first: what you'll recognize the credential by -->
          <div class="kx-field-row">
            <label class="kx-field">
              <span class="kx-field-lbl">Label</span>
              <input v-model="form.label" class="kx-input" type="text" placeholder="research-agent" />
            </label>
            <label class="kx-field">
              <span class="kx-field-lbl">Expires <span class="kx-field-hint-inline">— days</span></span>
              <input v-model="form.ttl" class="kx-input" type="number" min="1" placeholder="never" />
            </label>
          </div>

          <!-- whitelist component-tree picker (multi-select; empty = full account) -->
          <div class="kx-field">
            <span class="kx-field-lbl">Scope <span class="kx-field-hint-inline">— leave empty for full account, or add components to confine it</span></span>
            <div v-if="whitelist.length" class="kx-scope-chips">
              <span v-for="w in whitelist" :key="w.id" class="kx-scope-chip">
                <Icon icon="tabler:lock" aria-hidden="true" />
                <span class="kx-scope-chip-name">{{ entryLabel(w) }}<span v-if="!w.name" class="kx-id"> {{ w.id }}</span></span>
                <button class="kx-scope-chip-x" title="Remove" aria-label="Remove" @click="removeWhitelist(w.id)"><Icon icon="tabler:x" aria-hidden="true" /></button>
              </span>
            </div>
            <div v-else class="kx-scope-note">
              <Icon icon="tabler:world" aria-hidden="true" />
              <span v-if="currentFolder">Full account so far — nothing scoped yet. Use "{{ scopeLabel }}" to confine it to {{ entryLabel(currentFolder) }}.</span>
              <span v-else>Full account — reaches everything you can.</span>
            </div>
            <div class="kx-browser">
              <div class="kx-crumbs">
                <button class="kx-crumb" aria-label="Home" @click="crumbRoot"><Icon icon="tabler:home" aria-hidden="true" /><span v-if="atRoot">Home</span></button>
                <template v-for="(c, i) in crumbs" :key="c.id">
                  <Icon icon="tabler:chevron-right" class="kx-crumb-sep" aria-hidden="true" />
                  <button class="kx-crumb" :title="!c.name ? c.id : undefined" @click="crumbTo(i)">{{ entryLabel(c) }}</button>
                </template>
                <!-- scope to where you're standing: this folder, or Home (= full account) -->
                <Button
                  type="button"
                  size="small"
                  class="kx-crumb-add"
                  :severity="scopeActive ? undefined : 'secondary'"
                  :outlined="!scopeActive"
                  :label="scopeLabel"
                  @click="addScope"
                >
                  <template #icon="{ class: iconClass }"><Icon :icon="scopeActive ? 'tabler:check' : 'tabler:plus'" :class="iconClass" aria-hidden="true" /></template>
                </Button>
              </div>
              <div class="kx-browser-list">
                <div v-if="browsing" class="kx-tool-empty"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…</div>
                <div v-else-if="!children.length" class="kx-tool-empty">Nothing here.</div>
                <div v-for="e in children" :key="e.id" class="kx-browse-row">
                  <button class="kx-browse-open" @click="openFolder(e)" title="Open">
                    <Icon :icon="classIcon(e)" aria-hidden="true" />
                    <span>{{ entryLabel(e) }}<span v-if="!e.name?.trim()" class="kx-id"> {{ e.id }}</span></span>
                  </button>
                  <Button
                    type="button"
                    size="small"
                    :severity="inWhitelist(e.id) ? undefined : 'secondary'"
                    :outlined="!inWhitelist(e.id)"
                    :label="inWhitelist(e.id) ? 'Added' : 'Add'"
                    @click="toggleWhitelist(e)">
                    <template #icon="{ class: iconClass }"><Icon :icon="inWhitelist(e.id) ? 'tabler:check' : 'tabler:plus'" :class="iconClass" aria-hidden="true" /></template>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <wc-agent-trait-picker :value="traitPickerValue" :refresh-key="traitCatalogRefreshKey" keep-menu-open-on-add @change="onTraitPickerChange" />

          <div v-if="formError" class="kx-err inline">{{ formError }}</div>
        </div>

        <!-- minted token reveal -->
        <div v-else class="kx-modal-body">
          <div class="kx-field">
            <span class="kx-field-lbl">Endpoint URL <span class="kx-field-hint-inline">— public MCP endpoint</span></span>
            <div class="kx-token"><code>{{ mcpUrl }}</code><Button type="button" severity="secondary" outlined size="small" title="Copy URL" aria-label="Copy URL" @click="copy(mcpUrl, 'endpoint URL')">
              <template #icon="{ class: iconClass }"><Icon icon="tabler:copy" :class="iconClass" aria-hidden="true" /></template>
            </Button></div>
          </div>
          <div class="kx-field">
            <span class="kx-field-lbl">Bearer token <span class="kx-field-hint-inline">— shown once</span></span>
            <div class="kx-token"><code>{{ minted.token }}</code><Button type="button" severity="secondary" outlined size="small" title="Copy token" aria-label="Copy token" @click="copy(minted!.token, 'token')">
              <template #icon="{ class: iconClass }"><Icon icon="tabler:copy" :class="iconClass" aria-hidden="true" /></template>
            </Button></div>
          </div>
          <div class="kx-field">
            <span class="kx-field-lbl">Claude Code <span class="kx-field-hint-inline">— one command</span></span>
            <div class="kx-snip"><pre>{{ claudeCodeCmd }}</pre><Button type="button" severity="secondary" outlined size="small" title="Copy command" aria-label="Copy command" @click="copy(claudeCodeCmd, 'command')">
              <template #icon="{ class: iconClass }"><Icon icon="tabler:copy" :class="iconClass" aria-hidden="true" /></template>
            </Button></div>
          </div>
          <div class="kx-field">
            <span class="kx-field-lbl">Other clients <span class="kx-field-hint-inline">— streamable-http config</span></span>
            <div class="kx-snip"><pre>{{ snippet }}</pre><Button type="button" severity="secondary" outlined size="small" title="Copy config" aria-label="Copy config" @click="copy(snippet, 'config')">
              <template #icon="{ class: iconClass }"><Icon icon="tabler:copy" :class="iconClass" aria-hidden="true" /></template>
            </Button></div>
          </div>
          <div class="kx-connect-note">
            <Icon icon="tabler:info-circle" aria-hidden="true" />
            <span>Connecting from Claude (claude.ai)? You don't need this token — add the endpoint URL as a custom connector and approve the OAuth consent instead.</span>
          </div>
        </div>

      <template #footer>
        <template v-if="!minted">
          <Button type="button" label="Cancel" severity="secondary" outlined :disabled="saving" @click="closeCreate" />
          <Button type="button" label="Create credential" :loading="saving" :disabled="saving || !form.label.trim()" @click="submit">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:check" :class="iconClass" aria-hidden="true" /></template>
          </Button>
        </template>
        <Button v-else type="button" label="Done" @click="closeCreate">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:check" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </template>
    </Dialog>

    <!-- Rename modal -->
    <Dialog
      v-model:visible="renameOpen" modal
      class="kx-dialog" header="Rename credential" aria-label="Rename credential"
      :pt="dialogPt"
    >
      <div class="kx-modal-body">
        <div class="kx-field">
          <span class="kx-field-lbl">Label</span>
          <input v-model="renameLabel" class="kx-input" type="text" placeholder="A name you'll recognize"
                 @keydown.enter="saveRename" />
        </div>
      </div>
      <template #footer>
        <Button type="button" label="Cancel" severity="secondary" outlined :disabled="renameSaving" @click="closeRename" />
        <Button type="button" label="Save" :loading="renameSaving" :disabled="renameSaving || !renameLabel.trim()" @click="saveRename">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:check" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </template>
    </Dialog>
  </div>
</template>
