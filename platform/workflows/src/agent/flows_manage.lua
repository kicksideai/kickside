-- Write-side Workflow-management tool for agents: create a draft, import a
-- portable Flow artifact, apply a definition command batch, publish, restore a
-- frozen version as a new draft, delete, and run a published version. Every action reuses the exact
-- internal seam the HTTP API uses — the workflow writer for command batches, the
-- versions engine for publish, the definitions importer for artifacts, the run
-- request behind the Run button — so MCP
-- writes carry the same validation, undo tracking, and realtime broadcast as
-- the product UI.

local security = require("security")
local flows_support = require("flows_support")
local repo = require("workflow_repo")
local version_publish = require("version_publish")
local definitions_api = require("definitions_api")
local workflow = require("workflow")
local realtime = require("workflow_realtime")
local exec_api = require("exec_api")

type Map = { [string]: any }

local require_id = flows_support.require_id
local tool_result = require("tool_result")
local tool_action = require("tool_action")

-- Per-action fields; the input schema root stays a flat object.
local ACTIONS = {
    create = { required = { "title" }, optional = { "parent_id", "source_context" } },
    import = { required = { "flow" }, optional = { "bindings" } },
    apply = { required = { "id", "commands" } },
    publish = { required = { "id" } },
    restore = { required = { "id", "version" } },
    delete = { required = { "id" } },
    run = { required = { "id", "version" }, optional = { "input" } },
}

local function actor_id(): string?
    local actor = security.actor()
    local id = actor and actor:id() or nil
    return type(id) == "string" and id ~= "" and id or nil
end

local function do_create(args: Map): (Map?, error?)
    local title = type(args.title) == "string" and args.title or ""
    if title == "" then return tool_result.fail(errors.INVALID, "title is required") end
    local parent_id = type(args.parent_id) == "string" and args.parent_id ~= "" and args.parent_id or nil
    local created, err = repo.create(title, parent_id, nil, args.source_context)
    if err then return nil, err end
    if not created then return tool_result.fail(errors.INTERNAL, "create returned no workflow") end
    return { success = true, workflow = created }
end

local function do_import(args: Map, actor: string): (Map?, error?)
    if type(args.flow) ~= "table" then return tool_result.fail(errors.INVALID, "flow artifact object is required") end
    local imported, err = definitions_api.import_flow(args.flow, args.bindings or {}, actor)
    if err then return tool_result.domain_error((err :: Map).message, err :: Map) end
    if not imported then return tool_result.fail(errors.INTERNAL, "import returned no Flow") end
    return { success = true, flow = imported }
end

local function do_apply(args: Map, actor: string): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    if type(args.commands) ~= "table" or #(args.commands :: { any }) == 0 then
        return tool_result.fail(errors.INVALID, "commands array is required")
    end
    local access_err = repo.require_access(id :: string, repo.ACCESS.WRITE :: number)
    if access_err then return tool_result.fail(errors.PERMISSION_DENIED, "access denied") end
    local r, err = workflow.apply(id :: string, args.commands, actor)
    if err or not r then return nil, (err :: error) end
    local broadcast_err = realtime.broadcast(id :: string, r.events)
    if broadcast_err then return nil, broadcast_err end
    return {
        success = true,
        id = id,
        events = r.events or {},
        head_seq = r.head_seq or 0,
        state = r.state,
    }
end

local function do_publish(args: Map, actor: string): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local access_err = repo.require_access(id :: string, repo.ACCESS.WRITE :: number)
    if access_err then return tool_result.fail(errors.PERMISSION_DENIED, "access denied") end
    local result, err = version_publish.publish(id :: string, actor)
    if err then return nil, err end
    local r: Map = type(result) == "table" and (result :: Map) or {}
    if r.ok ~= true then
        local problems = type(r.errors) == "table" and (r.errors :: { any }) or {}
        local first: any = problems[1]
        local message = type(first) == "table" and tostring((first :: Map).message or "publish refused") or "publish refused"
        return nil, errors.new({ message = message, kind = errors.INVALID, details = { errors = problems } })
    end
    return { success = true, id = id, version = r.version, def_seq = r.def_seq, hash = r.hash }
end

local function do_restore(args: Map, actor: string): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local restored, err = definitions_api.restore_version(id :: string, args.version, actor)
    if err then return nil, err end
    if not restored then return tool_result.fail(errors.INTERNAL, "restore failed") end
    return { success = true, flow = restored }
end

local function do_delete(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local ok, err = repo.delete(id :: string)
    if err then return nil, err end
    if not ok then return tool_result.fail(errors.INTERNAL, "delete failed") end
    return { success = true, id = id }
end

-- Launch an exact published version the way the Run button does: READ access, the
-- same run request, and an immediate run_id. The run continues on its own, including
-- while it waits for a person, and WorkflowsRead run_detail follows it.
local function do_run(args: Map): (Map?, error?)
    local id, id_err = require_id(args)
    if not id then return nil, id_err end
    local access_err = repo.require_access(id :: string, repo.ACCESS.READ :: number)
    if access_err then return tool_result.fail(errors.PERMISSION_DENIED, "access denied") end
    local launched, err = exec_api.run_request(id :: string, {
        version = args.version,
        input = type(args.input) == "table" and args.input or {},
    })
    if err then
        local body = exec_api.launch_error_body(err)
        return nil, errors.new({ kind = errors.INVALID, message = tostring(body.error or "workflow launch failed"),
            details = body })
    end
    local result = launched :: Map
    return {
        success = true,
        id = id,
        run_id = result.run_id,
        dataflow_id = result.dataflow_id,
        deduped = result.deduped == true,
    }
end

local function handler(args: any): (any, error?)
    local a: Map = (type(args) == "table") and args or {}
    local actor = actor_id()
    if not actor then return tool_result.fail(errors.PERMISSION_DENIED, "authentication required") end

    local action, action_err = tool_action.check(a, ACTIONS)
    if not action then return nil, action_err end
    if action == "create" then return do_create(a) end
    if action == "import" then return do_import(a, actor :: string) end
    if action == "apply" then return do_apply(a, actor :: string) end
    if action == "publish" then return do_publish(a, actor :: string) end
    if action == "restore" then return do_restore(a, actor :: string) end
    if action == "delete" then return do_delete(a) end
    if action == "run" then return do_run(a) end
    return tool_result.fail(errors.INVALID, "unknown action: " .. action)
end

return { handler = handler }
