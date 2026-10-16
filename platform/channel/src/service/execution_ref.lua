local component = require("component")
local persist = require("channel_persist")
local execution_identity = require("execution_identity")
local consts = require("channel_consts")

-- Fixed trusted loaders. A route carries a locator and generation, never an
-- identity or a function id. Each use reloads the protected owner record.
local M = {}
local RESPONDER_IMPL = "kickside.channel.responder:channel_responder"

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false,
        details = { error_kind = "declaration" } }) :: error)
end

local function denied(message: string): error
    return (errors.new({ message = message, kind = errors.PERMISSION_DENIED, retryable = false,
        details = { error_kind = "subject" } }) :: error)
end

local function admission_for(session_id: string): (any?, error?)
    local db_id, db_err = consts.db_id()
    if db_err or not db_id then
        return nil, (errors.new({ message = "channel database unavailable: " .. tostring(db_err),
            kind = errors.UNAVAILABLE, retryable = true,
            details = { error_kind = "infrastructure" } }) :: error)
    end
    local admission, admission_err = persist.get_admission(db_id, session_id)
    if admission_err then
        return nil, (errors.new({ message = "session admission unavailable: " .. tostring(admission_err),
            kind = errors.UNAVAILABLE, retryable = true,
            details = { error_kind = "infrastructure" } }) :: error)
    end
    if not admission then return nil, denied("session admission is missing") end
    return admission, nil
end

function M.load(ref: any, role: string, route: any?): (any?, error?)
    if type(ref) ~= "table" or type(ref.record_id) ~= "string" or ref.record_id == ""
        or type(ref.generation) ~= "number" or ref.generation < 0
        or ref.generation % 1 ~= 0 then
        return nil, invalid("invalid execution_ref")
    end
    if role == "channel" and ref.owner_id == "automation.component" then
        local inbound = type(route) == "table" and route.inbound or nil
        if type(inbound) ~= "table" or type(inbound.reply_component_id) ~= "string"
            or type(inbound.channel_id) ~= "string" then
            return nil, invalid("channel route coordinates are required")
        end
        local rows = component.list_system({ component_ids = { ref.record_id },
            impl_ids = { RESPONDER_IMPL },
            meta = { connection_id = inbound.reply_component_id, channel_id = inbound.channel_id } })
        if type(rows) ~= "table" or #rows ~= 1 then
            return nil, denied("responder does not own this channel")
        end
        if type(route.session_id) == "string" and route.session_id ~= "" then
            local admission, admission_err = admission_for(route.session_id)
            if admission_err or not admission then return nil, admission_err end
            if admission.owner_id ~= "automation.component"
                or admission.record_id ~= ref.record_id or admission.generation ~= ref.generation
                or admission.provider ~= inbound.provider or admission.external_id ~= inbound.channel_id then
                return nil, denied("responder route does not match session admission")
            end
        end
        local receipt, receipt_err = component.get_identity_receipt(ref.record_id)
        if receipt_err or not receipt then return nil, receipt_err end
        if receipt.identity_generation ~= ref.generation then
            return nil, denied("responder identity generation changed")
        end
        local ok, verr = execution_identity.validate(receipt.execution_identity)
        if not ok then return nil, invalid(tostring(verr)) end
        return receipt.execution_identity, nil
    end
    if role == "channel" and ref.owner_id == "channel.session" then
        if type(route) ~= "table" or ref.record_id ~= route.session_id then
            return nil, invalid("channel session reference does not match route")
        end
        local admission, admission_err = admission_for(ref.record_id)
        if admission_err or not admission then return nil, admission_err end
        if admission.owner_id ~= "automation.component" or admission.generation ~= ref.generation then
            return nil, denied("channel session identity changed")
        end
        return M.load({ owner_id = "automation.component", record_id = admission.record_id,
            generation = admission.generation }, "channel", route)
    end
    if role == "dm" and ref.owner_id == "channel.session" then
        if type(route) ~= "table" or ref.record_id ~= route.session_id
            or type(route.inbound) ~= "table" then
            return nil, invalid("DM route does not match its admission")
        end
        local admission, admission_err = admission_for(ref.record_id)
        if admission_err or not admission then return nil, admission_err end
        if admission.owner_id ~= "channel.session" or admission.record_id ~= ref.record_id then
            return nil, denied("DM owner does not match its admission")
        end
        if admission.provider ~= route.inbound.provider
            or admission.external_id ~= route.inbound.external_user_id then
            return nil, denied("DM sender does not match its admission")
        end
        if admission.generation ~= ref.generation then
            return nil, denied("session admission generation changed")
        end
        local ok, verr = execution_identity.validate(admission.identity)
        if not ok then return nil, invalid(tostring(verr)) end
        return admission.identity, nil
    end
    return nil, invalid("execution_ref owner is not allowed for " .. tostring(role))
end

local function admit(ref: any, role: string, route: any?, authorize: any): (any?, error?)
    local identity, load_err = M.load(ref, role, route)
    if load_err or not identity then return nil, load_err end
    local resolved, resolve_err = authorize(identity,
        { deferred_owner = "kickside.channel.service:execution_ref" })
    if resolve_err or not resolved then return nil, resolve_err end
    if role == "channel" then
        local inbound = type(route) == "table" and route.inbound or nil
        local connection_id = type(inbound) == "table" and inbound.reply_component_id or nil
        if type(connection_id) ~= "string" or connection_id == "" then
            return nil, invalid("channel reply connection is required")
        end
        local meta = type(resolved.meta) == "table" and resolved.meta or {}
        local allowed, access_err = component.validate_principal_access(connection_id,
            component.ACCESS.WRITE, resolved.principal, meta.security_groups, meta.access_filter)
        if access_err then return nil, access_err end
        if allowed ~= true then return nil, denied("responder cannot use reply connection") end
    end
    return resolved, nil
end

function M.authorize(ref: any, role: string, route: any?): (any?, error?)
    return admit(ref, role, route, execution_identity.authorize)
end

function M.resolve(ref: any, role: string, route: any?): (any?, error?)
    return admit(ref, role, route, execution_identity.resolve)
end

function M.load_turn(ref: any): (any?, error?)
    if type(ref) ~= "table" or ref.owner_id ~= "channel.turn"
        or type(ref.record_id) ~= "string" or ref.record_id == ""
        or ref.generation ~= 1 then
        return nil, invalid("accepted-turn execution_ref is invalid")
    end
    local db_id, db_err = consts.db_id()
    if db_err or not db_id then
        return nil, (errors.new({ message = "channel database unavailable: " .. tostring(db_err),
            kind = errors.UNAVAILABLE, retryable = true,
            details = { error_kind = "infrastructure" } }) :: error)
    end
    local route, read_err = persist.get_accepted(db_id, ref.record_id)
    if read_err then
        return nil, (errors.new({ message = "accepted turn unavailable: " .. tostring(read_err),
            kind = errors.UNAVAILABLE, retryable = true,
            details = { error_kind = "infrastructure" } }) :: error)
    end
    if not route then return nil, denied("accepted turn is missing") end
    if type(route.session_id) ~= "string" or route.session_id == ""
        or type(route.inbound) ~= "table" or type(route.thread) ~= "table" then
        return nil, invalid("stored accepted turn is invalid")
    end
    local _, load_err = M.load(route.execution_ref, route.thread.role :: string, route)
    if load_err then return nil, load_err end
    return route, nil
end

return M
