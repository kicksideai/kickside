local contract = require("contract")
local security = require("security")
local base = require("base")

local M = {}
local ADMISSION = "kickside.channel:reply_admission"

local function unavailable(message: string): error
    return (errors.new({ message = message, kind = errors.UNAVAILABLE, retryable = true,
        details = { error_kind = "infrastructure" } }) :: error)
end

local function denied(message: string): error
    return (errors.new({ message = message, kind = errors.PERMISSION_DENIED, retryable = false,
        details = { error_kind = "access" } }) :: error)
end

local function admission(): (any?, error?)
    local def, get_err = contract.get(ADMISSION)
    if get_err or not def then return nil, unavailable("reply admission unavailable: " .. tostring(get_err)) end
    local svc, open_err = def:open()
    if open_err or not svc then return nil, unavailable("reply admission open failed: " .. tostring(open_err)) end
    return svc, nil
end

-- target(args) -> the admission target a presented proof must match: the
-- connection (args.connection_id, else the connection scope this runs in), the
-- conversation, the proof's inbound message, the send operation and the
-- caller's execution principal.
local function target(args: any): (any?, error?)
    if type(args) ~= "table" or type(args.reply_proof) ~= "table" then
        return nil, denied("sealed reply proof is required")
    end
    local connection_id: string? = type(args.connection_id) == "string" and args.connection_id ~= ""
        and (args.connection_id :: string) or nil
    if connection_id == nil then
        local scoped, id_err = base.component_id()
        if not scoped then return nil, id_err end
        connection_id = scoped
    end
    local actor = security.actor()
    local meta = actor and actor.meta and actor:meta() or nil
    local principal = type(meta) == "table" and meta.principal or nil
    if principal == nil and type(args.reply_proof.principal) == "table"
        and args.reply_proof.principal.kind == "transport"
        and args.reply_proof.principal.id == tostring(args.reply_proof.provider) .. ".gateway" then
        principal = { kind = "transport", id = args.reply_proof.principal.id }
    end
    if type(principal) ~= "table" or type(principal.kind) ~= "string"
        or type(principal.id) ~= "string" then
        return nil, denied("reply execution principal is unavailable")
    end
    return {
        provider = type(args.provider) == "string" and args.provider ~= ""
            and args.provider or args.reply_proof.provider,
        connection_id = connection_id,
        external_conversation_id = args.resource_id,
        inbound_message_id = args.reply_proof.inbound_message_id,
        reply_op = "send_reply",
        principal = { kind = principal.kind, id = principal.id },
    }, nil
end

-- verify(args) -> err?: the proof admits this reply target; nothing is reserved.
function M.verify(args: any): error?
    local expected, target_err = target(args)
    if target_err or not expected then return target_err end
    local svc, open_err = admission()
    if open_err or not svc then return open_err end
    local result, verify_err = svc:verify({ proof = args.reply_proof, target = expected })
    if verify_err or type(result) ~= "table" or result.verified ~= true then
        return verify_err or denied("reply proof refused")
    end
    return nil
end

function M.reserve(args: any): (any?, any?)
    local expected, target_err = target(args)
    if target_err or not expected then return nil, target_err end
    local svc, open_err = admission()
    if open_err or not svc then return nil, open_err end
    local result, reserve_err = svc:reserve({ proof = args.reply_proof,
        target = expected, content = args.content })
    if reserve_err or not result then return nil, reserve_err or denied("reply reservation refused") end
    return result, nil
end

function M.complete(args: any): (boolean, any?)
    local expected, target_err = target(args)
    if target_err or not expected then return false, target_err end
    local svc, open_err = admission()
    if open_err or not svc then return false, open_err end
    local result, complete_err = svc:complete({ proof = args.reply_proof,
        content = args.content, message_ref = args.message_ref })
    if complete_err or not result then return false, complete_err or denied("reply receipt refused") end
    return true, nil
end

return M
