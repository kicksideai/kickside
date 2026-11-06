-- Workflow builder assist endpoints. Edge assist is WRITE-gated because it helps
-- prepare a persisted canvas mutation; binding assist is READ-gated to the target
-- workflow because it only drafts an external trigger-to-Start mapping. Schema
-- assist is actor-gated because its pinned route is shared across schema editor
-- surfaces and has no workflow id.

local http = require("http")
local json = require("json")
local security = require("security")
local repo = require("workflow_repo")
local assist = require("assist")

local M = {}

type Map = { [string]: any }

local function actor_id(): string?
    local actor = security.actor()
    if not actor then return nil end
    local id = actor:id()
    if type(id) == "string" and id ~= "" then return id end
    return nil
end

local function guard_actor(res: any): boolean
    if not actor_id() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication_required", code = "authentication_required", message = "Authentication is required." })
        return false
    end
    return true
end

local function guard_access(res: any, id: string, access: number): boolean
    if not guard_actor(res) then return false end
    local access_err = repo.require_access(id, access)
    if access_err then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({ success = false, error = "access_denied", code = "access_denied", message = "You do not have permission to edit this workflow." })
        return false
    end
    return true
end

local function read_body(req: any): (Map?, string?)
    local raw = req:body()
    if type(raw) ~= "string" or raw == "" then return nil, "invalid JSON body" end
    local decoded, derr = json.decode(raw)
    if derr or type(decoded) ~= "table" then return nil, "invalid JSON body" end
    return decoded :: Map, nil
end

local function write_result(res: any, result: Map): ()
    if result.success == false and result.error == "assist_unavailable" then
        res:set_status(http.STATUS.SERVICE_UNAVAILABLE)
    else
        res:set_status(http.STATUS.OK)
    end
    res:write_json(result)
end

function M.edge()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local id = tostring(req:param("id") or "")
    if not guard_access(res, id, repo.ACCESS.WRITE :: number) then return end

    local body, berr = read_body(req)
    if berr then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = berr })
        return
    end

    local input = body :: Map
    local result: Map
    if input.mode == "intent" then
        result = assist.assist_edge_intent({
            edge = input.edge,
            intent = input.intent,
            upstream_schema = input.upstream_schema,
            downstream_schema = input.downstream_schema,
            upstream_sample = input.upstream_sample,
            downstream_sample = input.downstream_sample,
            source_failure_available = input.source_failure_available,
            available_steps = input.available_steps,
        })
    else
        result = assist.assist_edge({
            edge = input.edge,
            upstream_schema = input.upstream_schema,
            downstream_schema = input.downstream_schema,
            upstream_sample = input.upstream_sample,
            downstream_sample = input.downstream_sample,
        })
    end
    write_result(res, result)
end

function M.binding()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local id = tostring(req:param("id") or "")
    if not guard_access(res, id, repo.ACCESS.READ :: number) then return end

    local body, berr = read_body(req)
    if berr then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = berr })
        return
    end

    local result = assist.assist_binding({
        source_context_schema = (body :: Map).source_context_schema,
        target_start_schema = (body :: Map).target_start_schema,
        source_context_sample = (body :: Map).source_context_sample,
        target_start_sample = (body :: Map).target_start_sample,
        source_root = (body :: Map).source_root,
        intent = (body :: Map).intent,
    })
    write_result(res, result)
end

function M.schema()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not guard_actor(res) then return end

    local body, berr = read_body(req)
    if berr then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = berr })
        return
    end

    local result = assist.assist_schema({
        intent = (body :: Map).intent,
        current_schema = (body :: Map).current_schema,
        context = (body :: Map).context,
    })
    write_result(res, result)
end

function M.config()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local id = tostring(req:param("id") or "")
    if not guard_access(res, id, repo.ACCESS.WRITE :: number) then return end

    local body, berr = read_body(req)
    if berr then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid_request", code = "invalid_request", message = berr })
        return
    end

    local target, target_err = assist.resolve_config_target(id, (body :: Map).node_id)
    if target_err or not target then
        local failure = target_err or { success = false, error = "config_not_supported", code = "config_not_supported", message = "This step has no AI-configurable settings." }
        local code = tostring((failure :: Map).code or "")
        if code == "node_not_found" then res:set_status(http.STATUS.NOT_FOUND)
        elseif code == "state_unavailable" then res:set_status(http.STATUS.INTERNAL_ERROR)
        elseif code == "catalog_unavailable" then res:set_status(http.STATUS.SERVICE_UNAVAILABLE)
        else res:set_status(http.STATUS.BAD_REQUEST) end
        res:write_json(failure)
        return
    end
    local result = assist.assist_config({
        intent = (body :: Map).intent,
        block_id = (target :: Map).block_id,
        block_title = (target :: Map).block_title,
        config_schema = (target :: Map).config_schema,
        current_config = (target :: Map).current_config,
        upstream_schema = (body :: Map).upstream_schema,
    })
    -- Return the exact projected schema used to validate this draft. The inspector can
    -- label and merge the review without carrying a second hand-maintained copy of a
    -- compiler-owned node schema.
    if result.success == true then result.config_schema = (target :: Map).config_schema end
    write_result(res, result)
end

return M
