local funcs = require("funcs")
local security = require("security")
local strategy_reference = require("strategy_reference")

local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return ((value :: string):gsub("^%s+", ""):gsub("%s+$", ""))
end

-- code runs config.code in the hard cage with the item as input. Tool use is
-- limited to config.tool_ids; declared resources are authorized before the
-- call. The raw sandbox result is returned; only nil is absent.
function M.apply(config: any, env: any, authorization: any): (any, string?, string?)
    local c = type(config) == "table" and config or {}
    local code_text = trim((c :: { [string]: any }).code)
    if code_text == "" then return nil, "code transform requires code", "missing_code" end
    local ok, amsg, acode = strategy_reference.authorize(M.describe, c, authorization)
    if not ok then return nil, amsg, acode end

    local caller = funcs.new()
    local actor, scope = security.actor(), security.scope()
    if actor then caller = caller:with_actor(actor) end
    if scope then caller = caller:with_scope(scope) end

    local e = type(env) == "table" and env or {}
    local einput = (e :: { [string]: any }).input
    local sandbox_input = { input = einput, payload = (e :: { [string]: any }).payload, envelope = (e :: { [string]: any }).envelope }
    local sandbox_config: { [string]: any } = { code = code_text }
    if type((c :: { [string]: any }).tool_ids) == "table" then
        sandbox_config.tool_ids = (c :: { [string]: any }).tool_ids
    end
    local out, ferr = caller:call("kickside.code_execution:run_code", {
        input = sandbox_input,
        config = sandbox_config,
    })
    if ferr ~= nil then return nil, "code transform failed: " .. tostring(ferr), "strategy_failed" end
    local o = type(out) == "table" and out or {}
    if (o :: { [string]: any }).ok == false then
        local details = (o :: { [string]: any }).error
        if type(details) ~= "table" then details = {} end
        return nil, "code execution error: " .. tostring((details :: { [string]: any }).message or ""), "strategy_failed"
    end
    return (o :: { [string]: any }).result, nil, nil
end

-- describe declares config.resources; a tool outside them cannot be enforced.
function M.describe(config: any): ({ any }?, string?)
    local out: { any } = {}
    local extra_err = strategy_reference.declared(config, "code", out)
    if extra_err then return nil, extra_err end
    local tools_err = strategy_reference.tools_covered(config, out, "code")
    if tools_err then return nil, tools_err end
    return out, nil
end

M.bind_apply, M.bind_describe = strategy_reference.binding(M)

return M
