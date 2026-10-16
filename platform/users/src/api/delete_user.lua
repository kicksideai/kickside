local http = require("http")
local security = require("security")
local user_repo = require("user_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local lifecycle_report = require("lifecycle_report")

-- Deleting a user durably reports principal.deleted to the system lifecycle thread.
-- The reaper invokes the users module's idempotent principal-cleanup handler to remove
-- the account, alongside every other module's cleanup and the owned-component cascade.
-- The HTTP request never destroys the account before that durable event exists.
local M = {}

local STATUS_BAD_REQUEST: integer = 400
local STATUS_NOT_FOUND: integer = 404
local STATUS_INTERNAL_ERROR: integer = 500
local STATUS_ACCEPTED: integer = 202

-- process resolves the {id} path param (user_id OR email) to the canonical user_id,
-- enqueues its deletion. Returns (status, body) the HTTP shell writes verbatim. An
-- unknown identifier is a 404, not a repo 500. Completion is asynchronous because
-- the durable lifecycle reaper owns the destructive work and its retries.
function M.process(identifier: string?): (integer, any)
    if not identifier or identifier == "" then
        return STATUS_BAD_REQUEST, { success = false, error = "User ID is required" }
    end

    local user = user_repo.get(identifier)
    if not user then
        return STATUS_NOT_FOUND, { success = false, error = "User not found" }
    end
    local user_id = tostring(user.user_id)

    -- Fence credentials before the asynchronous event is appended. This prevents a
    -- new session from being minted in the window before lifecycle cleanup runs.
    local prepared, prepare_err = user_lifecycle_repo.prepare_delete(user_id)
    if not prepared then
        return STATUS_INTERNAL_ERROR, { success = false, error = "principal deletion preparation failed: " .. tostring(prepare_err) }
    end

    if prepared.retained then
        return STATUS_ACCEPTED, {success = true, result = {
            user_id = user_id, deletion_queued = false, retained = true,
            sessions_revoked = prepared.sessions_revoked or 0,
        }}
    end

    -- The report is the durable deletion intent. If it fails, the account remains
    -- deliberately inactive and this request can be retried safely.
    local reported, report_err = lifecycle_report.principal_deleted(user_id)
    if not reported then
        return STATUS_INTERNAL_ERROR, { success = false, error = "principal deletion report failed: " .. tostring(report_err) }
    end

    local result: { [string]: any } = {
        user_id = user_id,
        deletion_queued = true,
        sessions_revoked = prepared.sessions_revoked or 0,
    }

    return STATUS_ACCEPTED, { success = true, result = result }
end

function M.handler()
    local req = http.request()
    local res = http.response()

    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() or not security.can("access", "kickside.users.api:delete_user.endpoint") then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({ success = false, error = "access denied" })
        return
    end

    local status, body = M.process(req:param("id"))
    res:set_status(status)
    res:write_json(body)
end

return M
