-- GET /threads — list threads the actor can read. Query: ?thread_class&limit.
-- Response: { success, threads, items }. `threads` is the raw thread rows;
-- `items` is the canonical picker envelope: one flat { id, label, icon } per row.

local http = require("http")
local json = require("json")
local http_errors = require("http_errors")
local error_envelope = require("error_envelope")
local contract = require("threads_contract")
local http_params = require("http_params")

-- thread_item projects a thread row to a picker item. The id is the thread's
-- component id. The label is the component's human title (component_title, from the
-- component's public meta), falling back to a title/name recorded in the thread
-- attrs, then to the id -- so a component-backed thread that keeps its name on the
-- component rather than in attrs still renders by name, never a bare id. The icon
-- comes from the component meta likewise.
local function thread_item(row: { [string]: any }): { [string]: any }
    local id = row.component_id or row.id or ""
    local label = type(row.component_title) == "string" and row.component_title or ""
    if label == "" then
        local attrs: any = row.attrs
        if type(attrs) == "string" and attrs ~= "" then
            local decoded = json.decode(attrs)
            if type(decoded) == "table" then attrs = decoded else attrs = nil end
        end
        if type(attrs) == "table" then
            label = (attrs :: { [string]: any }).title or (attrs :: { [string]: any }).name or ""
        end
    end
    if type(label) ~= "string" or label == "" then label = tostring(id) end
    local icon = type(row.component_icon) == "string" and row.component_icon ~= "" and row.component_icon
        or (type(row.icon) == "string" and row.icon or "")
    return { id = id, label = label, icon = icon }
end

local function handler(): ()
    local req = http.request()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)

    local args: { [string]: any } = {}
    local thread_class = req:query("thread_class")
    if type(thread_class) == "string" and thread_class ~= "" then
        args.thread_class = thread_class
    end
    local limit, limit_err = http_params.query_int(req, "limit", nil, { min = 1, max = 1000 })
    if limit_err then
        http_params.bad_request(res, limit_err:message(), limit_err)
        return
    end
    if limit ~= nil then
        args.limit = limit
    end

    local result, list_err = contract.list(args)
    if not list_err then
        result, list_err = error_envelope.binding(result, nil, nil, "Read list threads", "core_http_read_response")
    end
    if list_err then
        res:set_status((http_errors.classify(list_err :: error)))
        res:write_json(http_errors.response(list_err))
        return
    end

    local threads = ((result :: any).threads or {}) :: { { [string]: any } }
    local items: { { [string]: any } } = {}
    for _, row in ipairs(threads) do
        items[#items + 1] = thread_item(row)
    end
    res:write_json({ success = true, threads = threads, items = items })
end

return { handler = handler, thread_item = thread_item }
