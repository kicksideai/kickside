<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { api, host } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import Tag from 'primevue/tag'
import { formatDate } from '@widgets/app/datetime'

// Standalone WC: no SPA composables — the authenticated API comes through the
// synchronous @wippy-fe/proxy import and the universal --p-* theme
// vocabulary so it renders in any host's shadow DOM.

interface User {
  user_id: string
  email: string
  full_name: string
  status: string
  security_groups: string[]
  bot_account?: true
  created_at: string
}

interface Role {
  id: string
  label: string
  description?: string
  built_in?: boolean
}

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Pending', value: 'pending' },
]

const DEFAULT_ROLE_ID = 'app.security:user'

const users = ref<User[]>([])
const accountTab = ref<'users' | 'bots'>('users')
const editingBot = ref(false)
const roles = ref<Role[]>([])
const loading = ref(false)
const error = ref('')
const rolesError = ref('')

const showCreate = ref(false)
const createForm = ref({ email: '', full_name: '', password: '', groups: [] as string[] })
const useDefaultMembership = ref(true)
const saving = ref(false)

const showEdit = ref(false)
const editForm = ref({ user_id: '', email: '', full_name: '', status: '', password: '', groups: [] as string[] })

const isBotForm = computed(() => showCreate.value ? accountTab.value === 'bots' : editingBot.value)

// Both badges are PrimeVue Tags, so a state maps to a severity the theme
// already paints - no KickSide colour class in between.
function statusSeverity(status: string): string {
  switch (status) {
    case 'active': return 'success'
    case 'suspended': return 'danger'
    case 'pending': return 'warn'
    default: return 'secondary'
  }
}
function groupLabel(id: string): string {
  return roles.value.find(g => g.id === id)?.label ?? id
}
function groupSeverity(id: string): string {
  const role = roles.value.find(g => g.id === id)
  if (id === 'app.security:admin') return 'warn'
  return role && role.built_in === false ? 'success' : 'info'
}
function initials(u: User): string {
  const base = u.full_name || u.email
  return base.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get<{ success?: boolean; users?: User[] }>(accountTab.value === 'bots' ? '/api/v1/users/bots' : '/api/v1/users')
    users.value = data.success ? (data.users || []) : []
  } catch (e) {
    users.value = []
    error.value = e instanceof Error ? e.message : 'failed to load users'
  } finally {
    loading.value = false
  }
}

// Assignable scopes come through the users module's own endpoint, which is backed
// by the kickside.contract:security_scopes port — so the editor sees the full
// normalized catalog (built-in roles AND custom scopes), not just policy-granted
// app.security roles.
interface ScopeRecord { id: string; label?: string; description?: string; source?: string }
async function fetchRoles() {
  rolesError.value = ''
  try {
    const { data } = await api.get<{ success?: boolean; scopes?: ScopeRecord[] }>('/api/v1/users/assignable-scopes')
    const scopes: ScopeRecord[] = data.success ? (data.scopes || []) : []
    roles.value = scopes.map(s => ({
      id: s.id,
      label: s.label || s.id,
      description: s.description,
      built_in: s.source === 'builtin',
    }))
  } catch (e) {
    roles.value = []
    rolesError.value = e instanceof Error ? e.message : 'failed to load security groups'
  }
}

async function selectTab(tab: 'users' | 'bots') {
  accountTab.value = tab
  showCreate.value = false
  showEdit.value = false
  await fetchUsers()
}

function openCreate() {
  createForm.value = { email: '', full_name: '', password: '', groups: [] }
  useDefaultMembership.value = true
  showEdit.value = false
  showCreate.value = true
}

async function createUser() {
  if (isBotForm.value ? !createForm.value.full_name.trim() : !createForm.value.email || !createForm.value.password) return
  saving.value = true
  error.value = ''
  try {
    const payload = isBotForm.value
      ? { full_name: createForm.value.full_name, groups: createForm.value.groups }
      : { email: createForm.value.email, full_name: createForm.value.full_name, password: createForm.value.password,
          ...(useDefaultMembership.value ? {} : { groups: createForm.value.groups }) }
    const { data } = await api.post<{ success?: boolean; user?: User; error?: string }>(
      isBotForm.value ? '/api/v1/users/bots' : '/api/v1/users', payload)
    if (data.success && data.user) {
      showCreate.value = false
      await fetchUsers()
    } else {
      error.value = data.error || 'failed to create user'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'failed to create user'
  } finally {
    saving.value = false
  }
}

function openEdit(user: User) {
  showCreate.value = false
  editingBot.value = user.bot_account === true
  editForm.value = {
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    status: user.status,
    password: '',
    groups: [...user.security_groups],
  }
  showEdit.value = true
}

async function saveUser() {
  const userId = editForm.value.user_id
  if (!userId) return
  saving.value = true
  error.value = ''
  try {
    const updateData: Record<string, string> = {}
    if (!editingBot.value && editForm.value.email) updateData.email = editForm.value.email
    if (editForm.value.full_name) updateData.full_name = editForm.value.full_name
    if (editForm.value.status) updateData.status = editForm.value.status
    if (!editingBot.value && editForm.value.password) updateData.password = editForm.value.password
    const { data } = await api.put<{ success?: boolean; error?: string }>(`/api/v1/users/${userId}`, { ...updateData, groups: editForm.value.groups })
    if (data.success) {
      showEdit.value = false
      await fetchUsers()
    } else {
      error.value = data.error || 'failed to update user'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'failed to update user'
  } finally {
    saving.value = false
  }
}

// Destructive confirm runs in the host layer via host.confirm (rendered outside
// this web component), so no in-component modal is needed.
async function askDelete(user: User) {
  const label = user.full_name || user.email
  const ok = await host.confirm({
    header: user.bot_account ? 'Disable bot' : 'Delete user',
    message: user.bot_account
      ? `Disable “${label}”? This revokes access and retains the account and its history.`
      : `Delete “${label}”? This permanently removes the user and revokes all access.`,
    icon: 'tabler:trash',
    acceptLabel: user.bot_account ? 'Disable' : 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
  })
  if (!ok) return
  error.value = ''
  try {
    const { data } = await api.delete<{ success?: boolean; error?: string }>(`/api/v1/users/${user.user_id}`)
    if (data.success) {
      await fetchUsers()
    } else {
      error.value = data.error || 'failed to delete user'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'failed to delete user'
  }
}

useHostVisibilityRefresh(async () => {
  await fetchRoles()
  await fetchUsers()
})
</script>

<template>
  <div class="ku">
    <div class="ku-bar" role="tablist" aria-label="Account type">
      <button class="ku-btn" role="tab" :aria-selected="accountTab === 'users'" aria-controls="users-accounts" @click="selectTab('users')">All users</button>
      <button class="ku-btn" role="tab" :aria-selected="accountTab === 'bots'" aria-controls="users-bots" @click="selectTab('bots')">Bots</button>
    </div>
    <div class="ku-bar">
      <span class="ku-count">{{ users.length }} user{{ users.length !== 1 ? 's' : '' }}</span>
      <button :aria-label="accountTab === 'bots' ? 'Create bot' : 'Create user'" class="ku-btn ku-btn-primary" @click="openCreate"><Icon icon="tabler:user-plus" aria-hidden="true" /> {{ accountTab === 'bots' ? 'Create bot' : 'Create user' }}</button>
    </div>

    <div v-if="error" role="alert" class="ku-err">{{ error }}</div>
    <div v-if="rolesError" class="ku-err">{{ rolesError }}</div>

    <div class="ku-body" role="tabpanel" :id="accountTab === 'bots' ? 'users-bots' : 'users-accounts'">
      <div v-if="loading" class="ku-loading"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…</div>

      <div v-else-if="!users.length" class="ku-empty">
        <div class="ku-empty-title">No {{ accountTab === 'bots' ? 'bots' : 'users' }} yet</div>
        <div class="ku-empty-sub">Create your first user to grant access to the workspace.</div>
        <button :aria-label="accountTab === 'bots' ? 'Create bot' : 'Create user'" class="ku-btn ku-btn-primary" @click="openCreate"><Icon icon="tabler:user-plus" aria-hidden="true" /> {{ accountTab === 'bots' ? 'Create bot' : 'Create user' }}</button>
      </div>

      <div v-else class="ku-list">
        <div v-for="user in users" :key="user.user_id" class="ku-row">
          <span class="ku-avatar">{{ initials(user) }}</span>
          <div class="ku-id">
            <div class="ku-name">{{ user.full_name || user.email }}</div>
            <div class="ku-email">{{ user.email }}</div>
          </div>
          <div class="ku-meta">
            <Tag v-if="user.bot_account" severity="info" value="Bot" class="ku-badge kx-tag-sm" />
            <Tag :severity="statusSeverity(user.status)" :value="user.status" class="ku-badge kx-tag-sm" />
            <Tag v-for="g in user.security_groups" :key="g" :severity="groupSeverity(g)" :value="groupLabel(g)" class="ku-badge kx-tag-sm" />
          </div>
          <span class="ku-date">{{ formatDate(user.created_at, { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
          <div class="ku-actions">
            <button class="ku-icon-btn" :aria-label="`Edit ${user.full_name || user.email}`" @click="openEdit(user)"><Icon icon="tabler:edit" aria-hidden="true" /></button>
            <button class="ku-icon-btn ku-danger" :aria-label="`${user.bot_account ? 'Disable' : 'Delete'} ${user.full_name || user.email}`" @click="askDelete(user)"><Icon icon="tabler:trash" aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </div>

    <section v-if="showCreate || showEdit" class="ku-editor" role="dialog" :aria-label="(showCreate ? 'Create ' : 'Edit ') + (isBotForm ? 'bot' : 'user')">
      <h2>{{ showCreate ? 'Create' : 'Edit' }} {{ isBotForm ? 'bot' : 'user' }}</h2>
        <form class="ku-form" @submit.prevent="showCreate ? createUser() : saveUser()">
          <template v-if="showCreate">
            <div v-if="!isBotForm" class="ku-field">
              <label class="ku-label">Email</label>
              <input v-model="createForm.email" type="email" class="ku-input" placeholder="user@example.com" />
            </div>
            <div class="ku-field">
              <label class="ku-label">Full name</label>
              <input v-model="createForm.full_name" aria-label="Full name" type="text" class="ku-input" placeholder="Jane Doe" />
            </div>
            <div v-if="!isBotForm" class="ku-field">
              <label class="ku-label">Password</label>
              <input v-model="createForm.password" type="password" class="ku-input" placeholder="Minimum 8 characters" autocomplete="new-password" />
            </div>
            <div class="ku-field">
              <label class="ku-label">Security groups</label>
              <label v-if="!isBotForm" class="ku-check">
                <input type="checkbox" v-model="useDefaultMembership" aria-label="Use default membership" />
                <span class="ku-check-label">Use default membership</span>
              </label>
              <template v-if="isBotForm || !useDefaultMembership">
                <label v-for="sg in roles" :key="sg.id" class="ku-check">
                  <input type="checkbox" v-model="createForm.groups" :value="sg.id" />
                  <span class="ku-check-label">{{ sg.label }}</span>
                  <span class="ku-check-id">{{ sg.id }}</span>
                </label>
              </template>
            </div>
          </template>

          <template v-else>
            <div v-if="!isBotForm" class="ku-field">
              <label class="ku-label">Email</label>
              <input v-model="editForm.email" type="email" class="ku-input" />
            </div>
            <div class="ku-field">
              <label class="ku-label">Full name</label>
              <input v-model="editForm.full_name" aria-label="Full name" type="text" class="ku-input" />
            </div>
            <div class="ku-field">
              <label class="ku-label">Status</label>
              <select v-model="editForm.status" class="ku-input" aria-label="Status">
                <option v-for="status in STATUS_OPTIONS" :key="status.value" :value="status.value">{{ status.label }}</option>
              </select>
            </div>
            <div v-if="!isBotForm" class="ku-field">
              <label class="ku-label">New password</label>
              <input v-model="editForm.password" type="password" class="ku-input" placeholder="Leave empty to keep current" autocomplete="new-password" />
            </div>
            <div class="ku-field">
              <label class="ku-label">Security groups</label>
              <label v-for="sg in roles" :key="sg.id" class="ku-check">
                <input type="checkbox" v-model="editForm.groups" :value="sg.id" />
                <span class="ku-check-label">{{ sg.label }}</span>
                <span class="ku-check-id">{{ sg.id }}</span>
              </label>
            </div>
          </template>
        </form>

        <div class="ku-bar">
          <button class="ku-btn ku-btn-ghost" @click="showCreate = false; showEdit = false">Cancel</button>
          <button v-if="showCreate" class="ku-btn ku-btn-primary" :disabled="saving || (isBotForm ? !createForm.full_name.trim() : !createForm.email || !createForm.password)" @click="createUser">
            <Icon :icon="saving ? 'tabler:loader-2' : 'tabler:check'" :class="saving && 'spin'" aria-hidden="true" /> Create
          </button>
          <button v-else class="ku-btn ku-btn-primary" :disabled="saving" @click="saveUser">
            <Icon :icon="saving ? 'tabler:loader-2' : 'tabler:device-floppy'" :class="saving && 'spin'" aria-hidden="true" /> Save
          </button>
        </div>
    </section>
  </div>
</template>
