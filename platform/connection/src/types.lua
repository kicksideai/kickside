-- Result shapes and runtime vocabulary for kickside.connection registry
-- contracts (connections / reply_providers). Consolidates the rollback
-- envelope every reversible method emits, documents each method's output at the
-- contract surface, and keeps connection-domain identifiers in one canonical
-- module. Reference cross-module via the import alias (e.g.
-- conn_types.RegisterResult) or a local readability alias for constants.

local M = {}
M.CAPACITY_META_KEY = "kickside.connection.capacity.retry_at_ms"

M.CONNECTIONS_CONTRACT = "kickside.connection:connections"
M.CONNECTION_CONTRACT = "kickside.connection:connection"
M.REPLY_PROVIDER_CONTRACT = "kickside.connection:reply_provider"
M.CONNECTION_CLASS = "connection"
M.REPLY_PROVIDER_CLASS = "reply_provider"

-- Canonical connection state vocabulary. Every writer stores exactly one stored
-- state in the connection_state meta key / DB column. EXPIRED and ERROR are
-- read-time projections and are never stored.
M.STATE_CONNECTED = "connected"       -- authorized and usable
M.STATE_NEEDS_REAUTH = "needs_reauth" -- requires re-authorization
M.STATE_DISABLED = "disabled"         -- soft-disabled, not used
M.STATE_EXPIRED = "expired"           -- projected: a connected token past expiry
M.STATE_ERROR = "error"               -- projected: status probe failed

-- A persisted rollback step: the contract method to call and its args,
-- replayed on teardown.
type RollbackStep = { method: string, args: { [string]: any } }

-- Public component row returned by kickside.component:component_service list
-- methods. Provider credentials and runtime state live in private_context and
-- plugin stores; callers must resolve those through the owning contract.
type ComponentRow = {
    component_id: string,
    impl_id: string,
    created_at: string?,
    updated_at: string?,
    meta: { [string]: string }?,
    parent_id: string?,
    position: string?,
    path: string?,
}

-- A registered component with its delete-rollback. Returned by
-- connections.register and reply_providers.create.
type RegisterResult = {
    component_id: string,
    provider: string?,
    name: string?,
    rollback: RollbackStep,
}

-- Bare component handle returned by update/delete.
type ComponentRef = { component_id: string }

-- connections.validate result.
type ValidateResult = { ok: boolean, error: string?, details: any? }

-- Idempotent upsert envelopes. Upserted components are the
-- public component row shape.
type ConnectionUpsertResult = { connection: ComponentRow, created: boolean, rollback: RollbackStep? }
type ReplyProviderUpsertResult = { reply_provider: ComponentRow, created: boolean, rollback: RollbackStep? }

M.RollbackStep = RollbackStep
M.ComponentRow = ComponentRow
M.RegisterResult = RegisterResult
M.ComponentRef = ComponentRef
M.ValidateResult = ValidateResult
M.ConnectionUpsertResult = ConnectionUpsertResult
M.ReplyProviderUpsertResult = ReplyProviderUpsertResult

-- Coerce a meta/DB timestamp into a unix number. Meta values are stored as text,
-- so an integer-looking string is accepted; anything else is nil.
local function timestamp(value: any): number?
    if type(value) == "number" then return value end
    if type(value) ~= "string" or value == "" or not value:match("^%d+$") then return nil end
    return tonumber(value)
end
M.timestamp = timestamp

-- Project a stored connection_state into its display state. Writers are
-- canonical, so there is no synonym mapping: the only derivation is a connected
-- token whose expiry has passed, which reads as expired. An absent state defaults
-- to connected (a freshly registered connection with no OAuth lifecycle).
function M.project_state(connection_state: any, expires_at: any, now_unix: number): string
    local state = M.STATE_CONNECTED
    if type(connection_state) == "string" and connection_state ~= "" then
        state = connection_state :: string
    end
    local exp = timestamp(expires_at)
    if state == M.STATE_CONNECTED and exp ~= nil and exp <= now_unix then
        return M.STATE_EXPIRED
    end
    return state
end

return M
