-- Keyset pages over a collection ordered by a unique string key. A page holds
-- the rows whose key sorts after the cursor; next_cursor is the key of the last
-- row returned and is absent on the final page.

type Map = { [string]: any }

local M = {}

M.DEFAULT_LIMIT = 25
M.MAX_LIMIT = 100

local function invalid(message: string): error
    return errors.new({ message = message, kind = errors.INVALID, retryable = false })
end

-- args(input, max_limit?) validates the limit and cursor inputs of a tool call.
function M.args(input: any, max_limit: integer?): (integer?, string?, error?)
    local source: Map = type(input) == "table" and (input :: Map) or {}
    local maximum = max_limit or M.MAX_LIMIT
    local limit = source.limit
    if limit == nil then
        limit = math.min(M.DEFAULT_LIMIT, maximum)
    elseif type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > maximum then
        return nil, nil, invalid("limit must be an integer from 1 through " .. tostring(maximum))
    end
    local cursor = source.cursor
    if cursor ~= nil and (type(cursor) ~= "string" or cursor == "") then
        return nil, nil, invalid("cursor must be a next_cursor value from a previous page")
    end
    return limit :: integer, cursor :: string?, nil
end

-- page(rows, key, limit, cursor) orders rows by key(row) and returns the rows
-- after cursor, at most limit of them, with the cursor of the next page.
function M.page(rows: { any }?, key: (any) -> string, limit: integer, cursor: string?): ({ any }, string?)
    local ordered: { any } = {}
    for _, row in ipairs(rows or {}) do ordered[#ordered + 1] = row end
    table.sort(ordered, function(left: any, right: any): boolean return key(left) < key(right) end)
    local out: { any } = {}
    local more = false
    for _, row in ipairs(ordered) do
        if cursor == nil or key(row) > (cursor :: string) then
            if #out == limit then
                more = true
                break
            end
            out[#out + 1] = row
        end
    end
    return out, more and key(out[#out]) or nil
end

-- field(name) is the key function that reads a string field of each row.
function M.field(name: string): (any) -> string
    return function(row: any): string return tostring((row :: Map)[name]) end
end

return M
