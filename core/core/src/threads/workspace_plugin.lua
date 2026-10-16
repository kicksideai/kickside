-- workspace_plugin: the single kickside relay plugin owning per-user component init.
-- The relay auto-discovers it (meta.type = relay.plugin, auto_start) and spawns one per
-- user on websocket login with user_id + user_metadata. On boot it materializes every
-- declared user-scope provisioned component for that user -- the component, its thread,
-- its projections, and its retention -- then EXITS cleanly (the relay records a clean
-- exit "stopped" and does not restart it).
--
-- Exactly ONE such plugin exists: component kinds declare provisioning on their own
-- contract.binding, never a plugin each.

local provision = require("provision")
local security = require("security")
local logger = require("logger"):named("kickside.core.threads.workspace_plugin")

-- provision_user materializes the workspace under the relay plugin's ambient
-- user actor + named scope. The relay owns that runtime frame; login metadata is
-- not an authorization source.
local function refusal(message: string, kind: string, code: string): error
    return errors.new({message = message, kind = kind, retryable = false,
        details = {code = code}})
end

local function provision_user(user_id: string): ({ string }?, error?)
    local actor = security.actor()
    local scope = security.scope()
    if not actor or tostring(actor:id() or "") == "" then
        return nil, refusal("workspace plugin requires an ambient actor", errors.PERMISSION_DENIED,
            "workspace_actor_required")
    end
    if tostring(actor:id()) ~= tostring(user_id) then
        return nil, refusal("workspace plugin actor does not match user_id", errors.PERMISSION_DENIED,
            "workspace_actor_mismatch")
    end
    if not scope then
        return nil, refusal("workspace plugin requires an ambient named scope", errors.PERMISSION_DENIED,
            "workspace_scope_required")
    end
    local ids, err = provision.ensure_user(actor, scope, tostring(user_id))
    if err then return nil, errors.wrap(err, "workspace provisioning failed") end
    return ids, nil
end

local function failed(user_id: string, err: error): any
    logger:error("workspace provisioning failed", {user_id = user_id, reason = tostring(err)})
    return {ok = false, error = err}
end

-- The clean exit retains the provisioning failure in its result for the parent.
local function run(args: any): any
    local user_id = type(args) == "table" and type(args.user_id) == "string" and (args.user_id :: string) or ""
    if user_id == "" then
        return failed(user_id, refusal("workspace plugin started without a user_id", errors.INVALID,
            "workspace_user_required"))
    end
    local ids, perr = provision_user(user_id)
    if perr then
        return failed(user_id, perr)
    end
    logger:info("workspace provisioned", { user_id = user_id, count = ids and #ids or 0 })
    return { ok = true, count = ids and #ids or 0 }
end

return { run = run, provision_user = provision_user }
