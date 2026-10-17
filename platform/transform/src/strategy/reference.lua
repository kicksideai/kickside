-- Strategy resource references (design v5 §6.2; CONTRACTS §14): the helpers
-- every kickside.transform:strategy binding uses to declare the resources its
-- configuration uses (describe) and to restrict each call to the intersection
-- of the operator's and the execution principal's grants on them (authorize).
-- A reference is { resource_id, required_mask } (mask defaults to READ).

local M = {}

M.READ = 1
M.WRITE = 2
M.DELETE = 4
M.ADMIN = 8

local function has_mask(have: any, need: any): boolean
    if type(have) ~= "number" or type(need) ~= "number" then return false end
    if need <= 0 then return false end
    return ((have :: number) % ((need :: number) * 2)) >= (need :: number)
end
M.has_mask = has_mask

local function valid_mask(mask: any): boolean
    return mask == 1 or mask == 2 or mask == 4 or mask == 8
end

-- reference(resource_id, required_mask?, label) -> the reference, or why the
-- declaration is not one.
function M.reference(resource_id: any, required_mask: any, label: string): ({ [string]: any }?, string?)
    if type(resource_id) ~= "string" or resource_id == "" then return nil, label .. " resource_id must be a non-empty string" end
    if required_mask ~= nil and not valid_mask(required_mask) then return nil, label .. " required_mask must be one of 1, 2, 4, 8" end
    return { resource_id = resource_id, required_mask = required_mask or M.READ }, nil
end

-- declared(config, label, out) appends config.resources to out.
function M.declared(config: any, label: string, out: { any }): string?
    local extra = type(config) == "table" and (config :: { [string]: any }).resources or nil
    if extra == nil then return nil end
    if type(extra) ~= "table" then return label .. " resources must be an array" end
    for _, entry in ipairs(extra :: { any }) do
        if type(entry) ~= "table" then return label .. " resource entry must be an object" end
        local ref, err = M.reference((entry :: { [string]: any }).resource_id, (entry :: { [string]: any }).required_mask, label)
        if err then return err end
        out[#out + 1] = ref
    end
    return nil
end

-- tools_covered(config, references, label) refuses a tool the declared
-- references do not cover: its use could not be enforced.
function M.tools_covered(config: any, references: { any }, label: string): string?
    local tools = type(config) == "table" and (config :: { [string]: any }).tool_ids or nil
    if type(tools) ~= "table" then return nil end
    for _, tool in ipairs(tools :: { any }) do
        local covered = false
        for _, entry in ipairs(references) do
            if tostring((entry :: { [string]: any }).resource_id) == tostring(tool) then covered = true; break end
        end
        if not covered then return label .. " tool " .. tostring(tool) .. " is outside the declared resources" end
    end
    return nil
end

local function holds(grants: any, id: string, need: number): boolean
    if type(grants) ~= "table" then return false end
    for _, g in ipairs(grants :: { any }) do
        if type(g) == "table" and tostring((g :: { [string]: any }).resource_id) == id then
            if has_mask((g :: { [string]: any }).mask, need) then return true end
        end
    end
    return false
end

-- authorize(describe, config, authorization) enforces the operator/principal
-- resource intersection at use time over the references describe(config)
-- declares; every effectful strategy call goes through it. A call without
-- an authorization is refused (code "missing_authorization"), as is a
-- configuration describe cannot enforce or a grant either side lacks (code
-- "forbidden_reference"). Returns ok, message?, code?.
function M.authorize(describe: (any) -> ({ any }?, string?), config: any, authorization: any): (boolean, string?, string?)
    if type(authorization) ~= "table" then
        return false, "an effectful transform needs the operator and principal authorization", "missing_authorization"
    end
    local references, describe_err = describe(config)
    if describe_err or not references then return false, describe_err, "forbidden_reference" end
    for _, entry in ipairs(references :: { any }) do
        local id = tostring((entry :: { [string]: any }).resource_id)
        local need = (entry :: { [string]: any }).required_mask :: number
        if not holds((authorization :: { [string]: any }).operator_grants, id, need) then
            return false, "operator lacks mask " .. tostring(need) .. " on " .. id, "forbidden_reference"
        end
        if not holds((authorization :: { [string]: any }).principal_grants, id, need) then
            return false, "principal lacks mask " .. tostring(need) .. " on " .. id, "forbidden_reference"
        end
    end
    return true, nil, nil
end

-- binding(strategy) -> the kickside.transform:strategy binding methods over a
-- strategy library { apply(config, env, authorization) -> (value, message?,
-- code?), describe(config) -> (references?, message?) }:
--   apply({ config, env, authorization }) -> { present, value?, skip? } | { error = { code, message } }
-- An explicit {present=false, skip=reason} output is an absent outcome;
-- other tables remain raw values. The apply resolver validates the outcome.
--   describe({ config }) -> { references } | { error = { message } }
function M.binding(strategy: any): (any, any)
    local function apply(request: any): (any, any)
        local r = type(request) == "table" and request or {}
        local value, message, code = strategy.apply((r :: any).config or {}, (r :: any).env or {}, (r :: any).authorization)
        if message ~= nil then return { error = { code = code or "strategy_failed", message = message } }, nil end
        if type(value) == "table" and value.present == false and value.skip ~= nil then return value, nil end
        if value == nil then return { present = false }, nil end
        return { present = true, value = value }, nil
    end
    local function describe(request: any): (any, any)
        local r = type(request) == "table" and request or {}
        local references, err = strategy.describe((r :: any).config or {})
        if err or not references then return { error = { message = err } }, nil end
        return { references = references }, nil
    end
    return apply, describe
end

return M
