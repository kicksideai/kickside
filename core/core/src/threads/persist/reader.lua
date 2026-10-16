-- Read side of the threads slice. Loads one thread, lists a scope's threads, reads
-- a thread's events / children, and reports its thread classes. Access is the
-- component contract's job: a per-thread read gates on get_access_context, and the
-- list query scopes to the component_ids list_components returns for the actor at
-- the requested mask — there is NO kickside_component_access / kickside_component_group_access SQL
-- join here. Every entry takes the caller's db handle and returns rows as values.

local sql = require("sql")
local json = require("json")
local component = require("threads_component")
local masks = require("core_types")
local subjects = require("subjects")

local reader = {}

local function response_error(field: string): error
    return errors.new({message = "thread read response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "thread_reader_response", field = field}})
end

local function rows_error(rows: any, err: error?, operation: string, field: string): error?
    if err then return errors.wrap(err, operation) end
    if type(rows) ~= "table" then return response_error(field) end
    return nil
end

-- A pooled connection or open transaction.
type Executor = sql.DB | sql.Transaction

local THREAD_COLUMNS = {
    "id", "thread_class", "attrs", "state", "event_count",
    "component_id",
    "last_event_ts", "max_pruned_seq", "created_at", "updated_at",
}

local EVENT_COLUMNS = {
    "id", "thread_id", "type", "role", "body", "token_count", "seq",
    "content_type", "content_mode", "content_ref", "content_hash", "content_bytes",
    "external_source", "external_id", "external_version",
    "trace_id", "run_id", "caused_by_event_id", "correlation_key",
    "created_at", "subject", "subject_version",
}

local function trim(value: any): string
    if type(value) ~= "string" then
        return ""
    end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function attach_trace_context(row: table): table
    local trace_id = trim(row.trace_id)
    local run_id = trim(row.run_id)
    local caused_by_event_id = trim(row.caused_by_event_id)
    local correlation_key = trim(row.correlation_key)
    if trace_id ~= "" then
        local ctx: { [string]: any } = {
            trace_id = trace_id,
            run_id = run_id ~= "" and run_id or trace_id,
        }
        if caused_by_event_id ~= "" then ctx.caused_by_event_id = caused_by_event_id end
        if correlation_key ~= "" then ctx.correlation_key = correlation_key end
        row.trace_context = ctx
    end
    row.trace_id = nil
    row.run_id = nil
    row.caused_by_event_id = nil
    row.correlation_key = nil
    return row
end

local function clamp(value: any, min_value: integer, max_value: integer, fallback: integer): integer
    local n = tonumber(value)
    if not n then
        return fallback
    end
    n = math.floor(n)
    if n < min_value then return min_value end
    if n > max_value then return max_value end
    return n :: integer
end

-- load_thread_row reads a single thread row (no access check). Returns
-- (row, nil), (nil, nil) when absent, or (nil, error) on a db failure.
local function load_thread_row(db_or_tx: Executor, thread_id: string): (table?, error?)
    local rows, err = sql.builder.select(table.unpack(THREAD_COLUMNS))
        :from("kickside_thread")
        :where(sql.builder.eq({ id = thread_id }))
        :limit(1)
        :run_with(db_or_tx)
        :query()
    local read_err = rows_error(rows, err, "failed to load thread", "thread.rows")
    if read_err then return nil, read_err end
    if #rows == 0 then
        return nil, nil
    end
    return rows[1], nil
end

local function authorize_thread(thread: table, required_mask: integer): (table?, error?)
    local component_id = trim(thread.component_id)
    if component_id == "" then
        return nil, (errors.new({ message = "thread has no component", kind = errors.NOT_FOUND }) :: error)
    end
    local allowed, access_err = component.has_access(component_id, required_mask)
    if access_err then
        return nil, access_err
    end
    if not allowed then
        return nil, (errors.new({ message = "access denied", kind = errors.PERMISSION_DENIED }) :: error)
    end
    return thread, nil
end

-- gate_read resolves a thread's component_id and checks the actor's READ access
-- through the component contract. Returns the thread row on success, a NOT_FOUND
-- when the thread or its access is missing, or a PERMISSION_DENIED otherwise.
local function gate_read(db_or_tx: Executor, thread_id: string, required_mask: integer): (table?, error?, boolean)
    local thread, load_err = load_thread_row(db_or_tx, thread_id)
    if load_err then
        return nil, load_err, false
    end
    if not thread then
        return nil, (errors.new({ message = "thread not found", kind = errors.NOT_FOUND }) :: error), false
    end
    local authorized, access_err = authorize_thread(thread, required_mask)
    return authorized, access_err, true
end

reader.gate_read = gate_read

-- prune_boundary returns a thread's class and highest pruned sequence without an
-- access check; the contract authorizes the caller against the class. A missing
-- thread is a NOT_FOUND.
function reader.prune_boundary(db_or_tx: Executor, thread_id: string): (table?, error?)
    local id = trim(thread_id)
    if id == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local rows, err = sql.builder.select("thread_class", "max_pruned_seq")
        :from("kickside_thread")
        :where(sql.builder.eq({ id = id }))
        :limit(1)
        :run_with(db_or_tx)
        :query()
    local read_err = rows_error(rows, err, "failed to read the prune boundary", "prune.rows")
    if read_err then return nil, read_err end
    local row = (rows :: { table })[1]
    if not row then
        return nil, (errors.new({ message = "thread not found", kind = errors.NOT_FOUND }) :: error)
    end
    return { thread_id = id, thread_class = trim(row.thread_class),
        max_pruned_seq = math.floor(tonumber(row.max_pruned_seq) or 0) }, nil
end

-- get_component_id returns the component_id for a thread, or nil when the
-- thread is absent or has an empty component_id. Returns (nil, error) on a
-- db failure.
function reader.get_component_id(db_or_tx: Executor, thread_id: string): (string?, error?)
    local rows, err = sql.builder.select("component_id")
        :from("kickside_thread")
        :where(sql.builder.eq({ id = thread_id }))
        :limit(1)
        :run_with(db_or_tx)
        :query()
    local read_err = rows_error(rows, err, "failed to load thread", "component.rows")
    if read_err then return nil, read_err end
    if #rows == 0 then
        return nil, nil
    end
    local component_id = rows[1].component_id
    if type(component_id) ~= "string" or component_id == "" then
        return nil, nil
    end
    return component_id :: string, nil
end

local function hydrate_thread(thread: table): error?
    if type(thread.attrs) == "string" then
        local decoded, err = json.decode(thread.attrs :: string)
        if err then return errors.wrap(err, "failed to decode thread attrs") end
        if type(decoded) ~= "table" then return response_error("attrs") end
        thread.attrs = decoded
    end
    return nil
end

function reader.get_loaded(row: table): (table?, error?)
    local thread: table = {}
    for _, column in ipairs(THREAD_COLUMNS) do thread[column] = row[column] end
    local authorized, access_err = authorize_thread(thread, (masks.ACCESS.READ :: integer))
    if access_err or not authorized then return nil, access_err end
    local attrs_err = hydrate_thread(authorized)
    if attrs_err then return nil, attrs_err end
    return authorized, nil
end

-- get returns one thread the actor can READ, or a typed error. attrs is stored as a
-- JSON string; a single-thread read hydrates it into a table so callers consume
-- structured attrs directly (list stays raw -- its rows are a bulk projection).
function reader.get(db_or_tx: Executor, thread_id: string, subject: any?): (table?, error?, boolean)
    local id = trim(thread_id)
    if id == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error), false
    end
    local thread, gate_err, thread_exists = gate_read(db_or_tx, id, (masks.ACCESS.READ :: integer))
    if gate_err or not thread then
        return thread, gate_err, thread_exists
    end
    if subject ~= nil then
        local shape_err = subjects.validate_subject(subject)
        if shape_err then return nil, shape_err, true end
        local version, version_err = subjects.version(db_or_tx, id, subject :: string)
        if version_err then return nil, version_err, true end
        thread.subject = subject
        thread.subject_version = version
    end
    local attrs_err = hydrate_thread(thread)
    if attrs_err then return nil, attrs_err, true end
    return thread, nil, true
end

-- list returns the threads the actor can access at READ, optionally filtered by
-- thread_class. Access scoping is delegated to the component contract: it returns
-- the component_ids the actor may see, and this query loads only the matching
-- kickside_thread rows. An actor with no accessible threads yields {}.
function reader.list(db_or_tx: Executor, options: table?): (table[]?, error?)
    local opts = type(options) == "table" and options or {}
    local thread_class = trim(opts.thread_class)
    local limit = clamp(opts.limit, 1, 1000, 100)

    local meta_filters: { [string]: any }? = nil
    if thread_class ~= "" then
        meta_filters = { thread_class = thread_class }
    end

    local component_ids, list_err, component_display = component.list_thread_components(meta_filters, (masks.ACCESS.READ :: integer), limit)
    if list_err then
        return nil, list_err
    end
    if type(component_ids) ~= "table" then return nil, response_error("component.ids") end
    if #component_ids == 0 then
        return {}, nil
    end

    local marks: { string } = {}
    for i = 1, #component_ids do marks[i] = "?" end
    local placeholders = table.concat(marks, ", ")
    local query = sql.builder.select(table.unpack(THREAD_COLUMNS))
        :from("kickside_thread")
        :where(sql.builder.expr("component_id IN (" .. placeholders .. ")", table.unpack(component_ids)))
    if thread_class ~= "" then
        query = query:where(sql.builder.eq({ thread_class = thread_class }))
    end
    local rows, err = query
        :order_by("last_event_ts DESC")
        :order_by("created_at DESC")
        :limit(limit)
        :run_with(db_or_tx)
        :query()
    local read_err = rows_error(rows, err, "failed to list threads", "list.rows")
    if read_err then return nil, read_err end
    -- A thread row carries no title/icon of its own; both live on its component's
    -- public meta. Surface them so a listing labels a thread by its human name.
    local list = rows
    if component_display then
        for _, row in ipairs(list) do
            local disp = component_display[row.component_id]
            if disp then
                row.component_title = disp.title
                row.component_icon = disp.icon
            end
        end
    end
    return list, nil
end

-- list_classes returns the distinct thread_class values across all threads. This
-- reports the vocabulary in use, not an access-scoped set, so it does not filter by
-- component access.
function reader.list_classes(db_or_tx: Executor, options: table?): (string[]?, error?, string?)
    local opts = type(options) == "table" and options or {}
    local limit = clamp(opts.limit, 1, 1000, 100)
    local query = sql.builder.select("DISTINCT thread_class")
        :from("kickside_thread")
    if opts.cursor ~= nil then query = query:where("thread_class > ?", opts.cursor) end
    local rows, err = query
        :order_by("thread_class ASC")
        :limit(limit + 1)
        :run_with(db_or_tx)
        :query()
    local read_err = rows_error(rows, err, "failed to list thread classes", "classes.rows")
    if read_err then return nil, read_err end
    local classes: string[] = {}
    for _, row in ipairs(rows) do
        if #classes == limit then return classes, nil, classes[#classes] end
        if type(row.thread_class) == "string" then
            classes[#classes + 1] = row.thread_class
        end
    end
    return classes, nil
end

-- One page of a thread's event log.
type EventPage = {
    events: { table },
    max_pruned_seq: integer,
    next_seq: integer,
    source_gap: { max_pruned_seq: integer, earliest_seq: integer }?,
}

local function int_of(value: any): integer
    return math.floor(tonumber(value) or 0) :: integer
end

-- list_events returns one page of a thread's events after a READ access check,
-- applying the seq window, type filter, and ordering. window is a loose options
-- table (the fields below, each optional) coerced internally: before/from_seq/to_seq
-- are mutually compatible — a range wins, then from, then to, then before, else
-- newest; limit/ascending/event_type tune the result.
--
-- The page carries the thread's prune boundary. A from_seq at or below a
-- positive max_pruned_seq names pruned events: the page is empty and reports
-- source_gap with the earliest available sequence, max_pruned_seq + 1. The
-- boundary is read after the events, so an event prune that races the read
-- surfaces as a gap and never as a silently shortened page. next_seq is the
-- position after the last returned event for a from_seq read, and the position
-- after the thread head otherwise.
function reader.list_events(db_or_tx: Executor, thread_id: string, window: table?): (EventPage?, error?)
    local id = trim(thread_id)
    if id == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local _, gate_err = gate_read(db_or_tx, id, (masks.ACCESS.READ :: integer))
    if gate_err then
        return nil, gate_err
    end

    local opts = type(window) == "table" and window or {}
    local before = tonumber(opts.before)
    local from_seq = tonumber(opts.from_seq)
    local to_seq = tonumber(opts.to_seq)
    local limit = clamp(opts.limit, 1, 1000, 200)
    local ascending = opts.ascending == true
    local event_type = trim(opts.event_type)

    local rows: { table } = {}
    if not (from_seq and to_seq and math.floor(to_seq) < math.floor(from_seq)) then
        local query = sql.builder.select(table.unpack(EVENT_COLUMNS))
            :from("kickside_event")
            :where(sql.builder.eq({ thread_id = id }))
        if event_type ~= "" then
            query = query:where(sql.builder.eq({ type = event_type }))
        end
        if from_seq and to_seq then
            query = query:where("seq >= ?", math.floor(from_seq)):where("seq <= ?", math.floor(to_seq))
        elseif from_seq then
            query = query:where("seq >= ?", math.floor(from_seq))
        elseif to_seq then
            query = query:where("seq <= ?", math.floor(to_seq))
        elseif before then
            query = query:where("seq < ?", math.floor(before))
        end
        query = query:order_by(ascending and "seq ASC" or "seq DESC"):limit(limit)
        local found, err = query:run_with(db_or_tx):query()
        local read_err = rows_error(found, err, "failed to list events", "events.rows")
        if read_err then return nil, read_err end
        rows = found :: { table }
    end

    local bound_rows, bound_err = sql.builder.select("max_pruned_seq", "event_count")
        :from("kickside_thread")
        :where(sql.builder.eq({ id = id }))
        :run_with(db_or_tx):query()
    local read_err = rows_error(bound_rows, bound_err, "failed to read the prune boundary", "prune.rows")
    if read_err then return nil, read_err end
    local bound = (bound_rows :: { table })[1]
    if not bound then
        return nil, (errors.new({ message = "thread not found", kind = errors.NOT_FOUND }) :: error)
    end
    local max_pruned = int_of(bound.max_pruned_seq)

    if from_seq then
        local from = math.floor(from_seq) :: integer
        if max_pruned > 0 and from <= max_pruned then
            return {
                events = {},
                max_pruned_seq = max_pruned,
                next_seq = from,
                source_gap = { max_pruned_seq = max_pruned, earliest_seq = max_pruned + 1 },
            }, nil
        end
    end

    local next_seq: integer
    if from_seq and ascending then
        next_seq = #rows > 0 and int_of(rows[#rows].seq) + 1 or math.floor(from_seq) :: integer
    else
        next_seq = int_of(bound.event_count) + 1
    end
    for _, row in ipairs(rows) do
        attach_trace_context(row)
    end
    return { events = rows, max_pruned_seq = max_pruned, next_seq = next_seq }, nil
end

-- Resolve the exact durable idempotency identity used by the event writer.
-- A missing version matches only an unversioned event.
function reader.find_event_by_external(
    db_or_tx: Executor,
    thread_id: string,
    event_type: string,
    external_source: string,
    external_id: string,
    external_version: string?
): (table?, error?)
    local id = trim(thread_id)
    local kind = trim(event_type)
    local source = trim(external_source)
    local external_key = trim(external_id)
    if id == "" or kind == "" or source == "" or external_key == "" then
        return nil, (errors.new({ message = "thread_id, event_type, external_source, and external_id are required", kind = errors.INVALID }) :: error)
    end
    local _, gate_err = gate_read(db_or_tx, id, (masks.ACCESS.READ :: integer))
    if gate_err then return nil, gate_err end

    local query = sql.builder.select(table.unpack(EVENT_COLUMNS))
        :from("kickside_event")
        :where(sql.builder.eq({
            thread_id = id,
            type = kind,
            external_source = source,
            external_id = external_key,
        }))
    if external_version ~= nil then
        query = query:where(sql.builder.eq({ external_version = external_version }))
    else
        query = query:where(sql.builder.expr("external_version IS NULL"))
    end
    local rows, query_err = query:limit(1):run_with(db_or_tx):query()
    local read_err = rows_error(rows, query_err, "failed to find external event", "external.rows")
    if read_err then return nil, read_err end
    local event = rows[1]
    if event then attach_trace_context(event :: table) end
    return event, nil
end

-- list_children returns the threads parented to thread_id via an active parent
-- edge, after a READ access check on the parent. Child rows are returned as-is;
-- the caller filters further if needed.
function reader.list_children(db_or_tx: Executor, thread_id: string, limit: integer?): (table[]?, error?)
    local id = trim(thread_id)
    if id == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local _, gate_err = gate_read(db_or_tx, id, (masks.ACCESS.READ :: integer))
    if gate_err then
        return nil, gate_err
    end

    local dbtype, type_err = (db_or_tx :: sql.DB):type()
    if type_err then return nil, errors.wrap(type_err, "failed to resolve db type") end
    if type(dbtype) ~= "string" or dbtype == "" then return nil, response_error("database.type") end
    local active = dbtype == sql.type.SQLITE and "e.active = 1" or "e.active = TRUE"

    local rows, err = sql.builder.select(
        "t.id", "t.thread_class", "t.attrs", "t.state", "t.event_count",
        "t.component_id",
        "t.last_event_ts", "t.created_at", "t.updated_at"
    )
        :from("kickside_thread t")
        :inner_join("kickside_thread_edge e ON e.from_thread_id = t.id AND e.edge_type = 'parent' AND " .. active)
        :where("e.to_thread_id = ?", id)
        :order_by("t.created_at DESC")
        :limit(clamp(limit, 1, 1000, 200))
        :run_with(db_or_tx)
        :query()
    local read_err = rows_error(rows, err, "failed to list children", "children.rows")
    if read_err then return nil, read_err end
    return rows, nil
end

-- list_edges returns the active graph edges touching a thread (either endpoint),
-- after a READ access check. Used by the graph endpoint.
function reader.list_edges(db_or_tx: Executor, thread_id: string, limit: integer?): (table[]?, error?)
    local id = trim(thread_id)
    if id == "" then
        return nil, (errors.new({ message = "thread_id is required", kind = errors.INVALID }) :: error)
    end
    local _, gate_err = gate_read(db_or_tx, id, (masks.ACCESS.READ :: integer))
    if gate_err then
        return nil, gate_err
    end

    local dbtype, type_err = (db_or_tx :: sql.DB):type()
    if type_err then return nil, errors.wrap(type_err, "failed to resolve db type") end
    if type(dbtype) ~= "string" or dbtype == "" then return nil, response_error("database.type") end
    local active = dbtype == sql.type.SQLITE and "active = 1" or "active = TRUE"

    local rows, err = sql.builder.select(
        "id", "from_thread_id", "to_thread_id", "edge_type", "attrs",
        "source_event_id", "active", "created_at", "updated_at"
    )
        :from("kickside_thread_edge")
        :where("(from_thread_id = ? OR to_thread_id = ?)", id, id)
        :where(sql.builder.expr(active))
        :order_by("updated_at DESC")
        :limit(clamp(limit, 1, 1000, 200))
        :run_with(db_or_tx)
        :query()
    local read_err = rows_error(rows, err, "failed to list thread edges", "edges.rows")
    if read_err then return nil, read_err end
    return rows, nil
end

return reader
