local consts = require("channel_consts")
local persist = require("channel_persist")
local execution_ref = require("execution_ref")

local M = {}

local function failure(message: string): error
    return (errors.new({ message = message, kind = errors.PERMISSION_DENIED,
        retryable = false, details = { error_kind = "access" } }) :: error)
end

local function store_failure(message: string, kind: string?): error
    if kind == "access" then return failure(message) end
    return (errors.new({ message = message, kind = errors.UNAVAILABLE,
        retryable = true, details = { error_kind = "infrastructure" } }) :: error)
end

-- admit(args) -> (db_id?, err?): the proof names an accepted turn, matches its
-- target, and the turn's surface and execution principal still admit it.
local function admit(args: any): (string?, error?)
    if type(args) ~= "table" then return nil, failure("reply admission request is required") end
    local db_id, db_err = consts.db_id()
    if db_err or not db_id then
        return nil, (errors.new({ message = "channel database unavailable: " .. tostring(db_err),
            kind = errors.UNAVAILABLE, retryable = true,
            details = { error_kind = "infrastructure" } }) :: error)
    end
    local proof = args.proof
    if type(proof) ~= "table" or type(proof.turn_id) ~= "string" then
        return nil, failure("reply proof is required")
    end
    local route, route_err = persist.get_accepted(db_id, proof.turn_id)
    if route_err then
        return nil, (errors.new({ message = "accepted turn unavailable: " .. tostring(route_err),
            kind = errors.UNAVAILABLE, retryable = true,
            details = { error_kind = "infrastructure" } }) :: error)
    end
    if not persist.matches_reply_proof(route, proof, args.target) then
        return nil, failure("reply proof does not match the admitted turn")
    end
    local role = type(route.thread) == "table" and route.thread.role or nil
    if role == "notice" then
        if proof.principal.kind ~= "transport" or proof.principal.id ~= tostring(route.session_provider) .. ".gateway"
            or type(route.execution_ref) ~= "table"
            or route.execution_ref.owner_id ~= "channel.notice" then
            return nil, failure("notice reply principal is invalid")
        end
    elseif role == "channel" or role == "dm" then
        local resolved, resolve_err = execution_ref.authorize(route.execution_ref, role, route)
        if resolve_err or not resolved then return nil, resolve_err end
        if resolved.principal.kind ~= proof.principal.kind
            or resolved.principal.id ~= proof.principal.id then
            return nil, failure("reply principal changed")
        end
    else
        return nil, failure("reply surface is invalid")
    end
    return db_id, nil
end

-- verify(args) -> ({ verified = true }?, err?): the admission a reply
-- boundary checks before it opens a provider; it reserves nothing.
function M.verify(args: any): (any?, error?)
    local db_id, admit_err = admit(args)
    if admit_err or not db_id then return nil, admit_err end
    local ok, err, kind = persist.verify_reply(db_id :: string, args.proof, args.target)
    if not ok then return nil, store_failure(tostring(err), kind) end
    return { verified = true }, nil
end

function M.reserve(args: any): (any?, error?)
    local db_id, admit_err = admit(args)
    if admit_err or not db_id then return nil, admit_err end
    if type(args.content) ~= "string" then return nil, failure("reply content is required") end
    local result, err, kind = persist.reserve_reply(db_id :: string, args.proof, args.target, args.content :: string)
    if err then return nil, store_failure(err, kind) end
    return result, nil
end

function M.complete(args: any): (any?, error?)
    if type(args) ~= "table" then return nil, failure("reply completion request is required") end
    local db_id, db_err = consts.db_id()
    if db_err or not db_id then
        return nil, (errors.new({ message = "channel database unavailable: " .. tostring(db_err),
            kind = errors.UNAVAILABLE, retryable = true,
            details = { error_kind = "infrastructure" } }) :: error)
    end
    if type(args.content) ~= "string" or type(args.message_ref) ~= "string" then
        return nil, failure("reply receipt content and message reference are required")
    end
    local saved, err, kind = persist.complete_reply(db_id, args.proof,
        args.content :: string, args.message_ref :: string)
    if err or not saved then return nil, err and store_failure(err, kind) or failure("reply receipt is no longer reserved") end
    return { saved = true }, nil
end

return M
