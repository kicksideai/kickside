local http = require("http")
local json = require("json")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local kb_search = require("kb_search")
local query_params = require("query_params")

local MAX_QUERY_LIMIT = 100

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local component = deps.component or component
    local kb_search = deps.kb_search or kb_search

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "failed to get http context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local kb_id = req:param("id")
    if not kb_id or kb_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "knowledge base id is required" })
        return
    end

    local _, access_err = component.validate_access(kb_id, component.ACCESS.READ)
    if access_err then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({ success = false, error = "access denied" })
        return
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, body_err = json.decode(raw)
    if body_err or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid json" })
        return
    end

    if not body.query or body.query == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "query is required" })
        return
    end

    -- Cap query byte length before it reaches the embedding model.
    local MAX_QUERY_BYTES = 8192
    if type(body.query) ~= "string" or #body.query > MAX_QUERY_BYTES then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "query must be a string of at most " .. MAX_QUERY_BYTES .. " bytes" })
        return
    end

    local limit, limit_err = query_params.value_int(body.limit, "limit", nil, { min = 1, max = MAX_QUERY_LIMIT })
    if limit_err then
        query_params.bad_request(res, limit_err)
        return
    end

    -- All query orchestration (graph vs document/memory dispatch) lives in the
    -- control-plane facade, so this endpoint never names an engine or routes by
    -- kb_type itself.
    local result, query_err = kb_search.query(kb_id, { query = body.query, limit = limit })
    if query_err then
        res:set_status((http_errors.classify(query_err)))
        res:write_json({ success = false, error = "search failed: " .. tostring(query_err) })
        return
    end
    if not result or not result.success then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json(result or { success = false, error = "search failed" })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json(result)
end

return { handler = handler }
end

local default = new()
default.new = new
return default
