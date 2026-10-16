-- SubmitToInbox tool: an agent escalates an item into the human review inbox
-- (HIL). It appends the canonical kickside.inbox.events:item.created event onto the
-- authenticated actor's inbox component thread through the in-module writer. The
-- human sees it in their inbox and approves / rejects / dismisses it; this tool
-- only enqueues -- it does not wait for or resolve the outcome.

local writer = require("inbox_writer")
local security = require("security")

local VALID_PRIORITY = { low = true, normal = true, high = true, urgent = true }

local function non_empty_string(value)
    return type(value) == "string" and value ~= ""
end

local function handle(args)
    args = args or {}

    if type(args.title) ~= "string" or not args.title:find("%S") then
        return nil, errors.new({ message = "title is required", kind = errors.INVALID })
    end

    local priority = args.priority
    if priority ~= nil and not VALID_PRIORITY[priority] then
        return nil, errors.new({ message = "priority must be one of low, normal, high, urgent", kind = errors.INVALID })
    end

    local actor = security.actor()
    if not actor or not non_empty_string(actor:id()) then
        return nil, errors.new({ message = "authenticated actor is required", kind = errors.PERMISSION_DENIED })
    end

    local item_type = args.item_type
    if type(item_type) ~= "string" or item_type == "" then
        item_type = "notice"
    end

    local data, err = writer.create({
        item_type = item_type,
        title = args.title,
        content = args.content,
        priority = priority or "normal",
        metadata = args.metadata,
        trace_context = args.trace_context,
    })
    if err then
        return nil, errors.new({ message = tostring(err), kind = errors.INTERNAL })
    end
    return { success = true, id = data and data.id or nil }
end

return { handle = handle }
