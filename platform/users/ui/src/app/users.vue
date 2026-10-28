<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { api, host } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import Tabs from 'primevue/tabs'
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

const DIALOG_PT = {
  header: { class: 'kx-dialog-header' },
  content: { class: 'kx-dialog-content' },
  footer: { class: 'kx-dialog-footer' },
}

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

const editorOpen = computed({
  get: () => showCreate.value || showEdit.value,
  set: (visible: boolean) => { if (!visible) { showCreate.value = false; showEdit.value = false } },
})
const editorTitle = computed(() => (showCreate.value ? 'Create ' : 'Edit ') + (isBotForm.value ? 'bot' : 'user'))

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
    rolesError.value = e instanceof Error ? e.message : 'failed to load roles'
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
    <header class="kx-head">
      <div class="kx-head-icon"><Icon icon="tabler:users" aria-hidden="true" /></div>
      <div class="kx-head-text">
        <h1 class="kx-title">Users</h1>
        <p class="kx-head-sub">Manage user and bot accounts and their roles.</p>
      </div>
      <div class="kx-head-actions">
        <Button type="button" :aria-label="accountTab === 'bots' ? 'Create bot' : 'Create user'" class="ku-btn-primary" :label="accountTab === 'bots' ? 'Create bot' : 'Create user'" @click="openCreate">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:user-plus" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </div>
    </header>
    <Tabs class="ku-tabs" :value="accountTab" @update:value="selectTab($event as 'users' | 'bots')">
      <TabList aria-label="Account type">
        <Tab value="users" aria-controls="users-accounts">All users</Tab>
        <Tab value="bots" aria-controls="users-bots">Bots</Tab>
      </TabList>
    </Tabs>
    <div class="ku-bar">
      <span class="ku-count">{{ users.length }} {{ accountTab === 'bots' ? 'bot' : 'user' }}{{ users.length !== 1 ? 's' : '' }}</span>
    </div>

    <div v-if="error && !editorOpen" role="alert" class="kx-err">{{ error }}</div>
    <div v-if="rolesError && !editorOpen" class="kx-err">{{ rolesError }}</div>

    <div class="ku-body" role="tabpanel" :id="accountTab === 'bots' ? 'users-bots' : 'users-accounts'">
      <div v-if="loading" class="kx-loading"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading…</div>

      <div v-else-if="!users.length" class="ku-empty kx-empty">
        <div class="kx-empty-ico"><Icon :icon="accountTab === 'bots' ? 'tabler:robot' : 'tabler:users'" aria-hidden="true" /></div>
        <div class="kx-empty-title">No {{ accountTab === 'bots' ? 'bots' : 'users' }} yet</div>
        <div class="kx-empty-sub">{{ accountTab === 'bots' ? 'Create a bot account and choose its roles.' : 'Create your first user to grant access to the workspace.' }}</div>
        <div class="kx-empty-actions">
          <Button type="button" :aria-label="accountTab === 'bots' ? 'Create bot' : 'Create user'" class="ku-btn-primary" :label="accountTab === 'bots' ? 'Create bot' : 'Create user'" @click="openCreate">
            <template #icon="{ class: iconClass }"><Icon icon="tabler:user-plus" :class="iconClass" aria-hidden="true" /></template>
          </Button>
        </div>
      </div>

      <div v-else class="ku-list">
        <table class="ku-table" :aria-label="accountTab === 'bots' ? 'Bots' : 'All users'">
          <thead><tr><th scope="col">Account</th><th scope="col">Status</th><th scope="col">Roles</th><th scope="col">Created</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
          <tbody>
            <tr v-for="user in users" :key="user.user_id" class="ku-row">
              <td>
                <div class="ku-account">
                  <span class="ku-avatar">{{ initials(user) }}</span>
                  <div class="ku-id">
                    <div class="ku-name">{{ user.full_name || user.email }}</div>
                    <div class="ku-email">{{ user.email }}</div>
                  </div>
                  <Tag v-if="user.bot_account" severity="info" value="Bot" class="ku-badge kx-tag-sm" />
                </div>
              </td>
              <td><Tag :severity="statusSeverity(user.status)" :value="user.status" class="ku-badge kx-tag-sm" /></td>
              <td><div class="ku-meta"><Tag v-for="g in user.security_groups" :key="g" :severity="groupSeverity(g)" :value="groupLabel(g)" class="ku-badge kx-tag-sm" /></div></td>
              <td class="ku-date">{{ formatDate(user.created_at, { month: 'short', day: 'numeric', year: 'numeric' }) }}</td>
              <td>
                <div class="ku-actions">
                  <Button type="button" severity="secondary" outlined size="small" :aria-label="`Edit ${user.full_name || user.email}`" @click="openEdit(user)">
                    <template #icon="{ class: iconClass }"><Icon icon="tabler:edit" :class="iconClass" aria-hidden="true" /></template>
                  </Button>
                  <Button type="button" severity="danger" outlined size="small" :aria-label="`${user.bot_account ? 'Disable' : 'Delete'} ${user.full_name || user.email}`" @click="askDelete(user)">
                    <template #icon="{ class: iconClass }"><Icon icon="tabler:trash" :class="iconClass" aria-hidden="true" /></template>
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog v-model:visible="editorOpen" modal class="kx-dialog" :pt="DIALOG_PT" :aria-label="editorTitle">
      <template #header>
        <span class="kx-modal-head-icon"><Icon :icon="isBotForm ? 'tabler:robot' : 'tabler:user'" aria-hidden="true" /></span>
        <span class="kx-modal-head-text"><span class="kx-modal-head-title">{{ editorTitle }}</span></span>
      </template>
        <form class="ku-form" @submit.prevent="showCreate ? createUser() : saveUser()">
          <template v-if="showCreate">
            <div v-if="!isBotForm" class="ku-field">
              <label class="ku-label" for="account-email">Email</label>
              <input id="account-email" v-model="createForm.email" type="email" class="ku-input" placeholder="user@example.com" />
            </div>
            <div class="ku-field">
              <label class="ku-label" for="account-name">Full name</label>
              <input id="account-name" v-model="createForm.full_name" aria-label="Full name" type="text" class="ku-input" placeholder="Jane Doe" />
            </div>
            <div v-if="!isBotForm" class="ku-field">
              <label class="ku-label" for="account-password">Password</label>
              <input id="account-password" v-model="createForm.password" type="password" class="ku-input" placeholder="Minimum 8 characters" autocomplete="new-password" />
            </div>
            <div class="ku-field">
              <label class="ku-label">Roles</label>
              <label v-if="!isBotForm" class="ku-check">
                <input type="checkbox" v-model="useDefaultMembership" aria-label="Use the default Member role" />
                <span class="ku-check-label">Use the default Member role</span>
              </label>
              <template v-if="isBotForm || !useDefaultMembership">
                <label v-for="sg in roles" :key="sg.id" class="ku-check">
                  <input type="checkbox" v-model="createForm.groups" :value="sg.id" />
                  <span class="ku-check-label">{{ sg.label }}</span>
                </label>
              </template>
            </div>
          </template>

          <template v-else>
            <div v-if="!isBotForm" class="ku-field">
              <label class="ku-label" for="account-email">Email</label>
              <input id="account-email" v-model="editForm.email" type="email" class="ku-input" />
            </div>
            <div class="ku-field">
              <label class="ku-label" for="account-name">Full name</label>
              <input id="account-name" v-model="editForm.full_name" aria-label="Full name" type="text" class="ku-input" />
            </div>
            <div class="ku-field">
              <label class="ku-label">Status</label>
              <select v-model="editForm.status" class="ku-input" aria-label="Status">
                <option v-for="status in STATUS_OPTIONS" :key="status.value" :value="status.value">{{ status.label }}</option>
              </select>
            </div>
            <div v-if="!isBotForm" class="ku-field">
              <label class="ku-label" for="account-password">New password</label>
              <input id="account-password" v-model="editForm.password" type="password" class="ku-input" placeholder="Leave empty to keep current" autocomplete="new-password" />
            </div>
            <div class="ku-field">
              <label class="ku-label">Roles</label>
              <label v-for="sg in roles" :key="sg.id" class="ku-check">
                <input type="checkbox" v-model="editForm.groups" :value="sg.id" />
                <span class="ku-check-label">{{ sg.label }}</span>
              </label>
            </div>
          </template>
          <div v-if="error" role="alert" class="kx-err inline">{{ error }}</div>
          <div v-if="rolesError" class="kx-err inline">{{ rolesError }}</div>
        </form>

      <template #footer>
        <Button type="button" label="Cancel" severity="secondary" outlined :disabled="saving" @click="editorOpen = false" />
        <Button v-if="showCreate" type="button" label="Create" class="ku-btn-primary" :loading="saving" :disabled="saving || (isBotForm ? !createForm.full_name.trim() : !createForm.email || !createForm.password)" @click="createUser">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:check" :class="iconClass" aria-hidden="true" /></template>
        </Button>
        <Button v-else type="button" label="Save" class="ku-btn-primary" :loading="saving" :disabled="saving" @click="saveUser">
          <template #icon="{ class: iconClass }"><Icon icon="tabler:device-floppy" :class="iconClass" aria-hidden="true" /></template>
        </Button>
      </template>
    </Dialog>
  </div>
</template>
