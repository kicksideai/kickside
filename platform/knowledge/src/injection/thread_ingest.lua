-- Canonical KB injection thread API.
local base = require("thread_ingest_base")
local util = require("util")
local status = require("thread_ingest_status")
local uuid = require("uuid")
local json = require("json")
local component = require("component")
local security = require("security")
local contract = require("contract")
local M = {
    EVENT_CONTENT_UPSERTED = base.EVENT_CONTENT_UPSERTED,
    EVENT_CONTENT_DELETED = base.EVENT_CONTENT_DELETED,
    EVENT_DELIVERY_CLAIMED = base.EVENT_DELIVERY_CLAIMED,
    EVENT_GRAPH_CHANGED = base.EVENT_GRAPH_CHANGED,
}
local THREAD_CLASS = base.THREAD_CLASS
local KB_STORE_CONTRACT = base.KB_STORE_CONTRACT
local EXTERNAL_SOURCE = base.EXTERNAL_SOURCE
local GRAPH_EXTERNAL_SOURCE = base.GRAPH_EXTERNAL_SOURCE
local SOURCE_PROJECTION_KIND = base.SOURCE_PROJECTION_KIND
local SOURCE_PROJECTION_KEY = base.SOURCE_PROJECTION_KEY
local SOURCE_CURSOR_KEY = base.SOURCE_CURSOR_KEY
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
local find_primary_thread = status.find_primary_thread
local number_or_nil = status.number_or_nil
local lookup_source_projection = status.lookup_source_projection
local source_projection = status.source_projection
local projection_cursor = status.projection_cursor
local status_result = status.status_result
local load_status = status.load_status
local emit_event = status.emit_event
-- Leave room below Core's 4 MiB row bound for metadata and row identities.
local INLINE_CONTENT_BUDGET = 3 * 1024 * 1024

function M.request_digest(kb_id: string): (any?, any?)
    local access_err = validate_kb_access(kb_id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end
    local exec, exec_err = current_executor()
    if exec_err or not exec then return nil, exec_err end
    return emit_event(exec, kb_id, {
        type = "kickside.knowledge.events:digest.requested",
        body = { kb_id = kb_id, user_id = current_actor_id(), reason = "config_changed" },
    })
end

-- The claim is keyed only by the delivery key, so it also catches attempts to
-- reuse one key for a different external_id on the same KB. The content event
-- remains keyed by document identity for reconciliation. A claim without a
-- content event is safe to resume with the same immutable payload.
function M.claim_delivery(kb_id: string, delivery_key: string, content: string, sink_write: any): (boolean, any?)
    local access_err = validate_kb_access(kb_id, component.ACCESS.WRITE)
    if access_err then return false, access_err end
    local exec, exec_err = current_executor()
    if exec_err or not exec then return false, exec_err end
    local external_id = "delivery:" .. delivery_key
    local query = { thread_id = kb_id, event_type = M.EVENT_DELIVERY_CLAIMED,
        external_source = EXTERNAL_SOURCE, external_id = external_id, external_version = "1" }
    local function existing_claim(): (any?, any?)
        local found, err = exec:find_event_by_external(query)
        if err then return nil, err end
        return type(found) == "table" and found.event or nil, nil
    end
    local function matches(event: any): (boolean?, any?)
        local body, decode_err = decode_object(event.body or event.body_json)
        if decode_err then return nil, decode_err end
        return body.content == content and util.same_value(body.sink_write, sink_write)
    end
    local previous, lookup_err = existing_claim()
    if lookup_err then return false, lookup_err end
    if previous then
        local same, match_err = matches(previous)
        if match_err then return false, match_err end
        if same then return true, nil end
        return false, errors.new({ message = "idempotency key already used for a different write",
            kind = errors.CONFLICT, retryable = false })
    end
    local _, append_err = emit_event(exec, kb_id, {
        type = M.EVENT_DELIVERY_CLAIMED, role = "system",
        body = { kb_id = kb_id, content = content, sink_write = sink_write },
        external = { external_source = EXTERNAL_SOURCE, external_id = external_id, external_version = "1" },
    })
    if append_err then return false, append_err end
    local claimed, claim_err = existing_claim()
    if claim_err then return false, claim_err end
    if claimed then
        local same, match_err = matches(claimed)
        if match_err then return false, match_err end
        if same then return true, nil end
    end
    return false, errors.new({ message = "idempotency key already used for a different write",
        kind = errors.CONFLICT, retryable = false })
end

-- A writable delivery key names one immutable request, independently of the
-- external_id that names the document across legitimate refreshes.
function M.check_delivery(kb_id: string, external_id: string, delivery_key: string, content: string, sink_write: any): (boolean, any?)
    local exec, exec_err = current_executor()
    if exec_err or not exec then return false, exec_err end
    local found, find_err = exec:find_event_by_external({
        thread_id = kb_id, event_type = M.EVENT_CONTENT_UPSERTED,
        external_source = EXTERNAL_SOURCE, external_id = external_id,
        external_version = "delivery:" .. delivery_key,
    })
    if find_err then return false, find_err end
    local event = type(found) == "table" and found.event or nil
    if not event then return false, nil end
    local body, body_err = decode_object(event.body or event.body_json)
    if body_err then return false, body_err end
    local metadata, metadata_err = decode_object(body.metadata == nil and {} or body.metadata)
    if metadata_err then return false, metadata_err end
    if body.content ~= content or not util.same_value(metadata.sink_write, sink_write) then
        return false, errors.new({ message = "idempotency key already used for a different write", kind = errors.CONFLICT, retryable = false })
    end
    return true, nil
end

-- ─── public API ──────────────────────────────────────────────────────────

function M.thread_id_for(kb_id)
    kb_id = trim(kb_id)
    if kb_id == "" then return nil, "kb_id is required" end
    -- The KB primary thread is addressed by the component id itself.
    return kb_id, nil
end

function M.status(kb_id, opts)
    kb_id = trim(kb_id)
    if kb_id == "" then return nil, "kb_id is required" end
    local access_err = validate_kb_access(kb_id, component.ACCESS.READ)
    if access_err then return nil, access_err end
    local exec, exec_err = current_executor()
    if exec_err or not exec then return nil, exec_err end
    return load_status(exec, kb_id)
end

function M.pause(kb_id, opts)
    kb_id = trim(kb_id)
    if kb_id == "" then return nil, "kb_id is required" end
    local access_err = validate_kb_access(kb_id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end

    local exec, exec_err = current_executor()
    if exec_err or not exec then return nil, exec_err end
    local injection_status, status_err = load_status(exec, kb_id)
    if status_err then return nil, status_err end
    if not injection_status or not injection_status.cursor_id then
        return nil, "knowledge injection cursor is not configured"
    end

    local _, pause_err = call_threads(exec, "pause_projection", {
        thread_id = kb_id,
        cursor_id = injection_status.cursor_id,
    })
    if pause_err then return nil, pause_err end
    return load_status(exec, kb_id)
end

function M.resume(kb_id, opts)
    kb_id = trim(kb_id)
    if kb_id == "" then return nil, "kb_id is required" end
    local access_err = validate_kb_access(kb_id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end

    local exec, exec_err = current_executor()
    if exec_err or not exec then return nil, exec_err end
    local injection_status, status_err = load_status(exec, kb_id)
    if status_err then return nil, status_err end
    if not injection_status or not injection_status.cursor_id then
        return nil, "knowledge injection cursor is not configured"
    end

    local _, resume_err = call_threads(exec, "resume_projection", {
        thread_id = kb_id,
        cursor_id = injection_status.cursor_id,
    })
    if resume_err then return nil, resume_err end
    return load_status(exec, kb_id)
end

-- configure updates the KB's per-KB materialization config, which lives on the KB
-- STORE row and is read by the source worker at runtime (materialization_options).
-- Projection cursors are declared, not tuned here.
function M.configure(kb_id, opts)
    kb_id = trim(kb_id)
    if kb_id == "" then return nil, "kb_id is required" end
    opts = type(opts) == "table" and opts or {}
    local access_err = validate_kb_access(kb_id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end

    local config = type(opts.config) == "table" and opts.config or nil
    if config then
        local actor = security.actor()
        local scope = security.scope()
        if not actor or not scope then return nil, "security actor and scope are required" end
        local svc, get_err = contract.get(KB_STORE_CONTRACT)
        if get_err or not svc then return nil, "kb_store unavailable: " .. tostring(get_err) end
        local store, open_err = (svc :: any):with_actor(actor):with_scope(scope):open()
        if open_err or not store then return nil, "kb_store open failed: " .. tostring(open_err) end
        local _, update_err = store:update_config({ component_id = kb_id, config = config })
        if update_err then return nil, "update_config: " .. tostring(update_err) end
    end

    local exec, exec_err = current_executor()
    if exec_err or not exec then return nil, exec_err end
    return load_status(exec, kb_id)
end

-- Component lifecycle cleanup is already authorized by its owner. It uses the
-- trusted Core purge contract, including when the component is fenced.
function M.purge_thread(kb_id)
    kb_id = trim(kb_id)
    if kb_id == "" then return nil, "kb_id is required" end
    local exec, exec_err = current_executor()
    if exec_err or not exec then return nil, exec_err end
    return call_threads(exec, "purge", { component_id = kb_id })
end

-- delete_thread purges the KB primary thread + its projection cascade. Idempotent;
-- a KB whose thread was never materialized is a no-op.
function M.delete_thread(kb_id)
    kb_id = trim(kb_id)
    if kb_id == "" then return nil, "kb_id is required" end
    local access_err = validate_kb_access(kb_id, component.ACCESS.DELETE)
    if access_err then return nil, access_err end

    local exec, exec_err = current_executor()
    if exec_err or not exec then return nil, exec_err end
    local thread, find_err = find_primary_thread(exec, kb_id)
    if find_err then return nil, find_err end
    if not thread then
        return { success = true, kb_id = kb_id, thread_id = kb_id, exists = false, deleted = false }, nil
    end

    local _, purge_err = M.purge_thread(kb_id)
    if purge_err then return nil, purge_err end
    return { success = true, kb_id = kb_id, thread_id = kb_id, exists = true, deleted = true }, nil
end

function M.control(args)
    args = type(args) == "table" and args or {}
    local action = trim(args.action)
    if action == "" then action = "status" end

    local result, err
    if action == "status" then
        result, err = M.status(args.kb_id or args.id, args)
    elseif action == "pause" then
        result, err = M.pause(args.kb_id or args.id, args)
    elseif action == "resume" then
        result, err = M.resume(args.kb_id or args.id, args)
    elseif action == "configure" then
        result, err = M.configure(args.kb_id or args.id, args)
    elseif action == "delete" or action == "delete_thread" or action == "cleanup" then
        result, err = M.delete_thread(args.kb_id or args.id, args)
    else
        err = "unsupported ingest control action: " .. action
    end

    if err then
        return {
            success = false,
            action = action,
            kb_id = args.kb_id or args.id,
            error = tostring(err),
            kind = type(err) == "userdata" and err:kind() or nil,
            retryable = type(err) == "userdata" and err:retryable() or nil,
            details = type(err) == "userdata" and err:details() or nil,
        }, nil
    end
    if type(result) == "table" then
        result.action = action
    end
    return result, nil
end

function M.append_content(kb_id, params)
    kb_id = trim(kb_id)
    if kb_id == "" then return nil, "kb_id is required" end
    params = type(params) == "table" and params or {}

    local content = params.content
    if type(content) ~= "string" or content == "" then
        return nil, "content is required"
    end

    local metadata = shallow_copy(params.metadata)
    strip_private_upload_locators(metadata)
    metadata.kb_id = kb_id
    metadata.source = trim(metadata.source) ~= "" and metadata.source or "manual"

    local access_err = validate_kb_access(kb_id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end

    local external_id = external_id_for(params, metadata)
    local external_version = external_version_for(params, metadata, content)
    metadata.external_source = EXTERNAL_SOURCE
    metadata.external_id = external_id
    metadata.external_version = external_version
    metadata.content_hash = trim(metadata.content_hash) ~= "" and metadata.content_hash or external_version
    local event_trace, trace_err = trace_for("kb.ingest", kb_id, external_id, params.trace_context)
    if trace_err then return nil, trace_err end

    local actor_id = current_actor_id()
    if actor_id then
        metadata.actor_id = metadata.actor_id or actor_id
    end

    local exec, exec_err = current_executor()
    if exec_err or not exec then return nil, exec_err end
    local projection, projection_err = source_projection(exec, kb_id)
    if projection_err then return nil, projection_err end

    local title = trim(params.title)
    if title == "" then title = trim(metadata.title or metadata.filename or metadata.source_url) end
    local content_type = trim(params.content_type)
    if content_type == "" then content_type = "text/plain" end
    local source_ref, source_ref_err = source_ref_for(params, metadata, content_type, title, external_id, external_version)
    if source_ref_err or not source_ref then return nil, source_ref_err end
    metadata.source_ref = source_ref

    local body = {
        kb_id = kb_id,
        content = content,
        content_type = content_type,
        title = title ~= "" and title or nil,
        metadata = metadata,
        source_ref = source_ref,
        actor_id = actor_id,
    }
    -- JSON can expand one input byte to six bytes. Small inputs need no
    -- additional serialization or artifact checks to establish that they fit.
    if #content * 6 + 2 > INLINE_CONTENT_BUDGET
        and trim(source_ref.upload_id) ~= "" and trim(source_ref.artifact_id) ~= "" then
        local omitted = #content > INLINE_CONTENT_BUDGET
        if not omitted then
            local encoded, encode_err = json.encode(content)
            if encode_err then return nil, encode_err end
            omitted = #encoded > INLINE_CONTENT_BUDGET
        end
        if omitted then
            body.content = nil
            body.content_omitted = true
            body.content_bytes = #content
        end
    end
    local appended, append_err = emit_event(exec, kb_id, {
        type = M.EVENT_CONTENT_UPSERTED,
        role = "system",
        body = body,
        external = {
            external_source = EXTERNAL_SOURCE,
            external_id = external_id,
            external_version = external_version,
        },
        trace_context = event_trace,
    })
    if append_err then return nil, append_err end

    local cursor = projection_cursor(projection)
    return {
        success = true,
        status = "queued",
        kb_id = kb_id,
        thread_id = kb_id,
        projection_id = projection and projection.projection_id,
        cursor_id = cursor and cursor.cursor_id,
        external_source = EXTERNAL_SOURCE,
        external_id = external_id,
        external_version = external_version,
        source_ref = source_ref,
        trace_context = event_trace,
        append = appended,
    }, nil
end

function M.delete_content(kb_id, params)
    kb_id = trim(kb_id)
    if kb_id == "" then return nil, "kb_id is required" end
    params = type(params) == "table" and params or {}

    local metadata = shallow_copy(params.metadata)
    strip_private_upload_locators(metadata)
    metadata.kb_id = kb_id
    metadata.source = trim(metadata.source) ~= "" and metadata.source or "manual"

    local access_err = validate_kb_access(kb_id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end

    local external_id = natural_external_id_for(params, metadata)
    if not external_id or external_id == "" then
        return nil, "external_id, upload_id, source_url, or reference source_ref is required for delete"
    end
    metadata.external_source = EXTERNAL_SOURCE
    metadata.external_id = external_id
    local event_trace, trace_err = trace_for("kb.delete", kb_id, external_id, params.trace_context)
    if trace_err then return nil, trace_err end
    local actor_id = current_actor_id()
    if actor_id then
        metadata.actor_id = metadata.actor_id or actor_id
    end
    local source = source_input(params, metadata)
    local external_version = trim(params.external_version)
    if external_version == "" then external_version = trim(metadata.external_version) end
    if external_version == "" then external_version = trim(source.external_version) end
    if external_version == "" then external_version = "delete:" .. uuid.v7() end
    local source_ref, source_ref_err = source_ref_for(params, metadata, nil, nil, external_id, external_version)
    if source_ref_err or not source_ref then return nil, source_ref_err end
    metadata.source_ref = source_ref

    local exec, exec_err = current_executor()
    if exec_err or not exec then return nil, exec_err end
    local projection, projection_err = source_projection(exec, kb_id)
    if projection_err then return nil, projection_err end

    local appended, append_err = emit_event(exec, kb_id, {
        type = M.EVENT_CONTENT_DELETED,
        role = "system",
        body = {
            kb_id = kb_id,
            metadata = metadata,
            source_ref = source_ref,
            actor_id = actor_id,
        },
        external = {
            external_source = EXTERNAL_SOURCE,
            external_id = external_id,
            external_version = external_version,
        },
        trace_context = event_trace,
    })
    if append_err then return nil, append_err end

    local cursor = projection_cursor(projection)
    return {
        success = true,
        status = "queued",
        kb_id = kb_id,
        thread_id = kb_id,
        projection_id = projection and projection.projection_id,
        cursor_id = cursor and cursor.cursor_id,
        external_source = EXTERNAL_SOURCE,
        external_id = external_id,
        external_version = external_version,
        source_ref = source_ref,
        trace_context = event_trace,
        append = appended,
    }, nil
end

function M.append_graph_change(kb_id, params)
    kb_id = trim(kb_id)
    if kb_id == "" then return nil, "kb_id is required" end
    params = type(params) == "table" and params or {}

    local access_err = validate_kb_access(kb_id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end

    local exec, exec_err = current_executor()
    if exec_err or not exec then return nil, exec_err end
    local _, projection_err = source_projection(exec, kb_id)
    if projection_err then return nil, projection_err end

    local actor_id = current_actor_id()
    local reason = trim(params.reason)
    if reason == "" then reason = "graph.changed" end
    local event_id = trim(params.external_id)
    if event_id == "" then event_id = reason .. ":" .. uuid.v7() end
    local event_trace, trace_err = trace_for("kb.graph", kb_id, event_id, params.trace_context)
    if trace_err then return nil, trace_err end

    local body = shallow_copy(params)
    body.kb_id = kb_id
    body.reason = reason
    if actor_id then body.actor_id = actor_id end
    body.trace_context = nil
    body.external_id = nil

    local appended, append_err = emit_event(exec, kb_id, {
        type = M.EVENT_GRAPH_CHANGED,
        role = "system",
        body = body,
        external = {
            external_source = GRAPH_EXTERNAL_SOURCE,
            external_id = event_id,
            external_version = "1",
        },
        trace_context = event_trace,
    })
    if append_err then return nil, append_err end

    return {
        success = true,
        kb_id = kb_id,
        thread_id = kb_id,
        trace_context = event_trace,
        append = appended,
    }, nil
end

return M
