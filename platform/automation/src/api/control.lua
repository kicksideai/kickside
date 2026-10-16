-- The automation control readers over drive and command state:
--   GET  /api/v1/automations/{id}/status?page_token=&page_size=  (READ)
--   GET  /api/v1/automations/health                              (READ, caller-scoped)
--   POST /api/v1/automations/{id}/identity                       (ADMIN)
--        { principal: {kind, id}, request_id, expected_identity_generation }
--   POST /api/v1/automations/{id}/control                        (WRITE)
--        { control: pause|resume|run_now|replay|resync, drive_key?, request_id?, keys?, from?, resolve_identity? }
-- Each handler parses the request and delegates to a response function that
-- owns the policy and envelope.

local http = require("http")
local security = require("security")
local automations_lib = require("automations_lib")
local api_errors = require("api_errors")

type Map = { [string]: any }

local M = {}

local function unauthenticated(errors_mod: any): (number, Map)
    return http.STATUS.UNAUTHORIZED, { success = false, error = errors_mod.error("authentication_required", "authentication required") }
end

local function missing_id(errors_mod: any): (number, Map)
    return http.STATUS.BAD_REQUEST, { success = false, error = errors_mod.error("missing_parameter", "component id is required") }
end

local function failure(errors_mod: any, err: any, code: string, message: string): (number, Map)
    local status, payload = errors_mod.status(err, code, message)
    return status, { success = false, error = payload }
end

function M.get_execution_identity_response(actor: any, component_id: any, deps: any?): (number, Map)
    local d = type(deps) == "table" and deps or {}
    local lib = d.automations_lib or automations_lib
    local errors_mod = d.api_errors or api_errors
    if not actor then
        local status, payload = unauthenticated(errors_mod)
        return status, payload
    end
    if type(component_id) ~= "string" or component_id == "" then
        local status, payload = missing_id(errors_mod)
        return status, payload
    end
    local identity, err = lib.get_execution_identity(component_id)
    if err then
        local status, body = failure(errors_mod, err, "identity_read_failed", "execution identity read failed")
        if body.error.code == "not_found" or body.error.code == "access_denied" then
            return http.STATUS.NOT_FOUND, {success = false, error = errors_mod.error("not_found", "automation not found or access denied")}
        end
        return status, body
    end
    return http.STATUS.OK, {success = true, identity = identity}
end

function M.status_response(actor: any, component_id: any, query: Map, deps: any?): (number, Map)
    local d = type(deps) == "table" and deps or {}
    local lib = d.automations_lib or automations_lib
    local errors_mod = d.api_errors or api_errors
    if not actor then
        local status, payload = unauthenticated(errors_mod)
        return status, payload
    end
    if type(component_id) ~= "string" or component_id == "" then
        local status, payload = missing_id(errors_mod)
        return status, payload
    end
    local opts: Map = {}
    if query.page_size ~= nil and query.page_size ~= "" then
        local size = tonumber(query.page_size)
        if size == nil then
            return http.STATUS.BAD_REQUEST, { success = false, error = errors_mod.error("invalid_request", "page_size must be an integer") }
        end
        opts.page_size = size
    end
    if type(query.page_token) == "string" and query.page_token ~= "" then opts.page_token = query.page_token end

    local status, err = lib.status(component_id :: string, opts)
    if err ~= nil then
        local code, body = failure(errors_mod, err, "status_failed", "status failed")
        if body.error.code == "not_found" or body.error.code == "access_denied" then
            -- READ folds missing and unreadable automations into one opaque denial.
            return http.STATUS.NOT_FOUND, { success = false, error = errors_mod.error("not_found", "automation not found or access denied") }
        end
        return code, body
    end
    -- The engine owns the status projection used by list and detail readers.
    -- Add only HTTP envelope fields; do not maintain a second field allowlist.
    local payload: Map = { success = true, id = component_id }
    for key, value in pairs(status :: Map) do payload[key] = value end
    return http.STATUS.OK, payload
end

function M.health_response(actor: any, deps: any?): (number, Map)
    local d = type(deps) == "table" and deps or {}
    local lib = d.automations_lib or automations_lib
    local errors_mod = d.api_errors or api_errors
    if not actor then
        local status, payload = unauthenticated(errors_mod)
        return status, payload
    end
    local health, err = lib.health()
    if err ~= nil then
        local status, payload = failure(errors_mod, err, "health_failed", "health failed")
        return status, payload
    end
    return http.STATUS.OK, { success = true, health = health }
end

function M.history_response(actor: any, component_id: any, query: Map, deps: any?): (number, Map)
    local d = type(deps) == "table" and deps or {}
    local lib = d.automations_lib or automations_lib
    local errors_mod = d.api_errors or api_errors
    if not actor then
        local status, payload = unauthenticated(errors_mod)
        return status, payload
    end
    if type(component_id) ~= "string" or component_id == "" then
        local status, payload = missing_id(errors_mod)
        return status, payload
    end
    local opts: Map = {kind = query.kind}
    if query.page_size ~= nil and query.page_size ~= "" then
        local size = tonumber(query.page_size)
        if size == nil then
            return http.STATUS.BAD_REQUEST, {success = false, error = errors_mod.error("invalid_request", "page_size must be an integer")}
        end
        opts.page_size = size
    end
    if query.page_token ~= nil then opts.page_token = query.page_token end
    local page, err = lib.history(component_id, opts)
    if err then
        local code, body = failure(errors_mod, err, "history_read_failed", "history read failed")
        if body.error.code == "not_found" or body.error.code == "access_denied" then
            return http.STATUS.NOT_FOUND, {success = false, error = errors_mod.error("not_found", "automation not found or access denied")}
        end
        return code, body
    end
    return http.STATUS.OK, {success = true, kind = page.kind, entries = page.entries, next_page_token = page.next_page_token}
end

function M.set_execution_identity_response(actor: any, component_id: any, body: Map, deps: any?): (number, Map)
    local d = type(deps) == "table" and deps or {}
    local lib = d.automations_lib or automations_lib
    local errors_mod = d.api_errors or api_errors
    if not actor then
        local status, payload = unauthenticated(errors_mod)
        return status, payload
    end
    if type(component_id) ~= "string" or component_id == "" then
        local status, payload = missing_id(errors_mod)
        return status, payload
    end
    local result, err = lib.set_execution_identity(component_id :: string, {
        principal = body.principal,
        request_id = body.request_id,
        expected_identity_generation = body.expected_identity_generation,
        supersede_request_id = body.supersede_request_id,
    })
    if err ~= nil then
        local status, payload = failure(errors_mod, err, "set_execution_identity_failed", "execution-identity change failed")
        return status, payload
    end
    local r = result :: Map
    return http.STATUS.OK, {
        success = true,
        id = component_id,
        request_id = r.request_id,
        generation = r.generation,
        state = r.state,
        outcome = r.outcome,
        identity_generation = r.identity_generation,
    }
end

function M.control_response(actor: any, component_id: any, body: Map, deps: any?): (number, Map)
    local d = type(deps) == "table" and deps or {}
    local lib = d.automations_lib or automations_lib
    local errors_mod = d.api_errors or api_errors
    if not actor then
        local status, payload = unauthenticated(errors_mod)
        return status, payload
    end
    if type(component_id) ~= "string" or component_id == "" then
        local status, payload = missing_id(errors_mod)
        return status, payload
    end
    local result, err = lib.control(component_id :: string, {
        control = body.control, drive_key = body.drive_key, request_id = body.request_id, keys = body.keys, from = body.from,resolve_identity=body.resolve_identity,
    })
    if err ~= nil then
        local status, payload = failure(errors_mod, err, "control_failed", "control failed")
        return status, payload
    end
    local r = result :: Map
    return http.STATUS.OK, {
        success = true,
        id = component_id,
        request_id = r.request_id,
        generation = r.generation,
        state = r.state,
        outcome = r.outcome,
    }
end

local function write(res: any, status: number, payload: Map)
    res:set_status(status)
    res:write_json(payload)
end

local function http_context(): (any?, any?)
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, nil end
    res:set_content_type(http.CONTENT.JSON)
    return res, req
end

function M.status_handler()
    local res, req = http_context()
    if not res or not req then return nil, "no http context" end
    local status, payload = M.status_response(security.actor(), req:param("id"),
        { page_token = req:query("page_token"), page_size = req:query("page_size") })
    write(res, status, payload)
end

function M.health_handler()
    local res, req = http_context()
    if not res or not req then return nil, "no http context" end
    local status, payload = M.health_response(security.actor())
    write(res, status, payload)
end

function M.get_execution_identity_handler()
    local res, req = http_context()
    if not res or not req then return nil, "no http context" end
    local status, payload = M.get_execution_identity_response(security.actor(), req:param("id"))
    write(res, status, payload)
end

function M.set_execution_identity_handler()
    local res, req = http_context()
    if not res or not req then return nil, "no http context" end
    local actor = security.actor()
    if not actor then
        write(res, M.set_execution_identity_response(nil, nil, {}))
        return
    end
    local body: Map = {}
    if req:has_body() then
        local parsed, parse_err = req:body_json()
        if parse_err then
            write(res, http.STATUS.BAD_REQUEST, { success = false, error = api_errors.error("invalid_json", "invalid JSON: " .. parse_err:message()) })
            return
        end
        if type(parsed) == "table" then body = parsed :: Map end
    end
    local status, payload = M.set_execution_identity_response(actor, req:param("id"), body)
    write(res, status, payload)
end

function M.control_handler()
    local res, req = http_context()
    if not res or not req then return nil, "no http context" end
    local actor = security.actor()
    if not actor then
        write(res, M.control_response(nil, nil, {}))
        return
    end
    local body: Map = {}
    if req:has_body() then
        local parsed, parse_err = req:body_json()
        if parse_err then
            write(res, http.STATUS.BAD_REQUEST, { success = false, error = api_errors.error("invalid_json", "invalid JSON: " .. parse_err:message()) })
            return
        end
        if type(parsed) == "table" then body = parsed :: Map end
    end
    local status, payload = M.control_response(actor, req:param("id"), body)
    write(res, status, payload)
end

function M.history_handler()
    local res, req = http_context()
    if not res or not req then return nil, "no http context" end
    local actor, actor_err = security.actor()
    if actor_err then
        local status, payload = failure(api_errors, actor_err, "history_authentication_failed", "history authentication failed")
        write(res, status, payload)
        return
    end
    local status, payload = M.history_response(actor, req:param("id"), {
        kind = req:query("kind"), page_size = req:query("page_size"), page_token = req:query("page_token"),
    })
    write(res, status, payload)
end

return M
