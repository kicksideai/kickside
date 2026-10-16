local http_errors = require("http_errors")
local util = require("util")

local M = {}

local function copy_json(value: any): any
    if type(value) ~= "table" then return value end
    local out: { [any]: any } = {}
    for key, child in pairs(value :: { [any]: any }) do
        out[key] = copy_json(child)
    end
    return out
end

local function failure(stage: string, err: any, fallback: string, status: integer?): any
    local message = fallback
    local resolved_status = status
    if type(err) == "table" then
        local e = err :: { [string]: any }
        if e.message ~= nil then message = tostring(e.message) end
        if e.status ~= nil then resolved_status = tonumber(e.status) or resolved_status end
    elseif err ~= nil then
        resolved_status = http_errors.classify(err)
        message = tostring(err)
    end
    return { stage = stage, message = message, status = resolved_status }
end

local function has_fields(fields: any): boolean
    return type(fields) == "table" and next(fields :: { [any]: any }) ~= nil
end

-- Build two independent JSON trees: the exact persisted snapshot used only for
-- compensation, and the desired config with descriptor defaults plus the patch.
-- Keeping this here makes the saga's rollback input impossible to mutate while
-- constructing or sending the forward write.
function M.config_plan(current: any, patch: any, apply_defaults: any): (any?, string?)
    if type(patch) ~= "table" then return nil, "config patch must be a table" end
    if type(apply_defaults) ~= "function" then return nil, "default config merger is required" end

    local current_config: any = copy_json(current)
    if type(current_config) ~= "table" then current_config = {} end
    local effective_config = apply_defaults(copy_json(current_config))
    if type(effective_config) ~= "table" then
        return nil, "default config merger must return a table"
    end
    local desired_config = copy_json(effective_config)
    for key, value in pairs(patch :: { [any]: any }) do
        desired_config[key] = copy_json(value)
    end
    return {
        current_config = current_config,
        effective_config = effective_config,
        desired_config = desired_config,
    }, nil
end

-- Coordinate the two separately owned representations of a KB update. Component
-- metadata stays behind component.set_meta and engine config stays behind the
-- kb_store_lifecycle contract. The only cross-boundary mechanism here is a saga:
-- prepare every fallible read first, write the engine store, then compensate that
-- exact store snapshot if the component write fails.
function M.apply(component_id: string, changes: any, collaborators: any): (boolean?, any?)
    local c = collaborators :: { [string]: any }
    local meta_fields = type(changes) == "table" and changes.meta_fields or nil
    local config_patch = type(changes) == "table" and changes.config_patch or nil
    local update_meta = has_fields(meta_fields)
    local update_config = config_patch ~= nil

    local config_plan: any = nil
    if update_config then
        local component_row, component_err = c.get_component(component_id)
        if component_err or not component_row then
            return nil, failure("component_preflight", component_err,
                "knowledge base not found", 404)
        end

        local plan, plan_err = c.prepare_config(component_id, component_row, config_patch)
        if plan_err or type(plan) ~= "table" then
            return nil, failure("config_preflight", plan_err,
                "failed to prepare knowledge base config", 500)
        end
        config_plan = plan
    end

    if update_config then
        local updated, update_err = c.update_config(component_id, config_plan, config_plan.desired_config)
        if update_err or not updated then
            return nil, failure("config_update", update_err,
                "config update failed", 500)
        end
    end

    local function rollback_config(problem: any): any
        if not update_config then return problem end
        local restored, restore_err = c.update_config(component_id, config_plan, config_plan.current_config)
        if restore_err or not restored then
            problem.status = 500
            problem.rollback = failure("config_rollback", restore_err, "config rollback failed", 500)
        end
        return problem
    end

    if update_config then
        local methods = {}
        for method in pairs(config_plan.config_maintenance or {}) do methods[#methods + 1] = method end
        table.sort(methods)
        for _, method in ipairs(methods) do
            local changed = false
            for _, key in ipairs(config_plan.config_maintenance[method]) do
                if not util.same_value(config_plan.effective_config[key], config_plan.desired_config[key]) then
                    changed = true
                    break
                end
            end
            if changed then
                local requested, request_err = c.request_maintenance(component_id, config_plan, method)
                if request_err or not requested then
                    return nil, rollback_config(failure("maintenance_request", request_err, "maintenance request failed", 500))
                end
            end
        end
    end

    if update_meta then
        local meta_ok, meta_err = c.set_meta(component_id, meta_fields)
        if not meta_ok then
            return nil, rollback_config(failure("metadata_update", meta_err, "component metadata update failed", 500))
        end
    end

    return true, nil
end

return M
