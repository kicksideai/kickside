local kb_search = require("kb_search")
local ctx = require("ctx")
local kb_render = require("kb_render")

local MAX_LIMIT = 50

-- Retrieval tool for the agentic query driver. The target KB is bound onto the
-- tool context (ctx.kb_id) by the driver; the agent supplies the search query
-- (and may call repeatedly with refined queries). Retrieval goes through the
-- control-plane facade (kb_search.query, no answer synthesis), so there is no
-- re-entry into the answering path.
local function handle(args: any, context: any)
    args = args or {}
    context = context or {}

    if not args.query or args.query == "" then
        return nil, errors.new({ message = "_query is required_", kind = errors.INVALID })
    end

    local kb_id = ctx.get("kb_id")
    if (type(kb_id) ~= "string" or kb_id == "") and type(context.kb_id) == "string" then
        kb_id = context.kb_id
    end
    if type(kb_id) ~= "string" or kb_id == "" then
        return nil, errors.new({ message = "_no knowledge base bound to this tool_", kind = errors.INVALID })
    end

    local limit = 25
    if args.limit ~= nil then
        if type(args.limit) ~= "number" or args.limit ~= math.floor(args.limit) or args.limit < 1 or args.limit > MAX_LIMIT then
            return nil, errors.new({ message = "limit must be an integer from 1 through " .. tostring(MAX_LIMIT), kind = errors.INVALID })
        end
        limit = args.limit :: integer
    end
    local offset = 0
    if args.cursor ~= nil then
        if type(args.cursor) ~= "string" or not string.match(args.cursor, "^%d+$") then
            return nil, errors.new({ message = "cursor must be a next_cursor value from a previous page", kind = errors.INVALID })
        end
        offset = tonumber(args.cursor) or -1
    end

    local result, err = kb_search.query(kb_id :: string, { query = args.query, limit = limit, offset = offset })
    if err or not result then
        return nil, errors.new({ message = tostring("_" .. tostring(err or "retrieval failed") .. "_"), kind = errors.INTERNAL })
    end

    local fields, fields_err = kb_render.requested_fields(args.fields)
    if fields_err then return nil, fields_err end
    local rows = {}
    for _, item in ipairs(result.items or {}) do
        rows[#rows + 1] = kb_render.result_summary(item, kb_id :: string, fields :: { [string]: boolean })
    end
    return { success = true, query = args.query, count = #rows, results = rows, next_cursor = result.next_offset and tostring(result.next_offset) or nil }, nil
end

return { handle = handle }
