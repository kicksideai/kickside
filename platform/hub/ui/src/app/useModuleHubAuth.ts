import { computed, ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { keeperHub, type HubAuthStatus } from '../keeper-hub.ts'
import { errorMessage, isHubAuthUsable } from '../lib.ts'
import { logError } from './modules-page-utils.ts'

interface ModuleHubAuthOptions {
  hub: ReturnType<typeof keeperHub>
  loadCatalog: () => Promise<void>
}

export function useModuleHubAuth({ hub, loadCatalog }: ModuleHubAuthOptions) {
  const isAdmin = ref(false)
  const authLoaded = ref(false)
  const hubConnected = ref(false)
  const hubUsable = ref(false)
  const hubStatus = ref<HubAuthStatus | null>(null)
  const hubToken = ref('')
  const showTokenPanel = ref(false)
  const hubConnecting = ref(false)
  const hubError = ref<string | null>(null)
  const hubOrgs = computed(() => hubStatus.value?.orgs || [])
  const hubIdentity = computed(() => hubStatus.value?.username || hubStatus.value?.user_id || '')
  const hubTokenStored = computed(() => Boolean(hubStatus.value?.authenticated))
  const hubTokenExpired = computed(() => Boolean(hubStatus.value?.authenticated && hubStatus.value?.expired))
  const hubTokenIcon = computed(() => {
    if (hubConnected.value) return 'tabler:key'
    if (hubTokenExpired.value) return 'tabler:alert-triangle'
    return 'tabler:key-off'
  })
  const hubTokenButtonLabel = computed(() => {
    if (hubConnected.value) return 'Hub token set'
    if (hubTokenExpired.value) return 'Hub token expired'
    return 'Set Hub token'
  })
  const hubExpiry = computed(() => {
    const e = hubStatus.value?.expires_at
    if (!e) return ''
    const d = new Date(e)
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
  })

  function applyHubAuthStatus(st: HubAuthStatus | null | undefined) {
    hubStatus.value = st?.authenticated ? st : null
    const usable = isHubAuthUsable(st)
    hubConnected.value = usable
    hubUsable.value = usable
  }

  async function loadAuth() {
    try {
      const { data } = await api.get<{ success?: boolean; security?: { is_admin?: boolean } }>('/api/v1/user/me')
      isAdmin.value = !!(data?.success && data?.security?.is_admin)
    } catch (e: unknown) {
      logError('modules:auth', e)
      isAdmin.value = false
    } finally {
      authLoaded.value = true
    }
  }

  async function loadHubAuth() {
    try {
      const st = await hub.authStatus()
      applyHubAuthStatus(st)
    } catch (e: unknown) {
      logError('modules:hub-auth', e)
    }
  }

  async function saveHubToken() {
    const token = hubToken.value.trim()
    if (!token) {
      hubError.value = 'Paste a Hub token first.'
      return
    }
    hubError.value = null
    hubConnecting.value = true
    try {
      const st = await hub.authenticate(token)
      applyHubAuthStatus(st)
      if (isHubAuthUsable(st)) {
        hubToken.value = ''
        showTokenPanel.value = false
        await loadCatalog()
      } else {
        hubError.value = 'That token is invalid or expired.'
      }
    } catch (e: unknown) {
      hubError.value = errorMessage(e, 'failed to save Hub token')
    } finally {
      hubConnecting.value = false
    }
  }

  async function clearHubToken() {
    hubError.value = null
    try {
      await hub.logout()
    } catch (e: unknown) {
      hubError.value = errorMessage(e, 'failed to clear Hub token')
      return
    }
    applyHubAuthStatus(null)
    await loadCatalog()
  }

  return {
    isAdmin, authLoaded, hubConnected, hubUsable, hubStatus, hubToken, showTokenPanel,
    hubConnecting, hubError, hubOrgs, hubIdentity, hubTokenStored, hubTokenExpired,
    hubTokenIcon, hubTokenButtonLabel, hubExpiry,
    applyHubAuthStatus, loadAuth, loadHubAuth, saveHubToken, clearHubToken,
  }
}
