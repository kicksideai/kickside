local kb_search = require("kb_search")
local ctx = require("ctx")
local kb_render = require("kb_render")

local MAX_QUERY_LIMIT = 100

-- The trait's configured kb_ids arrive via the runtime context module (the
-- compiler binds trait_contexts onto the tool ctx); the context param serves
-- unit-test injection.
local function resolve_kb_ids(args: any, context: any): any
    local from_ctx = ctx.get("kb_ids")
    if type(from_ctx) == "table" and #from_ctx > 0 then return from_ctx end
    if type(context.kb_ids) == "table" and #context.kb_ids > 0 then return context.kb_ids end
    return args.kb_ids
end

local function normalize_limit(value: any): (integer?, string?)
    if value == nil or value == "" then return 25, nil end
    if type(value) ~= "number" or value ~= math.floor(value) then
        return nil, "limit must be an integer"
    end
    local n = value :: integer
    if n < 1 or n > MAX_QUERY_LIMIT then
        return nil, "limit must be between 1 and " .. tostring(MAX_QUERY_LIMIT)
    end
    return n, nil
end

-- Returns { query, count, results }: every ranked result is the engine's full
-- item with its kb_id; failures use the typed invocation error return.
local function handle(args: any, context: any): (any, error?)
    args = args or {}
    context = context or {}

    if not args.query or args.query == "" then
        return nil, errors.new({ message = "_query is required_", kind = errors.INVALID })
    end

    local kb_ids = resolve_kb_ids(args, context)
    if args.kb_id ~= nil then
        if type(args.kb_id) ~= "string" or args.kb_id == "" then
            return nil, errors.new({ message = "kb_id must be a non-empty string", kind = errors.INVALID })
        end
        if type(kb_ids) == "table" and #kb_ids > 0 then
            local configured = false
            for _, id in ipairs(kb_ids) do
                if id == args.kb_id then configured = true break end
            end
            if not configured then
                return nil, errors.new({ message = "kb_id not in configured knowledge bases", kind = errors.PERMISSION_DENIED })
            end
        end
        kb_ids = { args.kb_id }
    end
    if not kb_ids or type(kb_ids) ~= "table" or #kb_ids == 0 then
        return nil, errors.new({ message = "_no knowledge bases configured for this trait_ Use FindKnowledgeBases to discover an accessible knowledge base and pass its id as kb_id, or configure this trait with kb_ids.", kind = errors.INVALID })
    end

    local limit, limit_err = normalize_limit(args.limit)
    if limit_err then
        return nil, errors.new({ message = limit_err, kind = errors.INVALID })
    end
    local fields, fields_err = kb_render.requested_fields(args.fields)
    if fields_err then return nil, fields_err end
    local base, offset = 1, 0
    if args.cursor ~= nil then
        if type(args.cursor) ~= "string" then
            return nil, errors.new({ message = "cursor must be a next_cursor value from a previous page", kind = errors.INVALID })
        end
        local base_text, offset_text = string.match(args.cursor, "^([1-9]%d*):(%d+)$")
        base, offset = tonumber(base_text) or 0, tonumber(offset_text) or -1
        if base < 1 or base > #kb_ids or offset < 0 or offset == math.huge then
            return nil, errors.new({ message = "cursor must be a next_cursor value from a previous page", kind = errors.INVALID })
        end
    end
    local all_results = {}
    local failures: { string } = {}

    -- Query each KB through the control-plane facade so graph KBs are dispatched
    -- by knowledge, never by reaching into a provider's queryable directly.
    local next_cursor: string? = nil
    for index = base, #kb_ids do
        local kb_id = kb_ids[index]
        local result, query_err = kb_search.query(kb_id :: string, {
            query = args.query,
            limit = (limit :: integer) - #all_results,
            offset = offset,
        })
        if not query_err and result then
            for _, item in ipairs(result.items or {}) do
                table.insert(all_results, kb_render.result_summary(item, kb_id, fields :: { [string]: boolean }))
            end
            if result.next_offset ~= nil then
                next_cursor = tostring(index) .. ":" .. tostring(result.next_offset)
                break
            end
            offset = 0
            if #all_results >= (limit :: integer) then
                if index < #kb_ids then next_cursor = tostring(index + 1) .. ":0" end
                break
            end
        else
            failures[#failures + 1] = tostring(kb_id) .. ": " .. tostring(query_err or "query returned no result")
        end
    end
    if #failures > 0 then
        return nil, errors.new({ message = "knowledge query failed: " .. table.concat(failures, "; "), kind = errors.INTERNAL })
    end

    return { success = true, query = args.query, count = #all_results, results = all_results, next_cursor = next_cursor }, nil
end

return { handle = handle }
