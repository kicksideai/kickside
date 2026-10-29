import { ref, nextTick } from 'vue'
import type { useApi, useHost, useWippy } from '../composables/useWippy'

export interface AccountItem {
  key: string
  label: string
  icon: string
  component_tag: string
}

export function useShellAccount(
  api: ReturnType<typeof useApi>,
  host: ReturnType<typeof useHost>,
  instance: ReturnType<typeof useWippy>,
) {
  const currentUser = ref<{ email: string; full_name: string } | null>(null)
  const accountItems = ref<AccountItem[]>([])
  const profileWcOpen = ref(false)
  const profileWcHost = ref<HTMLElement | null>(null)
  let profileEl: HTMLElement | null = null

  function teardownProfile() {
    if (profileEl) { profileEl.remove(); profileEl = null }
  }
  function closeProfile() { teardownProfile(); profileWcOpen.value = false }

  async function openComponentModal(tag: string) {
    profileWcOpen.value = true
    await nextTick()
    if (!profileWcHost.value) return
    try {
      await instance.loadByTagName(tag)
      const element = document.createElement(tag)
      element.addEventListener('close', closeProfile)
      element.addEventListener('updated', () => { void fetchMe() })
      profileWcHost.value.replaceChildren(element)
      profileEl = element
    } catch { closeProfile() }
  }

  function openProfile() { return openComponentModal('kickside-profile') }

  async function loadAccountItems() {
    try {
      const { data } = await api.get('/api/v1/account/items')
      if (data?.success && Array.isArray(data.items)) accountItems.value = data.items as AccountItem[]
    } catch { /* non-fatal: the dropdown still shows the built-in entries */ }
  }

  function userInitials(user: { email: string; full_name: string }): string {
    if (user.full_name) {
      return user.full_name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    }
    return user.email.charAt(0).toUpperCase()
  }

  function errorStatus(error: unknown): number | null {
    if (typeof error !== 'object' || error === null || !('response' in error)) return null
    const response = error.response
    if (typeof response !== 'object' || response === null || !('status' in response)) return null
    return typeof response.status === 'number' ? response.status : null
  }

  async function fetchMe() {
    try {
      const { data } = await api.get('/api/v1/user/me')
      if (data.success && data.user) {
        currentUser.value = { email: data.user.email, full_name: data.user.full_name }
      }
    } catch (error: unknown) {
      host.handleError(errorStatus(error) === 401 ? 'auth-expired' : 'other', { message: 'Unable to load the current session' })
    }
  }

  function logout() { host.logout() }

  return {
    currentUser,
    accountItems,
    profileWcOpen,
    profileWcHost,
    openComponentModal,
    openProfile,
    closeProfile,
    loadAccountItems,
    userInitials,
    fetchMe,
    logout,
  }
}
