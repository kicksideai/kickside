-- Harness-only data port handlers: an empty final source page and a no-op sink.

local ctx = require("ctx")

local function pull(_args: any): (any, any)
    return { items = {}, has_more = false }, nil
end

-- record_keys lists the fixture records' keys: one empty, final page.
local function record_keys(_args: any): (any, any)
    return { success = true, keys = {}, next_cursor = "", has_more = false }, nil
end

local function write(_args: any): (any, any)
    return { success = true, result = "noop" }, nil
end

local function source_schema(_args: any): (any, any)
    local id = ctx.get("component_id")
    if type(id) ~= "string" or id == "" or id:match("^%s") or id:match("%s$") then
        return nil, errors.new({ kind = errors.INVALID, message = "source schema needs a resolved component" })
    end
    return { context_schema = { type = "object", properties = { title = { type = "string" } } } }, nil
end

return { pull = pull, record_keys = record_keys, write = write, source_schema = source_schema }
