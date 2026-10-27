local component = require("component")

local function failure(kind: string, message: string): error
    return (errors.new({kind = kind, message = message, retryable = false}) :: error)
end

local PAGE = 50

local function root_item(row: any): any
    local meta = type(row.meta) == "table" and row.meta or {}
    return {id = row.component_id, label = type(meta.title) == "string" and meta.title or "",
        icon = type(meta.icon) == "string" and meta.icon or ""}
end

-- roots names the given component_ids for grants Security already lists, or returns
-- one page of the components the caller administers for choosing a new grant root.
local function roots(args: any): (any?, error?)
    if type(args) ~= "table" then return nil, failure(errors.INVALID, "root catalog request is required") end
    local items = {}
    if args.component_ids ~= nil then
        if type(args.component_ids) ~= "table" then return nil, failure(errors.INVALID, "component_ids must be an array") end
        local ids = {}
        for _, id in ipairs(args.component_ids) do
            if type(id) ~= "string" or id == "" then return nil, failure(errors.INVALID, "component_ids must hold component IDs") end
            ids[#ids + 1] = id
        end
        if #ids == 0 then return {success = true, items = items}, nil end
        local rows, read_err = component.list_system({component_ids = ids,
            include = {meta = true, private_context = false}, limit = #ids})
        if read_err then return nil, read_err end
        for _, row in ipairs(rows) do items[#items + 1] = root_item(row) end
        return {success = true, items = items}, nil
    end
    local requested = args.offset or 0
    if type(requested) ~= "number" or requested < 0 or requested % 1 ~= 0 then
        return nil, failure(errors.INVALID, "offset must be a non-negative integer")
    end
    local offset = math.floor(requested)
    local rows, query_err = component.query({access_mask = component.ACCESS.ADMIN,
        include = {meta = true}, limit = PAGE + 1, offset = offset})
    if query_err then return nil, query_err end
    for index = 1, math.min(#rows, PAGE) do items[#items + 1] = root_item(rows[index]) end
    return {success = true, items = items, next_offset = #rows > PAGE and offset + PAGE or nil}, nil
end

return {roots = roots}
