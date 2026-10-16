-- Transform strategy resolution (OWNERSHIP A28.4): every strategy is a
-- kickside.transform:strategy contract binding in the registry, marked
-- meta.type = kickside.transform.strategy with its meta.strategy name and
-- declared meta.replay_safe. Nothing here names a strategy.
--
--   resolve(name)          -> { id, strategy, replay_safe } of its one binding
--   open(name)             -> the binding's contract instance
--   describe(name, config) -> the references the configuration declares, or
--                             why its resource use cannot be enforced

local registry = require("registry")
local contract = require("contract")

local M = {}

M.CONTRACT = "kickside.transform:strategy"
M.TYPE = "kickside.transform.strategy"

type Map = { [string]: any }

local function cause_fields(cause: any): (Map, Map)
    if type(cause) == "table" then
        local value = cause :: Map
        local details = type(value.details) == "table" and (value.details :: Map) or {}
        return value, details
    end
    if type(cause) == "userdata" then
        local value = cause :: any
        local details = value:details()
        return { kind = value:kind(), message = value:message() }, type(details) == "table" and details or {}
    end
    return {}, {}
end

local function infrastructure_error(name: string, stage: string, cause: any): Map
    local value, details = cause_fields(cause)
    local code = value.code or details.code
    local message = value.message or details.message
    local scope = value.scope or details.scope
    local retry_after_ms = value.retry_after_ms or details.retry_after_ms
    if type(code) ~= "string" or code == "" then code = "strategy_unavailable" end
    if type(message) ~= "string" or message == "" then message = tostring(cause or "unavailable") end
    if type(scope) ~= "string" or scope == "" then scope = "infrastructure" end
    local failure: Map = {
        code = code,
        kind = "UNAVAILABLE",
        message = "transform strategy " .. tostring(name) .. " " .. stage .. ": " .. message,
        retriable = true,
        scope = scope,
    }
    if type(retry_after_ms) == "number" and retry_after_ms >= 0 then
        failure.retry_after_ms = retry_after_ms
    end
    return failure
end

local function resolve_binding(name: string): (Map?, string?, any?)
    local entries, err = registry.find({ ["meta.type"] = M.TYPE, ["meta.strategy"] = name })
    if err then return nil, "strategy registry read failed: " .. tostring(err), err end
    local found = (entries or {}) :: { Map }
    if #found ~= 1 then
        return nil, "unknown transform strategy: " .. tostring(name) .. " (" .. tostring(#found) .. " bindings declare it)"
    end
    local entry = found[1]
    local meta = type(entry.meta) == "table" and entry.meta or {}
    if type(meta.replay_safe) ~= "boolean" then
        return nil, "transform strategy " .. tostring(name) .. " binding declares no replay_safe"
    end
    return { id = tostring(entry.id), strategy = name, replay_safe = meta.replay_safe, validate_at_install = meta.validate_at_install == true }, nil
end

function M.resolve(name: string): (Map?, string?)
    local binding, resolve_err = resolve_binding(name)
    return binding, resolve_err
end

function M.open(name: string): (any?, Map?, any?)
    local binding, resolve_err, registry_err = resolve_binding(name)
    if resolve_err or not binding then
        if registry_err ~= nil then
            return nil, nil, infrastructure_error(name, "registry lookup failed", registry_err)
        end
        return nil, nil, resolve_err
    end
    local def, def_err = contract.get(M.CONTRACT)
    if def_err or not def then
        return nil, nil, infrastructure_error(name, "contract lookup failed", def_err or "contract unavailable")
    end
    local instance, open_err = (def :: any):open((binding :: Map).id)
    if open_err or not instance then
        return nil, nil, infrastructure_error(name, "contract open failed", open_err or "binding unavailable")
    end
    return instance, binding, nil
end

function M.describe(name: string, config: any): ({ Map }?, string?)
    local instance, _, open_err = M.open(name)
    if open_err or not instance then
        if type(open_err) == "table" then return nil, tostring((open_err :: Map).message) end
        return nil, open_err
    end
    local answer, call_err = (instance :: any):describe({ config = config })
    if call_err then return nil, "strategy " .. tostring(name) .. " describe failed: " .. tostring(call_err) end
    local a = type(answer) == "table" and answer or {}
    if type(a.error) == "table" then return nil, tostring(a.error.message) end
    if type(a.references) ~= "table" then return nil, "strategy " .. tostring(name) .. " described no references" end
    return a.references :: { Map }, nil
end

return M
