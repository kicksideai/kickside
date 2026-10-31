-- Primary-thread projection and event producer helpers.
local base = require("thread_ingest_base")
local THREAD_CLASS = base.THREAD_CLASS
local EXTERNAL_SOURCE = base.EXTERNAL_SOURCE
local GRAPH_EXTERNAL_SOURCE = base.GRAPH_EXTERNAL_SOURCE
local engines = require("engines")
local trim = base.trim
local shallow_copy = base.shallow_copy
local strip_private_upload_locators = base.strip_private_upload_locators
local decode_object = base.decode_object
local execution_scope = base.execution_scope
local current_executor = base.current_executor
local current_component_service = base.current_component_service
local call_threads = base.call_threads
local validate_kb_access = base.validate_kb_access
local current_actor_id = base.current_actor_id
local content_sha = base.content_sha
local source_input = base.source_input
local context_digest = base.context_digest
local natural_external_id_for = base.natural_external_id_for
local external_id_for = base.external_id_for
local external_version_for = base.external_version_for
local trace_for = base.trace_for
local put_str = base.put_str
local origin_type_for = base.origin_type_for
local source_ref_for = base.source_ref_for

local function find_primary_thread(exec: any, kb_id: string): (any?, string?)
    local thread, err = call_threads(exec, "find", { thread_id = kb_id })
    if err then return nil, err end
    if type(thread) ~= "table" then return nil, nil end
    return thread, nil
end

local function number_or_nil(value)
    local n = tonumber(value)
    if not n then return nil end
    return math.floor(n)
end

-- lookup_source_projection reads the declared source projection + its cursor off
-- the KB primary thread. Pure lookup: it addresses the cursor by the declared
-- (kind, projection_key, cursor_key), never registers it. Returns nil when the
-- projection has not been provisioned (KB not yet created through the engine).
local function lookup_source_projection(exec: any, kb_id: string, impl_id: string): (any?, any?)
    local engine, engine_err = engines.by_impl(impl_id)
    if engine_err then return nil, engine_err end
    local declaration, declaration_err = engines.ingest_projection(engine)
    if declaration_err then return nil, declaration_err end
    local pair, err = exec:get_projection_cursor({ thread_id = kb_id,
        kind = declaration.kind, projection_key = declaration.projection_key, cursor_key = declaration.cursor_key })
    if err then
        if errors.is(err, errors.NOT_FOUND) then return nil, nil end
        return nil, err
    end
    if type(pair) ~= "table" or type(pair.projection) ~= "table" or type(pair.cursor) ~= "table"
        or trim(pair.projection.id) == "" or trim(pair.cursor.id) == "" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "knowledge projection lookup returns an incomplete pair" })
    end
    local projection, cursor = pair.projection, pair.cursor
    local projection_id = trim(projection.id)
    local body, body_err = decode_object(projection.body)
    if body_err then return nil, body_err end
    local meta = type(body.meta) == "table" and body.meta or {}
    return {
        thread_id = kb_id,
        projection_id = projection_id,
        cursor_id = trim(cursor.id),
        projection = {
            projection_id = projection_id,
            cursor_id = trim(cursor.id),
            kind = projection.kind,
            projection_key = projection.projection_key,
            cursor_key = cursor.cursor_key,
            worker_ref = trim(meta.worker_ref),
            worker_runtime = trim(meta.worker_runtime),
            worker_input_mode = trim(meta.worker_input_mode),
            status = cursor.status,
            generation = number_or_nil(cursor.generation),
            last_seq = number_or_nil(cursor.last_seq),
            job_id = trim(cursor.job_id),
            debounce_idle_ms = number_or_nil(cursor.debounce_idle_ms),
            debounce_max_ms = number_or_nil(cursor.debounce_max_ms),
            last_error = cursor.last_error,
            actor_id = trim(projection.actor_id),
            created_at = cursor.created_at,
            updated_at = cursor.updated_at,
        },
        existing = true,
    }, nil
end

-- source_projection returns the KB's declared source projection off its primary
-- thread. Provisioning is owned by the KB create path
-- (knowledge_bases.ensure_primary_thread, which applies the engine binding's declared
-- meta.projections through ensure_thread). A miss means the KB was never provisioned,
-- so the producer path surfaces that as an error; it never materializes the thread or
-- projection.
local function source_projection(exec: any, kb_id: string, impl_id: string): (any?, any?)
    local projection, projection_err = lookup_source_projection(exec, kb_id, impl_id)
    if projection_err then return nil, projection_err end
    if not projection then
        return nil, "knowledge base is not provisioned: " .. kb_id
    end
    return projection, nil
end

local function projection_cursor(projection)
    if type(projection) ~= "table" then return nil end
    local p = projection.projection
    if type(p) ~= "table" then return nil end
    local cursor_id = trim(p.cursor_id)
    if cursor_id == "" then return nil end
    return {
        cursor_id = cursor_id,
        projection_id = p.projection_id,
        cursor_key = p.cursor_key,
        worker_ref = p.worker_ref,
        worker_runtime = p.worker_runtime,
        worker_input_mode = p.worker_input_mode,
        status = p.status,
        generation = tonumber(p.generation),
        last_seq = tonumber(p.last_seq),
        job_id = p.job_id,
        debounce_idle_ms = tonumber(p.debounce_idle_ms),
        debounce_max_ms = tonumber(p.debounce_max_ms),
        last_error = p.last_error,
        created_at = p.created_at,
        updated_at = p.updated_at,
    }
end

local function status_result(kb_id, thread_id, thread, projection)
    local cursor = projection_cursor(projection)
    local event_count = type(thread) == "table" and tonumber(thread.event_count) or nil
    local pending_events = nil
    if event_count and cursor and cursor.last_seq then
        pending_events = event_count - cursor.last_seq
        if pending_events < 0 then pending_events = 0 end
    end

    return {
        success = true,
        kb_id = kb_id,
        thread_id = thread_id,
        exists = type(thread) == "table",
        configured = cursor ~= nil,
        status = cursor and cursor.status or (type(thread) == "table" and "unconfigured" or "missing"),
        projection_id = cursor and cursor.projection_id or nil,
        cursor_id = cursor and cursor.cursor_id or nil,
        cursor = cursor,
        backpressure = cursor and {
            pending_events = pending_events,
            debounce_idle_ms = cursor.debounce_idle_ms,
            debounce_max_ms = cursor.debounce_max_ms,
            worker_ref = cursor.worker_ref,
            worker_runtime = cursor.worker_runtime,
            worker_input_mode = cursor.worker_input_mode,
        } or nil,
        event_count = event_count,
        pending_events = pending_events,
    }
end

local function load_status(exec, kb_id, impl_id)
    local thread, thread_err = find_primary_thread(exec, kb_id)
    if thread_err then return nil, thread_err end
    if not thread then
        return status_result(kb_id, kb_id, nil, nil), nil
    end
    local projection, projection_err = lookup_source_projection(exec, kb_id, impl_id)
    if projection_err then return nil, projection_err end
    return status_result(kb_id, kb_id, thread, projection), nil
end

-- ─── event producer ──────────────────────────────────────────────────────

-- emit_event appends a content/graph event to the KB primary thread. It uses the
-- canonical threads.emit (thread_id == component_id), so the declared source /
-- digest / graph_meta projections -- provisioned on this thread at KB create --
-- pick the event up. The producer never registers a projection.
local function emit_event(exec: any, kb_id: string, event: any): (any, string?)
    local args = {
        component_id = kb_id,
        thread_class = THREAD_CLASS,
        type = event.type,
        role = event.role or "system",
        body = event.body,
        external = event.external,
        trace_context = event.trace_context,
    }
    return call_threads(exec, "emit", args)
end


return {
    find_primary_thread = find_primary_thread,
    number_or_nil = number_or_nil,
    lookup_source_projection = lookup_source_projection,
    source_projection = source_projection,
    projection_cursor = projection_cursor,
    status_result = status_result,
    load_status = load_status,
    emit_event = emit_event,
}
