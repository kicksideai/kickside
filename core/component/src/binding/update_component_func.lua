local sql = require("sql")
local time = require("time")
local security = require("security")
local ops = require("component_ops")
local access_policy = require("access_policy")
local component_lifecycle = require("component_lifecycle")
local meta_service = require("meta_service")
local envelope = require("envelope")
local component_command = require("component_command")
local committed_error = require("committed_error")

local REQUEST_FIELDS = {
    component_id = true,
    commands = true,
    expected_revision = true,
}

-- Constants
local VALIDATION_ERRORS = {
    INVALID_REQUEST = "Invalid request: must be a table",
    MISSING_COMPONENT_ID = "component_id is required and must be a non-empty string",
    MISSING_COMMANDS = "commands is required and must be a non-empty array",
    NO_ACTOR = "No authenticated actor found",
    INVALID_ACTOR = "Invalid actor ID"
}

local COMMAND_ERRORS = {
    INVALID_COMMAND = "must be a table",
    MISSING_TYPE = ".type is required and must be a string",
    MISSING_PAYLOAD = ".payload is required and must be a table",
    UNSUPPORTED_TYPE = ".type '%s' is not supported"
}

local DATABASE_ERRORS = {
    ACCESS_DENIED = "Insufficient access to perform requested operations",
    COMMAND_FAILED = "Command %d failed",
    REVISION_READ_FAILED = "Failed to read context revision",
    ACCESS_CHECK_FAILED = "Failed to check component access"
}

-- Supported command types and their required access levels. Public metadata and
-- private context can share one batch/transaction; access changes still go
-- through grant_subtree/revoke_subtree.
local COMMAND_ACCESS_REQUIREMENTS = {
    [ops.COMMAND_TYPES.SET_CONTEXT] = ops.ACCESS.WRITE,
    [ops.COMMAND_TYPES.PATCH_CONTEXT] = ops.ACCESS.WRITE,
    [ops.COMMAND_TYPES.SET_META] = ops.ACCESS.WRITE,
}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID }) :: error)
end

local function validate_commands(commands: { any }): (integer?, error?)
    local required_access = 0

    for i, command in ipairs(commands) do
        if type(command) ~= "table" then
            return nil, invalid("commands[" .. i .. "] " .. COMMAND_ERRORS.INVALID_COMMAND)
        end

        if not command.type or type(command.type) ~= "string" then
            return nil, invalid("commands[" .. i .. "]" .. COMMAND_ERRORS.MISSING_TYPE)
        end

        if not command.payload or type(command.payload) ~= "table" then
            return nil, invalid("commands[" .. i .. "]" .. COMMAND_ERRORS.MISSING_PAYLOAD)
        end

        local access_required = COMMAND_ACCESS_REQUIREMENTS[command.type]
        if not access_required then
            return nil, invalid("commands[" .. i .. "]" .. string.format(COMMAND_ERRORS.UNSUPPORTED_TYPE, command.type))
        end

        required_access = access_policy.combine(required_access, access_required)
    end

    return required_access, nil
end

local function handle(request_dto)
    if not request_dto or type(request_dto) ~= "table" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_REQUEST, errors.INVALID)
    end

    for field in pairs(request_dto) do
        if not REQUEST_FIELDS[field] then
            return envelope.fail("Undeclared request field: " .. tostring(field), errors.INVALID)
        end
    end

    if not request_dto.component_id or type(request_dto.component_id) ~= "string" or request_dto.component_id == "" then
        return envelope.fail(VALIDATION_ERRORS.MISSING_COMPONENT_ID, errors.INVALID)
    end

    if not request_dto.commands or type(request_dto.commands) ~= "table" or #request_dto.commands == 0 then
        return envelope.fail(VALIDATION_ERRORS.MISSING_COMMANDS, errors.INVALID)
    end

    local expected = request_dto.expected_revision
    if expected ~= nil and (type(expected) ~= "number" or expected < 0
        or expected ~= math.floor(expected) or expected == math.huge) then
        return envelope.fail("expected_revision must be a non-negative integer", errors.INVALID)
    end

    local actor, actor_err = security.actor()
    if actor_err then return envelope.from_error(actor_err, "Failed to resolve update actor") end
    if not actor then
        return envelope.fail(VALIDATION_ERRORS.NO_ACTOR, errors.PERMISSION_DENIED)
    end

    local user_id, actor_id_err = actor:id()
    if actor_id_err then return envelope.from_error(actor_id_err, "Failed to resolve update actor ID") end
    if not user_id or user_id == "" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_ACTOR, errors.PERMISSION_DENIED)
    end

    local required_access, validate_error = validate_commands(request_dto.commands)
    if validate_error then
        return envelope.from_error(validate_error)
    end

    local results = table.create(#request_dto.commands, 0)
    local changes_made = false
    local meta_changed = false
    local deleted_meta_keys: { any } = {}
    local public_meta_snapshot: any = nil
    local context_revision: any = nil
    local _, transaction_err = component_command.with_component_tx(function(tx: sql.Transaction, db: sql.DB): (any?, error?)
        local has_access, access_err = ops.check_user_access(tx, user_id, request_dto.component_id, required_access)
        if access_err then return nil, errors.wrap(access_err, DATABASE_ERRORS.ACCESS_CHECK_FAILED) end
        if not has_access then
            return nil, errors.new({kind = errors.PERMISSION_DENIED, message = DATABASE_ERRORS.ACCESS_DENIED})
        end
        if expected ~= nil then
            local revision_err = ops.check_context_revision(tx, request_dto.component_id, expected :: integer)
            if revision_err then return nil, errors.wrap(revision_err, "Failed to check context expectation") end
        end

        for i, command in ipairs(request_dto.commands) do
            local command_payload = {}
            for k, v in pairs(command.payload) do command_payload[k] = v end
            command_payload.component_id = request_dto.component_id
            local command_to_execute = {type = command.type :: string, payload = command_payload}
            local result, err_cmd = ops.dispatch(tx, db, command_to_execute)
            if err_cmd then return nil, errors.wrap(err_cmd, string.format(DATABASE_ERRORS.COMMAND_FAILED, i)) end
            if not result then return nil, component_command.response_error("command") end
            table.insert(results, result)
            if result.changes_made then
                changes_made = true
                if command.type == ops.COMMAND_TYPES.SET_META then
                    meta_changed = true
                    for _, key in ipairs((command.payload or {}).delete_keys or {}) do
                        deleted_meta_keys[#deleted_meta_keys + 1] = key
                    end
                end
            end
        end

        if meta_changed then
            local snapshot, snapshot_err = ops.public_meta_tx(tx, request_dto.component_id)
            if snapshot_err then return nil, errors.wrap(snapshot_err, "Failed to read component metadata snapshot") end
            if not snapshot then return nil, component_command.response_error("snapshot") end
            public_meta_snapshot = snapshot
        end
        if changes_made then
            local dbtype_raw, dbtype_err = db:type()
            if dbtype_err then return nil, errors.wrap(dbtype_err, "Failed to resolve database type") end
            if dbtype_raw == nil then return nil, component_command.response_error("dbtype") end
            local summary, summary_err = ops.component_summary_tx(tx, request_dto.component_id)
            if summary_err then return nil, errors.wrap(summary_err, "Failed to read component summary") end
            if not summary then return nil, component_command.response_error("summary") end
            local command_types: { string } = table.create(#request_dto.commands, 0)
            for i, command in ipairs(request_dto.commands) do command_types[i] = command.type end
            local lifecycle_err = component_lifecycle.updated({
                tx = tx,
                dbtype = tostring(dbtype_raw),
                component_id = request_dto.component_id,
                impl_id = tostring((summary :: any).impl_id),
                parent_id = (summary :: any).parent_id,
                command_types = command_types,
            })
            if lifecycle_err then return nil, errors.wrap(lifecycle_err, "Failed to record component lifecycle") end
        end
        local revision_err
        context_revision, revision_err = ops.context_revision_tx(tx, request_dto.component_id)
        if revision_err then return nil, errors.wrap(revision_err, DATABASE_ERRORS.REVISION_READ_FAILED) end
        if context_revision == nil then return nil, component_command.response_error("revision") end
        return true, nil
    end)
    if transaction_err then return envelope.from_error(transaction_err) end

    if changes_made then
        local committed_err = component_lifecycle.committed()
        if committed_err then
            return envelope.from_error(committed_error.new(committed_err), "Failed to notify committed component lifecycle")
        end
    end

    if meta_changed then
        local _, notify_err = meta_service.notify_access(request_dto.component_id, nil, {
            event = "component.meta.changed",
            component_id = request_dto.component_id,
            meta = public_meta_snapshot or {},
            deleted = deleted_meta_keys,
        })
        if notify_err then
            return envelope.from_error(committed_error.new(notify_err), "Failed to notify the component audience")
        end
    end

    return {
        component_id = request_dto.component_id,
        changes_made = changes_made,
        context_revision = context_revision,
        results = results,
        success = true,
        updated_at = time.now():utc():format_rfc3339()
    }
end

return { handle = handle }
