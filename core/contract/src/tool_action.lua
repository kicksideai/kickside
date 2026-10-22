-- Multi-action agent tools. A tool input schema is one flat object whose
-- properties cover every action, because model providers accept only a plain
-- object at the schema root. Each action's contract names the fields it
-- requires and the optional fields it accepts; check enforces both before the
-- action runs and answers a typed INVALID error the model can act on.

type Map = { [string]: any }
type ActionContract = { required: { string }?, optional: { string }? }

local M = {}

local function invalid(message: string, details: Map): error
    return errors.new({ kind = errors.INVALID, message = message, retryable = false, details = details })
end

local function sorted_keys(map: { [string]: any }): { string }
    local keys: { string } = {}
    for key in pairs(map) do keys[#keys + 1] = key end
    table.sort(keys)
    return keys
end

-- check(args, contracts) -> (action, nil) | (nil, err). contracts maps each
-- action name to { required = {...}, optional = {...} }.
function M.check(args: any, contracts: { [string]: ActionContract }): (string?, error?)
    local input: Map = type(args) == "table" and (args :: Map) or {}
    local action = input.action
    local contract = type(action) == "string" and contracts[action :: string] or nil
    if not contract then
        local actions = sorted_keys(contracts)
        return nil, invalid("unknown action: " .. tostring(action or "") .. "; expected one of: " .. table.concat(actions, ", "),
            { field = "action", expected = actions })
    end
    local name = action :: string
    local accepted: { [string]: boolean } = { action = true }
    local missing: { string } = {}
    for _, field in ipairs(contract.required or {}) do
        accepted[field] = true
        if input[field] == nil then missing[#missing + 1] = field end
    end
    for _, field in ipairs(contract.optional or {}) do accepted[field] = true end
    if #missing > 0 then
        local message = missing[1] .. " is required for action=" .. name
        if #missing > 1 then message = message .. " (missing: " .. table.concat(missing, ", ") .. ")" end
        return nil, invalid(message, { action = name, missing = missing })
    end
    local rejected: { string } = {}
    for key in pairs(input) do
        if type(key) ~= "string" or not accepted[key] then rejected[#rejected + 1] = tostring(key) end
    end
    table.sort(rejected)
    if #rejected > 0 then
        local fields = sorted_keys(accepted)
        return nil, invalid("action=" .. name .. " does not accept " .. table.concat(rejected, ", ")
            .. "; accepted fields: " .. table.concat(fields, ", "), { action = name, rejected = rejected, accepted = fields })
    end
    return name, nil
end

return M
