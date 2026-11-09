local security = require("security")
local component_reader = require("component_reader")
local ops = require("component_ops")
local teardown = require("teardown")
local envelope = require("envelope")
local committed_error = require("committed_error")

-- Constants
local VALIDATION_ERRORS = {
    INVALID_REQUEST = "Invalid request: must be a table",
    MISSING_COMPONENT_ID = "component_id is required and must be a non-empty string",
    INVALID_CHILD_POLICY = "child_policy must be reparent_root when provided",
    NO_ACTOR = "No authenticated actor found",
    NO_SCOPE = "No security scope found",
    INVALID_ACTOR = "Invalid actor ID"
}

local DATABASE_ERRORS = {
    CONNECTION_FAILED = "Failed to connect to database",
    TRANSACTION_FAILED = "Failed to begin transaction",
    ACCESS_DENIED = "Component not found or insufficient access to delete",
    DELETE_FAILED = "Failed to delete component",
    COMMIT_FAILED = "Failed to commit transaction"
}

-- A failed read of the caller's grants is a storage failure, not a refusal.
local ACCESS_CHECK_FAILED = "Failed to check component access"

local NORMAL_STEP_MSG: { [string]: string } = {
    connect = DATABASE_ERRORS.CONNECTION_FAILED,
    begin = DATABASE_ERRORS.TRANSACTION_FAILED,
    access_check = ACCESS_CHECK_FAILED,
    purge = "Failed to reap component thread",
    delete = DATABASE_ERRORS.DELETE_FAILED,
    commit = DATABASE_ERRORS.COMMIT_FAILED,
    notify = "Failed to notify committed component lifecycle",
}
-- Authorize the request before committing its deletion intent and job.
local function handle(request_dto)
    if not request_dto or type(request_dto) ~= "table" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_REQUEST, errors.INVALID)
    end

    local component_id = request_dto.component_id
    if not component_id or type(component_id) ~= "string" or component_id == "" then
        return envelope.fail(VALIDATION_ERRORS.MISSING_COMPONENT_ID, errors.INVALID)
    end
    local child_policy = request_dto.child_policy
    if child_policy ~= nil and child_policy ~= "" and child_policy ~= "reparent_root" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_CHILD_POLICY, errors.INVALID)
    end
    if child_policy == "" then child_policy = nil end
    local delete_options = request_dto.delete_options
    if delete_options ~= nil and type(delete_options) ~= "table" then
        return envelope.fail("delete_options must be an object", errors.INVALID)
    end

    local actor = security.actor()
    if not actor then
        return envelope.fail(VALIDATION_ERRORS.NO_ACTOR, errors.PERMISSION_DENIED)
    end
    local user_id = actor:id()
    if not user_id or user_id == "" then
        return envelope.fail(VALIDATION_ERRORS.INVALID_ACTOR, errors.PERMISSION_DENIED)
    end
    local scope = security.scope()
    if not scope then
        return envelope.fail(VALIDATION_ERRORS.NO_SCOPE, errors.PERMISSION_DENIED)
    end

    -- Access-gated read of the component's impl + private context before any write.
    local reader = component_reader.new()
        :with_user(user_id)
        :with_components(component_id)
        :with_access_mask(ops.ACCESS.DELETE)
        :include_options({
            meta = false,
            private_context = true
        })

    local component, read_err = reader:one()
    if read_err then
        return envelope.from_error(read_err)
    end
    -- An absent component and a refused one answer alike, so existence stays hidden.
    if not component then
        return envelope.fail(DATABASE_ERRORS.ACCESS_DENIED, errors.PERMISSION_DENIED)
    end

    -- Reject deterministic unregister blockers before the kind's deletable is
    -- invoked. In particular, a parent delete without an explicit child policy must
    -- leave the kind's backing data untouched so the caller can delete children (or
    -- retry with reparent_root) without restoring already-cleaned state. Past the
    -- gates the delete mark is committed: the component fence refuses consumer
    -- writes from here on.
    local preflight_ok, preflight_step, preflight_err, _, job_id = teardown.begin_delete(component_id, user_id, child_policy, delete_options)
    if not preflight_ok then
        if preflight_step == "access" and not preflight_err then
            return envelope.fail(DATABASE_ERRORS.ACCESS_DENIED, errors.PERMISSION_DENIED)
        end
        return envelope.from_error(preflight_err, NORMAL_STEP_MSG[preflight_step or ""] or DATABASE_ERRORS.DELETE_FAILED)
    end

    return {
        success = true, component_id = component_id, status = "in_progress",
        in_progress = true, deleted = false, cleanup_pending = true, job_id = job_id,
        notification_error = preflight_err and envelope.from_error(committed_error.new(preflight_err)) or nil,
    }
end

return { handle = handle }
