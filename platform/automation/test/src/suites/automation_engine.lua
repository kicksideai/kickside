local automation_engine = require("automation_engine")
local errors = require("errors")
local automation_types = require("types")

local base_dependencies = {
    types = automation_types,
    automation_ref = require("automation_ref"),
    execution_identity = require("execution_identity"),
    json = require("json"),
    contract = require("contract"),
    component = require("component"),
    registry = require("registry"),
    funcs = require("funcs"),
    logger = require("logger"),
    security = require("security"),
    autoinit = require("autoinit"),
    view_components = require("view_components"),
    sql = require("sql"),
    time = require("time"),
    expr = require("expr"),
    ctx = require("ctx"),
    uuid = require("uuid"),
    hash = require("hash"),
    drive = require("drive"),
    command = require("command"),
    slot = require("slot"),
    policy = require("runtime_policy"),
    failure_classification = require("failure_classification"),
    round_ledger = require("round_ledger"),
    round_history = require("round_history"),
    prepared_retention = require("prepared_retention"),
    receipt_retention = require("receipt_retention"),
    round_outcome = require("round_outcome"),
    canonical_json = require("canonical_json"),
    automation_db = require("automation_db"),
    retention_pin = require("retention_pin"),
    core_db = require("core_db"),
    declaration_references = require("declaration_references"),
    declaration_authority = require("declaration_authority"),
    jobs_config = require("jobs_config"),
}

local M = {}

-- A component stub models the component service. Its client update mirrors the
-- real component.update over that service: a failed envelope becomes an
-- error of the service's kind.
local function with_client_update(component: any): any
    if type(component) ~= "table" or component.update ~= nil or type(component.get_service) ~= "function" then
        return component
    end
    local client: any = {}
    for name, value in pairs(component) do client[name] = value end
    client.update = function(component_id: string, commands: { any }): (any?, any)
        local service, service_err = component.get_service()
        if service_err or not service then return nil, service_err end
        local request: any = { component_id = component_id, commands = commands }
        local result, call_err = service:update(request)
        if call_err then return nil, errors.new({ kind = errors.INTERNAL, message = "update: " .. tostring(call_err) }) end
        if type(result) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "update returned nil result" }) end
        local envelope = result :: any
        if not envelope.success then
            local kind = type(envelope.kind) == "string" and envelope.kind ~= "" and envelope.kind or errors.PERMISSION_DENIED
            return nil, errors.new({ kind = kind, message = tostring(envelope.error or "update failed") })
        end
        return envelope, nil
    end
    return client
end

function M.new(overrides: any?): (any, any)
    local dependencies: any = {}
    for name, dependency in pairs(base_dependencies) do dependencies[name] = dependency end
    for name, dependency in pairs(overrides or {}) do
        if base_dependencies[name] == nil then error("unknown automation dependency: " .. tostring(name)) end
        dependencies[name] = name == "component" and with_client_update(dependency) or dependency
    end
    local engine = automation_engine.new(dependencies)
    local install = engine.install
    local replay = engine.replay
    local function with_runner(runner: any, operation: any): (any, any, any)
        if type(runner) ~= "function" then return operation() end
        local original = dependencies.funcs
        dependencies.funcs = {
            new = function()
                return {
                    call = function(_self: any, target: string, args: any)
                        local err = runner(target, args)
                        if err ~= nil then return nil, err end
                        return true, nil
                    end,
                }, nil
            end,
        }
        local first, second, third = operation()
        dependencies.funcs = original
        return first, second, third
    end
    engine.install = function(body: any, opts: any?)
        return with_runner(opts and opts.runner, function() return install(body) end)
    end
    engine.replay = function(chain: any, opts: any?)
        return with_runner(opts and opts.runner, function() return replay(chain, opts and { options = opts.options } or nil) end)
    end
    return engine, dependencies
end

return M
