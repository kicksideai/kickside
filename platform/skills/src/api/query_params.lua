local http = require("http")

local M = {}

type IntOptions = {
    min: integer?,
    max: integer?,
}

local function bounds_error(name: string, opts: IntOptions?): string
    local min_value = opts and opts.min or nil
    local max_value = opts and opts.max or nil
    if min_value ~= nil and max_value ~= nil then
        return name .. " must be between " .. tostring(min_value) .. " and " .. tostring(max_value)
    end
    if min_value ~= nil then return name .. " must be >= " .. tostring(min_value) end
    if max_value ~= nil then return name .. " must be <= " .. tostring(max_value) end
    return name .. " is out of range"
end

function M.query_int(req: any, key: string, default_value: integer?, opts: IntOptions?): (integer?, string?)
    local raw = req:query(key)
    if raw == nil or raw == "" then return default_value, nil end
    if type(raw) ~= "string" then return nil, key .. " must be an integer" end

    local value = tonumber(raw)
    if not value or value ~= math.floor(value) then
        return nil, key .. " must be an integer"
    end

    local int_value = value :: integer
    if opts and opts.min ~= nil and int_value < opts.min then return nil, bounds_error(key, opts) end
    if opts and opts.max ~= nil and int_value > opts.max then return nil, bounds_error(key, opts) end
    return int_value, nil
end

function M.bad_request(res: any, message: string): ()
    res:set_status(http.STATUS.BAD_REQUEST)
    res:write_json({ success = false, error = message })
end

return M
