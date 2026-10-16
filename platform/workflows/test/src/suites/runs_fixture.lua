-- Test-only run plane assembled from the real owning modules. Each dependency is
-- supplied to the constructor explicitly; the mutable controls here belong to
-- the fixture, never to a production module export.
local runs_read = require("runs_read")
local runs_launch = require("runs_launch")
local runs_completion = require("runs_completion")
local runs_debug = require("runs_debug")

local function new(options: any?): any
local selected = type(options) == "table" and options or {}
local _, defaults = runs_read.new()
local active: any = {
    client_new = selected.client_new or defaults.client_new,
    dataflow_get = selected.dataflow_get or defaults.dataflow_get,
    node_reader = selected.node_reader or defaults.node_reader,
    data_reader = selected.data_reader or defaults.data_reader,
    update_public_meta = selected.update_public_meta or defaults.update_public_meta,
    require_workflow_access = selected.require_workflow_access or defaults.require_workflow_access,
    actor_id = selected.actor_id or defaults.actor_id,
    security_actor = selected.security_actor or defaults.security_actor,
    security_scope = selected.security_scope or defaults.security_scope,
    threads_contract = selected.threads_contract or defaults.threads_contract,
}
local supplied: any = {}
for name, _ in pairs(active) do
    local key = name
    supplied[key] = function(...): any return active[key](...) end
end
supplied.version_read = selected.version_read
supplied.version_publish = selected.version_publish

local M, private = runs_read.new(supplied)
active.append_event = selected.append_event or private.append_event
private.append_event = function(...): any return active.append_event(...) end
runs_launch.attach(M, private)
runs_completion.attach(M, private)
runs_debug.attach(M, private)

local fixture = {}
local controls = {
    _client_new = "client_new", _dataflow_get = "dataflow_get",
    _node_reader = "node_reader", _data_reader = "data_reader",
    _update_public_meta = "update_public_meta",
    _require_workflow_access = "require_workflow_access",
    _actor_id = "actor_id", _security_actor = "security_actor",
    _security_scope = "security_scope", _threads_contract = "threads_contract",
    _append_event = "append_event",
}
setmetatable(fixture, {
    __index = function(_self: any, key: string): any
        if key == "new" then return new end
        if key == "_internals" then return private end
        if key == "fork" then
            return function(): any
                local copied: any = {
                    version_read = selected.version_read,
                    version_publish = selected.version_publish,
                }
                for name, value in pairs(active) do
                    if name ~= "append_event" then copied[name] = value end
                end
                return new(copied)
            end
        end
        local name = controls[key]
        if name then return active[name] end
        return M[key]
    end,
    __newindex = function(_self: any, key: string, value: any): ()
        local name = controls[key]
        if not name then error("unknown run fixture dependency: " .. tostring(key)) end
        active[name] = value
    end,
})

return fixture
end

local default = new()
rawset(default, "new", new)
return default
