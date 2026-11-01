local security = require("security")
local component_reader = require("component_reader")
local ops = require("component_ops")
local teardown = require("teardown")
local envelope = require("envelope")
local error_envelope = require("error_envelope")

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

-- Per-step phrasing for an unregister failure, by path: a plain delete reports the
-- operation, a post-cleanup unregister reports it as "unregister". A step failure
-- carries the kind of the error that stopped it.
local NORMAL_STEP_MSG: { [string]: string } = {
    connect = DATABASE_ERRORS.CONNECTION_FAILED,
    begin = DATABASE_ERRORS.TRANSACTION_FAILED,
    access_check = ACCESS_CHECK_FAILED,
    purge = "Failed to reap component thread",
    delete = DATABASE_ERRORS.DELETE_FAILED,
    commit = DATABASE_ERRORS.COMMIT_FAILED,
    notify = "Failed to notify committed component lifecycle",
}
local CLEANUP_STEP_MSG: { [string]: string } = {
    connect = "failed to connect to database",
    begin = "failed to begin transaction",
    purge = "failed to reap component thread",
    delete = "failed to unregister",
    commit = "failed to commit",
    notify = "failed to notify committed component lifecycle",
}

-- The component contract `delete` method. Gates the caller's DELETE access on the read,
-- then runs the shared teardown core (the impl's deletable cleanup + unregister) under
-- that same gate. The trusted lifecycle system delete (component.system_delete) rides
-- the exact same teardown core without the gate -- one delete path, not two.
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
    local preflight_ok, preflight_step, preflight_err, owns_fence, lease_token = teardown.begin_delete(component_id, user_id, child_policy)
    if not preflight_ok then
        if preflight_step == "busy" and preflight_err == nil then
            return {success = true, component_id = component_id, status = "in_progress", in_progress = true, deleted = false}
        end
        if preflight_step == "access" and not preflight_err then
            return envelope.fail(DATABASE_ERRORS.ACCESS_DENIED, errors.PERMISSION_DENIED)
        end
        return envelope.from_error(preflight_err, NORMAL_STEP_MSG[preflight_step or ""] or DATABASE_ERRORS.DELETE_FAILED)
    end

    -- Run the impl's deletable cleanup (if any). declared=true means the kind wires the
    -- deletable contract: its side data must be released before the row is dropped. A
    -- declared deletable that fails to open or reports a failed cleanup is a hard stop --
    -- unregistering now would strand that side data as an orphan -- so the whole delete
    -- fails and the row stays for the reaper's durable retry. declared=false means no
    -- deletable is wired; the unregister is the only step.
    local declared, cleanup_success, cleanup_err, cleanup_result = teardown.run_deletable(
        component, actor, scope, component_id, delete_options, lease_token)
    if declared and not cleanup_success then
        cleanup_err = teardown.retain_failed_delete(cleanup_err, owns_fence)
        local cleanup_pending = teardown.cleanup_pending(cleanup_err)
        local details = type(cleanup_err) == "userdata" and cleanup_err:details() or nil
        if cleanup_pending then
            local release_err = teardown.release_delete(component_id, lease_token :: string)
            if release_err then
                return envelope.from_error(error_envelope.wrap_secondary(release_err, cleanup_err, "release component delete lease"))
            end
            -- The deletable committed one bounded page and left deleting_at in
            -- place. That mark is owned by the retention continuation, so this
            -- is accepted work in progress rather than a failed delete.
            return {
                success = true,
                component_id = component_id,
                status = "in_progress",
                in_progress = true,
                deleted = false,
                cleanup_pending = true,
                kind = envelope.kind_of(cleanup_err),
                retryable = envelope.retryable_of(cleanup_err),
                details = details,
                discarded = type(details) == "table" and details.discarded or nil,
            }
        end
        local abandon_failure = teardown.abandon_delete(component_id, lease_token :: string)
        local failure = envelope.call_error(cleanup_err, "component deletable cleanup")
        if abandon_failure then
            failure = error_envelope.wrap_secondary(
                envelope.call_error(abandon_failure, "the delete mark stays"), failure, "component deletable cleanup")
        end
        local failed = envelope.from_error(failure)
        return {
            success = false,
            component_id = component_id,
            deleted = false,
            error = "Component deletable cleanup failed: " .. tostring(cleanup_err or "unknown error")
                .. (abandon_failure and "; the delete mark stays: " .. tostring(abandon_failure) or ""),
            kind = failed.kind,
            cleanup_pending = false,
            retryable = failed.retryable,
            details = failed.details,
            discarded = type(details) == "table" and details.discarded or nil,
        }
    end
    local discarded = type(cleanup_result) == "table" and cleanup_result.discarded or nil

    local delete_result, step, err = teardown.unregister(component_id, child_policy, lease_token :: string)
    if step == "purge" and delete_result ~= nil then
        -- The component is released; only its thread reap failed. The release
        -- stands (an unreferenced thread is inert), and the reap error rides the
        -- success response for the caller's log.
        return {
            component_id = component_id,
            deleted = delete_result.deleted == true,
            success = true,
            discarded = discarded,
            warning = "Failed to reap component thread: " .. tostring(err),
            cleanup_pending = teardown.cleanup_pending(err),
            in_progress = teardown.cleanup_pending(err),
            status = teardown.cleanup_pending(err) and "in_progress" or nil,
            retryable = envelope.retryable_of(err),
            details = type(err) == "userdata" and err:details() or nil,
            kind = envelope.kind_of(err),
            thread_discarded = type(err) == "userdata" and type(err.details) == "function"
                and (err:details() or {}).discarded or nil,
        }
    elseif step then
        if declared then
            return envelope.from_error(err, "Cleanup succeeded but " .. (CLEANUP_STEP_MSG[step] or ""))
        end
        return envelope.from_error(err, NORMAL_STEP_MSG[step] or "")
    end

    return {
        component_id = component_id,
        deleted = delete_result.deleted == true,
        success = true,
        discarded = discarded,
        thread_discarded = delete_result.thread_discarded,
        thread_notified = delete_result.thread_notified,
    }
end

return { handle = handle }
