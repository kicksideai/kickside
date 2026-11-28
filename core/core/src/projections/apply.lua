-- Fenced projection apply and jobs-slot completion. The source thread row is
-- locked before its cursor, and any worker-requested event writes are applied
-- in this same transaction. A stale generation or head cannot publish a fold.
local sql = require("sql")
local json = require("json")
local clock = require("clock")
local registry = require("registry")
local logger = require("logger"):named("kickside.projections")
local ctx = require("ctx")
local threads_writer = require("threads_writer")
local jobs = require("jobs")
local jobs_wake = require("jobs_wake")
local cursor_waiters = require("cursor_waiters")
local retention_notifier = require("retention_notifier")
local retention_pin = require("retention_pin")
local execution_identity = require("execution_identity")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local core_db = require("core_db")
local jobs_config = require("jobs_config")
local lease_status = require("lease_status")
local registration = require("registration")
local job_types = require("job_types")
local registered_checkpoint = require("registered_checkpoint")
local event_access = require("event_access")

local M = {}

type CheckpointWriter = (sql.Transaction, string) -> (boolean?, error?)
type RangeInput = {id: string, seq: number}
type Checkpoint = {
    first_input: RangeInput?,write: CheckpointWriter?, first_seq: number?, owner: table?, manifest: {RangeInput}?, filter: table?,
    registered: table?, reselect: boolean?}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false }) :: error)
end
local function response_error(field: string): error
    return errors.new({message = "projection apply response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "projection_apply_response", field = field}})
end

local function release(db: sql.DB, operation_error: error?): error?
    local _, err = db:release()
    if not err then return operation_error end
    if operation_error then
        return error_envelope.wrap_secondary(err, operation_error, "projection apply DB release failed")
    end
    return errors.wrap(err, "projection apply DB release failed")
end

local function rollback(tx: sql.Transaction, operation_error: error): error
    local _, err = tx:rollback()
    if err then return error_envelope.wrap_secondary(err, operation_error, "projection apply rollback failed") end
    return operation_error
end

local function write_error(result: any, err: error?, message: string, field: string): error?
    if err then return errors.wrap(err, message) end
    if type(result) ~= "table" or type(result.rows_affected) ~= "number" then return response_error(field) end
    return nil
end

function M.process_host(): (string?, error?)
    local entry, err = registry.get("kickside.core.jobs:process_config")
    if err then return nil, errors.wrap(err, "jobs process host unavailable") end
    if type(entry) ~= "table" then return nil, response_error("process_config") end
    local host = entry.meta and entry.meta.host_id
    if type(host) ~= "string" or host == "" then
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "jobs process host is not configured"})
    end
    return host, nil
end

local function input_type_set(body: table): table?
    local events = type(body.events) == "table" and body.events or nil
    local input = events and type(events.input) == "table" and events.input or nil
    if not input or #input == 0 then return nil end
    local set: table = {}
    for _, shape in ipairs(input) do
        if type(shape) == "table" and type(shape.type) == "string" then set[shape.type] = true end
    end
    return set
end

local function dense_array(value: any): boolean
    if type(value) ~= "table" then return false end
    local count = 0
    for key in pairs(value) do
        if type(key) ~= "number" or key < 1 or key ~= math.floor(key) then return false end
        count = count + 1
    end
    return count == #value
end

local function append_writes(output: table, source_id: string, body: table): (table[]?, error?)
    if output.append_events == nil then return {}, nil end
    if not dense_array(output.append_events) then return nil, invalid("append_events must be a dense array") end
    local writes: table[] = {}
    local types = input_type_set(body)
    for i, write in ipairs(output.append_events) do
        if type(write) ~= "table" or type(write.thread_id) ~= "string" or write.thread_id == "" then
            return nil, invalid("append_events[" .. tostring(i) .. "] needs thread_id")
        end
        local raw = type(write.events) == "table" and write.events or (type(write.event) == "table" and { write.event } or nil)
        if not dense_array(raw) or #raw == 0 then return nil, invalid("append_events[" .. tostring(i) .. "] needs a dense events array") end
        local events: table[] = {}
        for j, event in ipairs(raw) do
            if type(event) ~= "table" or type(event.type) ~= "string" or event.type == "" then
                return nil, invalid("append_events[" .. tostring(i) .. "].events[" .. tostring(j) .. "] needs type")
            end
            if write.thread_id == source_id and (not types or types[event.type]) then
                return nil, invalid("projection append would retrigger its source cursor")
            end
            local copy: table = {}
            for key, value in pairs(event) do copy[key] = value end
            if copy.body_json ~= nil and type(copy.body_json) ~= "string" then
                return nil, invalid("append event body_json must be JSON")
            end
            if copy.body_json == nil then
                local encoded, err = json.encode(copy.body or {})
                if err then return nil, errors.wrap(err, "append event body is not JSON") end
                if type(encoded) ~= "string" then return nil, response_error("append.body_json") end
                copy.body_json = encoded
            end
            copy.body = nil
            events[#events + 1] = copy
        end
        writes[#writes + 1] = { thread_id = write.thread_id, events = events }
    end
    return writes, nil
end

local function next_body(before: table, output: table): (table?, error?)
    local result: table = {}
    if output.body ~= nil then
        if type(output.body) ~= "table" then return nil, invalid("projection worker body must be an object") end
        result = output.body
    else
        for key, value in pairs(before) do result[key] = value end
        if output.patch ~= nil then
            if type(output.patch) ~= "table" then return nil, invalid("projection worker patch must be an object") end
            for key, value in pairs(output.patch) do result[key] = value end
        end
    end
    for _, key in ipairs({"meta", "worker_config", "events", "drop_notify"}) do
        if result[key] == nil then result[key] = before[key] end
    end
    return result, nil
end

local function completion(tx: sql.Transaction, job: table, opts: table): (table?, error?)
    local done, err = jobs.complete_tx(tx, tostring(job.id), {
        token = tostring(job.lease_token), execution_seq = tonumber(job.execution_seq),
    }, opts)
    if err then return nil, err end
    if type(done) ~= "table" then return nil, response_error("completion") end
    return done, nil
end

local function check_lease(tx: sql.Transaction, job: table, dbtype: string, lock: boolean): error?
    local active, err = lease_status.active_tx(tx, job, dbtype, lock)
    if err then return err end
    if not active then return job_types.lease_lost_error("projection checkpoint lease lost") end
    return nil
end

-- The stored encoding is an array of bounded scalars. The complete event
-- sequence remains independent, including for retention and cursor waiters.
local function step_index(value: any): boolean
    return type(value) == "number" and value >= 1 and value <= 2147483647 and value == math.floor(value)
end

function M.continuation(cursor: table): (table?, error?)
    local raw = cursor.continuation or ""
    if raw == "" then return nil, nil end
    if type(raw) ~= "string" or #raw > 96 then return nil, response_error("cursor.continuation") end
    local tagged = string.sub(raw, 1, 2) == "f:"
    local decoded, err = json.decode(tagged and string.sub(raw, 3) or raw)
    if err or type(decoded) ~= "table" or #decoded ~= 4 or type(decoded[1]) ~= "string"
        or #decoded[1] ~= 36 or type(decoded[2]) ~= "number" or decoded[2] <= 0
        or math.tointeger(decoded[2]) == nil or not step_index(decoded[3]) or not step_index(decoded[4]) then
        return nil, response_error("cursor.continuation")
    end
    return {event_id = decoded[1], seq = decoded[2], item = decoded[3], step = decoded[4], filtered = tagged}, nil
end

local function checkpoint_event(tx: sql.Transaction, thread_id: string, prior: number, pinned: table?): (table?, error?)
    local rows, err
    if pinned then
        rows, err = tx:query("SELECT id,seq FROM kickside_event WHERE thread_id=$1 AND seq=$2", {thread_id, pinned.seq})
    else
        rows, err = tx:query([[SELECT id,seq FROM kickside_event WHERE thread_id=$1 AND seq>$2 ORDER BY seq LIMIT 1]],
            {thread_id, prior})
    end
    if err then return nil, errors.wrap(err, "projection checkpoint input read failed") end
    if type(rows) ~= "table" then return nil, response_error("checkpoint.event_rows") end
    local event = rows[1]
    if not event or (pinned and tostring(event.id) ~= pinned.event_id) then
        return nil, errors.new({kind = errors.NOT_FOUND, retryable = false, message = "projection checkpoint input is missing"})
    end
    if type(event.id) ~= "string" or not tonumber(event.seq) then return nil, response_error("checkpoint.event") end
    return event, nil
end

local function next_continuation(event: table, prior: table?, next_step: any): (string?, error?)
    if type(next_step) ~= "table" or type(next_step.event_id) ~= "string" or #next_step.event_id ~= 36
        or not step_index(next_step.item) or not step_index(next_step.step) then
        return nil, invalid("projection continuation requires a bounded event, item, and step")
    end
    if next_step.event_id ~= event.id then
        return nil, errors.new({kind = errors.CONFLICT, retryable = true, message = "projection checkpoint input changed"})
    end
    if prior then
        if not ((next_step.item == prior.item and next_step.step == prior.step + 1)
                or (next_step.item == prior.item + 1 and next_step.step == 1)) then
            return nil, invalid("projection continuation must commit the next item step")
        end
    elseif next_step.item ~= 1 or next_step.step ~= 1 then
        return nil, invalid("projection continuation must start at the first item step")
    end
    return json.encode({event.id, tonumber(event.seq), next_step.item, next_step.step})
end

local function notify_progress(snapshot: table, last: number, progressed: boolean): error?
    local _, err = cursor_waiters.notify_cursor(snapshot.id, last, "active")
    if err then return err end
    if progressed then
        _, err = retention_notifier.notify({ kind = "projection_eligibility_changed", thread_id = snapshot.thread_id })
    end
    return err
end

-- Component adoption locks its row before updating the private identity.
-- Check that row before the thread and cursor acquire their write locks.
local function check_checkpoint_owner(tx: sql.Transaction, dbtype: string, owner: table): error?
    local lock = dbtype == sql.type.POSTGRES and " FOR SHARE" or ""
    local rows, err = tx:query([[SELECT identity_generation,CAST(created_at AS TEXT) AS incarnation,deleting_at
        FROM kickside_components WHERE component_id=$1]] .. lock, {owner.component_id})
    if err then return errors.wrap(err, "projection checkpoint owner fence read failed") end
    if type(rows) ~= "table" then return response_error("checkpoint.owner") end
    local row = rows[1]
    if not row or row.deleting_at ~= nil or row.incarnation ~= owner.incarnation
        or tonumber(row.identity_generation) ~= owner.generation then
        return errors.new({kind = errors.CONFLICT, retryable = true,
            message = "projection owner authority changed during execution",
            details = {code = "projection_checkpoint_owner_changed"}})
    end
    return nil
end

-- Scan only identity columns over the assigned physical interval. A caller may
-- close a prefix before the next eligible event, including across excluded rows.
local BACKFILLED_PIN = "projection_checkpoint_earlier_input"

local function check_range(tx: sql.Transaction, thread_id: string, prior: number, last: number,
        filter: table, manifest: {RangeInput}, pinned: table?): error?
    local marks, types = {}, {}
    for index, declaration in ipairs(filter) do
        marks[index], types[index] = "?", declaration.type
    end
    local rows, err = sql.builder.select("id", "seq"):from("kickside_event")
        :where("thread_id = ? AND seq > ? AND seq <= ?", thread_id, prior, last)
        :where("type IN (" .. table.concat(marks, ",") .. ")", table.unpack(types))
        :order_by("seq"):limit(#manifest + 1):run_with(tx):query()
    if err then return errors.wrap(err, "projection checkpoint range read failed") end
    if type(rows) ~= "table" then return response_error("checkpoint.range") end
    local first = rows[1]
    local first_seq = first and tonumber(first.seq)
    if pinned and first_seq and first_seq > prior and first_seq < pinned.seq then
        return errors.new({kind = errors.CONFLICT, retryable = true, message = "eligible input precedes the projection pin",
            details = {code = BACKFILLED_PIN}})
    end
    if #rows == #manifest then
        for index, row in ipairs(rows) do
            local expected = manifest[index]
            if type(expected) ~= "table" or expected.id ~= row.id or expected.seq ~= tonumber(row.seq) then
                return errors.new({kind = errors.CONFLICT, retryable = true, message = "projection checkpoint input changed"})
            end
        end
        return nil
    end
    return errors.new({kind = errors.CONFLICT, retryable = true, message = "projection checkpoint input changed"})
end

function M.backfilled_pin_error(err: error?): boolean
    local details = err and err:details()
    return type(details) == "table" and details.code == BACKFILLED_PIN
end

local function advance_tx(db: sql.DB, job: table, snapshot: table, prefetched_last: number, output: table,
        writes: table[], checkpoint: Checkpoint?, empty_scan: boolean?, owned: table?): (table?, error?)
    local raw_type, type_err = db:type()
    if type_err then return nil, errors.wrap(type_err, "projection dialect unavailable") end
    if type(raw_type) ~= "string" or raw_type == "" then return nil, response_error("database.type") end
    local dbtype = raw_type :: string
    local body = snapshot.body :: table
    local ids: string[] = { tostring(snapshot.thread_id) }
    for _, write in ipairs(writes :: table[]) do ids[#ids + 1] = tostring(write.thread_id) end
    local tx, begin_err = db:begin()
    if begin_err then return nil, errors.wrap(begin_err, "projection apply begin failed") end
    if type(tx) ~= "table" and type(tx) ~= "userdata" then return nil, response_error("transaction") end
    local function abort(err: error): (nil, error)
        return nil, rollback(tx, err)
    end
    local owner = owned or (checkpoint and checkpoint.owner)
    local registered = checkpoint and checkpoint.registered
    if registered then
        local access_err = registered_checkpoint.lock(tx, dbtype, registered)
        if access_err then return abort(access_err) end
    elseif owner then
        local owner_err = check_checkpoint_owner(tx, dbtype, owner)
        if owner_err then return abort(owner_err) end
    end
    local locked_threads, lock_err = threads_writer.lock_thread_rows_tx(tx, dbtype, ids, registered ~= nil)
    if lock_err then return abort(lock_err) end
    if type(locked_threads) ~= "table" then return abort(response_error("locked_threads")) end
    local source_thread = locked_threads[tostring(snapshot.thread_id)]
    local current_head = tonumber(source_thread and source_thread.event_count)
    if current_head == nil then return abort(response_error("thread.head")) end
    if checkpoint and source_thread.deleting_at ~= nil then
        return abort(job_types.lease_lost_error("projection source thread is deleting"))
    end
    if registered and not event_access.same_binding(source_thread, snapshot) then
        return abort(errors.new({kind = errors.CONFLICT, retryable = true,
            message = "registered checkpoint source binding changed during preparation"}))
    end
    local suffix = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
    -- Hot registry publication can precede migration 20. A pre-migration row
    -- simply has no optional lifecycle handoff position.
    local cursor_query = "SELECT * FROM kickside_projection_cursor WHERE id=$1"
    if checkpoint and checkpoint.manifest then
        local declaration = registered and ",c.actor_id,c.execution_identity_json,"
            .. registration.declaration_fields_sql(dbtype, "p.body") .. " AS registered_declaration" or ""
        cursor_query = [[SELECT c.generation,c.last_seq,c.status,c.job_id,c.thread_id,c.projection_id,c.continuation,
            p.reset_generation]] .. declaration .. [[
            FROM kickside_projection_cursor c JOIN kickside_projection p ON p.id=c.projection_id
            WHERE c.id=$1]]
    end
    local rows, cursor_err = tx:query(cursor_query .. suffix, {snapshot.id})
    if cursor_err then return abort(errors.wrap(cursor_err, "projection fence read failed")) end
    if type(rows) ~= "table" then return abort(response_error("cursor.rows")) end
    local cursor = rows[1]
    if not cursor then return abort(errors.new({message = "projection cursor removed", kind = errors.NOT_FOUND, retryable = false})) end
    if tostring(cursor.job_id or "") ~= tostring(job.id)
        or (checkpoint and (cursor.thread_id ~= snapshot.thread_id or cursor.projection_id ~= snapshot.projection_id)) then
        return abort(errors.new({message = "projection slot changed", kind = errors.CONFLICT, retryable = false}))
    end
    if registered then
        local declaration_err = registered_checkpoint.check_cursor(cursor, registered)
        if declaration_err then return abort(declaration_err) end
    end
    if cursor.status ~= "active" or tonumber(cursor.generation) ~= tonumber(snapshot.generation)
        or tonumber(cursor.last_seq) ~= tonumber(snapshot.last_seq)
        or (checkpoint and (cursor.continuation or "") ~= (snapshot.continuation or ""))
        or (checkpoint and checkpoint.manifest and cursor.reset_generation ~= snapshot.reset_generation) then
        if checkpoint then
            return abort(errors.new({kind = errors.CONFLICT, retryable = false,
                message = "projection checkpoint lost its position",
                details = {code = "projection_checkpoint_stale"}}))
        end
        local options: table = { rearm = clock.now(dbtype) }
        if cursor.status ~= "active" then options = { record = { status = "parked" } } end
        local done, done_err = completion(tx, job, options)
        if done_err then return abort(done_err) end
        local _, commit_err = tx:commit()
        if commit_err then return nil, errors.wrap(commit_err, "stale projection completion failed") end
        local _, notify_err = cursor_waiters.notify_cursor(snapshot.id, tonumber(cursor.last_seq), tostring(cursor.status))
        if notify_err then return nil, notify_err end
        return { self_completed = true, completion = done, stale = true }, nil
    end

    local prior = tonumber(snapshot.last_seq)
    if prior == nil then return abort(response_error("cursor.last_seq")) end
    if not checkpoint and (cursor.continuation or "") ~= "" then
        return abort(invalid("a projection with an incomplete checkpoint requires its owning worker"))
    end
    local last = prefetched_last
    if output.last_seq ~= nil then
        local reported = tonumber(output.last_seq)
        if not reported or reported < prior or reported > prefetched_last then
            return abort(invalid("projection worker last_seq is outside the loaded range"))
        end
        last = reported
    end
    local effect = checkpoint and checkpoint.write
    local continuation = ""
    local partial = effect and output.continuation ~= nil
    if checkpoint then
        -- An append wakes other slots. Leave its wake and Jobs row ordering
        -- to wake_multi, then lock the completing slot before commit.
        local lease_err = check_lease(tx, job, dbtype, #writes == 0)
        if lease_err then return abort(lease_err) end
    end
    if (effect or (checkpoint and checkpoint.manifest)) and (tonumber(source_thread.max_pruned_seq) or 0) > prior then
        return abort(errors.new({kind = errors.NOT_FOUND, retryable = false, message = "projection checkpoint input was pruned"}))
    end
    local logical_event: table? = nil
    if checkpoint and checkpoint.manifest then
        if last > current_head then return abort(invalid("filtered checkpoint exceeds the current thread head")) end
        if not checkpoint.filter then return abort(invalid("filtered checkpoint requires an input filter")) end
        local range_end = last
        local filtered_pin: table? = nil
        if partial or (cursor.continuation or "") ~= "" then
            local first = checkpoint.first_input
            if not first or #checkpoint.manifest ~= 1 then
                return abort(invalid("a filtered checkpoint cannot continue inside an event"))
            end
            local pinned, pin_err = M.continuation(snapshot)
            if pin_err then return abort(pin_err) end
            local entry = checkpoint.manifest[1]
            if entry.id ~= first.id or entry.seq ~= first.seq or first.seq <= prior
                or first.seq > prefetched_last or first.seq > current_head
                or (pinned and (pinned.event_id ~= first.id or pinned.seq ~= first.seq)) then
                return abort(invalid("continuation does not match the first offered eligible event"))
            end
            logical_event, range_end = first, first.seq
            if pinned and pinned.filtered then filtered_pin = pinned end
        end
        local range_err = check_range(tx, snapshot.thread_id, prior, range_end, checkpoint.filter,
            checkpoint.manifest, filtered_pin)
        if checkpoint.reselect then
            if not M.backfilled_pin_error(range_err) then
                return abort(range_err or response_error("checkpoint.reselect_earlier_input"))
            end
            local now = clock.now(dbtype)
            local cleared, clear_err = tx:execute([[UPDATE kickside_projection_cursor
                SET continuation='', generation=generation+1, last_error=NULL, updated_at=$1
                WHERE id=$2 AND generation=$3 AND last_seq=$4 AND continuation=$5 AND status='active']],
                {now, snapshot.id, snapshot.generation, prior, snapshot.continuation})
            local pin_err = write_error(cleared, clear_err, "projection pin retirement failed", "checkpoint.retire")
            if pin_err then return abort(pin_err) end
            if cleared.rows_affected ~= 1 then return abort(response_error("checkpoint.retire")) end
            local done, done_err = completion(tx, job, {rearm = now})
            if done_err then return abort(done_err) end
            local _, commit_err = tx:commit()
            if commit_err then return nil, errors.wrap(commit_err, "projection pin retirement commit failed") end
            return {self_completed = true, completion = done, last_seq = prior, reselected = true}, nil
        end
        if range_err then return abort(range_err) end
    end
    if effect then
        if output.last_seq == nil or (partial and last ~= prior) or (not partial and last <= prior) then
            return abort(invalid("projection checkpoint must consume the next complete event"))
        end
        if not checkpoint.manifest or logical_event then
            local pinned, pin_err = M.continuation(snapshot)
            if pin_err then return abort(pin_err) end
            local event = logical_event
            if not event then
                local event_err
                event, event_err = checkpoint_event(tx, snapshot.thread_id, prior, pinned)
                if event_err then return abort(event_err) end
            end
            if not event then return abort(response_error("checkpoint.event")) end
            local event_seq = tonumber(event.seq)
            if event_seq <= prior or event_seq > current_head or event_seq > prefetched_last
                or (not partial and last ~= event_seq) then
                return abort(errors.new({kind = errors.CONFLICT, retryable = true, message = "projection checkpoint input changed"}))
            end
            if partial then
                if output.body ~= nil or output.patch ~= nil or #writes ~= 0 then
                    return abort(invalid("projection continuation cannot publish completed event outputs"))
                end
                local next_value, position_err = next_continuation(event, pinned, output.continuation)
                if position_err then return abort(position_err) end
                if not next_value then return abort(response_error("cursor.continuation")) end
                continuation = next_value
                if checkpoint.first_input then
                    continuation = "f:" .. continuation
                    if not pinned then
                        local inserted, pin_write_err = tx:execute([[INSERT INTO kickside_filtered_checkpoint_pin
                            (cursor_id,reset_generation,event_id,projection_id) VALUES ($1,$2,$3,$4)]],
                            {snapshot.id,snapshot.reset_generation,event.id,snapshot.projection_id})
                        local pin_err = write_error(inserted, pin_write_err, "failed to create filtered checkpoint pin", "checkpoint.pin")
                        if pin_err then return abort(pin_err) end
                        if inserted.rows_affected ~= 1 then return abort(response_error("checkpoint.pin")) end
                    end
                end
            end
        end
        local ok, written, effect_err = pcall(effect, tx, dbtype)
        if not ok then
            local native = job_types.native_error(written)
            return abort(native or response_error("checkpoint.writer"))
        end
        if effect_err then return abort(effect_err) end
        if written ~= true then return abort(response_error("checkpoint.writer")) end
    end
    local now = clock.now(dbtype)
    if not checkpoint or empty_scan or (effect and not partial) then
        local updated, update_err
        if (not checkpoint and not empty_scan) or output.body ~= nil or output.patch ~= nil then
            local folded, fold_err = next_body(body, output)
            if fold_err then return abort(fold_err) end
            if registered then
                local matches, declaration_err = registered_checkpoint.check_declaration(folded, registered.admission)
                if declaration_err then return abort(declaration_err) end
                if not matches then return abort(invalid("registered checkpoint cannot change its declaration")) end
            elseif owned and not registration.declaration_matches(body, folded) then
                return abort(invalid("component-owned projection cannot change its declaration"))
            end
            local encoded, encode_err = json.encode(folded)
            if encode_err then return abort(errors.wrap(encode_err, "projection worker body is not JSON")) end
            if type(encoded) ~= "string" then return abort(response_error("body_json")) end
            updated, update_err = tx:execute([[UPDATE kickside_projection SET body=$1,state='valid',last_event_seq=$2,
                updated_at=$3 WHERE id=$4]], { encoded, last, now, snapshot.projection_id })
        else
            updated, update_err = tx:execute([[UPDATE kickside_projection SET state='valid',last_event_seq=$1,
                updated_at=$2 WHERE id=$3]], { last, now, snapshot.projection_id })
        end
        local fold_write_err = write_error(updated, update_err, "projection fold write failed", "projection.update")
        if fold_write_err then return abort(fold_write_err) end
        if checkpoint and updated.rows_affected ~= 1 then return abort(response_error("checkpoint.position")) end
    end
    if not checkpoint or empty_scan or effect then
        local statement = [[UPDATE kickside_projection_cursor SET last_seq=$1,
            last_error=$2,updated_at=$3 WHERE id=$4 AND generation=$5 AND last_seq=$6 AND status='active']]
        local values: {any} = {last, output.last_error, now, snapshot.id, snapshot.generation, snapshot.last_seq}
        if checkpoint then
            statement = [[UPDATE kickside_projection_cursor SET last_seq=$1, last_error=$2,updated_at=$3,
                continuation=$4 WHERE id=$5 AND generation=$6 AND last_seq=$7 AND continuation=$8 AND status='active']]
            values = {last, output.last_error, now, continuation, snapshot.id, snapshot.generation,
                snapshot.last_seq, snapshot.continuation or ""}
        end
        local headed, head_err = tx:execute(statement, values)
        local head_write_err = write_error(headed, head_err, "projection cursor advance failed", "cursor.update")
        if head_write_err then return abort(head_write_err) end
        if checkpoint and headed.rows_affected ~= 1 then return abort(response_error("checkpoint.position")) end
    end
    if #writes > 0 then
        local wake_keys: string[] = {}
        local appended_threads: {[string]: boolean} = {}
        for _, write in ipairs(writes :: table[]) do
            local appended, append_err = threads_writer.append_system_tx(tx, dbtype, tostring(write.thread_id), write.events, nil,
                { defer_wake = true, locked_threads = locked_threads })
            if append_err then return abort(append_err) end
            if type(appended) ~= "table" or type(appended.max_seq) ~= "number"
                or type(appended.inserted) ~= "number" or type(appended.thread_id) ~= "string" then
                return abort(response_error("append"))
            end
            if appended.inserted > 0 and not appended_threads[appended.thread_id] then
                appended_threads[appended.thread_id] = true
                wake_keys[#wake_keys + 1] = "thread:" .. appended.thread_id
            end
            if write.thread_id == snapshot.thread_id then current_head = appended.max_seq end
        end
        if #wake_keys > 0 then
            local woken, wake_err = jobs_wake.wake_multi(tx, wake_keys, dbtype, tostring(job.id))
            if wake_err then return abort(wake_err) end
            if type(woken) ~= "table" then return abort(response_error("wake")) end
        end
    end
    local done
    if effect then
        -- Check again before publishing. Expiry can occur while writing, and
        -- output appends acquire wake rows before taking Jobs row locks.
        local lease_err = check_lease(tx, job, dbtype, true)
        if lease_err then return abort(lease_err) end
    else
        local options: table = {}
        if last < current_head then options.rearm = now else options.demand_satisfied = true end
        if last > (checkpoint and checkpoint.first_seq or prior) then options.record = { status = "completed" } end
        local done_err
        done, done_err = completion(tx, job, options)
        if done_err then return abort(done_err) end
    end
    if registered then
        local revision_err = registered_checkpoint.recheck_revision(registered.admission.revision)
        if revision_err then return abort(revision_err) end
        local access_err = registered_checkpoint.lock(tx, dbtype, registered)
        if access_err then return abort(access_err) end
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "projection apply commit failed") end
    local result = { self_completed = not effect, completion = done, last_seq = last,
        pending_transition = not checkpoint and cursor.pending_transition_seq ~= nil
            and last >= (tonumber(cursor.pending_transition_seq) or math.huge) or nil,
        continuation = effect and continuation or nil }
    if not checkpoint then
        local notify_err = notify_progress(snapshot, last, last > prior or #writes > 0)
        if notify_err then return nil, notify_err end
    end
    return result, nil
end

-- Record an attempt failure on its cursor, fenced on the snapshot's
-- generation and head. A deterministic failure is the projection's verdict: the
-- cursor and projection turn invalid with the error, and the slot completes
-- with failed history and parks, so new events cannot re-run it until a
-- corrected declaration re-registers it. An infrastructure failure keeps the
-- cursor active with its last_error and returns to Jobs, which retries the
-- slot. Infrastructure publication also requires the current running lease.
-- Returns the self-completion of a deterministic failure, else nil.
function M.fail(db_id: string, job: table, snapshot: table, failure: error, deterministic: boolean,
        checkpointed: boolean?, owner: table?): (table?, error?)
    local db, db_err = sql.get(db_id)
    if db_err then return nil, errors.wrap(db_err, "projection failure DB unavailable") end
    if type(db) ~= "table" and type(db) ~= "userdata" then return nil, response_error("database") end
    local raw_type, type_err = db:type()
    if type_err then return nil, release(db, errors.wrap(type_err, "projection failure dialect unavailable")) end
    if type(raw_type) ~= "string" or raw_type == "" then return nil, release(db, response_error("database.type")) end
    local dbtype = raw_type :: string
    local message = tostring(failure)
    local details = failure:details()
    if details and details.code == "thread_event_read_denied" then
        message = details.code .. ": " .. message
    end
    local tx, begin_err = db:begin()
    if begin_err then return nil, release(db, errors.wrap(begin_err, "projection failure begin failed")) end
    if type(tx) ~= "table" and type(tx) ~= "userdata" then return nil, release(db, response_error("transaction")) end
    local function abort(err: error): (nil, error)
        return nil, release(db, rollback(tx, err)) :: error
    end
    if deterministic and owner then
        local owner_err = check_checkpoint_owner(tx, dbtype, owner)
        if owner_err then return abort(owner_err) end
    end
    local locked, lock_err = threads_writer.lock_thread_rows_tx(tx, dbtype, { tostring(snapshot.thread_id) })
    if lock_err then return abort(lock_err) end
    if checkpointed then
        local source = type(locked) == "table" and locked[tostring(snapshot.thread_id)] or nil
        if not source or source.deleting_at ~= nil then
            return abort(job_types.lease_lost_error("projection source thread is deleting"))
        end
        local lease_err = check_lease(tx, job, dbtype, true)
        if lease_err then return abort(lease_err) end
    end
    if deterministic then
        if type(locked) ~= "table" then return abort(response_error("locked_threads")) end
        local rows, read_err = tx:query([[SELECT generation,last_seq,status,job_id,continuation FROM kickside_projection_cursor
            WHERE id=$1]], { snapshot.id })
        if read_err then return abort(errors.wrap(read_err, "projection failure fence read failed")) end
        if type(rows) ~= "table" then return abort(response_error("cursor.rows")) end
        local current = rows[1]
        if current and current.status == "active" and tostring(current.job_id) == tostring(job.id)
            and tonumber(current.generation) == tonumber(snapshot.generation)
            and tonumber(current.last_seq) == tonumber(snapshot.last_seq)
            and (not checkpointed or current.continuation == snapshot.continuation) then
            local held, pin_err = retention_pin.lower_tx(tx, { thread_id = snapshot.thread_id,
                consumer_key = "projection:" .. tostring(snapshot.id),
                command_id = tostring(snapshot.id) .. ":" .. tostring(snapshot.generation),
                command_generation = tonumber(snapshot.generation), target_cursor = tonumber(snapshot.last_seq) })
            if pin_err then return abort(pin_err) end
            if type(held) ~= "table" then return abort(response_error("retention.pin")) end
        end
    end
    local now = clock.now(dbtype)
    local statement = [[UPDATE kickside_projection_cursor SET status=$1,last_error=$2,updated_at=$3
        WHERE id=$4 AND job_id=$5 AND generation=$6 AND last_seq=$7 AND status='active']]
    local args = { deterministic and "invalid" or "active", message, now, snapshot.id, tostring(job.id),
        snapshot.generation, snapshot.last_seq }
    if not deterministic then
        statement = statement .. [[ AND EXISTS (SELECT 1 FROM kickside_job
            WHERE id=$5 AND status='running' AND lease_token=$8)]]
        args[8] = tostring(job.lease_token or "")
    end
    if checkpointed then
        statement = statement .. " AND continuation=$" .. tostring(#args + 1)
        args[#args + 1] = snapshot.continuation
    end
    local fenced, fence_err = tx:execute(statement, args)
    local fence_write_err = write_error(fenced, fence_err, "projection failure record failed", "failure.fence")
    if fence_write_err then return abort(fence_write_err) end
    local recorded = fenced.rows_affected == 1
    local result: table? = nil
    if recorded and deterministic then
        local state, state_err = tx:execute("UPDATE kickside_projection SET state='invalid',updated_at=$1 WHERE id=$2",
            { now, snapshot.projection_id })
        local state_write_err = write_error(state, state_err, "projection invalidation failed", "projection.invalidate")
        if state_write_err then return abort(state_write_err) end
        local done, done_err = completion(tx, job, { park = true, record = { status = "failed", error = message }, demand_satisfied = true })
        if done_err then return abort(done_err) end
        result = { self_completed = true, completion = done, invalid = true }
    end
    local _, commit_err = tx:commit()
    if result and not commit_err then
        logger:error("projection cursor invalidated", {
            thread_id = snapshot.thread_id, projection = snapshot.kind, cursor_id = snapshot.id,
            generation = snapshot.generation, last_seq = snapshot.last_seq, error_kind = tostring(failure:kind()),
        })
    end
    local finish_err = release(db, commit_err and errors.wrap(commit_err, "projection failure commit failed") or nil)
    if finish_err then return nil, finish_err end
    if result then
        local _, notify_err = cursor_waiters.notify_cursor(tostring(snapshot.id), tonumber(snapshot.last_seq), "invalid")
        if notify_err then return nil, notify_err end
    end
    return result, nil
end

-- Resolve returned writes live before taking an apply connection. Actor-bound
-- authorization re-enters Component and Threads, including SQLite's single pool.
local function advance(db_id: string, job: table, snapshot: table, prefetched_last: number, output: table,
        checkpoint: Checkpoint?, empty_scan: boolean?, owned: table?): (table?, error?)
    local writes, write_err = append_writes(output, tostring(snapshot.thread_id), snapshot.body)
    if write_err then return nil, write_err end
    if owned and #writes > 0 then return nil, invalid("component-owned projection cannot return append_events") end
    local in_owner_process = checkpoint and checkpoint.owner and checkpoint.write
    if #writes > 0 and (in_owner_process or snapshot.actor_id ~= nil or snapshot.execution_identity_json ~= nil) then
        local admitted, admission_err
        if in_owner_process then
            -- A supervised checkpoint process already runs in the projection's
            -- admitted actor and scope. Authorize its effects in that frame.
            local actor, actor_err = require("security").actor()
            if actor_err then return nil, actor_err end
            if not actor or not snapshot.actor_id or actor:id() ~= snapshot.actor_id then
                return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "checkpoint actor differs from its admitted cursor"})
            end
            admitted, admission_err = require("funcs").call("kickside.core.threads:authorize_projection_writes", {writes = writes})
        else
            local identity, identity_err = execution_identity.from_row(snapshot.actor_id, snapshot.execution_identity_json)
            if identity_err then return nil, identity_err end
            if type(identity) ~= "table" then return nil, response_error("execution_identity") end
            admitted, admission_err = execution_identity.run_as(identity,
                "kickside.core.threads:authorize_projection_writes", { writes = writes }, {
                    deferred_owner = "kickside.core.projections:tick", execution_root = identity.component_id,
                })
        end
        if admission_err then return nil, admission_err end
        if type(admitted) ~= "table" or type(admitted.writes) ~= "table" then
            return nil, response_error("admitted.writes")
        end
        writes = admitted.writes
    end
    local db, db_err = sql.get(db_id)
    if db_err then return nil, errors.wrap(db_err, "projection apply DB unavailable") end
    if type(db) ~= "table" and type(db) ~= "userdata" then return nil, response_error("database") end
    local result, apply_err = advance_tx(db, job, snapshot, prefetched_last, output, writes, checkpoint, empty_scan, owned)
    local finish_err = release(db, apply_err)
    if checkpoint and result then
        local progressed = result.last_seq > tonumber(snapshot.last_seq)
        local notify_err = (result.self_completed or progressed)
            and notify_progress(snapshot, result.last_seq, progressed) or nil
        if finish_err and notify_err then
            finish_err = error_envelope.wrap_secondary(finish_err, notify_err, "projection checkpoint follow-up failed")
        else
            finish_err = finish_err or notify_err
        end
        if finish_err then return result, committed_error.new(finish_err) end
    end
    if finish_err then return nil, finish_err end
    return result, nil
end

function M.advance(db_id: string, job: table, snapshot: table, prefetched_last: number, output: table,
        empty_scan: boolean?, owned: table?): (table?, error?)
    return advance(db_id, job, snapshot, prefetched_last, output, nil, empty_scan, owned)
end

-- The scheduler can settle a filtered physical page without spawning its worker.
-- Revalidate the empty selection under the same thread and owner locks as publication.
function M.advance_filtered_empty(db_id: string, job: table, snapshot: table, last: number, owner: table,
        registered: table?): (table?, error?)
    local filter = registered and registered.filter or snapshot.body.events.input
    return advance(db_id, job, snapshot, last, {}, {owner = owner, manifest = {}, filter = filter, registered = registered}, true)
end

local function shared_db(target_db: string): (string?, error?)
    local db_id = core_db.id()
    if target_db ~= db_id or jobs_config.db_id() ~= db_id then
        return nil, invalid("projection checkpoint requires the same Core, Jobs, and target database resource")
    end
    return db_id, nil
end

function M.require_shared_database(target_db: string): (string?, error?)
    return shared_db(target_db)
end

-- The deployed writer invokes this library in its own frame. Worker output
-- carries data only. The transaction and callback are not process arguments.
function M.checkpoint(target_db: string, job: table, snapshot: table, prefetched_last: number, output: table,
        write: CheckpointWriter, manifest: {RangeInput}?): (table?, error?)
    local db_id, db_err = shared_db(target_db)
    if not db_id then return nil, db_err end
    if type(write) ~= "function" then return nil, invalid("projection checkpoint requires an owning writer") end
    local proof, proof_err = ctx.get("kickside.core.projection_checkpoint")
    if proof_err and not errors.is(proof_err, errors.NOT_FOUND) then return nil, proof_err end
    local registered = type(proof) == "table" and proof.registered ~= nil
    if proof ~= nil and (type(proof) ~= "table" or type(proof.owner) ~= "table"
        or type(proof.owner.incarnation) ~= "string" or type(proof.owner.generation) ~= "number"
        or proof.cursor_id ~= snapshot.id or proof.owner.component_id ~= (registered and snapshot.component_id or snapshot.thread_id)
        or proof.job_id ~= job.id or proof.lease_token ~= job.lease_token
        or tonumber(proof.execution_seq) ~= tonumber(job.execution_seq)) then
        return nil, invalid("projection checkpoint does not match its admitted owner and lease")
    end
    local filter: table? = nil
    if proof ~= nil then filter = proof.filter end
    local first_input = type(proof) == "table" and not registered and proof.first_input or nil
    local partial = output.continuation ~= nil and type(first_input) == "table"
    if filter or manifest ~= nil then
        if type(filter) ~= "table" or type(manifest) ~= "table" or #manifest == 0
            or proof.from_seq ~= snapshot.last_seq or proof.to_seq ~= prefetched_last
            or proof.reset_generation ~= snapshot.reset_generation or type(output.last_seq) ~= "number"
            or output.last_seq ~= math.floor(output.last_seq)
            or (partial and (output.last_seq ~= proof.from_seq or #manifest ~= 1))
            or (not partial and (output.last_seq <= proof.from_seq or #manifest > output.last_seq - proof.from_seq))
            or output.last_seq > proof.to_seq then
            return nil, invalid("filtered checkpoint is outside its assigned range")
        end
    end
    local authority
    if registered then
        if not filter or not dense_array(manifest) then return nil, invalid("registered checkpoint requires its exact input range") end
        local range_err = registered_checkpoint.check_offer(proof.inputs, manifest :: table, output.last_seq)
        if range_err then return nil, range_err end
        local err
        authority, err = registered_checkpoint.authorize(proof, snapshot, db_id)
        if not authority then return nil, err end
        filter = authority.filter
    end
    return advance(db_id, job, snapshot, prefetched_last, output, {write = write, owner = proof and proof.owner,
        manifest = manifest, filter = filter, registered = authority, first_input = first_input})
end

-- Invoked by the Core scheduler after private admission. Verify the live
-- owner, cursor, exact assignment, lease, and earlier input in the same tx.
function M.reselect_filtered_pin(db_id: string, job: table, snapshot: table, owner: table): (table?, error?)
    local _, db_err = shared_db(db_id)
    if db_err then return nil, db_err end
    local pin, pin_err = M.continuation(snapshot)
    if pin_err then return nil, pin_err end
    local prior = tonumber(snapshot.last_seq)
    local filter = snapshot.body.events and snapshot.body.events.input
    if not pin or not pin.filtered or not prior or pin.seq <= prior or type(filter) ~= "table"
        or #filter == 0 or type(owner) ~= "table" or owner.component_id ~= snapshot.thread_id then
        return nil, invalid("projection reselection requires its admitted filtered pin")
    end
    local offered = {id = pin.event_id, seq = pin.seq}
    return advance(db_id, job, snapshot, pin.seq, {last_seq = prior},
        {owner = owner, manifest = {offered}, first_input = offered, filter = filter, reselect = true})
end

function M.finish_checkpointed(target_db: string, job: table, snapshot: table, first_seq: number,
        owner: table?): (table?, error?)
    local db_id, db_err = shared_db(target_db)
    if not db_id then return nil, db_err end
    local position = tonumber(snapshot.last_seq)
    if not position or type(first_seq) ~= "number" or first_seq < 0 or first_seq > position
        or first_seq ~= math.floor(first_seq) then
        return nil, invalid("projection checkpoint settlement requires the execution's first position")
    end
    return advance(db_id, job, snapshot, position, {last_seq = position}, {first_seq = first_seq, owner = owner})
end

return M
