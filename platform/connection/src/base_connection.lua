local ctx = require("ctx")
local component = require("component")
local time = require("time")
local conn_types = require("conn_types")
local capacity = require("capacity")

-- Shared adapter helpers for kickside.connection provider bindings, plus the
-- canonical checklist for adding a new provider.
--
-- A provider connection is a thin adapter over its own transport: it resolves its
-- component_id from the ambient execution context the binding runs under and shapes
-- results. These helpers remove the boilerplate every provider shares so a new one
-- writes only the provider-specific calls.
--
-- ── To add a provider ──────────────────────────────────────────────────────
-- 1. A contract.binding (meta.provider=<name>, meta.class:[connection] -- add
--    reply_provider too if it sends replies) binding, each with
--    context_required:[component_id]:
--      kickside.connection:connection     -> get_status (base.get_status),
--        test_connection (live diagnostic), discover_resources
--      kickside.connection:reply_provider -> send_reply   (only if it replies;
--        declare static reply limits in meta.reply: { max_length, content_types, ... })
--      kickside.contract:deletable        -> delete   (use base.delete for credential-only providers)
-- 2. A transport lib exposing connect(component_id) -> handle (provider-owned).
-- 3. The binding's credential_schema (the fields the connect UI collects).
-- 4. If the provider has live inbound (a gateway worker per connection), a hub
--    process that lists its connections (component.list_system by provider) (see the
--    Discord gateway hub for the reference).
-- Routing, sessions, threads, and replies are owned by the core engine; a provider
-- never implements them.
local M = {}
M.capacity = capacity.new

type StatusResult = {
    success: boolean,
    status: string?,
    description: string?,
    details: any?,
    error: string?,
    updated_at: string?,
}

function M.trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- Plan worker ownership from the committed connection snapshot. Tokens are
-- compared at spawn boundaries because a running transport caches its credential.
function M.plan_workers(workers: any, connections: {any}): any
    local start, restart, stop, seen = {}, {}, {}, {}
    for _, connection in ipairs(connections) do
        local id, token = M.trim(connection.id), M.trim(connection.token)
        if id ~= "" and token ~= "" then
            seen[id] = true
            local worker = workers[id]
            if not worker then
                table.insert(start, {id = id, token = token})
            elseif M.trim(worker.token) ~= token then
                table.insert(restart, {id = id, token = token})
            end
        end
    end
    for id in pairs(workers) do
        if not seen[id] then table.insert(stop, id) end
    end
    return {start = start, restart = restart, stop = stop}
end

function M.wake_workers(process: any, name: string, input: any): (any?, error?)
    local pid, lookup_err = process.registry.lookup(name, process.registry.CONSISTENT)
    if lookup_err or not pid then
        return nil, (errors.new({message = "Connection supervisor unavailable: " .. tostring(lookup_err),
            kind = errors.UNAVAILABLE, retryable = true}) :: error)
    end
    local _, send_err = process.send(pid, "reconcile", {})
    if send_err then
        return nil, (errors.new({message = "Connection reconcile failed: " .. tostring(send_err),
            kind = errors.UNAVAILABLE, retryable = true}) :: error)
    end
    return {body = input.projection.body, last_seq = input.range.to_seq}, nil
end

function M.reconcile_workers(input: any): (any?, error?)
    return M.wake_workers(require("process"), input.projection.body.worker_config.hub_name, input)
end

-- The connection component's id, from the ambient context the binding runs under.
-- A missing id is a wiring error (the binding's context_required:[component_id]
-- was not satisfied), not a runtime condition.
function M.component_id(): (string?, error?)
    local id = ctx.get("component_id")
    if type(id) ~= "string" or id == "" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "component_id not in scope" })
    end
    return id :: string, nil
end

function M.public_meta(component_id: string): (any?, error?)
    local rows, err = component.query({
        component_ids = { component_id },
        include = { meta = true },
        limit = 1,
    })
    if err then return nil, err end
    local row = rows and rows[1]
    if not row then return nil, errors.new({kind = errors.NOT_FOUND, message = "component not found"}) end
    return row.meta or {}, nil
end

-- Public status is a component read model, not a provider health probe. Use
-- `test_connection` / connection registry `validate` for explicit live checks.
function M.get_status(_args: any): (StatusResult?, error?)
    local id, id_err = M.component_id()
    if id_err then return nil, id_err end
    local meta, meta_err = M.public_meta(id :: string)
    if meta_err then return nil, meta_err end

    local now = time.now()
    local state = conn_types.project_state(meta and meta.connection_state, meta and meta.expires_at, now:unix())
    local provider = tostring((meta and meta.provider) or "connection")
    local name = tostring((meta and meta.title) or provider)
    local description = name .. " (" .. provider .. ") is " .. state
    local expires_at = conn_types.timestamp(meta and meta.expires_at)
    if expires_at then
        description = description .. (expires_at <= now:unix() and " | token expired" or " | token has expiration")
    end

    return {
        success = true,
        status = state,
        description = description,
        details = {
            provider = provider,
            name = name,
            expires_at = meta and meta.expires_at,
            refresh_expires_at = meta and meta.refresh_expires_at,
        },
        updated_at = now:utc():format(time.RFC3339),
    }
end

-- The deletable:delete body for a provider that owns no external resource to tear
-- down: the component delete path already removes the stored credential, so delete
-- only confirms the component is in scope. Providers with side resources implement
-- their own delete instead.
function M.delete(): ({ success: boolean }?, error?)
    local _, err = M.component_id()
    if err then return nil, err end
    return { success = true }
end

return M
