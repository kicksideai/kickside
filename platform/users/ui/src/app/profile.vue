<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { api, host } from '@wippy-fe/proxy'
import Dialog from 'primevue/dialog'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { errMsg as baseErrMsg } from '@widgets/app/errMsg'
import { formatDate } from '@widgets/app/datetime'

// kickside-profile — self-service account popup. Reads GET /user/me and writes
// editable fields via PUT /user/me. Two modes in one component: a read-only
// summary (default) and a writable edit form (full name + optional password).
// `config.readonly` forces the read-only view (no Edit button). The component
// owns its modal chrome and emits `close` / `updated`.
interface ProfileConfig { readonly?: boolean }
interface ProfileProps { config?: ProfileConfig | null }
interface ProfileEvents {
  updated: { full_name?: string }
  close: undefined
  load: undefined
  error: { message: string; error: unknown }
}
const props = useProps<ProfileProps>()
const emit = useEvents<ProfileEvents>()

const forcedReadonly = computed(() => !!(props.value.config || {}).readonly)

interface Me {
  full_name: string
  email: string
  status: string
  created_at: string | null
  is_admin: boolean
  groups: string[]
}

const me = ref<Me | null>(null)
const loading = ref(true)
const loadError = ref('')

const editing = ref(false)
const saving = ref(false)
const saveError = ref('')
const form = ref({ full_name: '', password: '', confirm: '' })

const displayName = computed(() => me.value?.full_name?.trim() || me.value?.email || 'Your account')
const initials = computed(() => {
  const n = me.value?.full_name?.trim()
  if (n) return n.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (me.value?.email || '?').charAt(0).toUpperCase()
})
const roleLabel = computed(() => (me.value?.is_admin ? 'Administrator' : 'Member'))

// Account status enum from kickside.users consts; never shown raw.
const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  pending: 'Pending',
}
const statusLabel = computed(() => {
  const s = me.value?.status || ''
  return STATUS_LABEL[s] ?? s
})

const fmtDate = (ts: string | null | undefined): string =>
  formatDate(ts, { year: 'numeric', month: 'long', day: 'numeric' })

function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const ax = e as { response?: { data?: { error?: unknown }; status?: number }; message?: string }
    if (ax.response?.status === 401) host.handleError?.('auth-expired', ax as Record<string, unknown>)
  }
  return baseErrMsg(e, fallback)
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const { data } = await api.get('/api/v1/user/me')
    if (!data?.success || !data.user) throw new Error(data?.error || 'could not load profile')
    me.value = {
      full_name: data.user.full_name || '',
      email: data.user.email || '',
      status: data.user.status || '',
      created_at: data.user.created_at ?? null,
      is_admin: !!data.security?.is_admin,
      groups: Array.isArray(data.security?.groups) ? data.security.groups : [],
    }
    emit('load', undefined)
  } catch (e) {
    loadError.value = errMsg(e, 'could not load profile')
    emit('error', { message: loadError.value, error: e })
  } finally {
    loading.value = false
  }
}

function startEdit() {
  if (forcedReadonly.value || !me.value) return
  form.value = { full_name: me.value.full_name, password: '', confirm: '' }
  saveError.value = ''
  editing.value = true
}
function cancelEdit() { editing.value = false; saveError.value = '' }

async function save() {
  if (!me.value) return
  saveError.value = ''
  const name = form.value.full_name.trim()
  if (!name) { saveError.value = 'Name cannot be empty.'; return }
  if (form.value.password && form.value.password !== form.value.confirm) {
    saveError.value = 'Passwords do not match.'
    return
  }
  const body: Record<string, string> = {}
  if (name !== me.value.full_name) body.full_name = name
  if (form.value.password) body.password = form.value.password
  if (!Object.keys(body).length) { editing.value = false; return }

  saving.value = true
  try {
    const { data } = await api.put('/api/v1/user/me', body)
    if (!data?.success) throw new Error(data?.error || 'save failed')
    if (body.full_name) me.value.full_name = body.full_name
    editing.value = false
    emit('updated', { full_name: me.value.full_name })
    host.toast?.({ severity: 'success', summary: 'Profile updated', detail: displayName.value })
  } catch (e) {
    saveError.value = errMsg(e, 'save failed')
  } finally {
    saving.value = false
  }
}

// The modal shell is PrimeVue's Dialog; `dialogOpen` drives visibility and any
// dismissal (mask click, X) flips it false → emitClose. Escape is handled below so
// it can cancel an in-progress edit instead of closing the whole dialog.
const dialogOpen = ref(true)
function emitClose() { emit('close', undefined) }
function onDialogVisible(v: boolean) { if (!v) emitClose() }
function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (editing.value) { cancelEdit() } else { dialogOpen.value = false }
}

onMounted(() => { load(); window.addEventListener('keydown', onKey) })
onUnmounted(() => { window.removeEventListener('keydown', onKey) })
</script>

<template>
  <Dialog
    v-model:visible="dialogOpen"
    modal
    :header="editing ? 'Edit profile' : 'Profile'"
    :dismissable-mask="true"
    :close-on-escape="false"
    :style="{ width: '460px', maxWidth: 'calc(100vw - 48px)' }"
    aria-label="Profile"
    class="kxp-dialog"
    @update:visible="onDialogVisible"
  >
      <div v-if="loading" class="kxp-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…</div>
      <div v-else-if="loadError" class="kxp-state kxp-state-err"><Icon icon="tabler:alert-triangle" aria-hidden="true" /> {{ loadError }}</div>

      <div v-else-if="me" class="kxp-body">
        <!-- Identity header -->
        <div class="kxp-id">
          <span class="kxp-avatar">{{ initials }}</span>
          <div class="kxp-id-text">
            <div class="kxp-name">{{ displayName }}</div>
            <div class="kxp-email">{{ me.email }}</div>
          </div>
          <span class="kxp-role" :class="me.is_admin && 'kxp-role-admin'">{{ roleLabel }}</span>
        </div>

        <!-- Read-only view -->
        <template v-if="!editing">
          <dl class="kxp-fields">
            <div class="kxp-field"><dt>Full name</dt><dd>{{ me.full_name || '—' }}</dd></div>
            <div class="kxp-field"><dt>Email</dt><dd>{{ me.email }}</dd></div>
            <div class="kxp-field"><dt>Role</dt><dd>{{ roleLabel }}</dd></div>
            <div v-if="me.status" class="kxp-field"><dt>Status</dt><dd class="kxp-cap">{{ statusLabel }}</dd></div>
            <div v-if="fmtDate(me.created_at)" class="kxp-field"><dt>Member since</dt><dd>{{ fmtDate(me.created_at) }}</dd></div>
          </dl>
          <div class="kxp-foot">
            <button class="kxp-btn kxp-btn-ghost" @click="emitClose">Close</button>
            <button v-if="!forcedReadonly" class="kxp-btn kxp-btn-primary" @click="startEdit">
              <Icon icon="tabler:pencil" aria-hidden="true" /> Edit profile
            </button>
          </div>
        </template>

        <!-- Writable view -->
        <template v-else>
          <div class="kxp-form">
            <label class="kxp-input-group">
              <span class="kxp-label">Full name</span>
              <input v-model="form.full_name" class="kxp-input" type="text" placeholder="Your name" />
            </label>
            <label class="kxp-input-group">
              <span class="kxp-label">Email</span>
              <input :value="me.email" class="kxp-input" type="email" disabled />
              <span class="kxp-hint">Email is managed by an administrator.</span>
            </label>
            <div class="kxp-divider"><span>Change password</span></div>
            <label class="kxp-input-group">
              <span class="kxp-label">New password</span>
              <input v-model="form.password" class="kxp-input" type="password" autocomplete="new-password" placeholder="Leave blank to keep current" />
            </label>
            <label class="kxp-input-group">
              <span class="kxp-label">Confirm password</span>
              <input v-model="form.confirm" class="kxp-input" type="password" autocomplete="new-password" placeholder="Re-enter new password" />
            </label>
          </div>
          <div v-if="saveError" class="kxp-err">{{ saveError }}</div>
          <div class="kxp-foot">
            <button class="kxp-btn kxp-btn-ghost" :disabled="saving" @click="cancelEdit">Cancel</button>
            <button class="kxp-btn kxp-btn-primary" :disabled="saving" @click="save">
              <Icon :icon="saving ? 'tabler:loader-2' : 'tabler:check'" :class="saving && 'spin'" aria-hidden="true" /> Save changes
            </button>
          </div>
        </template>
      </div>
  </Dialog>
</template>
