-- The one event writer of the threads slice. Every append runs on the caller's
-- transaction under the thread row lock and never acquires a connection of its
-- own.
--
-- A batch is deduplicated with one lookup per identity kind (event id, external
-- identity, explicit sequence) against the log plus the batch itself, sequenced
-- after the thread head, and written with multi-row inserts of at most
-- INSERT_CHUNK rows. A sequence at or below max_pruned_seq names pruned history
-- and is refused before any write. The append advances the thread head, stamps
-- the thread's projection cursors due, and publishes wake demand through
-- jobs.wake_tx before the caller commits.

local sql = require("sql")
local sql_boundary = require("sql_boundary")
local error_envelope = require("error_envelope")
local json = require("json")
local uuid = require("uuid")
local clock = require("clock")
local jobs_wake = require("jobs_wake")
local consts = require("threads_consts")
local normalize = require("threads_normalize")
local masks = require("core_types")
local trace_context = require("trace_context")
local retention_policy = require("retention_policy")
local row_size = require("row_size")
local subjects = require("subjects")

local append = {}

append.INSERT_CHUNK = 100
append.LOOKUP_CHUNK = 200

local COLUMNS = {
    "id", "thread_id", "type", "role", "body", "seq", "content_type", "content_mode", "created_at",
    "external_source", "external_id", "external_version", "content_ref", "content_hash", "content_bytes",
    "trace_id", "run_id", "caused_by_event_id", "correlation_key", "subject", "subject_version",
}

-- One appended or matched event.
type Appended = {
    event_id: string,
    seq: integer,
    duplicate: boolean,
    subject: string?,
    subject_version: integer?,
}

-- The result of one thread's batch.
type BatchResult = {
    thread_id: string,
    inserted: integer,
    duplicates: integer,
    max_seq: integer,
    events: { Appended },
    wake_generation: integer?,
}

type AppendOptions = {
    completion_job_id: string?,
    defer_wake: boolean?,
    expect: any?,
    locked_thread: table?,
}

local trim = normalize.trim

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false }) :: error)
end

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false,
        message = "thread append returns no valid " .. field .. " proof",
        details = {code = "thread_append_response", field = field}})
end

local function int_of(value: any): integer
    return math.floor(tonumber(value) or 0) :: integer
end

local function external_key(event_type: string, source: string, id: string, version: string?): string
    return table.concat({ event_type, source, id }, "\0") .. (version and ("\0v" .. version) or "\0-")
end

local function placeholders(first: integer, count: integer): string
    local out: { string } = table.create(count, 0)
    for i = 1, count do out[i] = "$" .. tostring(first + i - 1) end
    return table.concat(out, ", ")
end

-- Run fn over values in chunks of LOOKUP_CHUNK.
local function each_chunk(values: { any }, fn: ({ any }) -> error?): error?
    local index = 1
    while index <= #values do
        local chunk: { any } = {}
        for i = index, math.min(index + append.LOOKUP_CHUNK - 1, #values) do
            chunk[#chunk + 1] = values[i]
        end
        local err = fn(chunk)
        if err then return err end
        index = index + append.LOOKUP_CHUNK
    end
    return nil
end

-- Candidate rows validated from the caller's events, in input order.
local function shape(events: { table }, dbtype: string, now: string): ({ table }?, error?)
    local rows: { table } = table.create(#events, 0)
    for index, event in ipairs(events) do
        local label = "events[" .. tostring(index) .. "]"
        if type(event) ~= "table" then return nil, invalid(label .. " must be an object") end
        local subject_err = subjects.validate_subject(event.subject)
        if subject_err then return nil, subject_err end
        local event_type = trim(event.type)
        if event_type == "" then event_type = consts.EVENT_TYPE.MESSAGE_CREATED end
        local seq = normalize.to_int(event.seq, nil)
        if seq ~= nil and seq < 1 then return nil, invalid(label .. ".seq must be >= 1") end
        local role = trim(event.role)
        if role == "" then role = consts.DEFAULT_ROLE end
        local created_at, created_at_err = normalize.normalize_created_at(event.created_at, label .. ".created_at", dbtype)
        if created_at_err then return nil, errors.wrap(created_at_err, "normalize event created_at") end
        local content, content_err = normalize.normalize_content(event.content)
        if content_err then return nil, content_err end
        local external, external_err = normalize.normalize_external(event.external)
        if external_err then return nil, external_err end
        local row: { [string]: any } = {
            id = trim(event.id),
            subject = event.subject,
            type = event_type,
            role = role,
            body = type(event.body_json) == "string" and event.body_json ~= "" and event.body_json or "{}",
            seq = seq,
            content_type = content.content_type,
            content_mode = content.content_mode,
            content_ref = content.content_ref_json,
            content_hash = content.content_hash,
            content_bytes = content.content_bytes,
            created_at = created_at or now,
            external_source = external.external_source,
            external_id = external.external_id,
            external_version = external.external_version,
        }
        local _, trace_err = trace_context.apply_to_row(row, event.trace_context)
        if trace_err then return nil, trace_err end
        rows[index] = row
    end
    return rows, nil
end

type Stored = { [string]: Appended }

-- Existing events matching the batch's ids, external identities and explicit
-- sequences, keyed for lookup.
local function load_existing(tx: sql.Transaction, thread_id: string, rows: { table }): (Stored?, Stored?, Stored?, error?)
    local ids: { any } = {}
    local external_ids: { any } = {}
    local seqs: { any } = {}
    local seen_external: { [string]: boolean } = {}
    for _, row in ipairs(rows) do
        if row.id ~= "" then ids[#ids + 1] = row.id end
        if row.external_source and row.external_id and not seen_external[row.external_id] then
            seen_external[row.external_id] = true
            external_ids[#external_ids + 1] = row.external_id
        end
        if row.seq ~= nil then seqs[#seqs + 1] = row.seq end
    end

    local by_id: Stored = {}
    local by_external: Stored = {}
    local by_seq: Stored = {}

    local id_err = each_chunk(ids, function(chunk)
        local found, err = tx:query("SELECT id, seq, subject, subject_version FROM kickside_event WHERE id IN (" .. placeholders(1, #chunk) .. ")", chunk)
        found, err = sql_boundary.rows(found, err, "failed to check duplicate event ids", "duplicate ids", response_error)
        if err then return err end
        for _, r in ipairs(found :: { table }) do
            by_id[tostring(r.id)] = { event_id = tostring(r.id), seq = int_of(r.seq), duplicate = true, subject = r.subject, subject_version = r.subject_version }
        end
        return nil
    end)
    if id_err then return nil, nil, nil, id_err end

    local external_err = each_chunk(external_ids, function(chunk)
        local params: { any } = { thread_id }
        for _, v in ipairs(chunk) do params[#params + 1] = v end
        local found, err = tx:query("SELECT id, seq, subject, subject_version, type, external_source, external_id, external_version FROM kickside_event"
            .. " WHERE thread_id = $1 AND external_id IN (" .. placeholders(2, #chunk) .. ")", params)
        found, err = sql_boundary.rows(found, err, "failed to check duplicate external events", "duplicate external events", response_error)
        if err then return err end
        for _, r in ipairs(found :: { table }) do
            if r.external_source ~= nil then
                local version = r.external_version ~= nil and tostring(r.external_version) or nil
                by_external[external_key(tostring(r.type), tostring(r.external_source), tostring(r.external_id), version)] =
                    { event_id = tostring(r.id), seq = int_of(r.seq), duplicate = true, subject = r.subject, subject_version = r.subject_version }
            end
        end
        return nil
    end)
    if external_err then return nil, nil, nil, external_err end

    local seq_err = each_chunk(seqs, function(chunk)
        local params: { any } = { thread_id }
        for _, v in ipairs(chunk) do params[#params + 1] = v end
        local found, err = tx:query("SELECT id, seq, subject, subject_version FROM kickside_event WHERE thread_id = $1 AND seq IN ("
            .. placeholders(2, #chunk) .. ")", params)
        found, err = sql_boundary.rows(found, err, "failed to check duplicate event sequences", "duplicate sequences", response_error)
        if err then return err end
        for _, r in ipairs(found :: { table }) do
            by_seq[tostring(int_of(r.seq))] = { event_id = tostring(r.id), seq = int_of(r.seq), duplicate = true, subject = r.subject, subject_version = r.subject_version }
        end
        return nil
    end)
    if seq_err then return nil, nil, nil, seq_err end

    return by_id, by_external, by_seq, nil
end

local function insert_rows(tx: sql.Transaction, rows: { table }): error?
    local index = 1
    while index <= #rows do
        local insert = sql.builder.insert("kickside_event"):columns(table.unpack(COLUMNS))
        local last = math.min(index + append.INSERT_CHUNK - 1, #rows)
        for i = index, last do
            local row = rows[i]
            local values: { any } = table.create(#COLUMNS, 0)
            for c, column in ipairs(COLUMNS) do
                local value = row[column]
                if value == nil then value = sql.NULL end
                values[c] = value
            end
            insert = insert:values(table.unpack(values, 1, #COLUMNS))
        end
        local result, err = insert:run_with(tx):exec()
        local _, count_err = sql_boundary.exact_row_count(result, err,
            "failed to insert events", "insert count", last - index + 1, response_error)
        if count_err then return count_err end
        index = index + append.INSERT_CHUNK
    end
    return nil
end

-- append_events_tx appends one thread's batch of writer-shaped events
-- ({ id?, type?, role?, body_json?, seq?, content?, external?, trace_context?,
-- created_at? }). An event carrying an explicit seq keeps it; the rest are
-- sequenced after the thread head. An event matching a stored or earlier batch
-- event by id, external identity or explicit sequence is answered with that
-- event and counted as a duplicate. With opts.defer_wake the caller publishes
-- wake demand itself under the global wake-key order.
function append.append_events_tx(tx: sql.Transaction, thread_id: string, events: { table }, opts: AppendOptions?): (BatchResult?, error?)
    local id = trim(thread_id)
    if id == "" then return nil, invalid("thread_id is required") end
    if type(events) ~= "table" or #events == 0 then return nil, invalid("events array is required") end
    local options = (type(opts) == "table" and opts or {}) :: AppendOptions

    local expect_err = subjects.validate_expect(options.expect)
    if expect_err then return nil, expect_err end

    local dbtype_raw, dbtype_err = tx:db_type()
    if dbtype_err then return nil, errors.wrap(dbtype_err, "failed to resolve the transaction dialect") end
    if type(dbtype_raw) ~= "string" or dbtype_raw == "" then return nil, response_error("dialect") end
    local dbtype = dbtype_raw :: string
    local now = clock.now(dbtype)

    local rows, shape_err = shape(events, dbtype, now)
    if shape_err then return nil, shape_err end
    local candidates = rows :: { table }

    local thread = options.locked_thread
    if thread then
        local same = tostring(thread.id) == id
        if dbtype == sql.type.POSTGRES then same = string.lower(tostring(thread.id)) == string.lower(id) end
        if not same then return nil, errors.new({kind = errors.INTERNAL, retryable = false, message = "locked thread snapshot identity mismatch", details = {code = "append_locked_thread_mismatch"}}) end
    else
        local lock = dbtype == sql.type.SQLITE and "" or " FOR UPDATE"
        local thread_rows, thread_err = tx:query([[SELECT event_count,max_pruned_seq,deleting_at
            FROM kickside_thread WHERE id=$1]] .. lock, { id })
        thread_rows, thread_err = sql_boundary.bounded_rows(thread_rows, thread_err,
            "failed to lock thread", "thread rows", 0, 1, response_error)
        if thread_err then return nil, thread_err end
        thread = (thread_rows :: { table })[1]
    end
    if not thread then
        return nil, (errors.new({ message = "thread not found", kind = errors.NOT_FOUND, retryable = false }) :: error)
    end
    if thread.deleting_at ~= nil then
        return nil, (errors.new({ message = "thread deletion is in progress", kind = errors.CONFLICT,
            retryable = false }) :: error)
    end
    local head = int_of(thread.event_count)
    local max_pruned = int_of(thread.max_pruned_seq)

    local by_id, by_external, by_seq, lookup_err = load_existing(tx, id, candidates)
    if lookup_err then return nil, lookup_err end
    local ids = by_id :: Stored
    local externals = by_external :: Stored
    local seqs = by_seq :: Stored

    if options.expect ~= nil then
        local retry: { Appended } = {}
        for index, row in ipairs(candidates) do
            local ext = row.external_source and row.external_id
                and external_key(row.type, row.external_source, row.external_id, row.external_version) or nil
            local match = (row.id ~= "" and ids[row.id]) or (ext and externals[ext])
            if not match then break end
            if row.subject ~= match.subject then
                return nil, (errors.new({ message = "event subject mismatch", kind = errors.CONFLICT, retryable = false,
                    details = { reason = "event_subject_mismatch", event_id = match.event_id,
                        subject = row.subject, stored_subject = match.subject } }) :: error)
            end
            retry[index] = match :: Appended
        end
        if #retry == #candidates then
            return { thread_id = id, inserted = 0, duplicates = #retry, max_seq = head, events = retry }, nil
        end
        local conflict_err = subjects.check(tx, id, head, options.expect)
        if conflict_err then return nil, conflict_err end
    end

    for index, row in ipairs(candidates) do
        if row.seq ~= nil and (row.seq :: integer) <= max_pruned then
            return nil, (errors.new({
                message = "events[" .. tostring(index) .. "].seq " .. tostring(row.seq) .. " is at or below the prune boundary " .. tostring(max_pruned),
                kind = errors.CONFLICT,
                retryable = false,
                details = { reason = "below_prune_boundary", max_pruned_seq = max_pruned },
            }) :: error)
        end
    end

    local answered: { Appended } = table.create(#candidates, 0)
    local to_insert: { table } = {}
    local next_auto = head
    local max_seq = head
    local duplicates = 0
    local versions: { [string]: integer } = {}
    local last_seqs: { [string]: integer } = {}

    for index, row in ipairs(candidates) do
        local ext = row.external_source and row.external_id
            and external_key(row.type, row.external_source, row.external_id, row.external_version) or nil
        local match: Appended? = nil
        if row.id ~= "" then match = ids[row.id] end
        if not match and ext then match = externals[ext] end
        if not match and row.seq ~= nil then
            if options.expect ~= nil and seqs[tostring(row.seq)] then
                return nil, (errors.new({ message = "explicit sequence already exists", kind = errors.CONFLICT,
                    details = { reason = "seq_collision", seq = row.seq }, retryable = false }) :: error)
            end
            match = seqs[tostring(row.seq)]
        end
        if match then
            duplicates = duplicates + 1
            answered[index] = match
        else
            local seq: integer
            if row.seq == nil then
                next_auto = next_auto + 1
                seq = next_auto
            else
                seq = row.seq :: integer
                if seq > next_auto then next_auto = seq end
            end
            if seqs[tostring(seq)] then
                duplicates = duplicates + 1
                local stored = seqs[tostring(seq)] :: Appended
                answered[index] = { event_id = stored.event_id, seq = stored.seq, duplicate = true, subject = stored.subject, subject_version = stored.subject_version }
            else
                if row.id == "" then row.id = uuid.v7() end
                if row.subject ~= nil then
                    local version = versions[row.subject]
                    if version == nil then
                        local current, version_err = subjects.version(tx, id, row.subject)
                        if version_err then return nil, version_err end
                        version = current :: integer
                    end
                    row.subject_version = version + 1
                    versions[row.subject] = row.subject_version
                    last_seqs[row.subject] = seq
                end
                row.thread_id = id
                row.seq = seq
                to_insert[#to_insert + 1] = row
                local stored: Appended = { event_id = row.id, seq = seq, duplicate = true, subject = row.subject, subject_version = row.subject_version }
                ids[row.id] = stored
                seqs[tostring(seq)] = stored
                if ext then externals[ext] = stored end
                if seq > max_seq then max_seq = seq end
                answered[index] = { event_id = row.id, seq = seq, duplicate = false, subject = row.subject, subject_version = row.subject_version }
            end
        end
    end

    local wake_generation: integer? = nil
    if #to_insert > 0 then
        local policy, policy_err = retention_policy.policy()
        policy, policy_err = error_envelope.binding(policy, policy_err, nil,
            "resolve append row size policy", "thread_append_response")
        if policy_err then return nil, policy_err end
        local cap = (policy :: table).max_row_bytes
        for _, row in ipairs(to_insert) do
            local row_bytes = #row.body + #(row.content_ref or "") + #row.type + #row.role
                + #(row.external_source or "") + #(row.external_id or "")
                + #(row.external_version or "") + #(row.content_type or "") + #(row.subject or "")
            local size_err = row_size.check(id, row_bytes, cap, "append_events")
            if size_err then return nil, size_err end
        end
        local insert_err = insert_rows(tx, to_insert)
        if insert_err then return nil, insert_err end

        for subject, version in pairs(versions) do
            local version_result, version_err = tx:execute([[INSERT INTO kickside_thread_subject(thread_id,subject,version,last_seq,updated_at)
                VALUES($1,$2,$3,$4,$5) ON CONFLICT(thread_id,subject) DO UPDATE
                SET version=excluded.version,last_seq=excluded.last_seq,updated_at=excluded.updated_at]],
                { id, subject, version, last_seqs[subject], now })
            local _, version_count_err = sql_boundary.exact_row_count(version_result, version_err,
                "failed to advance subject version", "subject version count", 1, response_error)
            if version_count_err then return nil, version_count_err end
        end

        local head_result, head_err = tx:execute("UPDATE kickside_thread SET event_count = $1, last_event_ts = $2, updated_at = $2"
            .. " WHERE id = $3 AND event_count < $1", { max_seq, now, id })
        local _, head_count_err = sql_boundary.single_row_count(head_result, head_err,
            "failed to advance thread head", "thread head count", response_error)
        if head_count_err then return nil, head_count_err end

        if not options.defer_wake then
            local woken, wake_err = jobs_wake.wake_tx(tx, "thread:" .. id, dbtype, options.completion_job_id)
            woken, wake_err = error_envelope.binding(woken, wake_err, nil,
                "publish append wake", "thread_append_response")
            if wake_err then return nil, wake_err end
            local generation, generation_err = sql_boundary.number_value((woken :: any).demand_generation,
                "wake generation", 0, true, false, response_error)
            if generation_err then return nil, generation_err end
            wake_generation = generation :: integer
        end
    end

    return {
        thread_id = id,
        inserted = #to_insert,
        duplicates = duplicates,
        max_seq = max_seq,
        events = answered,
        wake_generation = wake_generation,
    }, nil
end

-- append_tx is the public append (CONTRACTS threads.append_tx): events carry
-- event_type, payload, external_identity {source, id, version?} and
-- occurred_at; each is answered with its event id and sequence, a duplicate
-- external identity with the stored event. wake_generation is the demand
-- generation the append published; a batch of only duplicates publishes none.
function append.append_tx(tx: sql.Transaction, request: any): ({ events: { { event_id: string, seq: integer, subject: string?, subject_version: integer? } }, wake_generation: integer? }?, error?)
    local req = type(request) == "table" and request or {}
    if type(req.thread_id) ~= "string" or req.thread_id == "" then return nil, invalid("thread_id is required") end
    if type(req.events) ~= "table" or #(req.events :: { any }) == 0 then return nil, invalid("events array is required") end
    local events: { table } = {}
    for index, raw in ipairs(req.events :: { any }) do
        local label = "events[" .. tostring(index) .. "]"
        if type(raw) ~= "table" then return nil, invalid(label .. " must be an object") end
        if type(raw.event_type) ~= "string" or raw.event_type == "" then return nil, invalid(label .. ".event_type is required") end
        if raw.payload ~= nil and type(raw.payload) ~= "table" then return nil, invalid(label .. ".payload must be an object") end
        local body, encode_err = json.encode(raw.payload or {})
        if encode_err or type(body) ~= "string" then return nil, invalid(label .. ".payload must be JSON serializable") end
        if body == "[]" then body = "{}" end
        local external: table? = nil
        local identity = raw.external_identity
        if identity ~= nil then
            if type(identity) ~= "table" or type(identity.source) ~= "string" or identity.source == ""
                or type(identity.id) ~= "string" or identity.id == ""
                or (identity.version ~= nil and type(identity.version) ~= "string") then
                return nil, invalid(label .. ".external_identity needs a source and id string and an optional version string")
            end
            external = { external_source = identity.source, external_id = identity.id, external_version = identity.version }
        end
        events[index] = { subject = raw.subject, type = raw.event_type, body_json = body, external = external, created_at = raw.occurred_at }
    end
    local result, err = append.append_events_tx(tx, req.thread_id :: string, events, { expect = req.expect })
    if err then return nil, err end
    local answered: { { event_id: string, seq: integer, subject: string?, subject_version: integer? } } = {}
    for index, event in ipairs((result :: BatchResult).events) do
        answered[index] = { event_id = event.event_id, seq = event.seq, subject = event.subject, subject_version = event.subject_version }
    end
    return { events = answered, wake_generation = (result :: BatchResult).wake_generation }, nil
end

return append
