-- POST /inbox — enqueue an inbox item. Body: { item_type, title, content?,
-- metadata?, source_id?, priority?, trace_context? }. The acting user is recorded
-- as actor_id; live UI refresh is emitted on the owner inbox component event topic.
-- Modules can also create items in-process via the writer library or the
-- kickside.inbox:inbox contract.

local http = require("http")
local json = require("json")
local security = require("security")
local writer = require("inbox_writer")
local inbox_types = require("inbox_types")

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, perr = json.decode(raw)
    if perr or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid json" })
        return
    end
    local b = body :: { [string]: any }

    local actor = security.actor()
    local actor_id = actor and actor:id() or nil
    if type(actor_id) ~= "string" or actor_id == "" then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local params = ({
        item_type = b.item_type, title = b.title, content = b.content, files = b.files,
        metadata = b.metadata, source_id = b.source_id, priority = b.priority,
        trace_context = b.trace_context,
    }) :: inbox_types.InboxCreateParams
    local data, err = writer.create(params)
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, item = data })
end

return { handler = handler }
