import { ref, type ComputedRef, type Ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { apiError } from '../constants'
import type { Provider, ConnectionSummary } from './connection-picker.types.ts'

interface ConnectionOAuthOptions {
  provider: Ref<Provider | null>
  reauth: () => { componentId: string; name?: string } | undefined
  open: Ref<boolean>
  connName: Ref<string>
  selectedScopes: Ref<Set<string>>
  isCredentialProvider: ComputedRef<boolean>
  key: (provider: Provider) => string
  label: (provider: Provider) => string
  credentialPrivateContext: () => Record<string, string | boolean>
  credentialValidationError: () => string
  emitConnected: () => void
}

export function useConnectionOAuth({ provider, reauth, open, connName, selectedScopes, isCredentialProvider, key, label, credentialPrivateContext, credentialValidationError, emitConnected }: ConnectionOAuthOptions) {
  const connecting = ref(false)
  const connectError = ref('')
  const pendingAuthUrl = ref('')
  let popup: Window | null = null
  let popupTimer: ReturnType<typeof setInterval> | null = null
  let preConnectSnapshot: Map<string, string> | null = null
  let expectedCallbackOrigin = ''
  let expectedStateToken = ''
  let messageListenerAttached = false
  let oauthGeneration = 0
  let disposed = false

  async function providerConnectionSnapshot(selectedProvider: Provider): Promise<Map<string, string> | null> {
    const providerKey = key(selectedProvider)
    if (!providerKey) return null
    try {
      const { data } = await api.get(`/api/v1/connections?provider=${encodeURIComponent(providerKey)}&limit=100`)
      const rows = (data?.connections ?? []) as ConnectionSummary[]
      const snapshot = new Map<string, string>()
      for (const row of rows) {
        if (row.component_id) snapshot.set(row.component_id, row.updated_at ?? '')
      }
      return snapshot
    } catch {
      return null
    }
  }

  async function loadGrantedScopes(selectedProvider: Provider, componentId: string) {
    const providerKey = key(selectedProvider)
    if (!providerKey) return
    try {
      const { data } = await api.get(`/api/v1/connections?provider=${encodeURIComponent(providerKey)}&limit=100`)
      const rows = (data?.connections ?? []) as ConnectionSummary[]
      const row = rows.find(r => r.component_id === componentId)
      const granted = row?.scopes_granted ?? []
      if (granted.length) {
        const next = new Set(selectedScopes.value)
        for (const scope of granted) next.add(scope)
        selectedScopes.value = next
      }
    } catch { /* fall back to defaults */ }
  }

  function closePopup(target: Window | null) {
    if (!target) return
    try { target.close() } catch { /* cross-origin windows can reject access */ }
  }

  function onMessage(event: MessageEvent) {
    const data = event.data as { type?: string; success?: boolean; error?: string; state_token?: string }
    if (!data || data.type !== 'oauth_result') return
    if (!popup || event.source !== popup) return
    if (!expectedCallbackOrigin || event.origin !== expectedCallbackOrigin) return
    if (!expectedStateToken || data.state_token !== expectedStateToken) return

    cleanupPopup(true)
    expectedCallbackOrigin = ''
    expectedStateToken = ''
    pendingAuthUrl.value = ''
    connecting.value = false
    if (data.success) {
      emitConnected()
      open.value = false
    } else {
      connectError.value = data.error || 'Authorization failed'
    }
  }

  function cleanupPopup(close = false) {
    if (popupTimer) { clearInterval(popupTimer); popupTimer = null }
    if (messageListenerAttached) {
      window.removeEventListener('message', onMessage)
      messageListenerAttached = false
    }
    if (close) closePopup(popup)
    popup = null
  }

  function resetOAuthAttempt(close = true) {
    oauthGeneration += 1
    cleanupPopup(close)
    expectedCallbackOrigin = ''
    expectedStateToken = ''
    pendingAuthUrl.value = ''
  }

  function callbackOrigin(redirectUri: unknown): string {
    if (typeof redirectUri !== 'string' || !redirectUri) return ''
    try {
      const url = new URL(redirectUri, window.location.href)
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : ''
    } catch {
      return ''
    }
  }

  async function verifyClosedPopup(generation: number) {
    const selectedProvider = provider.value
    if (!selectedProvider) {
      connecting.value = false
      connectError.value = 'Authorization window closed before completion.'
      return
    }

    const next = await providerConnectionSnapshot(selectedProvider)
    if (disposed || generation !== oauthGeneration || provider.value !== selectedProvider) return
    if (!preConnectSnapshot || !next) {
      connecting.value = false
      pendingAuthUrl.value = ''
      connectError.value = 'Authorization window closed before the app received confirmation.'
      return
    }
    let completed = false
    if (reauth()?.componentId) {
      const id = reauth()!.componentId
      const before = preConnectSnapshot.get(id)
      const after = next.get(id)
      completed = after !== undefined && (before === undefined || after !== before)
    } else {
      for (const [id, updatedAt] of next.entries()) {
        const before = preConnectSnapshot.get(id)
        if (before === undefined || updatedAt !== before) {
          completed = true
          break
        }
      }
    }
    if (completed) {
      emitConnected()
      open.value = false
      return
    }
    connecting.value = false
    pendingAuthUrl.value = ''
    connectError.value = 'Authorization window closed before the app received confirmation.'
  }

  function watchPopupClose(generation: number) {
    popupTimer = setInterval(() => {
      let closed = false
      try { closed = !popup || popup.closed } catch { closed = false }
      if (closed) {
        cleanupPopup()
        expectedCallbackOrigin = ''
        expectedStateToken = ''
        void verifyClosedPopup(generation)
      }
    }, 1000)
  }

  function monitorPopup(generation: number) {
    if (!messageListenerAttached) {
      window.addEventListener('message', onMessage)
      messageListenerAttached = true
    }
    watchPopupClose(generation)
  }

  async function doConnect() {
    const selectedProvider = provider.value
    if (!selectedProvider || connecting.value) return
    connecting.value = true
    connectError.value = ''
    pendingAuthUrl.value = ''
    if (isCredentialProvider.value) {
      const validationError = credentialValidationError()
      if (validationError) {
        connectError.value = validationError
        connecting.value = false
        return
      }
      try {
        const { data } = await api.post('/api/v1/connections', {
          impl_id: selectedProvider.impl_id || selectedProvider.id,
          name: connName.value.trim() || label(selectedProvider),
          private_context: credentialPrivateContext(),
          validate: true,
        })
        if (!data?.success) {
          connectError.value = data?.error || 'Failed to save connection'
          connecting.value = false
          return
        }
        emitConnected()
        open.value = false
      } catch (e) {
        connectError.value = apiError(e)
        connecting.value = false
      }
      return
    }

    resetOAuthAttempt()
    const generation = oauthGeneration
    popup = window.open('about:blank', 'oauth_' + key(selectedProvider), 'width=520,height=680,menubar=no,toolbar=no,location=no,status=no')
    try {
      preConnectSnapshot = await providerConnectionSnapshot(selectedProvider)
      if (disposed || generation !== oauthGeneration) return
      const body: Record<string, unknown> = { name: connName.value.trim() || label(selectedProvider), scopes: [...selectedScopes.value] }
      const reauthValue = reauth()
      if (reauthValue) body.component_id = reauthValue.componentId
      const { data } = await api.post(`/api/v1/oauth/providers/${encodeURIComponent(key(selectedProvider))}/init`, body)
      if (disposed || generation !== oauthGeneration) return
      if (!data?.success || !data.authorization_url) {
        resetOAuthAttempt()
        connectError.value = data?.error || 'Failed to start authorization'
        connecting.value = false
        return
      }
      const origin = callbackOrigin(data.redirect_uri)
      const stateToken = typeof data.state_token === 'string' ? data.state_token : ''
      if (!origin || !stateToken) {
        resetOAuthAttempt()
        connectError.value = 'Authorization response did not include a valid callback identity'
        connecting.value = false
        return
      }
      expectedCallbackOrigin = origin
      expectedStateToken = stateToken
      if (popup && !popup.closed) {
        monitorPopup(generation)
        popup.location.href = data.authorization_url
      } else {
        popup = null
        pendingAuthUrl.value = data.authorization_url
        connecting.value = false
      }
    } catch (e) {
      if (disposed || generation !== oauthGeneration) return
      resetOAuthAttempt()
      connectError.value = apiError(e)
      connecting.value = false
    }
  }

  function openBlockedPopup() {
    if (!pendingAuthUrl.value || !provider.value || !expectedCallbackOrigin || !expectedStateToken) return
    const nextPopup = window.open(pendingAuthUrl.value, 'oauth_' + key(provider.value),
      'width=520,height=680,menubar=no,toolbar=no,location=no,status=no')
    if (!nextPopup || nextPopup.closed) {
      closePopup(nextPopup)
      connecting.value = false
      connectError.value = 'Popup blocked - allow popups and retry'
      return
    }
    cleanupPopup(true)
    popup = nextPopup
    pendingAuthUrl.value = ''
    connectError.value = ''
    connecting.value = true
    monitorPopup(oauthGeneration)
  }

  function dispose() {
    disposed = true
    resetOAuthAttempt()
  }

  return { connecting, connectError, pendingAuthUrl, loadGrantedScopes, resetOAuthAttempt, doConnect, openBlockedPopup, dispose }
}
