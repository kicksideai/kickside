-- Thread teardown of the threads slice: delete (actor-gated, then removes the
-- component) and purge_thread (component-driven, keeps the component).
--
-- The marked thread is the durable continuation address. New appends and pins
-- are fenced first; the owner retry blocks surviving consumers, then deletes
-- at most 100 dependent rows per call with drop notifications in the page tx.

local sql = require("sql")
local normalize = require("threads_normalize")
local component = require("threads_component")
local masks = require("core_types")
local writer = require("threads_writer")
local teardown_fence = require("teardown_fence")
local teardown_page = require("teardown_page")
local retention_notifier = require("retention_notifier")
local error_envelope = require("error_envelope")

local M = {}

-- A pooled connection.
type DB = sql.DB

local trim = normalize.trim

local function response_error(field: string): error
    return errors.new({message = "thread teardown response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "thread_teardown_response", field = field}})
end

local function rows_error(rows: any, err: error?, operation: string, field: string): error?
    if err then return errors.wrap(err, operation) end
    if type(rows) ~= "table" then return response_error(field) end
    return nil
end

local function notification_error(accepted: any, err: error?): error?
    if err then return errors.wrap(err, "thread teardown notification failed") end
    if type(accepted) ~= "boolean" then return response_error("notification.accepted") end
    return nil
end

local function teardown(db: DB, id: string): (any?, error?)
    local mark_err = teardown_fence.mark(db, id)
    if mark_err then return nil, mark_err end
    local fenced, fence_err = teardown_fence.fence_page(db, id)
    if fence_err then return nil, fence_err end
    if fenced ~= true then return nil, response_error("fence.complete") end
    local summary, page_err = teardown_page.run(db, id)
    if page_err then return nil, page_err end
    if type(summary) ~= "table" then return nil, response_error("page.summary") end
    local targets = summary.notified
    if type(targets) ~= "table" then return nil, response_error("page.notified") end
    if #targets > 0 then
        local accepted, notify_err = retention_notifier.notify({ kind = "events_appended", thread_ids = targets })
        local delivery_err = notification_error(accepted, notify_err)
        if delivery_err then return nil, delivery_err end
    end
    return summary, nil
end

-- purge_thread reaps a component's primary thread and its cascade WITHOUT
-- removing the component row: the component-driven teardown, the inverse of
-- delete. It is trusted (no access gate): component teardown calls it after
-- delete authorization; a scoped audit attach also calls it if marker
-- convergence fails. A component that never got a thread is
-- an idempotent no-op. Returns { purged, notified }.
function M.purge_thread(db: DB, component_id: string, actor_id: string?): ({ purged: boolean, notified: { string }, discarded: table? }?, error?)
    local id = trim(component_id)
    if id == "" then return { purged = true, notified = {} }, nil end

    local existing, exists_err = sql.builder.select("id"):from("kickside_thread")
        :where(sql.builder.eq({ id = id })):limit(1):run_with(db):query()
    local read_err = rows_error(existing, exists_err, "failed to load thread", "thread.rows")
    if read_err then return nil, read_err end
    if #(existing :: { table }) == 0 then
        return { purged = true, notified = {} }, nil
    end

    local summary, err = teardown(db, id)
    if err then
        local details = type(err) == "userdata" and err:details() or nil
        if type(details) == "table" and details.cleanup_pending == true and details.needs_continue == true then
            local accepted, notify_err = retention_notifier.notify({ kind = "cleanup_pending",
                owner_locator = { kind = "component", id = id } })
            local delivery_err = notification_error(accepted, notify_err)
            if delivery_err then return nil, error_envelope.wrap_secondary(delivery_err, err, "thread cleanup continuation notification failed") end
        end
        return nil, err
    end
    return { purged = true, notified = (summary :: any).notified,
        discarded = (summary :: any).discarded }, nil
end

-- delete removes a thread after a DELETE access check, then removes its
-- component through the contract, which tears down the component's access and
-- meta. A failed component removal after the thread is gone is returned so the
-- caller retries the component teardown. Returns { deleted, thread_id,
-- component_id, notified }.
function M.delete(db: DB, thread_id: string, actor_id: string?): (table?, error?)
    local id = trim(thread_id)
    if id == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end

    local thread, gate_err = writer.gate_write(db, id, (masks.ACCESS.DELETE :: integer))
    if gate_err then return nil, gate_err end
    if type(thread) ~= "table" or type(thread.component_id) ~= "string" or trim(thread.component_id) == "" then
        return nil, response_error("thread.component_id")
    end
    local component_id = trim(thread.component_id)

    -- Component deletion owns the durable post-unregister thread reap pointer.
    -- Its teardown calls purge_thread; a page failure leaves that pointer for
    -- the existing component retention retry even if this caller disappears.
    local _, remove_err, removed = component.remove(component_id)
    if remove_err then return nil, remove_err end
    if type(removed) == "table" and removed.in_progress == true then
        return { deleted = false, thread_id = id, component_id = component_id,
            in_progress = true, status = removed.status, cleanup_pending = removed.cleanup_pending,
            kind = removed.kind, retryable = removed.retryable, details = removed.details,
            discarded = removed.thread_discarded or removed.discarded }, nil
    end
    local remaining, remaining_err = db:query("SELECT id FROM kickside_thread WHERE id=$1", { id })
    local remaining_read_err = rows_error(remaining, remaining_err, "failed to verify thread deletion", "remaining.rows")
    if remaining_read_err then return nil, remaining_read_err end
    if remaining[1] then
        local summary, purge_err = teardown(db, id)
        if purge_err then return nil, purge_err end
        return { deleted = true, thread_id = id, component_id = component_id,
            notified = (summary :: any).notified, discarded = (summary :: any).discarded }, nil
    end

    return { deleted = true, thread_id = id, component_id = component_id,
        notified = type(removed) == "table" and removed.thread_notified or {},
        discarded = type(removed) == "table" and removed.thread_discarded or nil }, nil
end

return M
