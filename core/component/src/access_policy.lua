local component_types = require("component_types")

local M = {}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false,
        details = { code = "component_access_invalid" } }) :: error)
end

local function is_integer(value: any): boolean
    return type(value) == "number" and value == math.floor(value)
end

local function is_non_empty_string(value: any): boolean
    return type(value) == "string" and value ~= ""
end

function M.normalize_access_mask(value: any, default_value: integer?): (integer?, error?)
    if value == nil and default_value ~= nil then
        value = default_value
    end
    if not is_integer(value) or value < 0 or value > component_types.ACCESS.FULL then
        return nil, invalid("access_mask must be an integer between 0 and " .. tostring(component_types.ACCESS.FULL))
    end
    return value :: integer, nil
end

-- A grant subject type for a new grant or a revoke: user, group or service
-- (IDENTITY-1 §5). An absent type is a
-- typed INVALID at the caller: no default is applied here, so a missing
-- value can never silently become a user grant.
function M.normalize_subject_type(value: any): (string?, error?)
    if value == nil or value == "" then
        return nil, invalid("subject_type is required: one of user, group, service")
    end
    if value == component_types.SUBJECT_TYPES.USER or value == component_types.SUBJECT_TYPES.GROUP
        or value == component_types.SUBJECT_TYPES.SERVICE then
        return value :: string, nil
    end
    return nil, invalid("subject_type must be one of user, group, service")
end

-- The subject type is always required (IDENTITY-1 §5 typed ACL).
function M.normalize_share_subject(body: any): (any?, error?)
    if type(body) ~= "table" then
        return nil, invalid("subject body must be a table")
    end

    local id = body.subject_id
    if not is_non_empty_string(id) then
        return nil, invalid("subject_id is required")
    end

    local subject_type, type_err = M.normalize_subject_type(body.subject_type)
    if type_err then
        return nil, type_err
    end

    return {
        id = id :: string,
        subject_type = subject_type :: string,
    }, nil
end

function M.subtree_subject(subject: any): (any?, error?)
    if type(subject) ~= "table" then
        return nil, invalid("subject is required")
    end
    if not is_non_empty_string(subject.id) then
        return nil, invalid("subject id is required")
    end
    local subject_type, type_err = M.normalize_subject_type(subject.subject_type)
    if type_err then
        return nil, type_err
    end
    return { subject_id = subject.id, subject_type = subject_type :: string }, nil
end

-- Bitmask helpers (Lua 5.1 has no bit operators). An access mask is the capability
-- bits OR-ed together; this is the single place that math lives.

-- Whether mask carries every bit set in required -- the canonical access test,
-- equivalent to the SQL gate (access_mask & required) = required.
function M.has_all(mask: integer?, required: integer): boolean
    local m = mask or 0
    local bit = 1
    while bit <= required do
        if required % (bit * 2) >= bit and m % (bit * 2) < bit then
            return false
        end
        bit = bit * 2
    end
    return true
end

-- Union (OR) of two masks.
function M.combine(a: integer?, b: integer?): integer
    local x, y = a or 0, b or 0
    local result = 0
    local bit = 1
    local hi = math.max(x, y)
    while bit <= hi do
        if x % (bit * 2) >= bit or y % (bit * 2) >= bit then
            result = result + bit
        end
        bit = bit * 2
    end
    return result
end

return M
