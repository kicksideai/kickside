-- Execution-plane API: publish + versions (read), exact published run / explicit
-- owner simulation, runs read model, and past-run inspection. Publish, run, and
-- simulate are WRITE-gated; reads are READ-gated. Structured compile errors on
-- publish/simulate surface as 422 so the client can render them.

local http = require("http")
local http_errors = require("http_errors")
local json = require("json")
local security = require("security")
local repo = require("workflow_repo")
local version_publish = require("version_publish")
local version_read = require("version_read")
local runs_launch = require("runs_launch")
local runs_read = require("runs_read")
local default_runs_completion = require("runs_completion")
local runs_debug = require("runs_debug")
local run_errors = require("runs_state")

local function new(dependencies: any?): any
local supplied = type(dependencies) == "table" and dependencies or {}
local repo = supplied.workflow_repo or repo
local version_read = supplied.version_read or version_read
local selected_runs_launch = supplied.runs_launch or runs_launch
local runs_completion = supplied.runs_completion or default_runs_completion
local runs_debug = supplied.runs_debug or runs_debug
local http_runtime = supplied.http or http
local security_runtime = supplied.security or security
local M = {}

type Map = { [string]: any }
local function map(value: any): Map return type(value) == "table" and (value :: Map) or {} end

local ERROR_STATUS: { [string]: number } = {
    authentication_required = http.STATUS.UNAUTHORIZED,
    access_denied = http.STATUS.FORBIDDEN,
    run_not_found = http.STATUS.NOT_FOUND,
    version_not_found = http.STATUS.NOT_FOUND,
    not_published = http.STATUS.CONFLICT,
    run_terminal = http.STATUS.CONFLICT,
    dataflow_terminal = http.STATUS.CONFLICT,
    await_not_pending = http.STATUS.CONFLICT,
    await_ambiguous = http.STATUS.CONFLICT,
    compile_failed = 422,
    publish_refused = 422,
}

local function ctx(): (any?, any?, string?)
    local http_mod = http_runtime
    local req = http_mod.request()
    local res = http_mod.response()
    if not req or not res then return nil, nil, "no http context" end
    res:set_content_type(http_mod.CONTENT.JSON)
    return req, res, nil
end

local function actor_id(): string?
    local security_mod = security_runtime
    local actor = security_mod.actor()
    if not actor then return nil end
    local id = actor:id()
    if type(id) == "string" and id ~= "" then return id end
    return nil
end

local function body(req: any): Map
    local raw = req:body()
    if type(raw) ~= "string" or raw == "" then return {} end
    local decoded, derr = json.decode(raw)
    if derr or type(decoded) ~= "table" then return {} end
    return decoded :: Map
end

function M.launch_error_body(err: any): Map
    local body: Map = {
        success = false,
        error = run_errors.error_message(err),
        code = run_errors.error_code(err),
    }
    if type(err) == "table" and type((err :: Map).details) == "table" then body.details = (err :: Map).details end
    return body
end

function M.error_status(err: any): number
    if type(err) == "table" and type(err.code) == "string" and err.code ~= "" then
        return ERROR_STATUS[run_errors.error_code(err)] or http.STATUS.BAD_REQUEST
    end
    return http_errors.classify(err)
end

local function write_error(res: any, err: any): ()
    res:set_status(M.error_status(err))
    res:write_json(M.launch_error_body(err))
end

local function guard(res: any, id: string, mask: number): boolean
    if not actor_id() then
        write_error(res, run_errors.launch_error("authentication_required", "authentication required"))
        return false
    end
    local access_err = repo.require_access(id, mask :: number)
    if access_err then
        write_error(res, access_err)
        return false
    end
    return true
end

local function first_error_message(errors: any, fallback: string): string
    local first = type(errors) == "table" and (errors :: { any })[1] or nil
    if type(first) == "table" and type((first :: Map).message) == "string" then return tostring((first :: Map).message) end
    return fallback
end

function M.run_request(workflow_id: string, request_body: any): (Map?, any?)
    local b = type(request_body) == "table" and (request_body :: Map) or {}
    local version = b.version
    if type(version) ~= "number" or version < 1 or version ~= math.floor(version) then
        return nil, map(run_errors.launch_error(
            "flow_ref_invalid",
            "published Flow execution requires an explicit positive integer version"
        ))
    end
    local result, err = selected_runs_launch.launch(workflow_id, {
        input = type(b.input) == "table" and b.input or {},
        version = version,
        trigger_kind = "manual",
        trigger_id = b.trigger_id,
        dedup_key = b.dedup_key,
    })
    if err then
        return nil, err
    end
    if type(result) ~= "table" then
        return nil, map(run_errors.launch_error("launch_failed", "workflow launch returned no result"))
    end
    return {
        success = true,
        run_id = (result :: Map).run_id,
        dataflow_id = (result :: Map).dataflow_id,
        deduped = (result :: Map).deduped == true,
    }, nil
end

-- The detail payload deliberately keeps terminal output on the run object: error and
-- version are already run-level fields, and a completed run's Finish payload is its
-- corresponding result. Non-completed runs omit output rather than emitting null.
function M.run_detail_response(workflow_id: string, run_id: string): (Map?, error?)
    local debug, err = runs_debug.debug_detail(workflow_id, run_id)
    if err then return nil, err end
    if not debug then return nil, nil end
    local run = (debug :: Map).run :: Map

    if tostring(run.status or "") == "completed" then
        local output = select(1, runs_completion.output_for_run(run_id))
        if output ~= nil then run.output = output end
    end

    return {
        success = true,
        run = run,
        input = (debug :: Map).input,
        error_routed = (debug :: Map).error_routed == true,
        execution = (debug :: Map).execution,
        nodes = (debug :: Map).nodes or {},
    }, nil
end

-- POST /workflows/{id}/publish
function M.publish()
    local req, res = ctx()
    if not req then return end
    local id = tostring(req:param("id") or "")
    if not guard(res, id, repo.ACCESS.WRITE :: number) then return end
    local result, err = version_publish.publish(id, actor_id())
    if err then
        write_error(res, err)
        return
    end
    if type(result) ~= "table" or (result :: Map).ok ~= true then
        local errors = type(result) == "table" and (result :: Map).errors or {}
        write_error(res, run_errors.launch_error("publish_refused", first_error_message(errors, "publish refused"), { errors = errors }))
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, version = (result :: Map).version, def_seq = (result :: Map).def_seq, hash = (result :: Map).hash })
end

-- GET /workflows/{id}/versions
function M.list_versions()
    local req, res = ctx()
    if not req then return end
    local id = tostring(req:param("id") or "")
    if not guard(res, id, repo.ACCESS.READ :: number) then return end
    local rows, err = version_read.list(id)
    if err then res:set_status((http_errors.classify(err))); res:write_json({ success = false, error = tostring(err) }); return end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, versions = rows or {} })
end

-- GET /workflows/{id}/versions/{n}
function M.get_version()
    local req, res = ctx()
    if not req then return end
    local id = tostring(req:param("id") or "")
    if not guard(res, id, repo.ACCESS.READ :: number) then return end
    local v, err = version_read.get(id, tonumber(req:param("n")))
    if err then res:set_status((http_errors.classify(err))); res:write_json({ success = false, error = tostring(err) }); return end
    if not v then res:set_status(http.STATUS.NOT_FOUND); res:write_json({ success = false, error = "version not found" }); return end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, version = v })
end

-- GET /workflows/{id}/versions/diff?from_version=&to_version=
function M.diff_versions()
    local req, res = ctx()
    if not req then return end
    local id = tostring(req:param("id") or "")
    if not guard(res, id, repo.ACCESS.READ :: number) then return end
    local diff, err = version_read.diff(id, req:query("from_version"), req:query("to_version"))
    if err then
        write_error(res, err)
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, diff = diff })
end

-- POST /workflows/{id}/run { version, input?, trigger_id?, dedup_key? } -> { run_id }
-- Launching an exact published version is use, not modification: READ suffices,
-- matching the published catalog. Draft simulation and publish stay WRITE-gated.
function M.run()
    local req, res = ctx()
    if not req then return end
    local id = tostring(req:param("id") or "")
    if not guard(res, id, repo.ACCESS.READ :: number) then return end
    local b = body(req)
    local result, err = M.run_request(id, b)
    if err then
        write_error(res, err)
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json(result)
end

-- POST /workflows/{id}/simulate { input? } -> { run_id }
function M.simulate()
    local req, res = ctx()
    if not req then return end
    local id = tostring(req:param("id") or "")
    if not guard(res, id, repo.ACCESS.WRITE :: number) then return end
    local b = body(req)
    local result, err = selected_runs_launch.simulate(id, {
        input = type(b.input) == "table" and b.input or nil,
    })
    if err then
        write_error(res, err)
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, run_id = (result :: Map).run_id })
end

-- GET /workflows/{id}/runs?limit&offset&status
function M.list_runs()
    local req, res = ctx()
    if not req then return end
    local id = tostring(req:param("id") or "")
    if not guard(res, id, repo.ACCESS.READ :: number) then return end
    local rows, err, next_offset = runs_read.list_runs(id, {
        limit = tonumber(req:query("limit")),
        offset = tonumber(req:query("offset")),
        status = req:query("status"),
    })
    if err then res:set_status((http_errors.classify(err))); res:write_json({ success = false, error = tostring(err) }); return end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, runs = rows or {}, next_offset = next_offset })
end

-- GET /workflows/{id}/runs/{run_id} -> run row (+ Finish output when completed) + dataflow node headers
function M.get_run()
    local req, res = ctx()
    if not req then return end
    local id = tostring(req:param("id") or "")
    if not guard(res, id, repo.ACCESS.READ :: number) then return end
    local run_id = tostring(req:param("run_id") or "")
    local detail, err = M.run_detail_response(id, run_id)
    if err then res:set_status((http_errors.classify(err))); res:write_json({ success = false, error = tostring(err) }); return end
    if not detail then res:set_status(http.STATUS.NOT_FOUND); res:write_json({ success = false, error = "run not found" }); return end
    res:set_status(http.STATUS.OK)
    res:write_json(detail)
end

-- GET /workflows/{id}/runs/{run_id}/nodes/{def_node_id}/data?limit&offset
function M.run_node_data()
    local req, res = ctx()
    if not req then return end
    local id = tostring(req:param("id") or "")
    if not guard(res, id, repo.ACCESS.READ :: number) then return end
    local rows, err, next_offset = runs_completion.run_node_data(id, tostring(req:param("run_id") or ""), tostring(req:param("def_node_id") or ""), {
        limit = tonumber(req:query("limit")),
        offset = tonumber(req:query("offset")),
    })
    if err then res:set_status((http_errors.classify(err))); res:write_json({ success = false, error = tostring(err) }); return end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, data = rows or {}, next_offset = next_offset })
end

-- GET /workflows/{id}/runs/{run_id}/events?limit&offset
function M.run_events()
    local req, res = ctx()
    if not req then return end
    local id = tostring(req:param("id") or "")
    if not guard(res, id, repo.ACCESS.READ :: number) then return end
    local timeline, err = runs_debug.run_timeline(id, tostring(req:param("run_id") or ""), {
        limit = tonumber(req:query("limit")), offset = tonumber(req:query("offset")),
    })
    if err then res:set_status((http_errors.classify(err))); res:write_json({ success = false, error = tostring(err) }); return end
    if not timeline then res:set_status(http.STATUS.NOT_FOUND); res:write_json({ success = false, error = "run not found" }); return end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, timeline = timeline })
end

-- GET /workflows/{id}/runs/{run_id}/export
function M.run_export()
    local req, res = ctx()
    if not req then return end
    local id = tostring(req:param("id") or "")
    if not guard(res, id, repo.ACCESS.READ :: number) then return end
    local export, err = runs_debug.run_export(id, tostring(req:param("run_id") or ""))
    if err then res:set_status((http_errors.classify(err))); res:write_json({ success = false, error = tostring(err) }); return end
    if not export then res:set_status(http.STATUS.NOT_FOUND); res:write_json({ success = false, error = "run not found" }); return end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, export = export })
end

return M
end

local default = new()
default.new = new
return default
