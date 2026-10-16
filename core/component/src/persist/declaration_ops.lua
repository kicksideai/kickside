-- Validated automation declaration commands on a component (design v5 §6.3,
-- CONTRACTS §9, OWNERSHIP A14): a framework system actor verifies a reserved
-- automation command against the automation's durable command stream before
-- any component transaction, receives an opaque process-local token, and
-- applies it under the component row lock, where the declaration fence
-- refuses a stale or changed command. The one privileged create path takes
-- its verified creation from here too.
local json = require("json")
local security = require("security")
local context_ops = require("context_ops")
local meta_ops = require("meta_ops")
local declaration_fence = require("declaration_fence")
local execution_identity = require("execution_identity")

local M = {}

local authorized = setmetatable({}, { __mode = "k" })

local function failure(message: string, kind: string, error_kind: string?): error
    return (errors.new({ message = message, kind = kind,
        details = error_kind and { error_kind = error_kind } or nil }) :: error)
end

local function framework_actor(action: string): error?
    local actor = security.actor()
    local actor_id = actor and actor:id() or nil
    if not execution_identity.is_maintenance_key(actor_id)
        or security.can(action, "kickside.component:declaration") ~= true then
        return failure("framework system actor is required", errors.PERMISSION_DENIED)
    end
    return nil
end

-- verify_command checks a declaration command's shape and the receipt the
-- caller's verify(input) reads from the durable automation command, and
-- returns the receipt frozen as plain data.
local function verify_command(input: any, verify: any): (any?, error?)
    if type(input) ~= "table" or type(verify) ~= "function" then
        return nil, failure("command verification is required", errors.INVALID)
    end
    if type(input.component_id) ~= "string" or input.component_id == ""
        or type(input.automation_id) ~= "string" or input.automation_id == ""
        or type(input.command_id) ~= "string" or input.command_id == ""
        or type(input.declaration_hash) ~= "string" or input.declaration_hash == ""
        or type(input.generation) ~= "number" or input.generation < 1
        or input.generation ~= math.floor(input.generation) then
        return nil, failure("invalid declaration command", errors.INVALID, "declaration")
    end
    local receipt, verify_err = verify(input)
    if verify_err then return nil, verify_err end
    if type(receipt) ~= "table" then
        return nil, failure("automation command is not validated", errors.INVALID, "declaration")
    end
    if receipt.operator_valid == false or receipt.subject_valid == false then
        return nil, failure("operator or execution subject no longer has access", errors.PERMISSION_DENIED, "access")
    end
    if receipt.pins_lowered == false then
        return nil, failure("new-source pin is not acknowledged", errors.UNAVAILABLE, "infrastructure")
    end
    if receipt.valid ~= true or receipt.operator_valid ~= true or receipt.subject_valid ~= true
        or receipt.pins_lowered ~= true
        or receipt.component_id ~= input.component_id
        or receipt.automation_id ~= input.automation_id
        or receipt.command_id ~= input.command_id
        or receipt.generation ~= input.generation
        or receipt.declaration_hash ~= input.declaration_hash
        or type(receipt.operator_id) ~= "string" or receipt.operator_id == ""
        or type(receipt.execution_subject_id) ~= "string" or receipt.execution_subject_id == ""
        or type(receipt.declaration) ~= "table"
        or (receipt.state ~= nil and type(receipt.state) ~= "table")
        or (receipt.public_meta ~= nil and type(receipt.public_meta) ~= "table")
        or type(receipt.affected_drive_keys) ~= "table"
        or #receipt.affected_drive_keys == 0 then
        return nil, failure("automation command is not validated", errors.INVALID, "declaration")
    end
    local encoded, encode_err = json.encode(receipt)
    if encode_err then return nil, errors.wrap(encode_err, "invalid command receipt") end
    if not encoded then return nil, failure("invalid command receipt: nil", errors.INVALID) end
    local frozen, decode_err = json.decode(encoded)
    if decode_err then return nil, errors.wrap(decode_err, "invalid command receipt") end
    if type(frozen) ~= "table" then return nil, failure("invalid command receipt", errors.INVALID) end
    return frozen, nil
end

-- Creates an opaque, process-local authorization after verifying the durable
-- automation command. This runs before a component transaction is opened.
function M.prepare_declaration(input: any, verify: any): (any?, error?)
    local actor_err = framework_actor("component.declaration.apply")
    if actor_err then return nil, actor_err end
    local frozen, verify_err = verify_command(input, verify)
    if verify_err then return nil, verify_err end
    local token = {}
    authorized[token] = frozen
    return token, nil
end

-- The monotonic fence prevents a delayed older component write after a newer
-- generation has replaced it, even across separate automation/component DBs.
function M.apply_declaration_tx(tx: any, token: any): (any?, error?)
    local input = authorized[token]
    if not input then return nil, failure("validated declaration token is required", errors.PERMISSION_DENIED) end
    authorized[token] = nil
    return M.write_declaration_tx(tx, input)
end

-- write_declaration_tx writes a verified declaration command's
-- _portable_input under the component row lock and advances the fence.
function M.write_declaration_tx(tx: any, input: any): (any?, error?)
    if type(input) ~= "table" or type(input.component_id) ~= "string"
        or type(input.automation_id) ~= "string" or type(input.command_id) ~= "string"
        or type(input.declaration_hash) ~= "string"
        or type(input.generation) ~= "number" or input.generation < 1
        or input.generation ~= math.floor(input.generation)
        or type(input.declaration) ~= "table" then
        return nil, failure("validated declaration command is required", errors.INVALID)
    end
    local stored, err = context_ops.lock_and_read_tx(tx, input.component_id :: string)
    if err then return nil, err end
    local prior, fence_err = declaration_fence.read(tx, input.component_id, input.automation_id)
    if fence_err then return nil, fence_err end
    if prior then
        local generation = prior.applied_command_generation
        if generation > input.generation or
            (generation == input.generation and
                (prior.command_id ~= input.command_id or prior.declaration_hash ~= input.declaration_hash)) then
            return nil, failure("stale or changed declaration command", errors.CONFLICT)
        end
        if generation == input.generation then
            return { component_id = input.component_id, changes_made = false, generation = generation }, nil
        end
    end
    stored._portable_input = input.declaration
    if input.state ~= nil then
        if type(input.state) ~= "table" then return nil, failure("declaration state must be an object", errors.INVALID, "declaration") end
        for key, value in pairs(input.state) do
            if type(key) ~= "string" or key == "component_id" or key == "public_state"
                or key == "_portable_input" or key == "_execution_identity" or key == "_rollback" then
                return nil, failure("declaration state contains a reserved field: " .. tostring(key), errors.INVALID, "declaration")
            end
            stored[key] = value
        end
    end
    local result, write_err = context_ops.write_context_tx(tx, input.component_id :: string, stored)
    if write_err then return nil, write_err end
    if input.public_meta ~= nil then
        if type(input.public_meta) ~= "table" then
            return nil, failure("declaration public_meta must be an object", errors.INVALID, "declaration")
        end
        local _, _, meta_err = meta_ops.set_public_meta(tx, input.component_id, input.public_meta)
        if meta_err then return nil, meta_err end
    end
    local save_err = declaration_fence.save_tx(tx, prior ~= nil, input)
    if save_err then return nil, save_err end
    result.generation = input.generation
    return result, nil
end

-- The verified inputs of the one privileged create path (design v4 §6.3):
-- a framework system actor holding component.declaration.create creates an
-- automation component for a reserved install command at generation 1. The
-- operator becomes the creator: the initial ADMIN grant and the operator's
-- own v2 identity commit together with the component (IDENTITY-1 §2).
local creations = setmetatable({}, { __mode = "k" })

function M.prepare_creation(input: any, verify: any): (any?, error?)
    local actor_err = framework_actor("component.declaration.create")
    if actor_err then return nil, actor_err end
    if type(input) ~= "table" or input.generation ~= 1 then
        return nil, failure("a created component starts at declaration generation 1", errors.INVALID, "declaration")
    end
    if type(input.impl_id) ~= "string" or input.impl_id == "" then
        return nil, failure("implementation ID is required", errors.INVALID, "declaration")
    end
    if input.parent_id ~= nil and (type(input.parent_id) ~= "string" or input.parent_id == "") then
        return nil, failure("parent_id must be a non-empty string", errors.INVALID, "declaration")
    end
    for _, field in ipairs({ "context", "meta" }) do
        if input[field] ~= nil and type(input[field]) ~= "table" then
            return nil, failure(field .. " must be an object", errors.INVALID, "declaration")
        end
    end
    if type(input.rollback) ~= "table" then
        return nil, failure("rollback chain is required", errors.INVALID, "declaration")
    end
    local receipt, verify_err = verify_command(input, verify)
    if verify_err or not receipt then return nil, verify_err end
    if receipt.operator_id ~= receipt.execution_subject_id then
        return nil, failure("a created component runs as its operator; select another principal through SET_EXECUTION_IDENTITY",
            errors.INVALID, "declaration")
    end
    local encoded, encode_err = json.encode({
        component_id = input.component_id, impl_id = input.impl_id, parent_id = input.parent_id,
        context = input.context or {}, meta = input.meta or {}, rollback = input.rollback,
    })
    if encode_err then return nil, errors.wrap(encode_err, "creation input encoding failed") end
    if not encoded then return nil, failure("creation input must be JSON serializable", errors.INVALID, "declaration") end
    local frozen_input, decode_err = json.decode(encoded)
    if decode_err then return nil, errors.wrap(decode_err, "creation input decoding failed") end
    if type(frozen_input) ~= "table" then
        return nil, failure("creation input must be JSON serializable", errors.INVALID, "declaration")
    end
    local token = {}
    creations[token] = { input = frozen_input, receipt = receipt }
    return token, nil
end

-- take_creation(token) -> the verified creation, consumed once.
function M.take_creation(token: any): (any?, error?)
    local creation = creations[token]
    if not creation then return nil, failure("validated creation token is required", errors.PERMISSION_DENIED) end
    creations[token] = nil
    return creation, nil
end

return M
