-- Strict HTTP parameter parsing shared by core endpoints. Handlers should reject
-- malformed boundary input before it reaches contracts or persistence.

local http = require("http")

local M = {}

type IntOptions = {
    min: integer?,
    max: integer?,
}

local function bounds_message(name: string, opts: IntOptions?): string
    local min_value = opts and opts.min or nil
    local max_value = opts and opts.max or nil
    if min_value ~= nil and max_value ~= nil then
        return name .. " must be between " .. tostring(min_value) .. " and " .. tostring(max_value)
    end
    if min_value ~= nil then
        return name .. " must be >= " .. tostring(min_value)
    end
    if max_value ~= nil then
        return name .. " must be <= " .. tostring(max_value)
    end
    return name .. " is out of range"
end

local function invalid_parameter(key: string, message: string): error
    return errors.new({ kind = errors.INVALID, message = message, retryable = false,
        details = { code = "invalid_query_parameter", parameter = key } })
end

function M.query_int(req: any, key: string, default_value: integer?, opts: IntOptions?): (integer?, error?)
    local raw = req:query(key)
    if raw == nil or raw == "" then
        return default_value, nil
    end
    if type(raw) ~= "string" then
        return nil, invalid_parameter(key, key .. " must be an integer")
    end
    local value = tonumber(raw)
    if not value or value ~= math.floor(value) then
        return nil, invalid_parameter(key, key .. " must be an integer")
    end
    local int_value = value :: integer
    if opts and opts.min ~= nil and int_value < opts.min then
        return nil, invalid_parameter(key, bounds_message(key, opts))
    end
    if opts and opts.max ~= nil and int_value > opts.max then
        return nil, invalid_parameter(key, bounds_message(key, opts))
    end
    return int_value, nil
end

function M.query_bool(req: any, key: string, default_value: boolean): (boolean, error?)
    local raw = req:query(key)
    if raw == nil or raw == "" then
        return default_value, nil
    end
    if raw == "true" then return true, nil end
    if raw == "false" then return false, nil end
    return default_value, invalid_parameter(key, key .. " must be true or false")
end

function M.bad_request(res: any, message: string, err: error?): ()
    res:set_status(http.STATUS.BAD_REQUEST)
    local body: { [string]: any } = { success = false, error = message }
    if err then
        body.kind, body.retryable, body.details = err:kind(), err:retryable(), err:details()
    end
    res:write_json(body)
end

return M
