-- One jobs-slot attempt over a projection cursor. Jobs owns claim, lease,
-- heartbeat, retry and completion; this module only reads an event range and
-- invokes the registered fold under its stored execution identity.
local sql = require("sql")
local registry = require("registry")
local security = require("security")
local component_query = require("component_query")
local event_access = require("event_access")
local json = require("json")
local canonical_json = require("canonical_json")
local time = require("time")
local clock = require("clock")
local core_db = require("core_db")
local worker = require("worker")
local owned_worker = require("owned_worker")
local projection_policy = require("projection_policy")
local apply = require("apply")
local trace_context = require("trace_context")
local jobs = require("jobs")
local execution_identity = require("execution_identity")
local job_types = require("job_types")
local error_envelope = require("error_envelope")
local lifecycle_consts = require("lifecycle_consts")

local M = {}

local function response_error(field: string): error
    return errors.new({message = "projection invocation response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "projection_invoke_response", field = field}})
end

local function release(db: sql.DB, operation_error: error?): error?
    local _, err = db:release()
    if not err then return operation_error end
    if operation_error then
        return error_envelope.wrap_secondary(err, operation_error, "projection DB release failed")
    end
    return errors.wrap(err, "projection DB release failed")
end

local function body_from(raw: any): (table?, error?)
    if type(raw) == "table" then return raw :: table, nil end
    if type(raw) ~= "string" or raw == "" then
        return nil, response_error("body")
    end
    local body, err = json.decode(raw)
    if err then return nil, errors.wrap(err, "projection body invalid") end
    if type(body) ~= "table" then return nil, response_error("body") end
    return body :: table, nil
end

local function event_types(body: table): { string }?
    local events = type(body.events) == "table" and body.events or nil
    local declared = events and type(events.input) == "table" and events.input or nil
    if not declared or #declared == 0 then return nil end
    local out: { string } = {}
    for _, shape in ipairs(declared) do
        if type(shape) == "table" and type(shape.type) == "string" and shape.type ~= "" then
            out[#out + 1] = shape.type
        end
    end
    return #out > 0 and out or nil
end

local function unowned_context(dialect: string): string
    if dialect == sql.type.POSTGRES then
        return [[(c.private_context IS NULL OR c.private_context='[]'::jsonb OR
            (jsonb_typeof(c.private_context)='object' AND NOT jsonb_exists(c.private_context,'_execution_identity')))]]
    end
    return [[(c.private_context IS NULL OR CASE WHEN json_valid(c.private_context)
        THEN (json_type(c.private_context)='object' AND json_type(c.private_context,'$._execution_identity') IS NULL)
            OR (json_type(c.private_context)='array' AND json_array_length(c.private_context)=0)
        ELSE FALSE END)]]
end

local function snapshot(db: sql.DB, cursor_id: string, job_id: string): (table?, error?)
    local dialect, dialect_err = db:type()
    if dialect_err then return nil, dialect_err end
    if not dialect then return nil, response_error("database.type") end
    local key, key_err = event_access.component_key(db, dialect)
    if key_err then return nil, key_err end
    local rows, err = db:query([[SELECT k.id,k.projection_id,k.thread_id,k.cursor_key,k.last_seq,
        k.generation,k.status,k.job_id,k.last_error,k.debounce_idle_ms,k.debounce_max_ms,k.continuation,
        k.actor_id,k.execution_identity_json,p.kind,p.projection_key,p.reset_generation,p.body,t.thread_class,t.event_count,t.deleting_at,
        c.identity_generation AS component_identity_generation,
        CASE WHEN c.deleting_at IS NULL AND t.deleting_at IS NULL AND c.identity_hash IS NULL
            AND p.actor_id IS NULL AND p.actor_context IS NULL AND ]] .. unowned_context(dialect) .. [[
            THEN 1 ELSE 0 END AS component_owned_candidate, ]] .. table.concat(event_access.binding_columns, ",") .. [[
        FROM kickside_projection_cursor k
        JOIN kickside_projection p ON p.id=k.projection_id AND p.thread_id=k.thread_id
        JOIN kickside_thread t ON t.id=k.thread_id
        LEFT JOIN ]] .. event_access.component_join(key :: string) .. [[
        WHERE k.id=$1]], { cursor_id })
    if err then return nil, errors.wrap(err, "projection snapshot failed") end
    if type(rows) ~= "table" then return nil, response_error("snapshot.rows") end
    local row = rows[1]
    if not row then return nil, (errors.new({ message = "projection cursor not found", kind = errors.NOT_FOUND }) :: error) end
    if tostring(row.job_id or "") ~= job_id then
        return nil, (errors.new({ message = "projection cursor slot mismatch", kind = errors.CONFLICT }) :: error)
    end
    if row.execution_identity_json ~= nil then
        local identity, identity_err = execution_identity.from_row(row.actor_id, row.execution_identity_json)
        if identity_err then return row, identity_err end
        if type(identity) ~= "table" then return row, response_error("execution_identity") end
    elseif row.actor_id ~= nil then
        return row, (errors.new({ message = "projection cursor execution identity is missing", kind = errors.INVALID }) :: error)
    end
    local body, body_err = body_from(row.body)
    if body_err then return row, body_err end
    row.raw_body = row.body
    row.body = body
    return row, nil
end
M.snapshot = snapshot

-- Resolve the same actor used for dispatch outside the SQLite connection.
local function batch_access(row: table, binding: table, snapshot: any?): (any?, any?, table?, error?)
    if not row.component_incarnation then return nil, nil, nil, event_access.denied() end
    if not snapshot then
        local snapshot_err: error?
        snapshot, snapshot_err = registry.snapshot()
        if snapshot_err then return nil, nil, nil, snapshot_err end
    end
    local restricted, policy_err = event_access.restricted(row.component_impl_id, snapshot)
    if policy_err then return nil, nil, nil, policy_err end
    local actor, scope, identity_err
    if binding.system_identity then
        actor, identity_err = security.new_actor(lifecycle_consts.SYSTEM_ACTOR,
            {system = true, groups = {"system", "lifecycle"}})
        if not identity_err then scope, identity_err = security.named_scope(lifecycle_consts.SYSTEM_SCOPE) end
        if not identity_err and not scope then identity_err = response_error("system_scope") end
    else
        actor, scope, identity_err = worker.resolve_binding_identity(binding)
    end
    if identity_err then return nil, nil, nil, identity_err end
    if not actor then return nil, nil, nil, event_access.denied() end
    local read_mask = event_access.read_mask(restricted)
    local acl, acl_err = component_query.snapshot_access(row.component_id, read_mask, actor)
    if acl_err then return nil, nil, nil, acl_err end
    return acl, snapshot, {actor = actor, scope = scope, read_mask = read_mask}, nil
end

local function declaration(snapshot: any, id: string): (string?, error?)
    local entry, err = snapshot:get(id)
    if err then
        if errors.is(err, errors.NOT_FOUND) then return nil, nil end
        return nil, err
    end
    return canonical_json.encode(entry)
end

local function check_revision(previous: any?, ...: string): error?
    if not previous then return nil end
    local version, err = registry.current_version()
    if err then return err end
    if not version then return response_error("registry.version") end
    if tostring(version:id()) == tostring(previous:version():id()) then return nil end
    local live, snapshot_err = registry.snapshot()
    if snapshot_err then return snapshot_err end
    for _, id in ipairs({...}) do
        local before, before_err = declaration(previous, id)
        if before_err then return before_err end
        local after, after_err = declaration(live, id)
        if after_err then return after_err end
        if before ~= after then
            return errors.new({kind = errors.CONFLICT, retryable = true, message = "projection declaration changed",
                details = {code = "projection_source_revision"}})
        end
    end
    return nil
end

local function callback_source(db_id: string, current: table, job_id: string, acl: any?): error?
    local db, open_err = sql.get(db_id)
    if open_err then return open_err end
    local latest, err = snapshot(db, tostring(current.id), job_id)
    if not err then
        if not event_access.same_binding(latest, current) or latest.status ~= "active"
            or tonumber(latest.generation) ~= tonumber(current.generation) then
            err = errors.new({kind = errors.CONFLICT, message = "projection callback source changed"})
        elseif acl then
            err = event_access.check(db, current.thread_id, {binding = current, acl = acl})
        end
    end
    return release(db, err)
end

local function callback_fenced(err: error): boolean
    return errors.is(err, errors.CONFLICT) or errors.is(err, errors.NOT_FOUND) or errors.is(err, errors.PERMISSION_DENIED)
end

local function input_fence(db: sql.DB, row: table, job: table, acl: any?, owned: table?): (any?, error?)
    local key, err = event_access.component_key(db)
    if err then return nil, err end
    local query = sql.builder.select():from("kickside_projection_cursor k")
        :inner_join("kickside_thread t ON t.id=k.thread_id")
        :inner_join("kickside_projection p ON p.id=k.projection_id")
        :inner_join("kickside_job j ON j.id=k.job_id")
        :left_join(event_access.component_join(key :: string))
        :where("k.id = ? AND k.generation = ? AND k.last_seq = ? AND k.status = 'active'",
            row.id, row.generation, row.last_seq)
        :where("j.id = ? AND j.status = 'running' AND j.lease_token = ? AND j.execution_seq = ?",
            job.id, job.lease_token, job.execution_seq)
        :where("p.body = ? AND CAST(t.created_at AS TEXT) = ?", row.raw_body, row.thread_incarnation)
    if acl then
        local statement, args = acl:to_sql()
        query = event_access.component_matches(query, row):where("t.component_id = ?", row.component_id)
            :left_join("(" .. statement .. ") acl ON acl.component_id = c.component_id", table.unpack(args))
            :columns("CASE WHEN acl.component_id IS NULL THEN 0 ELSE 1 END AS payload_allowed")
    elseif owned then
        query = event_access.component_matches(query, row):where("t.component_id = ? AND c.identity_generation = ?",
            owned.component_id, owned.generation)
            :where([[c.deleting_at IS NULL AND t.deleting_at IS NULL AND c.identity_hash IS NULL
                AND p.actor_id IS NULL AND p.actor_context IS NULL
                AND k.actor_id IS NULL AND k.execution_identity_json IS NULL]])
            :columns("1 AS payload_allowed")
    else
        query = query:where("COALESCE(t.component_id, '') = ''"):columns("1 AS payload_allowed")
    end
    return query, nil
end

local TIMESTAMP_LAYOUTS = {
    "2006-01-02T15:04:05.999999999Z07:00",
    "2006-01-02 15:04:05.999999999Z07:00",
    "2006-01-02 15:04:05.999999999-07",
    "2006-01-02 15:04:05.999999999",
}

local function parsed_time(raw: any): (any?, error?)
    if type(raw) ~= "string" or raw == "" then return nil, response_error("event.created_at") end
    local parse_error: error? = nil
    for _, layout in ipairs(TIMESTAMP_LAYOUTS) do
        local value, err = time.parse(layout, raw)
        if value and not err then
            if type(value) ~= "userdata" then return nil, response_error("event.created_at") end
            return value, nil
        end
        if err then parse_error = err end
    end
    if parse_error then return nil, errors.wrap(parse_error, "projection event timestamp invalid") end
    return nil, response_error("event.created_at")
end

local function debounce_due(db: sql.DB, row: table): (string?, error?)
    local idle = tonumber(row.debounce_idle_ms)
    local maximum = tonumber(row.debounce_max_ms)
    if not idle or not maximum or idle < 0 or maximum < 0 then
        return nil, response_error("debounce")
    end
    if idle == 0 then return nil, nil end
    if maximum == 0 then return nil, (errors.new({
        message = "projection idle debounce requires a maximum duration", kind = errors.INVALID,
    }) :: error) end
    local first, first_err = db:query([[SELECT created_at FROM kickside_event
        WHERE thread_id=$1 AND seq>$2 ORDER BY seq ASC LIMIT 1]], { row.thread_id, row.last_seq })
    if first_err then return nil, errors.wrap(first_err, "projection debounce first event read failed") end
    local latest, latest_err = db:query([[SELECT created_at FROM kickside_event
        WHERE thread_id=$1 AND seq>$2 ORDER BY seq DESC LIMIT 1]], { row.thread_id, row.last_seq })
    if latest_err then return nil, errors.wrap(latest_err, "projection debounce latest event read failed") end
    if type(first) ~= "table" or type(first[1]) ~= "table" then return nil, response_error("debounce.first") end
    if type(latest) ~= "table" or type(latest[1]) ~= "table" then return nil, response_error("debounce.latest") end
    local opened, open_err = parsed_time(first[1].created_at)
    if open_err then return nil, open_err end
    local last, last_err = parsed_time(latest[1].created_at)
    if last_err then return nil, last_err end
    local idle_due = (last :: any):add(idle * time.MILLISECOND)
    local max_due = (opened :: any):add(maximum * time.MILLISECOND)
    local due = idle_due:before(max_due) and idle_due or max_due
    if not due:after(time.now()) then return nil, nil end
    local raw_type, type_err = db:type()
    if type_err then return nil, errors.wrap(type_err, "projection debounce dialect unavailable") end
    if type(raw_type) ~= "string" or raw_type == "" then return nil, response_error("database.type") end
    return clock.format(due, raw_type), nil
end

local function defer(db: sql.DB, job: table, due: string): (table?, error?)
    local tx, begin_err = db:begin()
    if begin_err then return nil, errors.wrap(begin_err, "projection debounce begin failed") end
    if type(tx) ~= "table" and type(tx) ~= "userdata" then return nil, response_error("transaction") end
    local done, done_err = jobs.complete_tx(tx, tostring(job.id), {
        token = tostring(job.lease_token), execution_seq = tonumber(job.execution_seq),
    }, { rearm = due, defer_demand = true })
    if not done_err and type(done) ~= "table" then done_err = response_error("completion") end
    if done_err then
        local _, rollback_err = tx:rollback()
        if rollback_err then return nil, error_envelope.wrap_secondary(rollback_err, done_err, "projection debounce rollback failed") end
        return nil, done_err
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "projection debounce commit failed") end
    return { self_completed = true, completion = done, deferred_until = due }, nil
end

local function run_checkpointed(binding: table, input: table, host: string, db_id: string, job: table,
        current: table, prefetched_last: number, before_dispatch: () -> error?, execution_frame: table?,
        owner: table?, registered: boolean?): (table?, error?, table?, table?)
    local first = tonumber(current.last_seq)
    if first == nil then return nil, response_error("cursor.position"), current end
    local first_continuation = current.continuation
    local assigned_cursor = {}
    for key, value in pairs(current) do assigned_cursor[key] = value end
    assigned_cursor.component_identity_generation = nil
    assigned_cursor.component_owned_candidate = nil
    -- The plain input already carries the registered projection body.
    if registered then assigned_cursor.body, assigned_cursor.raw_body = nil, nil end
    input.checkpoint = {
        job = {id = job.id, lease_token = job.lease_token, execution_seq = job.execution_seq, attempt_no = job.attempt_no},
        cursor = assigned_cursor,
        prefetched_last = prefetched_last,
        registered = registered,
    }
    local result, run_err = worker.run_proc_supervised(binding, input, {
        proc_host = host, before_dispatch = before_dispatch, execution_frame = execution_frame,
    })
    if job_types.is_lease_lost_error(run_err) then return nil, run_err end

    -- This process may have published several mutations before returning an
    -- error. Read the committed position back before reporting a failure or
    -- settling the slot. A returned range cannot change cursor progress.
    local db, open_err = sql.get(db_id)
    if open_err then return nil, open_err end
    if not db then return nil, response_error("checkpoint.database") end
    local latest, row_err = snapshot(db, tostring(current.id), tostring(job.id))
    local read_err = release(db, row_err)
    if read_err then return nil, read_err, owner and current or nil, owner end
    if not latest then return nil, response_error("checkpoint.snapshot") end
    if latest.status ~= "active" or latest.generation ~= current.generation then
        return apply.advance(db_id, job, current, first, {last_seq = first})
    end
    if binding.filtered_continuation and owner and apply.backfilled_pin_error(run_err) then
        local reselected, reselect_err = apply.reselect_filtered_pin(db_id, job, current, owner)
        return reselected, reselect_err, (not reselected and latest or nil), owner
    end
    if run_err then return nil, run_err, latest, owner end
    if type(result) ~= "table" or result.checkpointed ~= true then
        return nil, response_error("checkpoint.worker_receipt"), latest, owner
    end
    if tonumber(latest.last_seq) == first and latest.continuation == first_continuation then
        return nil, errors.new({kind = errors.INVALID, retryable = false,
            message = "checkpoint worker returned without advancing the position"}), latest, owner
    end
    local settled, settle_err = apply.finish_checkpointed(db_id, job, latest, first, owner)
    if owner and not settled and settle_err then return nil, settle_err, latest, owner end
    return settled, settle_err
end

local function attempt(connection: sql.DB, db_id: string, job: table, current: table, page_size: number,
        readmitting_owned: boolean?): (table?, error?, table?, table?, boolean?)
    local db: sql.DB? = connection
    local cursor_id = tostring(current.id)
    local head = tonumber(current.event_count)
    local last = tonumber(current.last_seq)
    if head == nil or last == nil then
        return nil, release(db, response_error("cursor.position"))
    end
    local target = math.min(head, last + page_size)
    if current.status == "active" and head > last then
        local due, due_err = debounce_due(db, current)
        if due_err then return nil, release(db, due_err) end
        if due then
            local result, defer_err = defer(db, job, due)
            local final_err = release(db, defer_err)
            if final_err then return nil, final_err end
            return result, nil
        end
    end
    local post_commit: table? = nil
    local committed_input: table? = nil
    local output: table? = {}
    local row_err: error? = nil
    local seen_last = last
    local revision: any = nil
    local fold_target: string? = nil
    local owned: table? = nil
    if current.status == "active" and head > last then
        local body = current.body :: table
        local meta = type(body.meta) == "table" and body.meta or {}
        local ref = meta.worker_ref
        local parsed, parse_err = worker.parse(ref, true)
        if parse_err then return nil, release(db, parse_err) end
        if type(parsed) ~= "table" then return nil, release(db, response_error("worker.reference")) end
        local component_backed = current.component_id ~= nil and current.component_id ~= ""
        local system_identity = current.actor_id == nil and current.execution_identity_json == nil
        local needs_owned = component_backed and system_identity and not (current.thread_id == current.component_id
            and owned_worker.core_lifecycle(current.component_impl_id, current.thread_id, current.kind, parsed.target_id))
        local binding, binding_err = worker.validate(parsed, system_identity)
        local needs_owned_declaration = (type(binding) == "table" and binding.component_owned)
            or (binding_err and worker.requires_owned_declaration(binding_err))
        if needs_owned and not needs_owned_declaration then
            return nil, release(db, event_access.denied())
        end
        if readmitting_owned and not needs_owned_declaration then
            return nil, release(db, binding_err or event_access.denied())
        end
        local needs_declaration = binding_err and worker.requires_checkpoint_declaration(binding_err)
        if needs_owned_declaration then
            binding = parsed
        elseif needs_declaration then
            binding = parsed
            binding.checkpointed_apply = true
        elseif binding_err then
            return nil, release(db, binding_err)
        end
        if type(binding) ~= "table" then return nil, release(db, response_error("worker.binding")) end
        binding.actor_id = current.actor_id
        binding.actor_context = current.execution_identity_json
        binding.system_identity = system_identity
        fold_target = binding.target_id
        local types: {string}? = nil
        local from = last + 1
        local pinned: table? = nil
        if binding.checkpointed_apply then
            if current.deleting_at ~= nil then
                return nil, release(db, job_types.lease_lost_error("projection source thread is deleting"))
            end
            local read_err
            pinned, read_err = apply.continuation(current)
            if read_err then return nil, release(db, read_err), current end
            -- Checkpoint resumption for ordinary pins uses their exact event.
            -- Filtered pins also check the unpublished prefix for a backfill.
            if pinned and not pinned.filtered then from = pinned.seq end
            target = head
        else
            local post_err: error? = nil
            if not needs_owned_declaration then
                post_commit, post_err = worker.post_commit_binding(binding)
                if post_err then return nil, release(db, post_err) end
            end
            types = event_types(body)
        end
        local acl: any = nil
        local execution_frame: table? = nil
        local checkpoint_owner: table? = nil
        local registered: boolean? = nil
        if component_backed or needs_declaration or needs_owned_declaration then
            local release_err = release(db, nil)
            if release_err then return nil, release_err end
            if needs_owned_declaration then
                local admission_err: error?
                revision, admission_err = registry.snapshot()
                if admission_err then return nil, admission_err end
                if not revision then return nil, response_error("owned.registry") end
                local _, proof_err = owned_worker.check(revision, current, binding.target_id)
                if proof_err then return nil, proof_err end
                local admitted
                local revision_changed: boolean?
                admitted, admission_err, revision_changed = worker.admit_owned(binding, system_identity, tostring(revision:version():id()))
                if not admitted then
                    return nil, admission_err or response_error("owned.worker"), nil, nil, revision_changed
                end
                binding = admitted
                binding.actor_id = current.actor_id
                binding.actor_context = current.execution_identity_json
                binding.system_identity = system_identity
                if needs_owned then
                    execution_frame, owned, admission_err = owned_worker.frame(current)
                    if admission_err then return nil, admission_err end
                end
            elseif needs_declaration then
                local admitted, declaration_err, owner = worker.admit_declared_checkpoint(binding, current)
                if not admitted then return nil, declaration_err or response_error("worker.declaration") end
                binding, checkpoint_owner = admitted, owner
            end
            if component_backed and not owned then
                local access_err: error?
                acl, revision, execution_frame, access_err = batch_access(current, binding, revision)
                if access_err then return nil, access_err end
            end
            if binding.registered_checkpoint and execution_frame then
                local admitted, admission_err, owner = worker.admit_registered_checkpoint(binding, current, db_id, revision, types)
                if admission_err then return nil, admission_err end
                if admitted then
                    binding, checkpoint_owner, registered = admitted, owner, true
                end
            end
            local open_err: error?
            db, open_err = sql.get(db_id)
            if open_err then return nil, open_err end
            if not db then return nil, response_error("database") end
        end
        if binding.filtered_checkpoint then
            types = event_types(body)
            if not checkpoint_owner or not types or (pinned and not binding.filtered_continuation) then
                return nil, release(db, response_error("filtered checkpoint declaration"))
            end
            target = pinned and pinned.seq or math.min(head, last + page_size)
        end
        local fence, fence_err = input_fence(db, current, job, acl, owned)
        if fence_err then return nil, release(db, fence_err) end
        local limit = pinned and pinned.filtered and 1 or page_size
        local events, events_err = worker.query_event_rows(db, tostring(current.thread_id), from, target, limit, types, fence)
        if events_err then return nil, release(db, events_err) end
        if type(events) ~= "table" then return nil, release(db, response_error("events")) end
        local batch = events :: table[]
        local first = batch[1]
        local eligible_seq = first and tonumber(first.seq)
        if pinned and pinned.filtered and binding.filtered_continuation and eligible_seq and eligible_seq < pinned.seq then
            local release_err = release(db, nil)
            if release_err then return nil, release_err end
            local reselected, reselect_err = apply.reselect_filtered_pin(db_id, job, current, checkpoint_owner)
            return reselected, reselect_err, (not reselected and current or nil), checkpoint_owner
        end
        if pinned and binding.filtered_checkpoint and (#batch ~= 1 or batch[1].id ~= pinned.event_id
            or tonumber(batch[1].seq) ~= pinned.seq) then
            return nil, release(db, errors.new({kind = errors.NOT_FOUND, retryable = false,
                message = "pinned filtered checkpoint input is missing"})), current, checkpoint_owner
        end
        if binding.checkpointed_apply and not binding.filtered_checkpoint and (#batch == 0 or (pinned and batch[1].id ~= pinned.event_id)) then
            return nil, release(db, errors.new({kind = errors.NOT_FOUND, retryable = false,
                message = "projection checkpoint input is missing"})), current
        end
        seen_last = target
        if not types and #batch > 0 then seen_last = tonumber(batch[#batch].seq) or last end
        if binding.checkpointed_apply then target = seen_last end
        local mode = meta.worker_input_mode == "prefetch_events" and "prefetch_events" or "cursor_only"
        if binding.checkpointed_apply and mode ~= "prefetch_events" then
            return nil, release(db, errors.new({kind = errors.INVALID,
                message = "checkpointed apply requires prefetched events"}))
        end
        local work_input = {
            thread_id = current.thread_id,
            trace_context = trace_context.common(batch),
            worker_input_mode = mode,
            cursor = { id = cursor_id, cursor_key = current.cursor_key, last_seq = last,
                target_seq = target, batch_size = page_size, generation = tonumber(current.generation),
                last_error = current.last_error },
            projection = { id = current.projection_id, kind = current.kind, body = body },
            range = { from_seq = from, to_seq = seen_last, target_seq = target, processed_count = #batch },
            events = mode == "prefetch_events" and batch or nil,
        }
        if binding.filtered_checkpoint and #batch == 0 then
            local release_err = release(db, nil)
            if release_err then return nil, release_err end
            local authority
            if registered then
                local capture_err
                authority, capture_err = worker.capture_registered_checkpoint(binding, current, execution_frame :: table, true)
                if not authority then return nil, capture_err or response_error("registered.checkpoint"), current, checkpoint_owner end
            end
            local result, empty_err = apply.advance_filtered_empty(db_id, job, current, seen_last, checkpoint_owner :: table, authority)
            return result, empty_err, current, checkpoint_owner
        end
        if #batch > 0 then
            local target_id = binding.target_id
            if type(target_id) ~= "string" then
                return nil, release(db, response_error("worker.target_id"))
            end
            committed_input = work_input
            -- Workers may read or write the shared core database. SQLite has a
            -- single pooled connection, so the snapshot handle must be returned
            -- before invoking either a function or a monitored process.
            local release_err = release(db, nil)
            if release_err then return nil, release_err end
            if registered then
                local captured, capture_err = worker.capture_registered_checkpoint(binding, current, execution_frame :: table)
                if not captured then return nil, capture_err or response_error("registered.checkpoint"), current, checkpoint_owner end
            end
            local revision_changed = false
            local function before_dispatch(): error?
                if needs_owned_declaration then
                    local live, err = registry.current_version()
                    if err then return err end
                    if not live then return response_error("registry.version") end
                    if tostring(live:id()) ~= tostring(revision:version():id()) then
                        revision_changed = true
                        return errors.new({kind = errors.CONFLICT, retryable = true,
                            message = "component-owned projection declaration changed before dispatch"})
                    end
                    return nil
                end
                if registered then return check_revision(revision, current.component_impl_id, target_id, fold_target :: string) end
                return check_revision(revision, current.component_impl_id, target_id)
            end
            if binding.worker_runtime == "proc" then
                local host, host_err = apply.process_host()
                if host_err then return nil, host_err end
                if type(host) ~= "string" or host == "" then return nil, response_error("process_host") end
                if binding.checkpointed_apply then
                    return run_checkpointed(binding, work_input, host, db_id, job, current, seen_last, before_dispatch,
                        execution_frame, checkpoint_owner, registered)
                end
                -- The outer Jobs watchdog can terminate this invocation before
                -- Core has a chance to record its own timeout on the cursor.
                work_input.previous_execution_timed_out = job.previous_execution_timed_out == true
                    or current.last_error == worker.PROC_TIMEOUT_MARKER or nil
                output, row_err = worker.run_proc_supervised(binding, work_input, {
                    proc_host = host,
                    before_dispatch = before_dispatch,
                    execution_frame = execution_frame,
                })
            else
                local worker_revision_changed: boolean?
                output, row_err, worker_revision_changed = worker.run(binding, work_input, before_dispatch, execution_frame)
                revision_changed = revision_changed or worker_revision_changed == true
            end
            if row_err then return nil, row_err, nil, nil, revision_changed end
            db = nil
        end
    end
    if db then
        local release_err = release(db, nil)
        if release_err then return nil, release_err end
    end
    if type(output) ~= "table" then return nil, response_error("worker.output") end
    -- The authorized range advanced without invoking a worker or changing its fold.
    local empty_scan = committed_input == nil and seen_last > last
    local result, apply_err = apply.advance(db_id, job, current, seen_last, output, empty_scan, owned)
    if apply_err then return nil, apply_err end
    if type(result) ~= "table" then return nil, response_error("advance") end
    -- Match apply's cursor/retention notifications: successful durable commit
    -- first. Release the pool handle before a callback may use the same DB,
    -- especially SQLite's single connection. Stale and empty folds never notify.
    if not result.stale and post_commit and committed_input
        and tonumber(result.last_seq) and tonumber(result.last_seq) > last then
        local function callback_revision(): error?
            return check_revision(revision, current.component_impl_id, fold_target :: string, post_commit.target_id)
        end
        local revision_err = callback_revision()
        if revision_err then
            if callback_fenced(revision_err) then return result, nil end
            return nil, revision_err
        end
        local acl, frame
        if revision then
            local access_err: error?
            acl, _, frame, access_err = batch_access(current, post_commit)
            if access_err then
                if callback_fenced(access_err) then return result, nil end
                return nil, access_err
            end
        end
        committed_input.projection.body = output.body or current.body
        committed_input.range.to_seq = result.last_seq
        local fenced = false
        local function before_callback(): error?
            local err = callback_source(db_id, current, job.id, acl) or callback_revision()
            fenced = err ~= nil and callback_fenced(err)
            return err
        end
        local _, post_err = worker.run(post_commit, committed_input, before_callback, frame)
        if fenced then return result, nil end
        if post_err then return nil, post_err end
    end
    return result, nil
end

function M.run(input: any): (table?, error?)
    local job = type(input) == "table" and input.job or nil
    local payload = type(input) == "table" and input.payload or nil
    local cursor_id = type(payload) == "table" and payload.cursor_id or nil
    if type(job) ~= "table" or type(job.id) ~= "string" or type(cursor_id) ~= "string" then
        return nil, (errors.new({ message = "projection slot input requires job and cursor_id", kind = errors.INVALID }) :: error)
    end
    local pol, pol_err = projection_policy.policy()
    if pol_err then return nil, pol_err end
    if type(pol) ~= "table" then return nil, response_error("policy") end
    local page_size = pol.apply_batch_size
    local db_id = core_db.id()
    local db, db_err = sql.get(db_id)
    if db_err then return nil, errors.wrap(db_err, "projection DB unavailable") end
    if type(db) ~= "table" and type(db) ~= "userdata" then return nil, response_error("database") end
    local row, row_err = snapshot(db, cursor_id, job.id)
    local result: table? = nil
    local attempt_err: error? = nil
    local checkpoint_failed = false
    local failed_owner: table? = nil
    if row_err then
        attempt_err = release(db, row_err)
        if not row then return nil, attempt_err end
    else
        local failed_at
        local revision_changed: boolean?
        result, attempt_err, failed_at, failed_owner, revision_changed = attempt(db, db_id, job, row :: table, page_size)
        if revision_changed then
            -- The stale attempt stopped before calling the worker. Re-admit
            -- once under the same claim, cursor and deadline. The input and
            -- publication fences still check the stored owner and lease. Any
            -- further rollover follows the existing Jobs failure path.
            local fresh_db, fresh_err = sql.get(db_id)
            if fresh_err then return nil, errors.wrap(fresh_err, "projection re-admission DB unavailable") end
            if type(fresh_db) ~= "table" and type(fresh_db) ~= "userdata" then
                return nil, response_error("database")
            end
            result, attempt_err, failed_at, failed_owner = attempt(fresh_db, db_id, job, row :: table, page_size, true)
        end
        if failed_at then
            row = failed_at
            checkpoint_failed = true
        end
    end
    local current = row :: table
    if result and result.pending_transition then
        result.pending_transition = nil
        local _, transition_err = require("funcs").call("kickside.core.lifecycle:resume_projection_transition", cursor_id)
        if transition_err then
            require("logger"):named("kickside.projections"):warn("deferred projection transition failed",
                {cursor_id = cursor_id, error = tostring(transition_err)})
        end
    end
    if not attempt_err or result then return result, attempt_err end
    if job_types.is_lease_lost_error(attempt_err) then return nil, attempt_err end
    -- Access, identity, worker and apply failures share the existing cursor
    -- failure transition. Its fence protects a resumed or committed cursor.
    local deterministic = job_types.is_deterministic_kind(attempt_err:kind())
    local failed, fail_err = apply.fail(db_id, job, current, attempt_err, deterministic, checkpoint_failed or nil, failed_owner)
    if fail_err then return nil, fail_err end
    if failed then return failed, nil end
    return nil, attempt_err
end

return M
