-- Id-set helpers for the master agent traits: the trait curator tracks the set of
-- dynamically-activated trait ids (in session context), and the roster builds id
-- lists. One place owns "normalize a context value into a clean id list" plus the
-- add/remove/has/union set ops, so every caller stays aligned. Pure, never mutates
-- its inputs.

local M = {}

-- Normalize a context value into a de-duplicated list of non-empty string ids, in
-- first-seen order. Accepts an array (trait/session context) or a comma/space
-- separated string (a flat form field); anything else yields an empty list.
function M.parse(v: any): { string }
    local out: { string } = {}
    local seen: { [string]: boolean } = {}
    local function push(id: string)
        if id ~= "" and not seen[id] then
            seen[id] = true
            out[#out + 1] = id
        end
    end
    if type(v) == "table" then
        for _, id in ipairs(v :: { any }) do
            if type(id) == "string" then push(id :: string) end
        end
    elseif type(v) == "string" then
        for id in string.gmatch(v :: string, "[^,%s]+") do push(id) end
    end
    return out
end

function M.has(list: { string }, id: string): boolean
    for _, v in ipairs(list) do
        if v == id then return true end
    end
    return false
end

-- Return a new list with id appended if absent; never mutates the input.
function M.add(list: { string }, id: string): { string }
    local out: { string } = {}
    for _, v in ipairs(list) do out[#out + 1] = v end
    if id ~= "" and not M.has(out, id) then out[#out + 1] = id end
    return out
end

-- Return a new list with every occurrence of id removed.
function M.remove(list: { string }, id: string): { string }
    local out: { string } = {}
    for _, v in ipairs(list) do
        if v ~= id then out[#out + 1] = v end
    end
    return out
end

-- Concatenate two lists into one de-duplicated list, base ids first. Used to fold
-- the curator's dynamic activations on top of the agent's configured base traits.
function M.union(base: { string }, extra: { string }): { string }
    local out: { string } = {}
    local seen: { [string]: boolean } = {}
    local function push(id: string)
        if id ~= "" and not seen[id] then
            seen[id] = true
            out[#out + 1] = id
        end
    end
    for _, v in ipairs(base) do push(v) end
    for _, v in ipairs(extra) do push(v) end
    return out
end

return M
