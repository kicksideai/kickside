local ctx = require("ctx")

local M = {}

function M.get_status(args: any): (any, string?)
    local component_id = ctx.get("component_id")
    if not component_id or component_id == "" then
        return nil, "component_id not in scope"
    end
    return { success = true, status = "connected" }, nil
end

function M.test_connection(args: any): (any, nil)
    return { success = true }, nil
end

function M.discover_resources(args: any): (any, nil)
    return { success = true, resources = {} }, nil
end

function M.delete(args: any): (any, nil)
    return { success = true }, nil
end

function M.send_reply(args: any): (any, nil)
    return { ok = true }, nil
end

function M.update_reply(args: any): (any, nil)
    return { success = true }, nil
end

function M.send_status(args: any): (any, nil)
    return { success = true, rendered = false }, nil
end

return M
