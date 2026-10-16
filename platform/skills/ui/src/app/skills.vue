<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { api, host, loadByTagName } from '@wippy-fe/proxy'
import type { Skill, SkillFile, SkillVersion } from '../types.ts'
import { fetchSkills, fetchSkill, fetchVersions, fetchSkillFile, errMsg } from '../api.ts'
import { skillStatusLabel, fileKindLabel } from './labels.ts'
import IconField from '@widgets/app/IconField.vue'
import SelectField from './SelectField.vue'

const DIALOG_PT = {
  header: { class: 'kx-dialog-header' },
  content: { class: 'kx-dialog-content' },
  footer: { class: 'kx-dialog-footer' },
}

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
]

const DEFAULT_ICON = 'tabler:bulb'

// The skills surface: manage your own skills (create / refine / share / delete +
// their bundled files). Canonical WC — proxy api/host, host.toast/host.confirm,
// universal --p-* theme so it renders in any host's shadow DOM.
const loading = ref(false)
const error = ref('')
const skills = ref<Skill[]>([])
const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return skills.value
  return skills.value.filter(s =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.description || '').toLowerCase().includes(q))
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    skills.value = await fetchSkills()
  } catch (e) {
    skills.value = []
    error.value = errMsg(e, 'could not load skills')
  } finally {
    loading.value = false
  }
}

// ─── create / refine ───────────────────────────────────────────────────
const editOpen = ref(false)
const saving = ref(false)
const formError = ref('')
const editing = ref<Skill | null>(null)
const editFiles = ref<SkillFile[]>([])
const head = ref<Skill | null>(null)
const fileBusy = ref(false)
const filePath = ref('')
const fileContent = ref('')
const fileError = ref('')

async function readFile(file: SkillFile, download = false) {
  if (!editing.value || !head.value?.version) return
  fileBusy.value = true
  filePath.value = file.path
  fileContent.value = ''
  fileError.value = ''
  try {
    const blob = await fetchSkillFile(editing.value.skill_id, file.path, head.value.version)
    if (download) {
      const url = URL.createObjectURL(blob)
      try {
        const link = document.createElement('a')
        link.href = url
        link.download = file.path.split('/').pop() || file.path
        link.click()
      } finally {
        URL.revokeObjectURL(url)
      }
    } else if (blob.type.startsWith('text/') || /(?:json|xml|javascript|yaml)$/.test(blob.type)) {
      fileContent.value = await blob.text()
    } else {
      fileContent.value = 'Binary file. Download to view its content.'
    }
  } catch (e) {
    fileError.value = errMsg(e, 'could not read skill file')
  } finally {
    fileBusy.value = false
  }
}
const form = ref({ name: '', description: '', body: '', status: 'active', icon: DEFAULT_ICON })

// ── version history (edit mode) ──
const versions = ref<SkillVersion[]>([])
const previewVersion = ref<number | null>(null)
const previewBody = ref('')
const previewMeta = ref<Skill | null>(null)
const previewing = computed(() => previewVersion.value !== null)

function openCreate() {
  editing.value = null
  head.value = null
  editFiles.value = []
  versions.value = []
  resetPreview()
  form.value = { name: '', description: '', body: '', status: 'active', icon: DEFAULT_ICON }
  formError.value = ''
  editOpen.value = true
}

async function openEdit(s: Skill) {
  editing.value = s
  head.value = null
  editFiles.value = []
  versions.value = []
  resetPreview()
  formError.value = ''
  form.value = {
    name: s.name || '', description: s.description || '', body: '',
    status: s.status || 'active', icon: s.icon || DEFAULT_ICON,
  }
  editOpen.value = true
  // The list carries only meta; load the current body + file manifest, then history.
  try {
    const skill = await fetchSkill(s.skill_id)
    head.value = skill
    form.value.body = skill.body || ''
    form.value.description = skill.description || form.value.description
    form.value.status = skill.status || form.value.status
    form.value.icon = skill.icon || form.value.icon
    editFiles.value = Array.isArray(skill.files) ? skill.files : []
  } catch (e) {
    formError.value = errMsg(e, 'could not load skill body')
  }
  try {
    versions.value = await fetchVersions(s.skill_id)
  } catch {
    versions.value = []
  }
}

function resetPreview() {
  filePath.value = ''
  fileContent.value = ''
  fileError.value = ''
  previewVersion.value = null
  previewBody.value = ''
  previewMeta.value = null
}

// Load a past version into a read-only preview (does not touch the editable head).
async function previewAt(n: number) {
  if (!editing.value) return
  formError.value = ''
  try {
    const skill = await fetchSkill(editing.value.skill_id, n)
    previewMeta.value = skill
    previewBody.value = skill.body || ''
    previewVersion.value = n
  } catch (e) {
    formError.value = errMsg(e, 'could not load version')
  }
}

// Leave preview, returning to the editable head.
function backToCurrent() {
  resetPreview()
}

// Copy the previewed body into the editable head so Save refines it forward
// (no backend restore call — a normal save creates the next version).
function restorePreview() {
  form.value.body = previewBody.value
  resetPreview()
}

function relTime(iso?: string): string {
  if (!iso) return ''
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  const s = Math.max(0, Math.round((Date.now() - t) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(t).toLocaleDateString()
}

function closeEdit() {
  editOpen.value = false
  editing.value = null
  head.value = null
  versions.value = []
  resetPreview()
  formError.value = ''
}

async function save() {
  if (!form.value.name.trim()) { formError.value = 'Name is required.'; return }
  if (!form.value.description.trim()) {
    formError.value = 'A description is required — it is what agents use to find the skill.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    if (editing.value) {
      const { data } = await api.patch(`/api/v1/skills/${editing.value.skill_id}`, {
        body: form.value.body,
        description: form.value.description,
        status: form.value.status,
        icon: form.value.icon,
      })
      if (!data?.success) throw new Error(data?.error || 'save failed')
      host.toast({ severity: 'success', summary: 'Saved', detail: `New version of ${form.value.name}` })
    } else {
      const { data } = await api.post('/api/v1/skills', {
        name: form.value.name,
        description: form.value.description,
        body: form.value.body,
        status: form.value.status,
        icon: form.value.icon,
      })
      if (!data?.success) throw new Error(data?.error || 'create failed')
      host.toast({ severity: 'success', summary: 'Created', detail: form.value.name })
    }
    closeEdit()
    await load()
  } catch (e) {
    formError.value = errMsg(e, 'save failed')
  } finally {
    saving.value = false
  }
}

// ─── share / access ────────────────────────────────────────────────────
// The reusable kickside-share popup owns the picker + grant/revoke; this just
// mounts it by tag and hands it the skill's access/share endpoints. Loading the
// peer component on demand is the canonical cross-module composition path.
const shareOpen = ref(false)
const shareTarget = ref<Skill | null>(null)
const shareHost = ref<HTMLElement | null>(null)
let shareEl: HTMLElement | null = null

function openShare(s: Skill) {
  shareTarget.value = s
  shareOpen.value = true
}
function closeShare() {
  shareOpen.value = false
  shareTarget.value = null
}

async function mountShare() {
  const s = shareTarget.value
  if (!shareHost.value || !s) return
  shareHost.value.innerHTML = ''
  if (!customElements.get('kickside-share')) {
    try { await loadByTagName('kickside-share', { timeoutMs: 8000 }) } catch { /* inert if undefined */ }
  }
  const el = document.createElement('kickside-share')
  el.setAttribute('config', JSON.stringify({
    resource_id: s.skill_id,
    access_url: `/api/v1/component-access/grants/${encodeURIComponent(s.skill_id)}`,
    share_url: `/api/v1/component-access/share/${encodeURIComponent(s.skill_id)}`,
    title: s.name || '',
  }))
  el.addEventListener('close', closeShare)
  shareHost.value.appendChild(el)
  shareEl = el
}

watch([shareOpen, shareHost], async () => {
  if (shareOpen.value && shareHost.value) await mountShare()
  else if (!shareOpen.value && shareEl) { shareEl = null }
})

// ─── delete (host confirm) ──────────────────────────────────────────────
async function askRemove(s: Skill) {
  const ok = await host.confirm({
    message: `Delete “${s.name || 'this skill'}”? This removes it and its version history. This can't be undone.`,
    header: 'Delete skill',
    icon: 'tabler:trash',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
  })
  if (!ok) return
  try {
    const { data } = await api.delete(`/api/v1/skills/${s.skill_id}`)
    if (!data?.success) throw new Error(data?.error || 'delete failed')
    host.toast({ severity: 'success', summary: 'Deleted', detail: s.name || 'skill' })
    await load()
  } catch (e) {
    error.value = errMsg(e, 'delete failed')
    host.toast({ severity: 'error', summary: 'Delete failed', detail: error.value })
  }
}

function fileIcon(kind?: string) {
  return kind === 'script' ? 'tabler:file-code'
    : kind === 'asset' ? 'tabler:file-download'
    : 'tabler:file-text'
}

// The edit modal is a PrimeVue Dialog (modal), which owns its own scrim, focus
// trapping, initial focus, and Escape-to-close. The share popup is a self-contained
// web component that handles its own backdrop, Escape, and close.
useHostVisibilityRefresh(load)
</script>

<template>
  <div class="kx">
    <header class="kx-head">
      <div class="kx-head-icon"><Icon icon="tabler:bulb" aria-hidden="true" /></div>
      <div class="kx-head-text">
        <h1 class="kx-title">Skills</h1>
        <p class="kx-head-sub">Reusable procedures your agents discover, follow, and refine.</p>
      </div>
      <div class="kx-head-actions">
        <div class="kx-search">
          <Icon icon="tabler:search" class="kx-search-ico" aria-hidden="true" />
          <input v-model="query" class="kx-search-input" type="text" placeholder="Search skills…" aria-label="Search skills" />
        </div>
        <Button type="button" data-testid="skills-create" label="New skill" @click="openCreate">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>
    </header>

    <div v-if="error" class="kx-err">{{ error }}</div>

    <div class="kx-body">
      <div v-if="loading && !skills.length" class="kx-loading">
        <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…
      </div>

      <div v-else-if="!skills.length" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:bulb" aria-hidden="true" /></div>
        <div class="kx-empty-title">No skills yet</div>
        <div class="kx-empty-sub">Skills are reusable procedures your agents discover, follow, and refine over time. Write one, or let an agent author it from a task it just did.</div>
        <div class="kx-empty-actions">
          <Button type="button" data-testid="skills-create" label="New skill" @click="openCreate">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:plus" :class="iconClass" aria-hidden="true" /></template>
          </Button>
        </div>
      </div>

      <div v-else-if="!filtered.length" class="kx-empty">
        <div class="kx-empty-ico"><Icon icon="tabler:mood-empty" aria-hidden="true" /></div>
        <div class="kx-empty-title">No matches</div>
        <div class="kx-empty-sub">Nothing matches “{{ query }}”. Try a different term or clear the search.</div>
        <div class="kx-empty-actions">
          <Button type="button" severity="secondary" outlined label="Clear search" @click="query = ''">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:x" :class="iconClass" aria-hidden="true" /></template>
          </Button>
        </div>
      </div>

      <div v-else class="kx-grid">
        <div v-for="s in filtered" :key="s.skill_id" class="kx-card" tabindex="0" role="button" :aria-label="`Open ${s.name || 'skill'}`" @click="openEdit(s)" @keydown.enter="openEdit(s)" @keydown.space.prevent="openEdit(s)">
          <div class="kx-card-head">
            <span class="kx-ficon"><Icon :icon="s.icon || 'tabler:bulb'" aria-hidden="true" /></span>
            <div class="kx-card-id">
              <div class="kx-card-name" :title="s.name || '(untitled)'">{{ s.name || '(untitled)' }}</div>
              <div class="kx-card-meta">
                <span v-if="s.version" class="kx-chip kx-tag-sm kx-ver">v{{ s.version }}</span>
                <span v-if="s.file_count" class="kx-chip kx-tag-sm kx-files-badge" :title="`${s.file_count} bundled file${s.file_count === 1 ? '' : 's'}`"><Icon icon="tabler:paperclip" aria-hidden="true" /> {{ s.file_count }}</span>
                <span v-if="s.agent_id" class="kx-chip kx-tag-sm kx-scope"><Icon icon="tabler:robot" aria-hidden="true" /> agent</span>
                <span v-if="s.status && s.status !== 'active'" class="kx-chip kx-tag-sm kx-status">{{ skillStatusLabel(s.status) }}</span>
              </div>
            </div>
            <div class="kx-card-actions" @click.stop>
              <Button type="button" severity="secondary" outlined size="small" title="Edit / refine" :aria-label="`Edit ${s.name}`" @click="openEdit(s)">
                <template #icon="{ class: iconClass }"><Icon icon="tabler:pencil" :class="iconClass" aria-hidden="true" /></template>
              </Button>
              <Button type="button" severity="secondary" outlined size="small" title="Share" :aria-label="`Share ${s.name}`" @click="openShare(s)">
                <template #icon="{ class: iconClass }"><Icon icon="tabler:share" :class="iconClass" aria-hidden="true" /></template>
              </Button>
              <Button type="button" severity="danger" outlined size="small" title="Delete" :aria-label="`Delete ${s.name}`" @click="askRemove(s)">
                <template #icon="{ class: iconClass }"><Icon icon="tabler:trash" :class="iconClass" aria-hidden="true" /></template>
              </Button>
            </div>
          </div>
          <div class="kx-card-desc">{{ s.description || 'No description' }}</div>
        </div>
      </div>
    </div>

    <!-- Create / refine: wide two-column editor — narrow controls left, big
         skill-text editor right. -->
    <Dialog
      v-model:visible="editOpen" modal
      class="kx-dialog kx-modal-xl" :pt="DIALOG_PT" aria-label="Edit skill"
    >
      <template #header>
        <span class="kx-modal-head-icon"><Icon :icon="form.icon || 'tabler:bulb'" aria-hidden="true" /></span>
        <span class="kx-modal-head-text">
          <span class="kx-modal-head-title">{{ editing ? 'Refine skill' : 'New skill' }}</span>
          <span class="kx-modal-head-sub">{{ form.description.trim() || 'A reusable procedure your agents discover and follow.' }}</span>
        </span>
        <span v-if="editing?.version" class="kx-chip kx-tag-sm kx-ver">v{{ editing.version }}</span>
      </template>

      <div class="kx-edit-cols">
          <!-- LEFT: controls + version history -->
          <div class="kx-edit-left">
            <div class="kx-field">
              <span class="kx-field-lbl">Name</span>
              <div class="kx-name-row">
                <IconField class="kx-name-icon" v-model="form.icon" fallback="tabler:bulb" />
                <input v-model="form.name" class="kx-input" type="text" :disabled="!!editing" placeholder="e.g. Triage a bug report" />
              </div>
            </div>

            <label class="kx-field">
              <span class="kx-field-lbl">Description <span class="kx-field-hint-inline">— what it does + when to use it (drives discovery)</span></span>
              <textarea v-model="form.description" class="kx-input kx-textarea kx-textarea-sm" rows="3" placeholder="Summarize a long chat into action items." />
            </label>

            <div class="kx-field">
              <span class="kx-field-lbl">Status</span>
              <SelectField v-model="form.status" :options="STATUS_OPTIONS" aria-label="Status" />
            </div>

            <div v-if="head" class="kx-meta-line">
              <span v-if="head.version">v{{ head.version }}</span>
              <span v-if="head.license">· {{ head.license }}</span>
              <span v-if="head.file_count">· {{ head.file_count }} file{{ head.file_count === 1 ? '' : 's' }}</span>
            </div>

            <div v-if="editFiles.length" class="kx-field">
              <span class="kx-field-lbl">Bundled files <span class="kx-field-hint-inline">— loaded on demand</span></span>
              <div class="kx-files">
                <div v-for="f in editFiles" :key="f.path" class="kx-file">
                  <Icon :icon="fileIcon(f.kind)" aria-hidden="true" />
                  <Button type="button" text class="kx-file-path" :label="f.path" :disabled="fileBusy" @click="readFile(f)" />
                  <Button type="button" text :aria-label="`Download ${f.path}`" :disabled="fileBusy" @click="readFile(f, true)">
                    <template #icon="{ class: iconClass }"><Icon icon="tabler:download" :class="iconClass" aria-hidden="true" /></template>
                  </Button>
                  <span v-if="f.kind" class="kx-file-kind">{{ fileKindLabel(f.kind) }}</span>
                </div>
              </div>
              <div v-if="filePath" role="region" :aria-label="filePath" :aria-busy="fileBusy">
                <p v-if="fileBusy" role="status">Reading {{ filePath }}…</p>
                <p v-if="fileError" role="alert">{{ fileError }}</p>
                <pre v-if="fileContent" class="kx-file-content">{{ fileContent }}</pre>
              </div>
            </div>

            <div v-if="editing && versions.length" class="kx-field">
              <span class="kx-field-lbl">Version history <span class="kx-field-hint-inline">— {{ versions.length }} version{{ versions.length === 1 ? '' : 's' }}</span></span>
              <div class="kx-vers">
                <button
                  v-for="v in versions" :key="v.version" type="button"
                  class="kx-ver-row" :class="previewVersion === v.version && 'kx-ver-row-on'"
                  @click="previewAt(v.version)"
                >
                  <span class="kx-chip kx-tag-sm kx-ver">v{{ v.version }}</span>
                  <span class="kx-ver-when">{{ relTime(v.created_at) }}</span>
                  <span v-if="v.file_count" class="kx-ver-files"><Icon icon="tabler:paperclip" aria-hidden="true" /> {{ v.file_count }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- RIGHT: the main writing surface -->
          <div class="kx-edit-right">
            <div class="kx-edit-right-head">
              <span class="kx-field-lbl">Skill instructions <span class="kx-field-hint-inline">— the procedure the agent follows{{ editing && !previewing ? '; saving creates a new version' : '' }}</span></span>
              <div v-if="previewing" class="kx-preview-bar">
                <span class="kx-preview-tag"><Icon icon="tabler:eye" aria-hidden="true" /> Previewing v{{ previewVersion }} (read-only)</span>
                <Button type="button" severity="secondary" outlined size="small" label="Back to current" @click="backToCurrent">
                  <template #icon="{ class: iconClass }"><Icon icon="tabler:arrow-back-up" :class="iconClass" aria-hidden="true" /></template>
                </Button>
                <Button type="button" severity="secondary" outlined size="small" label="Restore this version" @click="restorePreview">
                  <template #icon="{ class: iconClass }"><Icon icon="tabler:history" :class="iconClass" aria-hidden="true" /></template>
                </Button>
              </div>
            </div>
            <textarea
              v-if="previewing"
              :value="previewBody"
              class="kx-input kx-body-editor kx-body-preview"
              readonly aria-label="Previewed skill version (read-only)"
            />
            <textarea
              v-else
              v-model="form.body"
              class="kx-input kx-body-editor"
              aria-label="Skill instructions"
              placeholder="1. …&#10;2. …"
            />
          </div>
        </div>

      <div v-if="formError" class="kx-err inline kx-edit-err">{{ formError }}</div>

      <template #footer>
        <Button type="button" label="Cancel" severity="secondary" outlined :disabled="saving" @click="closeEdit" />
        <Button
          type="button"
          :label="editing ? 'Save new version' : 'Create skill'"
          :loading="saving"
          :disabled="saving || previewing"
          @click="save">
          <template #icon="{ class: iconClass }"><Icon :icon="editing ? 'tabler:device-floppy' : 'tabler:check'" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </template>
    </Dialog>

    <!-- Share: the reusable kickside-share popup, mounted by tag over the skill's
         access/share endpoints. -->
    <!-- Share: the reusable kickside-share popup owns its own modal chrome
         (backdrop + panel); we just mount the tag and close on its `close`. -->
    <div v-if="shareOpen" ref="shareHost"></div>
  </div>
</template>
