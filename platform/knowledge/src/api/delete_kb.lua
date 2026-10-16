local http = require("http")
local security = require("security")
local component = require("component")
local contract = require("contract")
local http_errors = require("http_errors")

local KNOWLEDGE_BASES_CONTRACT = "kickside.knowledge:knowledge_bases"

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "failed to get http context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
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

    local _, access_err = component.validate_access(kb_id, component.ACCESS.DELETE)
    if access_err then
        local status = http_errors.classify(access_err)
        local msg = tostring(access_err or "access denied")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    -- Knowledge owns KB teardown. The knowledge_bases service fans delete_store
    -- across every engine before removing the component, so engine-owned rows
    -- without a cross-connection FK cascade are not orphaned.
    local kb_def, def_err = contract.get(KNOWLEDGE_BASES_CONTRACT)
    if def_err or not kb_def then
        res:set_status((http_errors.classify(def_err)))
        res:write_json({ success = false, error = "knowledge_bases contract unavailable: " .. tostring(def_err) })
        return
    end
    local kb_svc, open_err = kb_def:with_actor(actor):with_scope(scope):open()
    if open_err or not kb_svc then
        res:set_status((http_errors.classify(open_err)))
        res:write_json({ success = false, error = "knowledge_bases open failed: " .. tostring(open_err) })
        return
    end

    local result, del_err = kb_svc:delete({ component_id = kb_id })
    if del_err or not result then
        local status = http_errors.classify(del_err)
        local msg = tostring(del_err or "delete failed")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    res:set_status(result.in_progress == true and http.STATUS.ACCEPTED or http.STATUS.OK)
    res:write_json({ success = true, deleted = result.deleted == true,
        in_progress = result.in_progress == true, status = result.status, cleanup_pending = result.cleanup_pending,
        kind = result.kind, retryable = result.retryable, details = result.details, discarded = result.discarded })
end

return { handler = handler }
