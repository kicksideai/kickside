-- teardown: the shared component-delete core -- run the impl's deletable cleanup and
-- unregister the component row. The gated contract delete (delete_component_func) and
-- the trusted lifecycle-engine system delete (component.system_delete) both ride this:
-- the cascade is identical, the access gate is the only difference. This mirrors how
-- writer.append_system shares all of ingest_events_batch and only drops the WRITE gate,
-- so there is one delete path, not two.

local sql = require("sql")
local contract = require("contract")
local registry = require("registry")
local security = require("security")
local time = require("time")
local uuid = require("uuid")
local component_types = require("component_types")
local ops = require("component_ops")
local placement = require("placement")
local component_lifecycle = require("component_lifecycle")
local error_envelope = require("error_envelope")

local M = {}

local DELETABLE_CONTRACT = "kickside.contract:deletable"
local THREADS_CONTRACT = "kickside.core:threads"
local REAP_TABLE = "kickside_component_thread_reap"

local function internal(message: string, cause: any): error
    if type(cause) == "userdata" then return errors.wrap(cause :: error, message) end
    return errors.new({message = message .. ": " .. tostring(cause), kind = errors.INTERNAL, retryable = false,
        details = {code = "component_teardown_response"}})
end


local function declares_deletable(impl_id: string): (boolean, error?)
    local permitted = security.can("registry.get", impl_id)
    if permitted == false then
        return false, errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
            message = "component cleanup declaration lookup denied", details = {code = "component_cleanup_declaration_access"}})
    end
    if permitted ~= true then return false, internal("component cleanup declaration permission is invalid", "permission") end
    local entries, err = registry.find({[".id"] = impl_id})
    if err then return false, internal("component cleanup declaration lookup failed", err) end
    if type(entries) ~= "table" then return false, internal("component cleanup declaration response is invalid", "entries") end
    for index, value in pairs(entries) do
        if index ~= 1 or type(value) ~= "table" or value.id ~= impl_id then
            return false, internal("component cleanup declaration response is invalid", "entries.identity")
        end
    end
    local entry = entries[1]
    if entry == nil then return false end
    local data = (entry :: any).data
    if type(data) ~= "table" then return false end
    local contracts = (data :: { [string]: any }).contracts
    if type(contracts) ~= "table" then return false end
    for _, raw in ipairs(contracts :: { any }) do
        local declared = type(raw) == "table" and (raw :: { [string]: any }) or {}
        if declared.contract == DELETABLE_CONTRACT then return true end
    end
    return false
end

-- purge_primary_thread reaps a component's own event-log thread (thread_id ==
-- component_id) through the threads contract: its events, projections, cursors,
-- retention. This is the component-driven delete cascade -- deleting a component reaps
-- its thread instead of orphaning it. Idempotent (a never-emitted component has no
-- thread) and a no-op when no threads contract is wired. Runs AFTER the component row
-- is released; a durable reap pointer survives any failure. Opened on the
-- ambient actor so the gated path checks DELETE and the trusted system delete runs as
-- the lifecycle engine.
local function purge_primary_thread(component_id: string): (any?, error?)
    if type(component_id) ~= "string" or component_id == "" then return nil, nil end
    local def, contract_err = contract.get(THREADS_CONTRACT)
    if contract_err then return nil, internal("thread purge contract unavailable", contract_err) end
    if not def then return nil, nil end
    local inst, open_err = (def :: any):open()
    inst, open_err = error_envelope.binding(inst, open_err, "purge", "thread purge contract could not be opened", "component_teardown_response")
    if open_err then return nil, open_err end
    local result, purge_err = (inst :: any):purge({ component_id = component_id })
    if purge_err then return nil, purge_err end
    if type(result) ~= "table" or result.purged ~= true then
        return nil, internal("thread purge returned no deletion proof", component_id)
    end
    return result, nil
end

local function remove_reap_pointer(component_id: string): error?
    local db, db_err = sql.get(ops.db_id())
    if db_err or not db then return internal("thread reap database unavailable", db_err) end
    local result, delete_err = db:execute("DELETE FROM " .. REAP_TABLE .. " WHERE component_id=$1", { component_id })
    local operation_err = delete_err and internal("thread reap pointer delete failed", delete_err) or nil
    if not operation_err and (not result or tonumber(result.rows_affected) == nil) then
        operation_err = internal("thread reap pointer delete returned no affected-row count", component_id)
    end
    return error_envelope.cleanup(function(): (any, error?) return db:release() end,
        operation_err, "thread reap pointer database release failed")
end

-- The component row and this pointer commit together. A failed post-commit
-- purge, or a crash before it, therefore leaves an address for the existing
-- retention tick to retry. Core's purge is idempotent after a prior success.
function M.reap_pending(limit: integer): (integer?, error?, boolean?, table[]?)
    if type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 50 then
        return nil, (errors.new({ message = "thread reap limit must be in [1,50]", kind = errors.INVALID }) :: error)
    end
    local db, db_err = sql.get(ops.db_id())
    if db_err or not db then return nil, internal("thread reap database unavailable", db_err) end
    local rows, read_err = db:query("SELECT component_id FROM " .. REAP_TABLE
        .. " ORDER BY last_attempt_at,created_at,component_id LIMIT $1", { limit })
    local scan_err = read_err and internal("thread reap scan failed", read_err) or nil
    if not scan_err and type(rows) ~= "table" then
        scan_err = internal("thread reap scan returned no rows result", "missing result")
    end
    scan_err = error_envelope.cleanup(function(): (any, error?) return db:release() end,
        scan_err, "thread reap scan database release failed")
    if scan_err then return nil, scan_err end
    local count = 0
    local first_error: error? = nil
    local needs_continue = false
    local blocked: table[] = {}
    for _, row in ipairs(rows) do
        local id = tostring(row.component_id)
        local _, purge_err = purge_primary_thread(id)
        if purge_err then
            local attempt_db, open_err = sql.get(ops.db_id())
            if open_err or not attempt_db then return nil, internal("thread reap retry database unavailable", open_err) end
            local _, attempt_err = attempt_db:execute("UPDATE " .. REAP_TABLE
                .. " SET last_attempt_at=$1 WHERE component_id=$2",
                { time.now():utc():format_rfc3339(), id })
            local stamp_err = attempt_err and error_envelope.wrap_secondary(
                internal("thread reap retry stamp failed", attempt_err), purge_err, "thread reap retry stamp failed") or nil
            local cleanup_err = error_envelope.cleanup(function(): (any, error?) return attempt_db:release() end,
                stamp_err, "thread reap retry database release failed")
            if cleanup_err then
                if not stamp_err then cleanup_err = error_envelope.wrap_secondary(cleanup_err, purge_err, "thread reap retry database release failed") end
                return nil, cleanup_err
            end
            local pending, continuation = M.cleanup_pending(purge_err)
            if continuation then needs_continue = true
            elseif pending then blocked[#blocked + 1] = { component_id = id, error = purge_err }
            elseif first_error == nil then first_error = purge_err end
        else
            local remove_err = remove_reap_pointer(id)
            if remove_err then return nil, remove_err end
            count = count + 1
        end
    end
    if first_error then return nil, first_error end
    return count, nil, needs_continue or (#rows == limit and count > 0), blocked
end

-- run_deletable invokes the impl's deletable.delete (its own backing-data teardown)
-- when the component kind declares the contract. A declared contract that cannot be
-- opened is a cleanup failure, so callers retain the component row for a safe retry.
function M.run_deletable(component: any, actor: any, scope: any, component_id: string, delete_options: any?, lease_token: string?): (boolean, boolean, any, any)
    local impl_id = type(component) == "table" and (component :: any).impl_id or nil
    if type(impl_id) ~= "string" or impl_id == "" then
        return false, false, nil
    end
    local deletable_contract, contract_err = contract.get(DELETABLE_CONTRACT)
    if contract_err then return true, false, internal("component cleanup contract unavailable", contract_err) end
    if not deletable_contract then return false, false, nil end
    local declared, declaration_err = declares_deletable(impl_id :: string)
    if declaration_err then return true, false, declaration_err end
    if not declared then return false, false, nil end

    local ctx: { [string]: any } = {}
    if type((component :: any).private_context) == "table" then
        for k, v in pairs((component :: any).private_context :: { [string]: any }) do ctx[k] = v end
    end
    ctx.component_id = component_id
    ctx.lease_token = lease_token

    -- Chain actor/scope only when present: the gated delete always has both; the
    -- trusted system delete may run with no ambient actor, in which case the deletable
    -- is opened bare (the canonical "opened without an actor" trusted idiom).
    local method = actor ~= nil and "with_actor" or (scope ~= nil and "with_scope" or "open")
    local opener, bind_err = error_envelope.binding(deletable_contract, nil, method, "component cleanup contract is invalid", "component_teardown_response")
    if bind_err then return true, false, bind_err end
    if actor ~= nil then
        local bound, actor_err = (opener :: any):with_actor(actor)
        opener, bind_err = error_envelope.binding(bound, actor_err, scope ~= nil and "with_scope" or "open", "component cleanup actor binding failed", "component_teardown_response")
        if bind_err then return true, false, bind_err end
    end
    if scope ~= nil then
        local bound, scope_err = (opener :: any):with_scope(scope)
        opener, bind_err = error_envelope.binding(bound, scope_err, "open", "component cleanup scope binding failed", "component_teardown_response")
        if bind_err then return true, false, bind_err end
    end
    local instance, open_err = (opener :: any):open(impl_id :: string, ctx)
    instance, open_err = error_envelope.binding(instance, open_err, "delete", "component cleanup contract could not be opened", "component_teardown_response")
    if open_err then return true, false, open_err end
    local request: { [string]: any } = {}
    if delete_options ~= nil then request.options = delete_options end
    local cleanup_result, cleanup_err = (instance :: any):delete(request)
    local cleanup_success = (not cleanup_err and cleanup_result and (cleanup_result :: any).success) and true or false
    local reported_error = type(cleanup_result) == "table" and (cleanup_result :: any).error or nil
    return true, cleanup_success, cleanup_err or reported_error, cleanup_result
end

-- A kind that committed a bounded cleanup page keeps the delete fence until
-- the retention slot resumes it. Ordinary failures still abandon the mark.
function M.cleanup_pending(err: any): (boolean, boolean)
    if type(err) ~= "userdata" then return false, false end
    local details = (err :: any):details()
    local pending = type(details) == "table" and details.cleanup_pending == true
    return pending, pending and details.needs_continue == true
        and details.wait_for == nil and details.blocked_operation == nil
end

function M.retain_failed_delete(err: any, owns_fence: boolean?): any
    if owns_fence == true or M.cleanup_pending(err) then return err end
    if type(err) == "userdata" then
        return error_envelope.wrap(err :: error, "component cleanup retry failed",
            {cleanup_pending = true, wait_for = "cleanup_retry"})
    end
    return (errors.new({ message = "component cleanup retry failed: " .. tostring(err or "unknown error"),
        kind = errors.CONFLICT, retryable = true,
        details = { cleanup_pending = true, wait_for = "cleanup_retry", cause = err } }) :: error)
end

local function abort_transaction(db: any, tx: any, primary: error?): error?
    local err = error_envelope.cleanup(function(): (any, error?) return tx:rollback() end,
        primary, "rollback component teardown")
    return error_envelope.cleanup(function(): (any, error?) return db:release() end,
        err, "release component teardown database")
end


-- Begin a delete: check every deterministic component-row deletion gate, then
-- commit the delete mark, all before an implementation's deletable is allowed to
-- mutate its own store. The gates keep known-invalid requests (most importantly a
-- parent with children and no child_policy) from consuming their side data; the
-- real unregister repeats them in its write transaction. The mark makes the
-- component fence refuse every consumer write from here on, so nothing lands in
-- the backing data the cleanup releases before the row goes. On PostgreSQL the
-- mark waits for the writes already past the fence.
-- Returns (ok, step?, err?, owns_fence?, lease_token?). A busy attempt runs no cleanup.

function M.begin_delete(component_id: string, gate_user_id: string?, child_policy: string?): (boolean, string?, any, boolean?, string?)
    local db, db_err = sql.get(ops.db_id())
    if db_err then return false, "connect", db_err end
    local tx, tx_err = db:begin()
    if tx_err then
        return false, "begin", error_envelope.cleanup(function(): (any, error?) return db:release() end,
            tx_err, "release component teardown database")
    end

    local tree_err = placement.lock_tree(tx)
    if tree_err then
        return false, "delete", abort_transaction(db, tx, tree_err)
    end

    if gate_user_id ~= nil then
        local has_access, access_err = ops.check_user_access(tx, gate_user_id, component_id, ops.ACCESS.DELETE)
        if access_err then
            return false, "access_check", abort_transaction(db, tx, access_err)
        end
        if not has_access then
            return false, "access", abort_transaction(db, tx, nil)
        end
    end

    local _, validation_err = ops.validate_delete_tx(tx, {
        component_id = component_id,
        child_policy = child_policy,
    })
    if validation_err then
        return false, "delete", abort_transaction(db, tx, validation_err)
    end
    local locked, lock_err = tx:execute("UPDATE kickside_components"
        .. " SET context_revision=context_revision WHERE component_id=$1", { component_id })
    if lock_err or not locked or tonumber(locked.rows_affected) == nil then
        return false, "delete", abort_transaction(db, tx, internal("component delete fence lock failed", lock_err or "missing row proof"))
    end
    local rows, fence_err = tx:query("SELECT deleting_at FROM kickside_components WHERE component_id=$1", { component_id })
    if fence_err or type(rows) ~= "table" then
        return false, "delete", abort_transaction(db, tx, internal("component delete fence read failed", fence_err or "missing result"))
    end
    local owns_fence = rows[1] ~= nil and rows[1].deleting_at == nil
    local lease_token = uuid.v7()
    local mark_err, claimed = ops.mark_deleting_tx(tx, component_id, true, lease_token)
    if mark_err then return false, "delete", abort_transaction(db, tx, mark_err) end
    if not claimed then
        local abort_err = abort_transaction(db, tx, nil)
        return false, abort_err and "delete" or "busy", abort_err
    end
    local _, commit_err = tx:commit()
    commit_err = error_envelope.cleanup(function(): (any, error?) return db:release() end,
        commit_err, "release component teardown database")
    if commit_err then return false, "commit", commit_err, owns_fence end
    return true, nil, nil, owns_fence, lease_token
end

-- Abandon a begun delete whose deletable cleanup failed: the component lives on
-- and the fence admits writes to it again.
function M.abandon_delete(component_id: string, lease_token: string): any
    local db, db_err = sql.get(ops.db_id())
    if db_err then return db_err end
    local err = (ops.mark_deleting_tx(db, component_id, false, lease_token) :: error?)
    return error_envelope.cleanup(function(): (any, error?) return db:release() end,
        err, "release component teardown database")
end

local function release_delete_tx(tx: any, component_id: string, lease_token: string): error?
    local result, err = tx:execute("UPDATE kickside_components SET lease_token=NULL,lease_until=NULL"
        .. " WHERE component_id=$1 AND lease_token=$2", {component_id, lease_token})
    if err then return errors.wrap(err, "release component delete lease") end
    if not result or tonumber(result.rows_affected) == nil then
        return internal("component delete lease release returned no affected-row count", "missing row proof")
    end
    if tonumber(result.rows_affected) == 0 then return component_types.lease_lost_error() end
    return nil
end

-- A bounded cleanup page retains its write fence but releases this attempt.
function M.release_delete(component_id: string, lease_token: string): error?
    local db, db_err = sql.get(ops.db_id())
    if db_err then return db_err end
    local err = release_delete_tx(db, component_id, lease_token)
    return error_envelope.cleanup(function(): (any, error?) return db:release() end,
        err, "release component teardown database")
end

-- Consume only the claimed fence, holding its row lock through unregister.
function M.unregister(component_id: string, child_policy: string?, lease_token: string): (any, string?, any)
    local db, err_db = sql.get(ops.db_id())
    if err_db then return nil, "connect", err_db end

    local tx, err_tx = db:begin()
    if err_tx then
        return nil, "begin", error_envelope.cleanup(function(): (any, error?) return db:release() end,
            err_tx, "release component teardown database")
    end

    local tree_err = placement.lock_tree(tx)
    if tree_err then
        return nil, "delete", abort_transaction(db, tx, tree_err)
    end

    local locked, lock_err = tx:execute("UPDATE kickside_components"
        .. " SET context_revision=context_revision WHERE component_id=$1 AND lease_token=$2", {component_id, lease_token})
    if lock_err or not locked or tonumber(locked.rows_affected) == nil then
        lock_err = internal("component unregister lock failed", lock_err or "missing row proof")
    elseif tonumber(locked.rows_affected) == 0 then
        lock_err = component_types.lease_lost_error()
    end
    if lock_err then return nil, "delete", abort_transaction(db, tx, lock_err) end
    local rows, fence_err = tx:query("SELECT deleting_at FROM kickside_components WHERE component_id=$1", { component_id })
    if fence_err or type(rows) ~= "table" then
        return nil, "delete", abort_transaction(db, tx, internal("component unregister fence read failed", fence_err or "missing result"))
    end
    if rows[1] and rows[1].deleting_at == nil then
        return nil, "delete", abort_transaction(db, tx, (errors.new({ message = "component delete fence is not committed", kind = errors.CONFLICT }) :: error))
    end

    local summary, summary_err = ops.component_summary_tx(tx, component_id)
    if summary_err then
        return nil, "delete", abort_transaction(db, tx, summary_err)
    end
    local parent_impl_id: string? = nil
    if summary and (summary :: any).parent_id ~= nil then
        local parent_summary, parent_summary_err = ops.component_summary_tx(tx, tostring((summary :: any).parent_id))
        if parent_summary_err then
            return nil, "delete", abort_transaction(db, tx, parent_summary_err)
        end
        if parent_summary then parent_impl_id = tostring((parent_summary :: any).impl_id) end
    end

    local delete_result, err_delete = ops.dispatch(tx, db, {
        type = ops.COMMAND_TYPES.DELETE_COMPONENT,
        payload = { component_id = component_id, child_policy = child_policy },
    })
    if not err_delete and delete_result and delete_result.pending then
        err_delete = release_delete_tx(tx, component_id, lease_token)
    end
    if err_delete then
        return nil, "delete", abort_transaction(db, tx, err_delete)
    end

    if delete_result and delete_result.changes_made and summary then
        local dbtype_raw, dbtype_err = db:type()
        if dbtype_err then
            return nil, "delete", abort_transaction(db, tx, dbtype_err)
        end
        local lifecycle_err = component_lifecycle.deleted({
            tx = tx,
            dbtype = tostring(dbtype_raw),
            component_id = component_id,
            impl_id = tostring((summary :: any).impl_id),
            parent_id = (summary :: any).parent_id,
            parent_impl_id = parent_impl_id,
        })
        if lifecycle_err then
            return nil, "delete", abort_transaction(db, tx, lifecycle_err)
        end
        local pointer_result, pointer_err = tx:execute("INSERT INTO " .. REAP_TABLE
            .. " (component_id,created_at) VALUES ($1,$2) ON CONFLICT (component_id) DO NOTHING",
            { component_id, time.now():utc():format_rfc3339() })
        if pointer_err or not pointer_result or tonumber(pointer_result.rows_affected) == nil then
            return nil, "delete", abort_transaction(db, tx, internal("failed to record primary-thread reap", pointer_err or "missing affected-row count"))
        end
    end

    local _, err_commit = tx:commit()
    if err_commit then
        return nil, "commit", abort_transaction(db, tx, err_commit)
    end

    local release_err = error_envelope.cleanup(function(): (any, error?) return db:release() end,
        nil, "release component teardown database")
    if release_err then return nil, "commit", release_err end

    if delete_result and delete_result.changes_made and summary then
        local committed_err = component_lifecycle.committed()
        if committed_err then return nil, "notify", committed_err end
    end

    if delete_result and delete_result.pending then
        return nil, "pending", (errors.new({ message = "component owner cleanup has another bounded page",
            kind = errors.CONFLICT, retryable = true, details = { cleanup_pending = true, needs_continue = true } }) :: error)
    end

    -- Reap the component's primary thread only AFTER the component row is gone.
    -- The old order (purge first) meant any later failure in the delete tx left a
    -- component alive with its thread destroyed — state no caller can repair. In
    -- this order a failure leaves the component whole (the durable retry re-runs
    -- the cascade), and a purge failure after a committed delete leaves a
    -- durable reap pointer for the existing retention tick. purge runs on its
    -- own connection, as before, since both share app:db.
    local thread_summary, purge_err = purge_primary_thread(component_id)
    if purge_err then return delete_result, "purge", purge_err end
    if delete_result and type(thread_summary) == "table" then
        delete_result.thread_discarded = thread_summary.discarded
        delete_result.thread_notified = thread_summary.notified
    end
    if delete_result and delete_result.changes_made then
        local remove_err = remove_reap_pointer(component_id)
        if remove_err then return delete_result, "purge", remove_err end
    end

    return delete_result, nil, nil
end

return M
