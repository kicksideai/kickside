-- kickside.core:threads projection management: register, list, catch up,
-- pause, resume, remove, attach and detach. Each method checks the caller's
-- access on the thread and delegates to the projections slice.

local sql = require("sql")
local time = require("time")
local jobs = require("jobs")
local writer = require("threads_writer")
local reader = require("threads_reader")
local proj_writer = require("proj_writer")
local proj_reader = require("proj_reader")
local page_cursor = require("page_cursor")
local proj_worker = require("proj_worker")
local masks = require("core_types")
local common = require("contract_common")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local is_str = common.is_str
local trim = common.trim
local normalize_int_arg = common.normalize_int_arg
local declared_identity = common.declared_identity
local open_db = common.open_db
local CATCH_UP_MS_PER_TICK = 1500

local M = {}

local function release(db: sql.DB, primary: error?, committed: boolean?): (error?, boolean)
    local _, err = db:release()
    if err then
        if primary then return error_envelope.wrap_secondary(err, primary, "projection DB release failed"), false end
        local source: error = err
        if committed then source = committed_error.new(source) end
        return errors.wrap(source, "projection DB release failed"), false
    end
    return primary, true
end

-- gate_thread_write opens the db and confirms the actor has WRITE on the thread
-- before a projection mutation. Returns the db handle (caller releases) on success.
local function gate_thread_access(thread_id: string, mask: integer): (sql.DB?, table?, error?, boolean?)
    local db, db_err = open_db()
    if db_err then return nil, nil, db_err end
    local _db = db :: sql.DB
    local thread, gate_err = reader.gate_read(_db, thread_id, mask)
    if gate_err then
        local err, released = release(_db, gate_err)
        return nil, nil, err, released and errors.is(gate_err, errors.NOT_FOUND)
    end
    return _db, thread, nil
end

local function gate_thread_write(thread_id: string): (sql.DB?, error?)
    local db, _, err = gate_thread_access(thread_id, (masks.ACCESS.WRITE :: integer))
    return db, err
end

local function gate_thread_read(thread_id: string): (sql.DB?, table?, error?, boolean?)
    return gate_thread_access(thread_id, (masks.ACCESS.READ :: integer))
end

-- register_projection defines a projection on a thread (reversible via
-- remove_projection). It gates WRITE on the thread, then delegates the row work to
-- the projections writer. Returns { thread_id, projection_id, projection, rollback }.
function M.register_projection(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end

    local binding, parse_err = proj_worker.parse(args.worker_ref :: string?, true)
    if parse_err or not binding then
        return nil, parse_err
    end

    local db, gate_err = gate_thread_write(args.thread_id :: string)
    if gate_err then return nil, gate_err end
    local _db = db :: sql.DB

    local identity, identity_load_err = declared_identity(args.thread_id :: string)
    if identity_load_err or not identity then
        return nil, (release(_db, identity_load_err))
    end
    if identity.system == true and not common.is_maintenance_actor() then
        local err = errors.new({ message = "system projection identity requires a framework actor",
            kind = errors.PERMISSION_DENIED })
        return nil, (release(_db, err))
    end

    local validated, validate_err = proj_worker.validate(binding, identity.system == true)
    if validate_err or not validated then
        return nil, (release(_db, validate_err))
    end

    local register_args: { [string]: any } = {}
    for key, value in pairs(args :: table) do register_args[key] = value end
    register_args.worker_ref = (validated :: any).worker_ref
    register_args.execution_identity_row = nil
    register_args.execution_identity = nil
    register_args.system_identity = nil
    register_args.execution_identity_row = identity.row
    register_args.system_identity = identity.system == true

    local result, register_err = proj_writer.register_projection(_db, args.thread_id :: string, register_args)
    register_err = release(_db, register_err, register_err == nil and result ~= nil)
    if register_err or not result then
        return nil, register_err
    end

    local projection_id = (result :: any).projection_id
    return {
        thread_id = args.thread_id,
        projection_id = projection_id,
        projection = result,
        rollback = is_str(projection_id) and {
            method = "remove_projection",
            args = { thread_id = args.thread_id, projection_id = projection_id },
        } or nil,
    }, nil
end

-- list_projections exposes the projections and cursors attached to a thread after
-- a READ gate. This is the control-plane view automations use to inspect and clean
-- managed projections without importing persistence modules.
function M.list_projections(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local limit, limit_err = normalize_int_arg(args.limit, "limit", 1, 1000)
    if limit_err then return nil, limit_err end
    local projections_after, projections_after_err = page_cursor.decode(args.projections_cursor, args.thread_id, "projections")
    if projections_after_err then return nil, projections_after_err end
    local cursors_after, cursors_after_err = page_cursor.decode(args.cursors_cursor, args.thread_id, "cursors")
    if cursors_after_err then return nil, cursors_after_err end

    local db, thread, gate_err, missing_thread = gate_thread_read(args.thread_id :: string)
    if gate_err then
        -- A lazy thread that has never been emitted to has no thread row yet, hence no
        -- projections -- that reads as empty, not an error (the canonical lazy-thread
        -- read). Other gate failures (e.g. permission denied on an existing thread) still
        -- surface, so a real access denial is never masked as empty.
        if missing_thread then
            return { thread_id = args.thread_id, event_count = 0, projections = {}, cursors = {}, count = 0,
                projections_has_more = false, cursors_has_more = false }, nil
        end
        return nil, gate_err
    end
    local _db = db :: sql.DB

    local projections, projections_err, projections_page = proj_reader.list_projections(_db, args.thread_id :: string, limit, projections_after)
    if projections_err then
        return nil, (release(_db, projections_err))
    end
    local cursors, cursors_err, cursors_page = proj_reader.list_cursors(_db, args.thread_id :: string, limit, cursors_after)
    cursors_err = release(_db, cursors_err)
    if cursors_err then return nil, cursors_err end
    local result, page_err = page_cursor.response(args.thread_id, projections or {}, cursors or {}, projections_page, cursors_page)
    if page_err or not result then return nil, page_err end
    result.event_count = tonumber((thread :: table).event_count) or 0
    return result, nil
end

function M.get_projection_cursor(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) or trim(args.thread_id) == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    if not is_str(args.kind) or trim(args.kind) == "" then
        return nil, (errors.new({ message = "kind is required", kind = errors.INVALID }) :: error)
    end
    for _, key in ipairs({ "projection_key", "cursor_key" }) do
        if args[key] ~= nil and type(args[key]) ~= "string" then
            return nil, (errors.new({ message = key .. " must be a string", kind = errors.INVALID }) :: error)
        end
    end
    local db, _, gate_err = gate_thread_read(args.thread_id :: string)
    if gate_err then return nil, gate_err end
    local pair, find_err = proj_reader.find_projection_cursor(db :: sql.DB, args.thread_id :: string, args)
    find_err = release(db :: sql.DB, find_err)
    if find_err then return nil, find_err end
    return pair, nil
end

local function deadline_passed(): error
    return (errors.new({ message = "projection catch-up reached the caller's deadline before the cursor reached the thread head",
        kind = errors.UNAVAILABLE, retryable = true }) :: error)
end

-- catch_up_projection asks the supervised Jobs pool to advance one projection
-- cursor, then observes its committed progress after a READ gate. This is the
-- read-after-write consistency seam for components whose public read model is a
-- projection body: callers do not replay events or query private tables.
-- The caller's deadline (an RFC3339 instant), parsed at the contract boundary.
local function parse_deadline(value: any): (any?, error?)
    if value == nil then return nil, nil end
    if type(value) ~= "string" then
        return nil, (errors.new({ message = "deadline must be an RFC3339 instant", kind = errors.INVALID }) :: error)
    end
    local parsed, err = time.parse(time.RFC3339, value)
    if err or not parsed then
        return nil, (errors.new({ message = "deadline must be an RFC3339 instant", kind = errors.INVALID }) :: error)
    end
    return parsed, nil
end

-- A caller waits on the cursor's jobs slot (the pool runs awaited slots on
-- their own reserved capacity) at most until its own deadline when it names
-- one, else for max_ticks observation periods.
function M.catch_up_projection(args: any): (any?, error?)
    local cursor_waiters = require("cursor_waiters")
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    if not is_str(args.kind) then
        return nil, (errors.new({ message = "kind is required", kind = errors.INVALID }) :: error)
    end
    local max_ticks, max_err = normalize_int_arg(args.max_ticks, "max_ticks", 1, 1000)
    if max_err then return nil, max_err end
    max_ticks = max_ticks or 20
    local deadline, deadline_err = parse_deadline(args.deadline)
    if deadline_err then return nil, deadline_err end

    local db, thread, gate_err = gate_thread_read(args.thread_id :: string)
    if gate_err then return nil, gate_err end
    local _db = db :: sql.DB

    local selected, select_err = proj_reader.select_projection_cursor(_db, args.thread_id :: string, args)
    select_err = release(_db, select_err)
    if select_err or not selected then return nil, select_err end
    local projection_id = tostring(selected.projection_id)
    local cursor_id = tostring(selected.id)
    local job_id = selected.job_id
    local current_status = selected.status
    local initial_seq = tonumber(selected.last_seq)
    if current_status ~= "active" then
        return nil, (errors.new({ message = "projection cursor is not active", kind = errors.CONFLICT }) :: error)
    end
    if type(job_id) ~= "string" or job_id == "" then
        return nil, (errors.new({ message = "projection cursor has no jobs slot", kind = errors.INTERNAL }) :: error)
    end
    if initial_seq == nil then
        return nil, (errors.new({ message = "projection cursor sequence missing", kind = errors.INTERNAL }) :: error)
    end
    local target = math.floor(tonumber((thread :: table).event_count) or 0)
    local tick_limit = max_ticks :: integer
    local bound_ms = tick_limit * CATCH_UP_MS_PER_TICK
    local bounded_by_deadline = false
    if deadline then
        local remaining_ms = math.floor(((deadline :: any):sub(time.now()) :: any):milliseconds())
        if remaining_ms < 1 then return nil, deadline_passed() end
        if remaining_ms < bound_ms then bound_ms, bounded_by_deadline = remaining_ms, true end
    end
    if initial_seq >= target then
        return {
            thread_id = args.thread_id, projection_id = projection_id, cursor_id = cursor_id,
            event_count = target, last_seq = initial_seq, status = current_status,
            ticks = 0, max_ticks = max_ticks, processed = 0, done = true,
        }, nil
    end
    local waiter, waiter_err = cursor_waiters.begin_wait(cursor_id, target, bound_ms)
    if waiter_err or not waiter then return nil, waiter_err end
    local function close_wait(): () cursor_waiters.close_wait(waiter :: table) end
    local _, wake_err = jobs.wake_job(job_id, { control = true, ensure_due = true })
    if wake_err then close_wait(); return nil, wake_err end

    local observations = 0
    while true do
        -- Registration is acknowledged before this authoritative snapshot, so
        -- a commit racing the read is either visible here or queued to waiter.
        local progress_db, progress_db_err = open_db()
        if progress_db_err or not progress_db then
            close_wait()
            return nil, progress_db_err
        end
        local rows, read_err = (progress_db :: sql.DB):query(
            "SELECT last_seq,status FROM kickside_projection_cursor WHERE id=$1", { cursor_id })
        if read_err then read_err = errors.wrap(read_err, "projection cursor progress read failed") end
        read_err = release(progress_db :: sql.DB, read_err)
        if read_err then close_wait(); return nil, read_err end
        local current = rows and rows[1]
        if not current then
            close_wait()
            return nil, (errors.new({ message = "projection cursor was removed", kind = errors.NOT_FOUND }) :: error)
        end
        local last_seq = tonumber(current.last_seq) or 0
        if last_seq >= target then
            close_wait()
            return {
                thread_id = args.thread_id, projection_id = projection_id, cursor_id = cursor_id,
                event_count = target, last_seq = last_seq, status = current.status,
                ticks = observations, max_ticks = max_ticks,
                processed = last_seq - initial_seq,
                done = true,
            }, nil
        end
        if current.status ~= "active" then
            close_wait()
            return nil, (errors.new({ message = "projection cursor stopped before reaching the thread head", kind = errors.CONFLICT }) :: error)
        end
        if observations >= tick_limit then
            close_wait()
            return nil, (errors.new({ message = "projection cursor did not reach the thread head within the observation bound", kind = errors.INTERNAL, retryable = true }) :: error)
        end

        local _, timed_out, wait_err = cursor_waiters.wait_until_reached(waiter :: table)
        if wait_err then close_wait(); return nil, wait_err end
        if timed_out then
            close_wait()
            if bounded_by_deadline then return nil, deadline_passed() end
            return nil, (errors.new({ message = "projection cursor did not reach the thread head within the wait bound", kind = errors.INTERNAL, retryable = true }) :: error)
        end
        observations = observations + 1
    end
end

function M.pause_projection(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end

    local db, gate_err = gate_thread_write(args.thread_id :: string)
    if gate_err then return nil, gate_err end
    local _db = db :: sql.DB

    local result, pause_err = proj_writer.pause(_db, args.thread_id :: string, args)
    pause_err = release(_db, pause_err, pause_err == nil and result ~= nil)
    if pause_err or not result then
        return nil, pause_err
    end
    return {
        thread_id = args.thread_id,
        cursor_id = (result :: any).cursor_id,
        projection_id = (result :: any).projection_id,
        status = (result :: any).status,
        already_paused = (result :: any).already_paused,
    }, nil
end

function M.resume_projection(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end

    local db, gate_err = gate_thread_write(args.thread_id :: string)
    if gate_err then return nil, gate_err end
    local _db = db :: sql.DB

    local result, resume_err = proj_writer.resume(_db, args.thread_id :: string, args)
    resume_err = release(_db, resume_err, resume_err == nil and result ~= nil)
    if resume_err or not result then
        return nil, resume_err
    end
    return {
        thread_id = args.thread_id,
        cursor_id = (result :: any).cursor_id,
        projection_id = (result :: any).projection_id,
        status = (result :: any).status,
        already_active = (result :: any).already_active,
    }, nil
end

-- remove_projection deletes a projection definition and its cursors after a WRITE
-- check. Returns { thread_id, projection_id }.
function M.remove_projection(args: any): (any?, error?)
    args = type(args) == "table" and args or {}
    if not is_str(args.thread_id) then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end

    local db, gate_err = gate_thread_write(args.thread_id :: string)
    if gate_err then return nil, gate_err end
    local _db = db :: sql.DB

    local result, remove_err = proj_writer.remove_projection(_db, args.thread_id :: string, {
        projection_id = args.projection_id,
        kind = args.kind,
        projection_key = args.projection_key,
    })
    remove_err = release(_db, remove_err, remove_err == nil and result ~= nil)
    if remove_err or not result then
        return nil, remove_err
    end
    return {
        thread_id = args.thread_id,
        projection_id = (result :: any).projection_id,
        removed_cursors = (result :: any).removed_cursors,
    }, nil
end

return M
