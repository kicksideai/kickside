local http = require("http")
local json = require("json")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local kb_answer = require("kb_answer")
local query_params = require("query_params")

local MAX_QUERY_LIMIT = 50
local MAX_QUERY_BYTES = 8192

-- Grounded question answering over a KB. Retrieval + answer generation live in
-- the control plane (kb_answer): the per-KB query_driver selects the agentic
-- dataflow agent or single-shot synthesis. Returns the answer plus its sources.
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
        local status = http_errors.classify(access_err)
        local msg = tostring(access_err or "access denied")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
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

    if type(body.query) ~= "string" or body.query == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "query is required" })
        return
    end
    if #body.query > MAX_QUERY_BYTES then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "query must be at most " .. MAX_QUERY_BYTES .. " bytes" })
        return
    end

    local limit, limit_err = query_params.value_int(body.limit, "limit", nil, { min = 1, max = MAX_QUERY_LIMIT })
    if limit_err then
        query_params.bad_request(res, limit_err)
        return
    end

    local result, ask_err = kb_answer.ask(kb_id, { query = body.query, limit = limit })
    if ask_err then
        res:set_status((http_errors.classify(ask_err)))
        res:write_json({ success = false, error = "ask failed: " .. tostring(ask_err) })
        return
    end
    if not result or not result.success then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json(result or { success = false, error = "ask failed" })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json(result)
end

return { handler = handler }
