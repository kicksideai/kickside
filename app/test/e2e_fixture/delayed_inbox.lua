local funcs = require("funcs")
local logger = require("logger")
local time = require("time")
local component = require("component")

local M = {}

function M.write(request: any): (any, any)
    if type(request.config) == "table" and type(request.config.resource_id) == "string" then
        local _, access_err = component.validate_access(request.config.resource_id, component.ACCESS.WRITE)
        if access_err ~= nil then return nil, access_err end
    end
    local result, err = funcs.call("kickside.inbox.sink:inbox_write", request)
    if err ~= nil or type(result) ~= "table" or result.success ~= true then
        return result, err
    end
    logger:named("app.test.e2e.delayed_inbox"):info("sink effect committed before receipt", {
        automation_id = request.automation_ref.id,
        item_key = request.input.metadata.item_key,
        identity_key = request.identity_key,
        idempotency_key = request.idempotency_key,
    })
    local delay_ms = type(request.config) == "table" and request.config.delay_ms or 10000
    time.sleep(tostring(delay_ms) .. "ms")
    return result, nil
end


return M
