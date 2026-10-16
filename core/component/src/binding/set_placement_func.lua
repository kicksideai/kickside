local sql = require("sql")
local security = require("security")
local ops = require("component_ops")
local envelope = require("envelope")
local component_command = require("component_command")
local committed_error = require("committed_error")
local component_lifecycle = require("component_lifecycle")

local function handle(request_dto)
    if not request_dto or type(request_dto) ~= "table" then
        return envelope.fail("Invalid request: must be a table", errors.INVALID)
    end

    if not request_dto.component_id or type(request_dto.component_id) ~= "string" or request_dto.component_id == "" then
        return envelope.fail("component_id is required and must be a non-empty string", errors.INVALID)
    end

    -- parent_id is optional; an explicit nil/false moves the component to root.
    local has_parent_arg = request_dto.parent_id ~= nil
    local parent_id = request_dto.parent_id
    if parent_id ~= nil and parent_id ~= false and (type(parent_id) ~= "string" or parent_id == "") then
        return envelope.fail("parent_id must be a non-empty string, false, or null", errors.INVALID)
    end
    if parent_id == false then
        parent_id = nil
    end

    local position = request_dto.position
    if position ~= nil and (type(position) ~= "string" or position == "") then
        return envelope.fail("position must be a non-empty string if provided", errors.INVALID)
    end

    local actor, actor_err = security.actor()
    if actor_err then return envelope.from_error(actor_err, "Failed to resolve placement actor") end
    if not actor then
        return envelope.fail("No authenticated actor found", errors.PERMISSION_DENIED)
    end
    local user_id, actor_id_err = actor:id()
    if actor_id_err then return envelope.from_error(actor_id_err, "Failed to resolve placement actor ID") end
    if not user_id or user_id == "" then
        return envelope.fail("Invalid actor ID", errors.PERMISSION_DENIED)
    end

    local result: any = nil
    local _, transaction_err = component_command.with_component_tx(function(tx: sql.Transaction, db: sql.DB): (any?, error?)
        -- WRITE access on the moved component.
        local has_access, access_err = ops.check_user_access(tx, user_id, request_dto.component_id, ops.ACCESS.WRITE)
        if access_err then
            return nil, errors.wrap(access_err, "Failed to check component access")
        end
        if not has_access then
            return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Insufficient access to place this component"})
        end

        -- Moving a component into a parent mutates that parent's child set. Require
        -- WRITE on the target parent as well as WRITE on the moved component.
        if parent_id ~= nil then
            local has_parent_access, parent_access_err = ops.check_user_access(tx, user_id, parent_id :: string, ops.ACCESS.WRITE)
            if parent_access_err then
                return nil, errors.wrap(parent_access_err, "Failed to check target parent access")
            end
            if not has_parent_access then
                return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Insufficient access to place under the target parent"})
            end
        end

        local err
        result, err = ops.dispatch(tx, db, {
            type = ops.COMMAND_TYPES.SET_PLACEMENT,
            payload = {
                component_id = request_dto.component_id,
                has_parent_arg = has_parent_arg,
                parent_id = parent_id,
                position = position
            }
        })

        if err then
            return nil, err
        end

        if not result then return nil, component_command.response_error("command") end
        if result.changes_made then
            local dbtype_raw, dbtype_err = db:type()
            if dbtype_err then
                return nil, errors.wrap(dbtype_err, "Failed to resolve database type")
            end

            if dbtype_raw == nil then return nil, component_command.response_error("dbtype") end
            local summary, summary_err = ops.component_summary_tx(tx, request_dto.component_id)
            if summary_err then return nil, errors.wrap(summary_err, "Failed to read component summary") end
            if not summary then return nil, component_command.response_error("summary") end

            local parent_impl_id: string? = nil
            if result.parent_id ~= nil then
                local parent_summary, parent_summary_err = ops.component_summary_tx(tx, result.parent_id :: string?)
                if parent_summary_err then
                    return nil, errors.wrap(parent_summary_err, "Failed to read parent component")
                end
                if parent_summary then parent_impl_id = tostring((parent_summary :: any).impl_id) end
            end

            local previous_parent_impl_id: string? = nil
            if result.previous_parent_id ~= nil then
                local previous_summary, previous_summary_err = ops.component_summary_tx(tx, result.previous_parent_id :: string?)
                if previous_summary_err then
                    return nil, errors.wrap(previous_summary_err, "Failed to read previous parent component")
                end
                if previous_summary then previous_parent_impl_id = tostring((previous_summary :: any).impl_id) end
            end

            local lifecycle_err = component_lifecycle.updated({
                tx = tx,
                dbtype = tostring(dbtype_raw),
                component_id = request_dto.component_id,
                impl_id = tostring((summary :: any).impl_id),
                parent_id = result.parent_id,
                parent_impl_id = parent_impl_id,
                previous_parent_id = result.previous_parent_id,
                previous_parent_impl_id = previous_parent_impl_id,
                position = result.position,
                previous_position = result.previous_position,
                command_types = { ops.COMMAND_TYPES.SET_PLACEMENT },
            })
            if lifecycle_err then
                return nil, errors.wrap(lifecycle_err, "Failed to record component lifecycle")
            end
        end

        return true, nil
    end)
    if transaction_err then return envelope.from_error(transaction_err) end

    if result.changes_made then
        local committed_err = component_lifecycle.committed()
        if committed_err then
            return envelope.from_error(committed_error.new(committed_err), "Failed to notify committed component lifecycle")
        end
    end

    return {
        component_id = result.component_id,
        parent_id = result.parent_id,
        position = result.position,
        changes_made = result.changes_made,
        success = true
    }
end

return { handle = handle }
