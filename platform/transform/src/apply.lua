local strategies = require("strategies")

local M = {}

local function invalid(field: string, message: string): (nil, error)
    return nil, (errors.new({kind = errors.INVALID, retryable = false, message = message,
        details = {code = "transform_request_invalid", field = field}}) :: error)
end

local ERROR_KIND: { [string]: string } = {
    unknown_strategy = "INVALID",
    invalid_configuration = "INVALID",
    invalid_result = "INVALID",
    invalid_expression = "INVALID",
    missing_function = "INVALID",
    missing_code = "INVALID",
    batch_too_large = "INVALID",
    forbidden_reference = "PERMISSION_DENIED",
    missing_authorization = "PERMISSION_DENIED",
    strategy_failed = "INTERNAL",
}

local function fail(code: string, message: any, replay_safe: boolean): { [string]: any }
    local retriable = code == "strategy_failed"
    return {
        present = false,
        replay_safe = replay_safe,
        error = { code = code, kind = ERROR_KIND[code] or "INTERNAL", message = tostring(message), retriable = retriable },
    }
end

-- build_env assembles the single frozen expression environment from the
-- request item: {envelope, item, payload, event_type, input}. input stays raw
-- so false and nil survive; payload is the declared input body.
function M.build_env(item: any): { [string]: any }
    local it = type(item) == "table" and item or {}
    local envelope = (it :: { [string]: any }).envelope
    if type(envelope) ~= "table" then envelope = {} end
    local input = (it :: { [string]: any }).input
    local payload = input
    local event_type = (envelope :: { [string]: any }).event_type
    return { envelope = envelope, item = it, payload = payload, event_type = event_type, input = input }
end

type Request = { [string]: any }

-- checked(request) -> the strategy name, item and config of a well-formed
-- apply request.
local function checked(request: any): (string?, any, any, error?)
    if type(request) ~= "table" then
        local _, err = invalid("request", "apply requires {strategy, config?, item={item_key, envelope?, input?}}")
        return nil, nil, nil, err
    end
    local req = request :: Request
    if type(req.strategy) ~= "string" or tostring(req.strategy) == "" then
        local _, err = invalid("strategy", "apply requires {strategy, config?, item={item_key, envelope?, input?}}")
        return nil, nil, nil, err
    end
    local item = req.item
    if type(item) ~= "table" then
        local _, err = invalid("item", "apply requires {strategy, config?, item={item_key, envelope?, input?}}")
        return nil, nil, nil, err
    end
    if type((item :: Request).item_key) ~= "string" or tostring((item :: Request).item_key) == "" then
        local _, err = invalid("item.item_key", "apply item requires a non-empty item_key string")
        return nil, nil, nil, err
    end
    local config = req.config
    if config == nil then config = {} end
    if type(config) ~= "table" then
        local _, err = invalid("config", "apply config must be an object")
        return nil, nil, nil, err
    end
    return tostring(req.strategy), item, config, nil
end

local function evaluate(instance: any, binding: any, open_err: any, request: Request, item: any,
    config: any): ({ [string]: any }?, error?)
    if open_err or not instance or not binding then
        if type(open_err) == "table" then
            return { present = false, replay_safe = false, error = open_err }, nil
        end
        return fail("unknown_strategy", open_err, false), nil
    end
    local replay_safe = (binding :: Request).replay_safe == true

    local answer, call_err = (instance :: any):apply({ config = config, env = M.build_env(item),
        authorization = request.authorization })
    if call_err ~= nil then return fail("strategy_failed", call_err, replay_safe), nil end
    local a = type(answer) == "table" and answer or {}
    if type((a :: any).error) == "table" then
        return fail(tostring((a :: any).error.code or "strategy_failed"), (a :: any).error.message, replay_safe), nil
    end
    if (a :: any).skip ~= nil then
        if (a :: any).present ~= false or (a :: any).value ~= nil
            or type((a :: any).skip) ~= "string" or not string.find((a :: any).skip, "%S") then
            return fail("invalid_result", "a transform skip requires present=false, a non-empty reason and no value", replay_safe), nil
        end
        return { present = false, skip = (a :: any).skip, replay_safe = replay_safe }, nil
    end
    if (a :: any).present ~= true then return { present = false, replay_safe = replay_safe }, nil end
    return { present = true, value = (a :: any).value, replay_safe = replay_safe }, nil
end

-- apply evaluates one strategy once and returns the raw value plus replay
-- metadata. present=false without skip is the exact nil result; false stays
-- a value. An explicit absent skip carries a non-empty reason.
function M.apply(request: any): ({ [string]: any }?, error?)
    local name, item, config, request_err = checked(request)
    if request_err or not name then return nil, request_err end
    local instance, binding, open_err = strategies.open(name)
    return evaluate(instance, binding, open_err, request :: Request, item, config)
end

-- apply_with(handle, request) is apply over a strategy its caller resolved and
-- opened once for many requests: handle = { binding, instance?, error? }, the
-- binding from strategies.resolve and the instance or open failure from
-- strategies.open_binding.
function M.apply_with(handle: Request, request: any): ({ [string]: any }?, error?)
    local name, item, config, request_err = checked(request)
    if request_err or not name then return nil, request_err end
    local binding = handle.binding
    if type(binding) ~= "table" or (binding :: Request).strategy ~= name then
        return invalid("strategy", "apply_with requires the handle of the requested strategy")
    end
    return evaluate(handle.instance, binding, handle.error, request :: Request, item, config)
end

return M
