import type { MetaFieldTypes } from '@widgets/app/componentRealtime'

// Canonical connection state vocabulary, shared by every connection UI. The API
// emits the stored connection_state verbatim; expired is derived here from token
// expiry so the initial list and the realtime meta relay resolve to the same
// display state.
export type ConnectionState = 'connected' | 'expired' | 'needs_reauth' | 'disabled' | 'error'

export function resolveConnectionState(connectionState?: string, expiresAt?: number | null): ConnectionState {
  const state = (connectionState || 'connected') as ConnectionState
  const exp = Number(expiresAt || 0)
  if (state === 'connected' && exp > 0 && exp <= Math.floor(Date.now() / 1000)) return 'expired'
  return state
}

// The single user-visible label per state; components layer scope-based overlays
// (e.g. "Limited access") on top of these, never a competing label table.
export const CONNECTION_STATE_LABELS: Record<ConnectionState, string> = {
  connected: 'Connected',
  expired: 'Token expired',
  needs_reauth: 'Reconnect required',
  disabled: 'Disabled',
  error: 'Unavailable',
}

// The card and its status line are not PrimeVue components, so they take a class
// named for the state; the colour behind it is the theme's severity ramp.
export const CONNECTION_STATE_CLASSES: Record<ConnectionState, string> = {
  connected: 'ok',
  expired: 'bad',
  needs_reauth: 'bad',
  disabled: 'muted',
  error: 'warn',
}

// Declared field types for connection component public meta. The realtime meta
// relay carries every value as a raw string; the shared subscribeComponentMeta
// seam coerces these keys to their typed values (schema-driven), so consumers read
// numbers/booleans without hand-rolled coercion.
export const CONNECTION_META_FIELD_TYPES: MetaFieldTypes = {
  expires_at: 'integer',
  refresh_expires_at: 'integer',
  oauth_connection: 'boolean',
}
