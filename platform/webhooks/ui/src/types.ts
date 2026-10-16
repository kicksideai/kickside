// The webhook views fetch their own data; `mode` is the only host-driven prop
// (the create view is mounted with mode="create" by the generic picker path).
export interface ComponentProps {
  mode?: string
}

// A webhook row from GET /api/v1/webhooks — never the secret, only its display
// prefix. Matches kickside.webhooks repo.list.
export interface WebhookRow {
  webhook_id: string
  secret_prefix?: string
  label?: string
  status: string
  schema?: Record<string, unknown>
  subscriber_count?: number
  created_at?: number | string
  updated_at?: number | string
  last_used_at?: number | string | null
}

// The mint result returned ONCE by POST /api/v1/webhooks. `secret` is present only
// on this response and is never listed again.
export interface MintedWebhook {
  webhook_id: string
  thread_id?: string
  secret: string
  secret_prefix?: string
  schema?: Record<string, unknown>
  label?: string
  status?: string
  created_at?: number | string
  url?: string
}

// The create view's outbound events: the generic picker create-path listens for
// `created` (refresh + auto-select) and `close` (dismiss).
export interface Events {
  created: { id: string; thread_id: string; webhook_id: string; title?: string }
  close: Record<string, never>
  error: { message: string; error?: unknown }
}
