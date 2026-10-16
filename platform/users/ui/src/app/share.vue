<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { api, host } from '@wippy-fe/proxy'
import Dialog from 'primevue/dialog'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { errMsg as baseErrMsg } from '@widgets/app/errMsg'
import PrincipalPicker from './PrincipalPicker.vue'
import { resolvePrincipals, type Principal } from '../principals'

// kickside-share — reusable share popup over the component access model. Access is
// the real capability bitmask (READ/WRITE/DELETE/ADMIN), sourced from the
// component layer — no invented roles. Principals come from the directory seam.
// The host passes the resource's endpoints via `config`.
interface ShareConfig { resource_id?: string; access_url?: string; share_url?: string; title?: string }
interface ShareProps { config?: ShareConfig | null }
interface ShareEvents {
  changed: { resource_id?: string }
  close: undefined
  load: undefined
  error: { message: string; error: unknown }
}
const props = useProps<ShareProps>()
const emit = useEvents<ShareEvents>()

interface Capability { bit: number; key: string; label: string; description?: string }
interface AccessRow { id: string; type: 'user' | 'group'; label: string; sublabel?: string; access_mask: number; owner: boolean; resolved: boolean }

// A grant whose subject resolvePrincipals() can't match (a revoked account, a
// stale group id) never surfaces its raw principal id as the row's name.
function unknownPrincipalLabel(type: 'user' | 'group'): string {
  return type === 'group' ? 'Unknown group' : 'Unknown user'
}

const cfg = computed<ShareConfig>(() => (props.value.config || {}) as ShareConfig)

// The canonical capability vocabulary, sourced from the component layer.
const caps = ref<Capability[]>([])
const capsError = ref('')
const adminBit = computed(() => caps.value.find(c => c.key === 'admin')?.bit ?? 8)

function hasBit(mask: number, bit: number): boolean { return (mask & bit) === bit }
function toggleBit(mask: number, bit: number): number { return mask ^ bit }
function isOnlyAdmin(row: AccessRow): boolean {
  if (!hasBit(row.access_mask, adminBit.value)) return false
  return rows.value.filter(r => hasBit(r.access_mask, adminBit.value)).length <= 1
}

const loading = ref(false)
const error = ref('')
const rows = ref<AccessRow[]>([])

function looksLikeGroup(id: string): boolean { return id.includes(':') && !id.includes('@') }

function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const ax = e as { response?: { data?: { error?: unknown }; status?: number }; message?: string }
    if (ax.response?.status === 401) host.handleError?.('auth-expired', ax as Record<string, unknown>)
  }
  return baseErrMsg(e, fallback)
}

async function loadCaps() {
  capsError.value = ''
  try {
    const { data } = await api.get('/api/v1/components/access-model')
    if (data?.success && Array.isArray(data.capabilities) && data.capabilities.length) {
      caps.value = data.capabilities as Capability[]
      return
    }
    caps.value = []
    capsError.value = 'could not load permissions'
  } catch (e) {
    caps.value = []
    capsError.value = errMsg(e, 'could not load permissions')
  }
}

async function loadAccess() {
  const url = cfg.value.access_url
  if (!url) { rows.value = []; return }
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get(url)
    const list = (data?.success ? (data.access || []) : []) as Array<Record<string, any>>
    const owner = data?.owner as string | undefined
    const mapped: AccessRow[] = list.map(r => {
      const id = r.subject_id || r.user_id || r.id
      const type: 'user' | 'group' = r.subject_type || (looksLikeGroup(id) ? 'group' : 'user')
      return { id, type, label: r.full_name || r.email || '', sublabel: r.email || '', access_mask: Number(r.access_mask) || 0, owner: r.owner === true || (!!owner && id === owner), resolved: true }
    })
    // Resolve any missing labels (groups, unenriched rows) through the seam.
    const need = mapped.filter(m => !m.label)
    if (need.length) {
      try {
        const resolved = await resolvePrincipals(need.map(m => ({ type: m.type, id: m.id })))
        const byId = new Map<string, Principal>(resolved.map((p) => [p.id, p]))
        for (const m of mapped) { if (!m.label) { const p = byId.get(m.id); m.label = p?.label || ''; m.sublabel = m.sublabel || p?.sublabel || '' } }
      } catch { /* leave labels empty; the terminal fallback below covers it */ }
    }
    // Whatever resolvePrincipals could not match (or the call failed outright)
    // gets a neutral name, never the bare id.
    for (const m of mapped) { if (!m.label) { m.label = unknownPrincipalLabel(m.type); m.resolved = false } }
    // Owner first, then admins, then by label.
    mapped.sort((a, b) => Number(b.owner) - Number(a.owner) || b.access_mask - a.access_mask || a.label.localeCompare(b.label))
    rows.value = mapped
  } catch (e) {
    rows.value = []
    error.value = errMsg(e, 'could not load access')
  } finally {
    loading.value = false
  }
}

// The component owns its full popup chrome (backdrop + panel), so every host
// gets an identically sized share dialog by just mounting the tag. Closing is
// driven from here: backdrop click, the header close button, or Escape all emit
// `close` for the host to act on.
// The modal shell is PrimeVue's Dialog; `dialogOpen` drives its visibility, and any
// dismissal (mask click, X, or the Escape handler below) flips it false → emitClose.
const dialogOpen = ref(true)
function emitClose() { emit('close', undefined) }
function onDialogVisible(v: boolean) { if (!v) emitClose() }
function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  dialogOpen.value = false
}

onMounted(() => { loadCaps(); window.addEventListener('keydown', onKey) })
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})
watch(() => cfg.value.access_url, () => loadAccess(), { immediate: true })

const selected = ref<Principal | null>(null)
const newMask = ref<number>(1)
const granting = ref(false)
const principalPickerKey = ref(0)
function pick(value: { id: string; type: 'user' | 'group'; label: string }) { selected.value = { ...value } }
function toggleNew(bit: number) { newMask.value = toggleBit(newMask.value, bit) }

async function apply(subjectId: string, subjectType: 'user' | 'group', mask: number, revoke?: boolean) {
  const url = cfg.value.share_url
  if (!url) return false
  error.value = ''
  try {
    const body = revoke
      ? { subject_id: subjectId, subject_type: subjectType, action: 'revoke' }
      : { subject_id: subjectId, subject_type: subjectType, access_mask: mask }
    const { data } = await api.post(url, body)
    if (!data?.success) throw new Error(data?.error || 'failed')
    await loadAccess()
    emit('changed', { resource_id: cfg.value.resource_id })
    return true
  } catch (e) {
    error.value = errMsg(e, 'change failed')
    return false
  }
}

async function grant() {
  if (!selected.value || newMask.value === 0) return
  granting.value = true
  const label = selected.value.label
  const ok = await apply(selected.value.id, selected.value.type, newMask.value)
  if (ok) { host.toast?.({ severity: 'success', summary: 'Shared', detail: label }); selected.value = null; principalPickerKey.value += 1; newMask.value = 1 }
  granting.value = false
}

// Toggle a capability on an existing grant. Removing the last admin bit, or
// touching the owner, is blocked (the server enforces it too).
async function toggleRow(row: AccessRow, bit: number) {
  if (row.owner) return
  const removing = hasBit(row.access_mask, bit)
  if (removing && bit === adminBit.value && isOnlyAdmin(row)) {
    error.value = 'At least one admin is required.'
    return
  }
  const next = toggleBit(row.access_mask, bit)
  if (next === 0) { await apply(row.id, row.type, 0, true); return }
  await apply(row.id, row.type, next)
}

async function revoke(row: AccessRow) {
  if (row.owner) return
  await apply(row.id, row.type, 0, true)
}
</script>

<template>
  <Dialog
    v-model:visible="dialogOpen"
    modal
    :dismissable-mask="true"
    :close-on-escape="false"
    :style="{ width: '560px', maxWidth: 'calc(100vw - 48px)' }"
    aria-label="Share"
    class="kxs-dialog"
    @update:visible="onDialogVisible"
  >
    <template #header>
      <Icon icon="tabler:user-share" class="kxs-head-ico" aria-hidden="true" />
      <div class="kxs-head-text">
        <div class="kxs-title">Share<span v-if="cfg.title"> · {{ cfg.title }}</span></div>
        <div class="kxs-sub">Choose people or groups and exactly what they can do.</div>
      </div>
    </template>

    <div class="kxs">
    <!-- Add people/groups -->
    <div class="kxs-add" @click.stop>
      <PrincipalPicker :key="principalPickerKey" class="kxs-pick" kinds="user,group" @change="pick" />
      <button class="kxs-btn kxs-btn-primary" :disabled="!selected || newMask === 0 || granting" @click="grant">
        <Icon :icon="granting ? 'tabler:loader-2' : 'tabler:plus'" :class="granting && 'spin'" aria-hidden="true" /> Share
      </button>
    </div>
    <!-- Capability chips for the new grant -->
    <div class="kxs-caps kxs-caps-new" @click.stop>
      <button v-for="c in caps" :key="c.key" type="button" class="kxs-cap" :class="hasBit(newMask, c.bit) && 'kxs-cap-on'" :title="c.description" @click="toggleNew(c.bit)">
        <Icon :icon="hasBit(newMask, c.bit) ? 'tabler:check' : 'tabler:plus'" aria-hidden="true" /> {{ c.label }}
      </button>
    </div>

    <div v-if="capsError" class="kxs-err">{{ capsError }}</div>
    <div v-if="error" class="kxs-err">{{ error }}</div>

    <!-- Current access -->
    <div class="kxs-list-head">People with access</div>
    <div v-if="loading" class="kxs-loading"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…</div>
    <div v-else-if="!rows.length" class="kxs-empty"><Icon icon="tabler:lock" aria-hidden="true" /> Not shared with anyone yet.</div>
    <div v-else class="kxs-list">
      <div v-for="row in rows" :key="row.type + ':' + row.id" class="kxs-row">
        <span class="kxs-ava" :class="row.type === 'group' && 'kxs-ava-group'">
          <Icon :icon="row.type === 'group' ? 'tabler:users-group' : 'tabler:user'" aria-hidden="true" />
        </span>
        <div class="kxs-row-text">
          <span class="kxs-row-label">{{ row.label }}<span v-if="!row.resolved" class="kxs-id"> {{ row.id }}</span><span v-if="row.owner" class="kxs-owner">Owner</span></span>
          <span v-if="row.sublabel" class="kxs-row-sub">{{ row.sublabel }}</span>
        </div>
        <div class="kxs-caps">
          <button v-for="c in caps" :key="c.key" type="button" class="kxs-cap kxs-cap-sm"
            :class="[hasBit(row.access_mask, c.bit) && 'kxs-cap-on', row.owner && 'kxs-cap-locked']"
            :disabled="row.owner" :title="row.owner ? 'The owner has full access' : c.description"
            @click="toggleRow(row, c.bit)">
            {{ c.label }}
          </button>
        </div>
        <button v-if="!row.owner" class="kxs-icon-btn" title="Remove access" :aria-label="`Remove ${row.label}`" @click="revoke(row)">
          <Icon icon="tabler:x" aria-hidden="true" />
        </button>
        <span v-else class="kxs-icon-btn kxs-icon-locked" title="The owner can't be removed"><Icon icon="tabler:lock" aria-hidden="true" /></span>
      </div>
    </div>
    </div>
  </Dialog>
</template>
