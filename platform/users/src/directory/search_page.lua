local users = require("user_directory_repo")
local catalog = require("directory_catalog")
local cursor_codec = require("search_cursor")
local M = {}

local function bounded_limit(value: any): integer
    if type(value) ~= "number" or value ~= math.floor(value) then return 20 end
    return math.max(1, math.min(100, value)) :: integer
end

local function continued(principals: any, position: any, query: string, want: any): (any?, any?)
    local cursor, err = cursor_codec.encode(position, query, want)
    if err then return nil, err end
    return { principals = principals, has_more = true, cursor = cursor }, nil
end

function M.search(input: any): (any?, any?)
    input = type(input) == "table" and input or {}
    if input.query ~= nil and type(input.query) ~= "string" then
        return nil, errors.new({ kind = errors.INVALID, message = "principal search query must be a string" })
    end
    local query = string.lower(input.query or "")
    local limit = bounded_limit(input.limit)
    local want = { user = true, group = true }
    if type(input.kinds) == "table" and #input.kinds > 0 then
        want = { user = false, group = false }
        for _, kind in ipairs(input.kinds) do if kind == "user" or kind == "group" then want[kind] = true end end
    end
    local cursor, cursor_err = cursor_codec.decode(input.cursor, query, want)
    if cursor_err then return nil, cursor_err end
    local plane = cursor and cursor.plane or (want.user and "user" or "group")
    local principals = {}
    if plane == "user" and want.user then
        local page, err = users.search({ query = query, limit = limit, after = cursor and cursor.user_after })
        if err then
            return nil, errors.new({ kind = errors.UNAVAILABLE, message = "principal user search: " .. tostring(err), retryable = true })
        end
        for _, row in ipairs(page.users) do
            principals[#principals + 1] = { type = "user", id = row.user_id,
                label = row.full_name ~= nil and row.full_name ~= "" and row.full_name or (row.email or row.user_id),
                sublabel = row.email or "" }
        end
        if page.has_more then return continued(principals, { plane = "user", user_after = page.next_after }, query, want) end
        cursor = nil
    end
    if not want.group then return { principals = principals, has_more = false }, nil end
    local groups, groups_err = catalog.groups()
    if groups_err then return nil, groups_err end
    local after = cursor and cursor.group_after or ""
    local last = after
    for _, group in ipairs(groups) do
        if group.id > after and (string.lower(group.label):find(query, 1, true)
            or string.lower(group.id):find(query, 1, true)) then
            if #principals == limit then
                return continued(principals, { plane = "group", group_after = last }, query, want)
            end
            principals[#principals + 1] = { type = "group", id = group.id, label = group.label, sublabel = group.id }
            last = group.id
        end
    end
    return { principals = principals, has_more = false }, nil
end

return M
