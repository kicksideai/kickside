local registry = require("registry")
local canonical_json = require("canonical_json")
local round_write = require("round_write")
local automations = require("automations_lib")
local schema = require("engine_schema")
local M = {}

local function invalid(message: string): error
    return (errors.new({kind = errors.INVALID, message = message, retryable = false,
        details = {error_kind = "declaration"}}) :: error)
end

local function nonempty(value)
    return type(value) == "string" and value:match("%S") ~= nil
end

-- Providers own their writable port and advertise its recurring target kind.
local function target_port(kind)
    local entries, err = registry.find({ ["meta.type"] = "kickside.automation.port", ["meta.recurring_target"] = kind })
    if err then return nil, err end
    if not entries or #entries == 0 then return nil, invalid("recurring " .. kind .. " target provider is unavailable") end
    if #entries ~= 1 then return nil, invalid("recurring " .. kind .. " target provider is ambiguous") end
    return tostring(entries[1].id), nil
end

-- Convenience targets lower to the same declared writable port as an action.
function M.resolve(target: any): (any?, any)
    if type(target) ~= "table" then return nil, invalid("target is required") end
    if (target.kind == "workflow" or target.kind == "action") and type(target.input) == "table" then
        target.input = canonical_json.object(target.input)
    end
    if target.kind == "workflow" then
        local ref = target.flow_ref
        if type(ref) ~= "table" or ref.kind ~= "flow" or not nonempty(ref.id)
            or type(ref.version) ~= "number" or ref.version < 1 or ref.version ~= math.floor(ref.version) then
            return nil, invalid("workflow target requires an exact published flow_ref {kind='flow', id, version}")
        end
        local port, port_err = target_port("workflow")
        if port_err then return nil, port_err end
        return { port = port, config = { flow_ref = ref }, input = target.input or canonical_json.object({}) }, nil
    elseif target.kind == "action" then
        if not nonempty(target.port) or type(target.input) ~= "table" then
            return nil, invalid("action target requires a declared writable port and input object")
        end
        return { port = target.port, config = target.config or {}, input = target.input }, nil
    end
    return nil, invalid("target.kind must be workflow or action")
end

function M.validate(input: any): (any?, any)
    local target, target_err = M.resolve(input)
    if target_err or not target then return nil, target_err end
    local sink, sink_err = round_write.describe_sink(tostring(target.port))
    if sink_err or not sink then return nil, sink_err end
    local port, port_err = automations.resolve_sink(tostring(target.port))
    if port_err or not port then return nil, port_err end
    local config_err = schema.validate_port_config(port.config_schema, target.config)
    if config_err then return nil, errors.wrap(config_err, "target.config for " .. target.port) end
    local input_err = schema.validate_install_input(port.input_schema, target.input)
    if input_err then return nil, errors.wrap(input_err, "target.input for " .. target.port) end
    return target, nil
end

return M
