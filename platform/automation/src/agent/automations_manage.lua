-- Write automation-management tool for agents: install, reconfigure,
-- pause/resume, manual run, import, uninstall, and execution-execution-identity change. Every action maps onto one
-- automations_lib write call; access is enforced by the library's own
-- access-masked component queries, never checked here.
--
-- pause/resume/run dispatch through automations_lib.call_action, whose result
-- carries the dispatched action's own reported outcome under `result`
-- unmodified on success; refused actions and failed controls return typed errors.

local security = require("security")
local automations_lib = require("automations_lib")
local tool_result = require("tool_result")
local tool_action = require("tool_action")

type Map = { [string]: any }

-- Per-action fields; the input schema root stays a flat object.
local ACTIONS = {
    install = { required = { "type", "input" }, optional = { "parent_id" } },
    reconfigure = { required = { "id", "input" } },
    pause = { required = { "id" } },
    resume = { required = { "id" } },
    run = { required = { "id" } },
    call = { required = { "id", "method" }, optional = { "args" } },
    import = { required = { "artifact" }, optional = { "parent_id", "input_overrides" } },
    uninstall = { required = { "id" }, optional = { "options" } },
    set_execution_identity = {
        required = { "id", "principal", "request_id", "expected_identity_generation" },
        optional = { "supersede_request_id" },
    },
    control = {
        required = { "id", "control" },
        optional = { "drive_key", "request_id", "keys", "from", "resolve_identity" },
    },
}

local function require_id(args: Map): (string?, error?)
    local id = args.id
    if type(id) ~= "string" or id == "" then
        return nil, errors.new({ message = "id is required", kind = errors.INVALID })
    end
    return id, nil
end

local function optional_id(args: Map, key: string): string?
    local value = args[key]
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

local function do_install(args: Map): (Map?, error?)
    local type_id = args.type
    if type(type_id) ~= "string" or type_id == "" then return tool_result.fail(errors.INVALID, "type is required") end
    local result, err = automations_lib.install_type(type_id :: string, args.input, optional_id(args, "parent_id"))
    if err then return nil, err end
    local r = result :: Map
    return { success = true, id = r.id, type = r.type, metadata = r.metadata, created = r.created }
end

local function do_reconfigure(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local result, err = automations_lib.reconfigure(id :: string, args.input)
    if err then return nil, err end
    local r = type(result) == "table" and result or {}
    -- A kind refusal rides the result envelope with err == nil; reporting it
    -- as success is how edits silently persisted nothing.
    local inner = type((r :: Map).result) == "table" and ((r :: Map).result :: Map) or (r :: Map)
    if inner.success == false or inner.state == "failed" or (inner.error ~= nil and inner.success ~= true) then
        return tool_result.fail(errors.INVALID, tostring(inner.error or inner.message or "reconfigure refused"))
    end
    return { success = true, id = (r :: Map).id or id }
end

-- Shared controls may report a recorded refusal in the result slot. Preserve
-- the engine's kind, message and command receipt in the tool error on every route.
local function control_failure(id: any, recorded: Map): (nil, error)
    local outcome: Map = type(recorded.outcome) == "table" and (recorded.outcome :: Map) or {}
    return nil, errors.new({
        message = tostring(outcome.message or outcome.error or "automation control failed"),
        kind = outcome.kind or errors.INTERNAL,
        details = { id = id, request_id = recorded.request_id, generation = recorded.generation,
            state = recorded.state, outcome = recorded.outcome },
    })
end

local function call_action_result(result: any, err: any): (any, error?)
    if err then return nil, err end
    local r = result :: Map
    local outcome = type(r.result) == "table" and (r.result :: Map) or nil
    if outcome and outcome.state == "failed" then
        return control_failure(r.id, outcome)
    end
    if outcome and (outcome.success == false or (outcome.error ~= nil and outcome.success ~= true)) then
        return tool_result.fail(errors.INVALID, outcome.error or outcome.message or "automation action failed")
    end
    return { success = true, id = r.id, method = r.method, result = r.result }
end

local function do_pause(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local result, err = automations_lib.call_action(id :: string, "pause", {})
    return call_action_result(result, err)
end

local function do_resume(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local result, err = automations_lib.call_action(id :: string, "resume", {})
    return call_action_result(result, err)
end

-- run is the generic drive wakeup, independent of kind-declared methods.
local function do_run(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local result, err = automations_lib.call_action(id :: string, "run_now", {})
    return call_action_result(result, err)
end

-- call dispatches a catalog control or declared action with the caller's args.
-- The engine reserves generic names and validates kind actions; this tool routes.
local function do_call(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local method = type(args.method) == "string" and args.method or ""
    if method == "" then return tool_result.fail(errors.INVALID, "method is required for call") end
    local call_args = type(args.args) == "table" and (args.args :: Map) or {}
    local result, err = automations_lib.call_action(id :: string, method, call_args)
    return call_action_result(result, err)
end

local function do_import(args: Map): (Map?, error?)
    local imported, err = automations_lib.import_artifact(args.artifact, optional_id(args, "parent_id"), args.input_overrides)
    if err then return nil, err end
    local r = imported :: Map
    return { success = true, id = r.id, type = r.type, created = r.created }
end

local function do_uninstall(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local result, err = automations_lib.delete_automation(id :: string, args.options)
    if err then return nil, err end
    local r = type(result) == "table" and result or {}
    return { success = true, id = (r :: Map).id or id, replayed = (r :: Map).replayed,
        replay_failed = (r :: Map).replay_failed, discarded = (r :: Map).discarded }
end

-- set_execution_identity selects the principal the automation runs as (ADMIN).
local function do_set_execution_identity(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local result, err = automations_lib.set_execution_identity(id :: string, {
        principal = args.principal,
        request_id = args.request_id,
        expected_identity_generation = args.expected_identity_generation,
        supersede_request_id = args.supersede_request_id,
    })
    if err then return nil, err end
    local r = result :: Map
    return {
        success = true,
        id = id,
        request_id = r.request_id,
        generation = r.generation,
        state = r.state,
        identity_generation = r.identity_generation,
    }
end

-- control runs one drive control (pause, resume, run_now, replay, resync)
-- through the automation's command stream (WRITE).
local function do_control(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local result, err = automations_lib.control(id :: string, {
        control = args.control, drive_key = args.drive_key, request_id = args.request_id, keys = args.keys, from = args.from,resolve_identity=args.resolve_identity,
    })
    if err then return nil, err end
    local r = result :: Map
    if r.state == "failed" then return control_failure(id, r) end
    return { success = true, id = id, request_id = r.request_id, generation = r.generation, state = r.state, outcome = r.outcome }
end

local function handler(args: any): (any, error?)
    local a: Map = (type(args) == "table") and (args :: Map) or {}
    local actor = security.actor()
    if not actor or tostring(actor:id() or "") == "" then return tool_result.fail(errors.PERMISSION_DENIED, "authentication required") end

    local action, action_err = tool_action.check(a, ACTIONS)
    if not action then return nil, action_err end
    if action == "install" then return do_install(a) end
    if action == "reconfigure" then return do_reconfigure(a) end
    if action == "pause" then return do_pause(a) end
    if action == "resume" then return do_resume(a) end
    if action == "run" then return do_run(a) end
    if action == "call" then return do_call(a) end
    if action == "import" then return do_import(a) end
    if action == "uninstall" then return do_uninstall(a) end
    if action == "set_execution_identity" then return do_set_execution_identity(a) end
    if action == "control" then return do_control(a) end
    return tool_result.fail(errors.INVALID, "unknown action: " .. action)
end

return { handler = handler }
