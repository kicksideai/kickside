-- Lifecycle delete reports have two boundaries. The caller must hold the
-- core lifecycle report permission; the private publisher carries the scoped audit
-- capability required to append the framework-owned event.

local funcs = require("funcs")
local uuid = require("uuid")
local execution_identity = require("execution_identity")
local security = require("security")
local consts = require("lifecycle_consts")
local framework_events = require("framework_events")

local M = {}

local REPORT_RESOURCE = "kickside.core.lifecycle:report"
local REPORT_PUBLISHER = "kickside.core.lifecycle:publish_report"

local function report_error(message: string, kind: any): error
    return (errors.new({ message = message, kind = kind }) :: error)
end

local function append(event_type: string, subject_id: string, qualifier: string?): (boolean, error?)
    if type(subject_id) ~= "string" or subject_id == "" then
        return false, report_error("subject_id is required", errors.INVALID)
    end
    local published, publish_err = funcs.call(REPORT_PUBLISHER, {
        event_type = event_type,
        subject_id = subject_id,
        principal_kind = event_type == consts.EVENT.PRINCIPAL_DELETED and qualifier or nil,
        incarnation = event_type == consts.EVENT.COMPONENT_DELETED and qualifier or nil,
    })
    if publish_err then return false, publish_err end
    if published ~= true then
        return false, report_error("lifecycle publisher returned no success result", errors.INTERNAL)
    end
    return true, nil
end

-- This is a function entry with a scoped threads.audit.publish capability.
-- Keep the caller's actor here so the report permission is checked before any
-- system-level append authority is exercised.
function M.publish_report(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    local event_type = args.event_type
    if event_type ~= consts.EVENT.PRINCIPAL_DELETED and event_type ~= consts.EVENT.COMPONENT_DELETED then
        return nil, report_error("unsupported lifecycle event type", errors.INVALID)
    end
    if type(args.subject_id) ~= "string" or args.subject_id == "" then
        return nil, report_error("subject_id is required", errors.INVALID)
    end
    if security.actor() == nil or security.can("lifecycle.report.publish", REPORT_RESOURCE) ~= true then
        return nil, report_error("lifecycle deletion report denied", errors.PERMISSION_DENIED)
    end

    local subject_id = args.subject_id
    local body = {subject_id = subject_id}
    local report_id = event_type .. ":" .. subject_id
    if event_type == consts.EVENT.PRINCIPAL_DELETED then
        local principal, principal_err = execution_identity.check_principal(
            {kind = args.principal_kind or "user", id = subject_id}, "lifecycle report principal")
        if principal_err then return nil, principal_err end
        body.principal_kind = principal.kind
        if principal.kind ~= "user" then report_id = report_id .. ":" .. principal.kind end
    elseif args.incarnation ~= nil then
        if not uuid.validate(subject_id) or type(args.incarnation) ~= "string" or not uuid.validate(args.incarnation) then
            return nil, report_error("component report requires a component id and incarnation", errors.INVALID)
        end
        body.incarnation = args.incarnation
        report_id = report_id .. ":" .. args.incarnation
    end

    local _, append_err = framework_events.append_events({
        thread_id = consts.thread_id(),
        audit = true,
        audit_thread = {
            impl_id = "kickside.core.lifecycle:system_lifecycle",
            thread_class = consts.CLASS,
            audience_principal = { kind = "service", id = consts.SYSTEM_ACTOR },
        },
        events = { {
            type = event_type,
            role = "system",
            body = body,
            external = {
                external_source = "lifecycle",
                external_id = report_id,
                external_version = "1",
            },
        } },
    })
    if append_err then return nil, append_err end
    return true, nil
end

-- principal_deleted reports a deleted principal. The private append function
-- checks the caller's report authority at its boundary.
function M.principal_deleted(principal_id: string, kind: string?): (boolean, error?)
    return append(consts.EVENT.PRINCIPAL_DELETED, principal_id, kind)
end

-- component_deleted reports a component deletion through the same lifecycle
-- publication capability.
function M.component_deleted(component_id: string, incarnation: string?): (boolean, error?)
    return append(consts.EVENT.COMPONENT_DELETED, component_id, incarnation)
end

return M
