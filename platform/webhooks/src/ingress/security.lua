-- Synthesizes the actor context for public ingress. A webhook has no inbound
-- session; after the endpoint verifies its secret, dispatch runs AS the stored
-- actor, least-privilege (no groups), under a scope that allows ordinary work but
-- denies the control plane. Mirrors the kickside.mcp execution-identity model.

local security = require("security")
local funcs = require("funcs")
local contract = require("contract")
local component = require("component")
local identity = require("execution_identity")

local M = {}

local SESSION_SCOPE = "kickside.webhooks.security:session"
local THREADS_CONTRACT = "kickside.core:threads"

-- The webhook actor: identity is the stored actor_id, no groups, tagged with its origin.
function M.synthesize_actor(actor_id: string): (any?, string?)
    if type(actor_id) ~= "string" or actor_id == "" then
        return nil, "webhook actor_id is required"
    end
    local actor, err = security.new_actor(actor_id, {
        security_groups = {},
        via = "kickside.webhooks",
        actor_id = actor_id,
    })
    if not actor then
        return nil, "failed to synthesize webhook actor: " .. tostring(err)
    end
    return actor, nil
end

-- The runtime scope for ingress work. This policy GROUP resolves without granting
-- the synthesized no-groups actor membership, and re-resolves at the callee frame so
-- it survives the funcs boundary into the threads contract. The group contains the
-- broad allow plus the control-plane deny.
function M.session_scope(): (any?, string?)
    local scope, err = security.named_scope(SESSION_SCOPE)
    if not scope then return nil, "failed to resolve webhook session scope: " .. tostring(err) end
    return scope, nil
end

-- Run a call AS the webhook actor. The actor is synthesized AND bound onto the funcs
-- executor in this one lib (mirrors kickside.mcp's invoke seam): a synthesized actor
-- handle passed across a module boundary is rejected by funcs:with_actor, so the
-- synthesize + with_actor + call must stay colocated.
function M.call_as_actor(actor_id: string, target: string, args: any): (any, any?)
    local actor, actor_err = M.synthesize_actor(actor_id)
    if not actor then return nil, actor_err end
    local scope, scope_err = M.session_scope()
    if not scope then return nil, scope_err end
    local exec = funcs.new()
    if not exec then return nil, "func executor unavailable" end
    exec = exec:with_actor(actor)
    if not exec then return nil, "failed to bind webhook actor" end
    exec = exec:with_scope(scope)
    if not exec then return nil, "failed to bind webhook scope" end
    return exec:call(target, args or {})
end

-- Dispatch the verified append AS the webhook actor. Keep actor reconstruction and
-- funcs binding colocated because a synthesized actor handle cannot cross a module
-- boundary into a later executor frame.
function M.dispatch_append_as_actor(actor_id: string, args: any): (any, any?)
    return M.call_as_actor(actor_id, "kickside.webhooks.ingress:append_event", args)
end

-- append_event is the internal callee for a verified webhook request. It runs under
-- the stored webhook actor reconstructed by dispatch_append_as_actor, so contract
-- lookup/open/call are authorized by that actor's named runtime scope rather than the
-- anonymous HTTP endpoint policy. Thread WRITE access remains enforced by the threads
-- contract against the actor's own component grant.
function M.append_event(args: any): any
    local input = type(args) == "table" and args or {}
    local thread_id = type(input.thread_id) == "string" and input.thread_id or ""
    if thread_id == "" then return { success = false, error = "webhook thread_id is required" } end

    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then return { success = false, error = "webhook execution identity is unavailable" } end
    local actor_meta = actor.meta and actor:meta() or nil
    if type(actor_meta) ~= "table" or actor_meta.via ~= "kickside.webhooks"
        or actor_meta.actor_id ~= actor:id() then
        return { success = false, error = "verified webhook actor is required" }
    end

    local principal, principal_err = identity.principal_of_key(actor:id())
    if principal_err or not principal then return nil, principal_err end
    local masks, access_err = component.principal_masks_system(principal, {thread_id})
    if access_err then return nil, access_err end
    local mask = masks and masks[thread_id] or 0
    if (mask & component.ACCESS.WRITE) ~= component.ACCESS.WRITE then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
            message = "webhook principal has no live thread write access"})
    end

    local def, def_err = contract.get(THREADS_CONTRACT)
    if def_err or not def then return { success = false, error = "threads contract unavailable: " .. tostring(def_err) } end
    local inst, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not inst then return { success = false, error = "failed to open threads as webhook actor: " .. tostring(open_err) } end
    local result, append_err = (inst :: any):append_event({ thread_id = thread_id, event = input.event })
    if append_err then return { success = false, error = "webhook event append failed: " .. tostring(append_err) } end
    if result == nil then return { success = false, error = "webhook event append returned no result" } end
    return { success = true, result = result }
end

return M
