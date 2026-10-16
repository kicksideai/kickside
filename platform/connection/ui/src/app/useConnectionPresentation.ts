import { computed, type Ref } from 'vue'
import type { Provider } from './connection-picker.types.ts'
import type { Connection } from './connections.types.ts'
import {
  resolveConnectionState,
  CONNECTION_STATE_LABELS,
  CONNECTION_STATE_CLASSES,
  type ConnectionState,
} from '../status'

interface ConnectionPresentationOptions {
  providers: Ref<Provider[]>
  connections: Ref<Connection[]>
  search: Ref<string>
  confirmId: Ref<string>
}

export function useConnectionPresentation({ providers, connections, search, confirmId }: ConnectionPresentationOptions) {
  const providerKey = (provider: Provider) => provider.provider ?? ''
  const providerLabel = (provider: Provider) => provider.title ?? provider.name ?? provider.oauth_provider ?? 'Provider'
  const providerIcon = (provider: Provider) => provider.icon || 'tabler:plug'

  const providersByKey = computed(() => {
    const map: Record<string, Provider> = {}
    for (const provider of providers.value) {
      const key = providerKey(provider)
      if (key) map[key] = provider
    }
    return map
  })

  function connIcon(connection: Connection): string {
    return connection.icon || providersByKey.value[connection.provider || '']?.icon || 'tabler:plug-connected'
  }

  function providerForConnection(connection: Connection): Provider | undefined {
    return connection.provider ? providersByKey.value[connection.provider] : undefined
  }

  function grantedScopeSet(connection: Connection): Set<string> {
    return new Set((connection.scopes_granted ?? []).filter(scope => typeof scope === 'string' && scope.length > 0))
  }

  function defaultScopeSet(provider?: Provider): Set<string> {
    return new Set((provider?.default_scopes ?? []).filter(scope => typeof scope === 'string' && scope.length > 0))
  }

  function availableScopeValues(provider?: Provider): string[] {
    return (provider?.available_scopes ?? [])
      .map(scope => scope.scope)
      .filter(scope => typeof scope === 'string' && scope.length > 0)
  }

  function hasOptionalProviderScopes(provider?: Provider): boolean {
    const defaults = defaultScopeSet(provider)
    return availableScopeValues(provider).some(scope => !defaults.has(scope))
  }

  function hasSignInOnlyScopes(connection: Connection): boolean {
    if (!connection.oauth) return false
    const provider = providerForConnection(connection)
    if (!hasOptionalProviderScopes(provider)) return false
    const granted = grantedScopeSet(connection)
    const defaults = defaultScopeSet(provider)
    if (granted.size === 0 || defaults.size === 0) return false
    for (const scope of granted) {
      if (!defaults.has(scope)) return false
    }
    return true
  }

  function connectionState(connection: Connection): ConnectionState {
    return resolveConnectionState(connection.connection_state, connection.expires_at)
  }

  function statusClass(connection: Connection): string {
    const status = connectionState(connection)
    if (status === 'connected' && hasSignInOnlyScopes(connection)) return 'warn'
    return CONNECTION_STATE_CLASSES[status]
  }

  function statusLabel(connection: Connection): string {
    const status = connectionState(connection)
    if (status === 'connected' && hasSignInOnlyScopes(connection)) return 'Limited access'
    return CONNECTION_STATE_LABELS[status]
  }

  function expiryText(connection: Connection): string {
    const expiresAt = Number(connection.expires_at || 0)
    if (!expiresAt) return ''
    const seconds = expiresAt - Math.floor(Date.now() / 1000)
    if (seconds <= 0) return 'token expired'
    if (seconds < 3600) return `expires in ${Math.max(1, Math.floor(seconds / 60))}m`
    if (seconds < 86400) return `expires in ${Math.floor(seconds / 3600)}h`
    return `expires in ${Math.floor(seconds / 86400)}d`
  }

  function statusDetail(connection: Connection): string {
    const parts = []
    if (connection.provider) parts.push(connection.provider)
    if (connection.oauth) {
      if (hasSignInOnlyScopes(connection)) parts.push('sign-in only')
      const expiry = expiryText(connection)
      if (expiry) parts.push(expiry)
      if (Number(connection.scope_count || 0) > 0) {
        parts.push(`${connection.scope_count} scope${connection.scope_count === 1 ? '' : 's'}`)
      }
    }
    return parts.join(' · ')
  }

  function connectionDescription(connection: Connection): string {
    if (confirmId.value === connection.component_id) return 'Click the check again to remove this connection.'
    const status = connectionState(connection)
    if (status === 'expired') return 'The stored access token is expired; reconnect or wait for refresh.'
    if (status === 'needs_reauth') return `Reauthorize this connection to restore access.${connection.reauth_reason ? ' ' + connection.reauth_reason : ''}`
    if (status === 'disabled') return 'This connection is disabled and will not be used.'
    if (hasSignInOnlyScopes(connection)) return 'Reauthorize this connection to grant service scopes.'
    if (connection.oauth) return 'OAuth connection available for agents and automations.'
    return 'Connection available for agents and automations.'
  }

  function matches(text: string): boolean {
    const q = search.value.trim().toLowerCase()
    return !q || text.toLowerCase().includes(q)
  }

  const filteredProviders = computed(() =>
    providers.value.filter(provider => matches(`${providerLabel(provider)} ${provider.description ?? ''} ${(provider.classes ?? []).join(' ')}`)))
  const filteredConnections = computed(() =>
    connections.value.filter(connection => matches(`${connection.name ?? ''} ${connection.provider ?? ''}`)))

  return {
    providerKey, providerLabel, providerIcon, connIcon, providerForConnection,
    grantedScopeSet, defaultScopeSet, availableScopeValues, hasOptionalProviderScopes,
    hasSignInOnlyScopes, connectionState, statusClass, statusLabel, expiryText,
    statusDetail, connectionDescription, filteredProviders, filteredConnections,
  }
}
