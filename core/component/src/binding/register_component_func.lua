local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local security = require("security")
local ops = require("component_ops")
local component_command = require("component_command")
local committed_error = require("committed_error")
local access_policy = require("access_policy")
local component_lifecycle = require("component_lifecycle")
local envelope = require("envelope")

-- Constants
local VALIDATION_ERRORS = {
    INVALID_REQUEST = "Invalid request: must be a table",
    MISSING_IMPL_ID = "impl_id is required and must be a non-empty string",
    NO_ACTOR = "No authenticated actor found",
    INVALID_ACTOR = "Invalid actor ID",
    INVALID_PRIVATE_CONTEXT = "private_context must be a table",
    INVALID_META = "meta must be a table",
    INVALID_ADDITIONAL_ACCESS = "additional_access must be a table",
    INVALID_COMPONENT_ID = "component_id must be a non-empty string if provided",
    INVALID_PARENT_ID = "parent_id must be a non-empty string if provided",
    INVALID_POSITION = "position must be a non-empty string if provided",
    INVALID_THREAD = "thread must be a table if provided"
}

local function additional_access_error(index: integer, err: error): error
    return errors.new({ message = "additional_access[" .. index .. "]." .. err:message(),
        kind = err:kind(), retryable = err:retryable(), details = err:details() })
end

local function validate_additional_access(additional_access): error?
    for i, access_rule in ipairs(additional_access) do
        if type(access_rule) ~= "table" then
            return errors.new({ message = "additional_access[" .. i .. "] must be a table", kind = errors.INVALID })
        end
        if not access_rule.subject_id or type(access_rule.subject_id) ~= "string" or access_rule.subject_id == "" then
            return errors.new({ message = "additional_access[" .. i .. "].subject_id is required", kind = errors.INVALID })
        end
        local _, type_err = access_policy.normalize_subject_type(access_rule.subject_type)
        if type_err then
            return additional_access_error(i, type_err)
        end
        local mask, mask_err = access_policy.normalize_access_mask(access_rule.access_mask)
        if mask_err then
            return additional_access_error(i, mask_err)
        end
        access_rule.access_mask = mask
    end
    return nil
end

local function handle(request_dto)
    if not request_dto or type(request_dto) ~= "table" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_REQUEST, errors.INVALID)
    end

    if not request_dto.impl_id or type(request_dto.impl_id) ~= "string" or request_dto.impl_id == "" then
        return envelope.fail(VALIDATION_ERRORS.MISSING_IMPL_ID, errors.INVALID)
    end

    local actor = security.actor()
    if not actor then
        return envelope.fail(VALIDATION_ERRORS.NO_ACTOR, errors.PERMISSION_DENIED)
    end

    local user_id = actor:id()
    if not user_id or user_id == "" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_ACTOR, errors.PERMISSION_DENIED)
    end

    local private_context = request_dto.private_context or {}
    if type(private_context) ~= "table" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_PRIVATE_CONTEXT, errors.INVALID)
    end

    local meta = request_dto.meta or {}
    if type(meta) ~= "table" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_META, errors.INVALID)
    end

    local additional_access = request_dto.additional_access or {}
    if type(additional_access) ~= "table" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_ADDITIONAL_ACCESS, errors.INVALID)
    end

    local access_error = validate_additional_access(additional_access)
    if access_error then
        return envelope.from_error(access_error)
    end

    local component_id = request_dto.component_id
    if component_id and (type(component_id) ~= "string" or component_id == "") then
        return envelope.fail(VALIDATION_ERRORS.INVALID_COMPONENT_ID, errors.INVALID)
    end
    if not component_id then
        component_id = uuid.v7()
    end

    -- Placement args: omitted => root + end-of-siblings (handled by ops).
    local parent_id = request_dto.parent_id
    if parent_id ~= nil and (type(parent_id) ~= "string" or parent_id == "") then
        return envelope.fail(VALIDATION_ERRORS.INVALID_PARENT_ID, errors.INVALID)
    end

    local position = request_dto.position
    if position ~= nil and (type(position) ~= "string" or position == "") then
        return envelope.fail(VALIDATION_ERRORS.INVALID_POSITION, errors.INVALID)
    end

    local thread = request_dto.thread
    if thread ~= nil and type(thread) ~= "table" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_THREAD, errors.INVALID)
    end

    local _, transaction_err = component_command.with_component_tx(function(tx: sql.Transaction, db: sql.DB): (any?, error?)
        if parent_id ~= nil then
            local has_parent_access, parent_access_err = ops.check_user_access(tx, user_id, parent_id :: string, ops.ACCESS.WRITE)
            if parent_access_err then return nil, errors.wrap(parent_access_err, "Failed to check target parent access") end
            if not has_parent_access then
                return nil, errors.new({kind = errors.PERMISSION_DENIED,
                    message = "Insufficient access to create under the target parent"})
            end
        end

        local create_command = {
            type = ops.COMMAND_TYPES.CREATE_COMPONENT,
            payload = {
                component_id = component_id,
                impl_id = request_dto.impl_id,
                private_context = private_context,
                initial_meta = meta,
                actor_id = user_id,
                parent_id = parent_id,
                position = position
            }
        }
        local create_result, create_err = ops.dispatch(tx, db, create_command)
        if create_err then return nil, errors.wrap(create_err, "Failed to create component") end
        if not create_result then return nil, component_command.response_error("creation") end

        for _, access_rule in ipairs(additional_access) do
            local access_command = {
                type = ops.COMMAND_TYPES.GRANT_ACCESS,
                payload = {
                    component_id = component_id,
                    subject_id = access_rule.subject_id,
                    subject_type = access_rule.subject_type,
                    access_mask = access_rule.access_mask
                }
            }
            local access_result, access_err = ops.dispatch(tx, db, access_command)
            if access_err then return nil, errors.wrap(access_err, "Failed to grant additional access") end
            if not access_result then return nil, component_command.response_error("access") end
        end

        local dbtype_raw, dbtype_err = db:type()
        if dbtype_err then return nil, errors.wrap(dbtype_err, "Failed to resolve database type") end
        if dbtype_raw == nil then return nil, component_command.response_error("database_type") end

        local parent_impl_id: string? = nil
        if parent_id ~= nil then
            local parent_summary, parent_summary_err = ops.component_summary_tx(tx, parent_id :: string)
            if parent_summary_err then return nil, errors.wrap(parent_summary_err, "Failed to read parent component") end
            if parent_summary then parent_impl_id = tostring((parent_summary :: any).impl_id) end
        end
        local lifecycle_err = component_lifecycle.created({
            tx = tx,
            dbtype = tostring(dbtype_raw),
            component_id = component_id,
            impl_id = request_dto.impl_id,
            parent_id = parent_id,
            parent_impl_id = parent_impl_id,
            actor_id = user_id,
            meta = meta,
            thread = thread,
        })
        if lifecycle_err then return nil, errors.wrap(lifecycle_err, "Failed to record component lifecycle") end
        return true, nil
    end)
    if transaction_err then return envelope.from_error(transaction_err) end

    local committed_err = component_lifecycle.committed()
    if committed_err then
        return envelope.from_error(committed_error.new(committed_err), "Failed to notify committed component lifecycle")
    end

    return {
        component_id = component_id,
        impl_id = request_dto.impl_id,
        parent_id = parent_id,
        thread_id = thread ~= nil and component_id or nil,
        created_at = time.now():utc():format_rfc3339(),
        success = true
    }
end

return { handle = handle }
