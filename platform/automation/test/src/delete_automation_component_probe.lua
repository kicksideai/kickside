-- Test-only seam. It runs the real component client and the DELETE policy in
-- one actor/scope-bound function frame, so the regression sees the exact error
-- object component.validate_access produces in a running component harness.

local component = require("component")
local delete_automation = require("delete_automation")
local errors = require("errors")
local security = require("security")

local M = {}

function M.run(args: any): (any?, any)
    local component_id = type(args) == "table" and (args :: any).component_id or nil
    if type(component_id) ~= "string" or component_id == "" then
        return nil, "component_id is required"
    end

    local _, access_err = component.validate_access(component_id, component.ACCESS.DELETE)
    if access_err == nil then return nil, "expected missing component access error" end

    local raw_kind: any = nil
    if type((access_err :: any).kind) == "function" then
        raw_kind = (access_err :: any):kind()
    else
        raw_kind = (access_err :: any).kind
    end

    local status, body = delete_automation.response_for(security.actor(), component_id, nil, {
        component = component,
        automations_lib = {
            delete_automation = function(): (any?, any)
                return nil, "delete must not run for a missing component"
            end,
        },
    })

    return {
        error_type = type(access_err),
        kind_type = type(raw_kind),
        kind = tostring(raw_kind),
        is_not_found = errors.is(access_err, errors.NOT_FOUND),
        status = status,
        body = body,
    }, nil
end

return M
