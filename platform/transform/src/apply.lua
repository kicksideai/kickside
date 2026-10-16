local strategies = require("strategies")

local M = {}

local function invalid(field: string, message: string): (nil, error)
    return nil, (errors.new({kind = errors.INVALID, retryable = false, message = message,
        details = {code = "transform_request_invalid", field = field}}) :: error)
end

local ERROR_KIND: { [string]: string } = {
    unknown_strategy = "INVALID",
    invalid_configuration = "INVALID",
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

-- apply evaluates one strategy once and returns the raw value plus replay
-- metadata. present=false is the exact nil result; false stays a value.
function M.apply(request: any): ({ [string]: any }?, error?)
    if type(request) ~= "table" then
        return invalid("request", "apply requires {strategy, config?, item={item_key, envelope?, input?}}")
    end
    local req = request
    if type((req :: { [string]: any }).strategy) ~= "string" or tostring((req :: { [string]: any }).strategy) == "" then
        return invalid("strategy", "apply requires {strategy, config?, item={item_key, envelope?, input?}}")
    end
    local item = (req :: { [string]: any }).item
    if type(item) ~= "table" then
        return invalid("item", "apply requires {strategy, config?, item={item_key, envelope?, input?}}")
    end
    if type((item :: { [string]: any }).item_key) ~= "string" or tostring((item :: { [string]: any }).item_key) == "" then
        return invalid("item.item_key", "apply item requires a non-empty item_key string")
    end
    local config = (req :: { [string]: any }).config
    if config == nil then config = {} end
    if type(config) ~= "table" then return invalid("config", "apply config must be an object") end

    local name = tostring((req :: { [string]: any }).strategy)
    local instance, binding, open_err = strategies.open(name)
    if open_err or not instance or not binding then
        if type(open_err) == "table" then
            return { present = false, replay_safe = false, error = open_err }, nil
        end
        return fail("unknown_strategy", open_err, false), nil
    end
    local replay_safe = (binding :: { [string]: any }).replay_safe == true

    local answer, call_err = (instance :: any):apply({ config = config, env = M.build_env(item),
        authorization = (req :: { [string]: any }).authorization })
    if call_err ~= nil then return fail("strategy_failed", call_err, replay_safe), nil end
    local a = type(answer) == "table" and answer or {}
    if type((a :: any).error) == "table" then
        return fail(tostring((a :: any).error.code or "strategy_failed"), (a :: any).error.message, replay_safe), nil
    end
    if (a :: any).present ~= true then return { present = false, replay_safe = replay_safe }, nil end
    return { present = true, value = (a :: any).value, replay_safe = replay_safe }, nil
end

return M
