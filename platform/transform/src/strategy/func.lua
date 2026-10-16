local funcs = require("funcs")
local security = require("security")
local strategy_reference = require("strategy_reference")

local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return ((value :: string):gsub("^%s+", ""):gsub("%s+$", ""))
end

-- func calls the configured function with the item envelope and its config.
-- The raw output is returned as is, including scalars; only nil is absent.
-- Authorization is enforced before the call, never after.
function M.apply(config: any, env: any, authorization: any): (any, string?, string?)
    local c = type(config) == "table" and config or {}
    local target = trim((c :: { [string]: any })["function"])
    if target == "" then return nil, "func transform requires function", "missing_function" end
    local ok, amsg, acode = strategy_reference.authorize(M.describe, c, authorization)
    if not ok then return nil, amsg, acode end

    local caller = funcs.new()
    local actor, scope = security.actor(), security.scope()
    if actor then caller = caller:with_actor(actor) end
    if scope then caller = caller:with_scope(scope) end

    local e = type(env) == "table" and env or {}
    local item = (e :: { [string]: any }).item
    if item == nil then item = e end
    local out, ferr = caller:call(target, { item = item, config = (c :: { [string]: any }).config })
    if ferr ~= nil then return nil, "func transform failed: " .. tostring(ferr), "strategy_failed" end
    return out, nil, nil
end

-- describe declares the resources the function uses (config.resource_id with
-- its required_mask, and config.resources); a function declaring none cannot
-- be enforced.
function M.describe(config: any): ({ any }?, string?)
    local c = type(config) == "table" and config or {}
    local out: { any } = {}
    if (c :: { [string]: any }).resource_id ~= nil then
        local ref, ref_err = strategy_reference.reference((c :: { [string]: any }).resource_id, (c :: { [string]: any }).required_mask, "func")
        if ref_err then return nil, ref_err end
        out[#out + 1] = ref
    end
    local extra_err = strategy_reference.declared(c, "func", out)
    if extra_err then return nil, extra_err end
    if #out == 0 then return nil, "func without a declared resource_id cannot be authorized at use time" end
    return out, nil
end

M.bind_apply, M.bind_describe = strategy_reference.binding(M)

return M
