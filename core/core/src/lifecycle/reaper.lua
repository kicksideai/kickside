-- reaper: the lifecycle thread's projection worker. Each tick prefetches the new
-- deletion reports (kickside.lifecycle.events:principal.deleted / kickside.lifecycle.events:component.deleted) and, for every named owner,
-- deletes each component that owner still owns via the trusted component.system_delete
-- (which runs the impl's own deletable cleanup). Ownership is nested-safe: deleting a
-- component recurses into anything IT owns, so a single principal report tears the
-- whole owned subtree down to its leaves' backing data.
--
-- Idempotent + retriable: list_system shrinks as components go, system_delete no-ops on
-- an already-gone component, and the cursor only advances when the tick returns -- so a
-- failed tick safely re-runs the same window.

local component = require("component")
local consts = require("lifecycle_consts")
local persisted_json = require("persisted_json")
local registry = require("registry")
local funcs = require("funcs")
local security = require("security")
local execution_identity = require("execution_identity")
local component_envelope = require("component_envelope")

local M = {}

-- Bound on nested-ownership recursion: a guard against a pathological ownership cycle,
-- far above any real component tree depth.
local MAX_DEPTH = 64
local MAX_COMPONENTS_PER_TICK = 50
local CLEANUP_META_TYPE = "kickside.lifecycle.principal_cleanup"

local function cleanup_error(message: string, cause: any?): error
    if type(cause) == "userdata" then
        return (errors.wrap(cause, message) :: error)
    end
    return (errors.new({ message = message .. (cause ~= nil and (": " .. tostring(cause)) or ""),
        kind = errors.INTERNAL, retryable = true }) :: error)
end

-- Delete children before their owning parent. If a page or child cleanup
-- fails, the parent still names the unfinished subtree on the next tick.
local function reap_owner(owner_id: string, depth: integer, budget: { remaining: integer, deleted: integer }): error?
    if depth > MAX_DEPTH then return cleanup_error("component ownership depth exceeds " .. tostring(MAX_DEPTH)) end
    if type(owner_id) ~= "string" or owner_id == "" then return cleanup_error("component owner id is required") end
    local limit = math.max(1, budget.remaining)
    local rows, list_err = component.list_system({
        meta = { [consts.OWNER_META_KEY] = owner_id }, include = { meta = false },
        limit = limit, order_by = { field = "component_id", direction = "ASC" },
    })
    if list_err or type(rows) ~= "table" then return cleanup_error("component owner scan failed", list_err or "no rows result") end
    if budget.remaining == 0 and #rows > 0 then
        return cleanup_error("component owner cleanup has another bounded page", owner_id)
    end
    for _, row in ipairs(rows :: { any }) do
        local cid = (row :: any).component_id
        if type(cid) ~= "string" or cid == "" then return cleanup_error("component owner scan returned an invalid id") end
        local child_err = reap_owner(cid :: string, depth + 1, budget)
        if child_err then return child_err end
        if budget.remaining == 0 then
            return cleanup_error("component owner cleanup has another bounded page", owner_id)
        end
        local ok, delete_err = component.system_delete(cid :: string, "reparent_root")
        if delete_err or ok ~= true then
            return cleanup_error("component owner delete failed for " .. cid, delete_err or "no deletion proof")
        end
        budget.remaining = budget.remaining - 1
        budget.deleted = budget.deleted + 1
    end
    if budget.remaining == 0 then
        local more, more_err = component.list_system({ meta = { [consts.OWNER_META_KEY] = owner_id },
            include = { meta = false }, limit = 1 })
        if more_err or type(more) ~= "table" then return cleanup_error("component owner continuation scan failed", more_err or "no rows result") end
        if #more > 0 then return cleanup_error("component owner cleanup has another bounded page", owner_id) end
    end
    return nil
end

local function cleanup_target(entry: any): string
    if type(entry) ~= "table" then return "" end
    if type((entry :: any).target) == "string" and (entry :: any).target ~= "" then
        return (entry :: any).target :: string
    end
    if type((entry :: any).id) == "string" then return (entry :: any).id :: string end
    return ""
end

local function run_principal_cleanups(owner_id: string): error?
    if type(owner_id) ~= "string" or owner_id == "" then return nil end
    local entries, find_err = registry.find({ ["meta.type"] = CLEANUP_META_TYPE })
    if find_err then
        return (errors.wrap(find_err, "principal cleanup discovery failed") :: error)
    end
    for _, entry in ipairs(entries or {}) do
        local target = cleanup_target(entry)
        if target ~= "" then
            local result, call_err = funcs.call(target, {
                principal_id = owner_id,
                user_id = owner_id,
            })
            if call_err then
                return (errors.wrap(call_err, "principal cleanup failed (" .. target .. ")") :: error)
            end
            if type(result) == "table" and (result :: any).success == false then
                return component_envelope.error_of(result, target, "principal cleanup failed (" .. target .. ")")
            end
        end
    end
    return nil
end

-- run is the func:// projection worker entry. input.events holds the prefetched batch;
-- input.range.to_seq is the cursor advance. Returns the patched body + the new last_seq.
local function run(input: table): (table?, error?)
    local input_tbl: table = type(input) == "table" and input or {}
    local actor = security.actor()
    if actor == nil or not execution_identity.is_maintenance_key(actor:id()) then
        return nil, (errors.new({ message = "lifecycle reaper requires a framework caller",
            kind = errors.PERMISSION_DENIED }) :: error)
    end
    if input_tbl.thread_id ~= consts.thread_id() then
        return nil, (errors.new({ message = "lifecycle reaper input is not from the system lifecycle thread",
            kind = errors.PERMISSION_DENIED }) :: error)
    end
    local events: { any } = type(input_tbl.events) == "table" and input_tbl.events or {}
    local range: table = type(input_tbl.range) == "table" and input_tbl.range or {}
    local projection: table = type(input_tbl.projection) == "table" and input_tbl.projection or {}
    local body: table = type(projection.body) == "table" and projection.body or {}

    local budget = { remaining = MAX_COMPONENTS_PER_TICK, deleted = 0 }
    for _, ev in ipairs(events) do
        local etype = type((ev :: any).type) == "string" and (ev :: any).type or ""
        if etype == consts.EVENT.PRINCIPAL_DELETED or etype == consts.EVENT.COMPONENT_DELETED then
            local payload, decode_err = persisted_json.decode_table((ev :: any).body, "lifecycle.event.body")
            if decode_err then return nil, decode_err end
            local owner_id = payload.subject_id
            if type(owner_id) ~= "string" or owner_id == "" then
                return nil, (errors.new({ message = "lifecycle event subject_id must be a non-empty string",
                    kind = errors.INVALID }) :: error)
            end
            local reap_err = reap_owner(owner_id, 0, budget)
            if reap_err then return nil, reap_err end
            if etype == consts.EVENT.PRINCIPAL_DELETED then
                local cleanup_err = run_principal_cleanups(owner_id)
                if cleanup_err then return nil, cleanup_err end
            end
        end
    end

    local stats: table = type(body.stats) == "table" and body.stats or {}
    stats.reaped = (tonumber(stats.reaped) or 0) + budget.deleted
    body.stats = stats

    return {
        body = body,
        last_seq = tonumber(range.to_seq) or nil,
    }
end

M.run = run

return M
