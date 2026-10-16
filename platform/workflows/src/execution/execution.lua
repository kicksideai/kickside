-- Internal workflow execution facade. A workflow is already a Dataflow artifact;
-- this module only normalizes a published reference and delegates to the run launcher.

local runs_launch = require("runs_launch")
local exact_flow_ref = require("flow_ref")
local exact_automation_ref = require("automation_ref")

type Map = { [string]: any }

local function default_launch(workflow_id: string, opts: Map): (Map?, any?)
    local launched, err = runs_launch.launch(workflow_id, opts)
    return type(launched) == "table" and (launched :: Map) or nil, err
end

local function new(dependencies: any?): any
local deps = type(dependencies) == "table" and dependencies or {}
local launch = deps.runs_launch or default_launch
local M = {}

local function map(v: any): Map
    return type(v) == "table" and (v :: Map) or {}
end

local function str(v: any): string
    return type(v) == "string" and v or ""
end

local function launch_error_message(err: any): string
    if type(err) == "table" then
        local e = err :: Map
        local code = str(e.code)
        local message = str(e.message)
        if code ~= "" and message ~= "" then return code .. ": " .. message end
        if message ~= "" then return message end
        if code ~= "" then return code end
    end
    return tostring(err or "workflow launch failed")
end

local function run_version(workflow_id: string, version: number, input: any, opts: any): (Map?, string?)
    local o = map(opts)
    if type(input) ~= "table" then return nil, "input must be an object" end
    local allowed: Map = {
        mode = true, dedup_key = true, trace_context = true, authority_identity = true,
        trigger_kind = true, trigger_id = true, origin = true,
        automation_ref = true, invocation_id = true, session_id = true,
    }
    for key, _ in pairs(o) do
        if allowed[key] ~= true then return nil, "unsupported Flow launch option: " .. tostring(key) end
    end
    local automation_ref: Map? = nil
    if o.automation_ref ~= nil then
        local exact, automation_err = exact_automation_ref.validate(o.automation_ref)
        if automation_err or not exact then return nil, automation_err end
        automation_ref = exact :: Map
    end
    if o.mode ~= nil and type(o.mode) ~= "string" then return nil, "Flow launch mode must be async or sync" end
    local mode = str(o.mode)
    if mode == "" then mode = "async" end
    if mode ~= "async" and mode ~= "sync" then return nil, "unsupported Flow launch mode: " .. mode end

    local launch_opts: Map = {
        input = input :: Map,
        version = version,
        trigger_kind = str(o.trigger_kind) ~= "" and o.trigger_kind or "workflow",
        trigger_id = str(o.trigger_id) ~= "" and o.trigger_id or "workflow",
        dedup_key = str(o.dedup_key) ~= "" and o.dedup_key or nil,
        origin = str(o.origin) ~= "" and o.origin or nil,
        trace_context = type(o.trace_context) == "table" and o.trace_context or nil,
        authority_identity = type(o.authority_identity) == "table" and o.authority_identity or nil,
        automation_ref = automation_ref,
        invocation_id = str(o.invocation_id) ~= "" and o.invocation_id or nil,
        session_id = str(o.session_id) ~= "" and o.session_id or nil,
        mode = mode,
    }
    local launched, err = launch(workflow_id, launch_opts)
    -- Contract functions declare the second result as a string. The run launcher returns
    -- structured launch errors, and handing that table through this boundary makes
    -- the contract runtime erase it into an empty successful-looking result.
    if err then return nil, launch_error_message(err) end
    local res = map(launched)
    if str(res.run_id) == "" then return nil, "workflow launch returned no run_id" end
    return {
        run_id = res.run_id,
        dataflow_id = res.dataflow_id,
        status = str(res.status) ~= "" and res.status or "running",
        success = res.success,
        data = res.data,
        error = res.error,
        deduped = res.deduped == true,
    }, nil
end

function M.run(flow_ref: any, input: any?, opts: any?): (Map?, error?)
    local exact, ref_err = exact_flow_ref.validate(flow_ref)
    if ref_err or not exact then return nil, ref_err end
    return run_version(exact.id, exact.version, input, opts)
end

return M
end

local default = new()
default.new = new
return default
