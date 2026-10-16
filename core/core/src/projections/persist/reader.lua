-- Read side of the projection engine. Lists a thread's projections and cursors,
-- loads one projection, and resolves a cursor by id or by its natural address
-- (kind + projection_key + cursor_key). Every call takes the caller's db or tx
-- handle and returns rows as-is; access control and HTTP shaping are the
-- endpoint's job, not this module's. Errors are returned as values.

local sql = require("sql")
local types = require("types")

local reader = {}

-- A pooled connection or open transaction.
type Executor = sql.DB | sql.Transaction

-- A cursor row as resolved by find_cursor (the columns a lifecycle action needs).
type CursorRef = {
    id: string,
    projection_id: string,
    thread_id: string,
    status: string,
    generation: integer,
}

local function trim(value: any): string
    if type(value) ~= "string" then
        return ""
    end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- Resolve the dialect's row-lock clause for a builder :suffix (empty on sqlite).
local function lock_clause(db_or_tx: Executor): (string?, error?)
    local dbtype, err = (db_or_tx :: sql.DB):type()
    if err then
        return nil, (errors.wrap(err, "failed to resolve db type") :: error)
    end
    if dbtype == sql.type.SQLITE then
        return "", nil
    end
    return "FOR UPDATE", nil
end

-- list_projections returns a thread's projection definitions, ordered by
-- (kind, projection_key).
function reader.list_projections(db_or_tx: Executor, thread_id: string, limit: integer?, after: table?): (table[]?, error?, table?)
    local page_limit = limit or 200
    local query = sql.builder.select(
        "id", "thread_id", "kind", "projection_key", "body", "state",
        "last_event_seq", "actor_id",
        "CASE WHEN actor_id IS NOT NULL AND actor_id <> '' AND actor_context IS NOT NULL AND actor_context <> '' THEN 1 ELSE 0 END AS has_execution_identity",
        "created_at", "updated_at"
    )
        :from("kickside_projection")
        :where(sql.builder.eq({ thread_id = thread_id }))
        :order_by("kind ASC")
        :order_by("projection_key ASC")
        :limit(page_limit + 1)
    if after then
        query = query:where("(kind > ? OR (kind = ? AND projection_key > ?))", after.kind, after.kind, after.projection_key)
    end
    local rows, err = query:run_with(db_or_tx):query()
    if err then
        return nil, (errors.wrap(err, "failed to list projections") :: error), nil
    end
    local result = rows or {}
    local more = #result > page_limit
    if more then table.remove(result) end
    local last = result[#result]
    return result, nil, { has_more = more, next_after = more and { kind = last.kind, projection_key = last.projection_key } or nil }
end

-- get_projection loads a single projection by id (scoped to its thread).
function reader.get_projection(db_or_tx: Executor, thread_id: string, projection_id: string): (table?, error?)
    local rows, err = sql.builder.select(
        "id", "thread_id", "kind", "projection_key", "body", "state",
        "last_event_seq", "created_at", "updated_at"
    )
        :from("kickside_projection")
        :where(sql.builder.eq({ id = projection_id, thread_id = thread_id }))
        :limit(1)
        :run_with(db_or_tx)
        :query()
    if err then
        return nil, (errors.wrap(err, "failed to load projection") :: error)
    end
    if not rows or #rows == 0 then
        return nil, (errors.new({ message = "projection not found", kind = errors.NOT_FOUND }) :: error)
    end
    return rows[1], nil
end

-- list_cursors returns a thread's projection cursors joined to their projection's
-- addressing, newest first.
function reader.list_cursors(db_or_tx: Executor, thread_id: string, limit: integer?, after: table?): (table[]?, error?, table?)
    local page_limit = limit or 200
    local query = sql.builder.select(
        "c.id", "c.projection_id", "c.thread_id", "c.cursor_key",
        "c.generation", "c.last_seq", "c.status", "c.last_error",
        "c.debounce_idle_ms", "c.debounce_max_ms", "c.job_id",
        "c.created_at", "c.updated_at",
        "p.kind", "p.projection_key"
    )
        :from("kickside_projection_cursor c")
        :inner_join("kickside_projection p ON p.id = c.projection_id")
        :where("c.thread_id = ?", thread_id)
        :order_by("c.created_at DESC")
        :order_by("c.id DESC")
        :limit(page_limit + 1)
    if after then
        local anchor = "(SELECT created_at FROM kickside_projection_cursor WHERE id = ? AND thread_id = ?)"
        query = query:where("(c.created_at < " .. anchor .. " OR (c.created_at = " .. anchor .. " AND c.id < ?))",
            after.id, thread_id, after.id, thread_id, after.id)
    end
    local rows, err = query:run_with(db_or_tx):query()
    if err then
        return nil, (errors.wrap(err, "failed to list projection cursors") :: error), nil
    end
    local result = rows or {}
    if after and #result == 0 then
        local anchors, anchor_err = sql.builder.select("id"):from("kickside_projection_cursor")
            :where(sql.builder.eq({ id = after.id, thread_id = thread_id }))
            :limit(1):run_with(db_or_tx):query()
        if anchor_err then
            return nil, (errors.wrap(anchor_err, "failed to resolve cursor anchor") :: error), nil
        end
        if not anchors or #anchors == 0 then
            return nil, (errors.new({ message = "cursors_cursor anchor no longer exists", kind = errors.INVALID }) :: error), nil
        end
    end
    local more = #result > page_limit
    if more then table.remove(result) end
    local last = result[#result]
    return result, nil, { has_more = more, next_after = more and { id = last.id } or nil }
end

function reader.find_projection_cursor(db_or_tx: Executor, thread_id: string, params: table): (table?, error?)
    local kind = trim(params.kind)
    if kind == "" then
        return nil, (errors.new({ message = "kind is required", kind = errors.INVALID }) :: error)
    end
    local projection_key, cursor_key = trim(params.projection_key), trim(params.cursor_key)
    if projection_key == "" then projection_key = types.KEY_DEFAULT end
    if cursor_key == "" then cursor_key = types.KEY_DEFAULT end
    local rows, err = sql.builder.select(
        "p.id AS projection_id", "p.body", "p.state", "p.last_event_seq", "p.actor_id",
        "p.created_at AS projection_created_at", "p.updated_at AS projection_updated_at",
        "CASE WHEN p.actor_id IS NOT NULL AND p.actor_id <> '' AND p.actor_context IS NOT NULL AND p.actor_context <> '' THEN 1 ELSE 0 END AS has_execution_identity",
        "c.id AS cursor_id", "c.thread_id", "c.cursor_key", "c.generation", "c.last_seq", "c.status",
        "c.last_error", "c.debounce_idle_ms", "c.debounce_max_ms", "c.job_id", "c.created_at", "c.updated_at",
        "p.kind", "p.projection_key")
        :from("kickside_projection_cursor c")
        :inner_join("kickside_projection p ON p.id = c.projection_id AND p.thread_id = c.thread_id")
        :where("c.thread_id = ?", thread_id)
        :where("p.kind = ?", kind)
        :where("p.projection_key = ?", projection_key)
        :where("c.cursor_key = ?", cursor_key)
        :limit(1):run_with(db_or_tx):query()
    if err then
        return nil, (errors.wrap(err, "failed to load projection cursor") :: error)
    end
    if not rows or not rows[1] then
        return nil, (errors.new({ message = "projection cursor not found", kind = errors.NOT_FOUND }) :: error)
    end
    local row = rows[1]
    return { thread_id = thread_id,
        projection = { id = row.projection_id, thread_id = row.thread_id, kind = row.kind,
            projection_key = row.projection_key, body = row.body, state = row.state,
            last_event_seq = row.last_event_seq, actor_id = row.actor_id,
            has_execution_identity = row.has_execution_identity,
            created_at = row.projection_created_at, updated_at = row.projection_updated_at },
        cursor = { id = row.cursor_id, projection_id = row.projection_id, thread_id = row.thread_id,
            kind = row.kind, projection_key = row.projection_key, cursor_key = row.cursor_key,
            generation = row.generation, last_seq = row.last_seq, status = row.status,
            last_error = row.last_error, debounce_idle_ms = row.debounce_idle_ms,
            debounce_max_ms = row.debounce_max_ms, job_id = row.job_id,
            created_at = row.created_at, updated_at = row.updated_at },
    }, nil
end

function reader.select_projection_cursor(db_or_tx: Executor, thread_id: string, params: table): (table?, error?)
    local projection_query = sql.builder.select("id"):from("kickside_projection")
        :where(sql.builder.eq({ thread_id = thread_id, kind = trim(params.kind) }))
        :order_by("projection_key ASC"):limit(1)
    if type(params.projection_key) == "string" and params.projection_key ~= "" then
        projection_query = projection_query:where("projection_key = ?", trim(params.projection_key))
    end
    local projections, projection_err = projection_query:run_with(db_or_tx):query()
    if projection_err then
        return nil, (errors.wrap(projection_err, "failed to select catch-up projection") :: error)
    end
    local projection = projections and projections[1]
    if not projection then
        return nil, (errors.new({ message = "projection not found", kind = errors.NOT_FOUND }) :: error)
    end
    local cursor_query = sql.builder.select("id", "projection_id", "thread_id", "cursor_key", "status", "last_seq", "job_id")
        :from("kickside_projection_cursor")
        :where(sql.builder.eq({ thread_id = thread_id, projection_id = projection.id }))
        :order_by("created_at DESC"):order_by("id DESC"):limit(1)
    if type(params.cursor_key) == "string" and params.cursor_key ~= "" then
        cursor_query = cursor_query:where("cursor_key = ?", trim(params.cursor_key))
    end
    local cursors, cursor_err = cursor_query:run_with(db_or_tx):query()
    if cursor_err then
        return nil, (errors.wrap(cursor_err, "failed to select catch-up cursor") :: error)
    end
    if not cursors or not cursors[1] then
        return nil, (errors.new({ message = "projection cursor not found", kind = errors.NOT_FOUND }) :: error)
    end
    return cursors[1], nil
end

-- find_cursor resolves one cursor for a thread. With a cursor_id it looks up
-- directly; otherwise it addresses the cursor by kind + projection_key +
-- cursor_key (KEY_DEFAULT filling the omitted keys). It takes a row lock so a
-- lifecycle action can mutate the resolved cursor in the same transaction.
function reader.find_cursor(db_or_tx: Executor, thread_id: string, params: table): (CursorRef?, error?)
    local lock, lock_err = lock_clause(db_or_tx)
    if lock_err then
        return nil, lock_err
    end
    local _lock = lock :: string

    local cursor_id = trim(params.cursor_id)
    if cursor_id ~= "" then
        local query = sql.builder.select("c.id", "c.projection_id", "c.thread_id", "c.status", "c.generation")
            :from("kickside_projection_cursor c")
            :where("c.id = ?", cursor_id)
            :where("c.thread_id = ?", thread_id)
        if _lock ~= "" then
            query = query:suffix(_lock)
        end
        local rows, err = query:run_with(db_or_tx):query()
        if err then
            return nil, (errors.wrap(err, "failed to load cursor") :: error)
        end
        if not rows or #rows == 0 then
            return nil, (errors.new({ message = "cursor not found", kind = errors.NOT_FOUND }) :: error)
        end
        return rows[1] :: CursorRef, nil
    end

    local kind = trim(params.kind)
    if kind == "" then
        return nil, (errors.new({ message = "kind or cursor_id is required", kind = errors.INVALID }) :: error)
    end
    local projection_key = trim(params.projection_key)
    if projection_key == "" then
        projection_key = types.KEY_DEFAULT
    end
    local cursor_key = trim(params.cursor_key)
    if cursor_key == "" then
        cursor_key = types.KEY_DEFAULT
    end

    local query = sql.builder.select("c.id", "c.projection_id", "c.thread_id", "c.status", "c.generation")
        :from("kickside_projection_cursor c")
        :inner_join("kickside_projection p ON p.id = c.projection_id")
        :where("c.thread_id = ?", thread_id)
        :where("p.kind = ?", kind)
        :where("p.projection_key = ?", projection_key)
        :where("c.cursor_key = ?", cursor_key)
    if _lock ~= "" then
        query = query:suffix(_lock)
    end
    local rows, err = query:run_with(db_or_tx):query()
    if err then
        return nil, (errors.wrap(err, "failed to load cursor") :: error)
    end
    if not rows or #rows == 0 then
        return nil, (errors.new({ message = "cursor not found", kind = errors.NOT_FOUND }) :: error)
    end
    return rows[1] :: CursorRef, nil
end

return reader
