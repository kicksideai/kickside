local events = require("inbox_events")
local resolve = require("inbox_resolve")

local function run(input: any): any
    if input.operation == "resolve" then
        return resolve.apply(input.id, "dismiss", {})
    end
    local id, create_err = events.create({ id = input.id, item_type = "notice", title = "Early deletion",
        content = "Durable body", idempotency_key = input.id .. ":create" })
    if create_err then return nil, create_err end
    if not id then return nil, errors.new({ kind = errors.INTERNAL, message = "create returns no item id" }) end
    local get = events.get
    events.get = function() return nil, nil end
    local ok, err = events.delete(id, input.id .. ":delete")
    events.get = get
    return { deleted = ok, error_kind = err and errors.is(err, errors.NOT_FOUND) or false }
end
return { run = run }
