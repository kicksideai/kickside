-- Workflow persistence and snapshot reads.
local store = require("store")
local types = require("types")
local mapping = require("mapping")
local workflow_state = require("workflow_state")
local policy = require("policy")
local workflow_inverse = require("workflow_inverse")
local undo = require("undo")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
local M = {}
local seed = workflow_state.seed
local is_str = workflow_state.is_str
local copy_map = workflow_state.copy_map
local copy_tree = mapping.copy_tree
local copy_list = workflow_state.copy_list
local edge_from = workflow_state.edge_from
local encoded_size = workflow_state.encoded_size

-- ─── snapshot ────────────────────────────────────────────────────────────

local function ordered(map: any, order: any): { any }
    local out: { any } = {}
    local seen: { [string]: boolean } = {}
    if type(order) == "table" then
        for _, id in ipairs(order :: { any }) do
            local key = tostring(id)
            if type(map) == "table" and map[key] and not seen[key] then
                out[#out + 1] = map[key]; seen[key] = true
            end
        end
    end
    if type(map) == "table" then
        for id, v in pairs(map :: { [string]: any }) do
            if not seen[tostring(id)] then out[#out + 1] = v end
        end
    end
    return out
end

function M.build(state: any, head_seq: any): any
    state = seed(state)
    local edges: { any } = {}
    for _, edge in ipairs(ordered(state.edges, state.edge_order)) do
        edges[#edges + 1] = edge_from(edge, nil, state.nodes)
    end
    local snapshot: any = {
        nodes = ordered(state.nodes, state.node_order),
        edges = edges,
        notes = ordered(state.notes, state.note_order),
        layout = { positions = state.layout, viewport = state.viewport, direction = state.direction },
        params = state.params or {},
        labels = copy_list(state.labels),
        head_seq = tonumber(head_seq) or 0,
        counts = {
            nodes = #ordered(state.nodes, state.node_order),
            edges = #ordered(state.edges, state.edge_order),
            notes = #ordered(state.notes, state.note_order),
        },
    }
    if state.version_lineage ~= nil then snapshot.version_lineage = copy_tree(state.version_lineage) end
    return snapshot
end

-- ─── DB-backed write ─────────────────────────────────────────────────────

local function finish(db: any, tx: any?, primary: error?, committed: boolean): error?
    local cleanup_failed = false
    if tx then
        primary = error_envelope.cleanup(function(): (any, error?)
            local rolled, err = tx:rollback()
            cleanup_failed = err ~= nil
            return rolled, err
        end, primary, "workflow rollback failed")
    end
    primary = error_envelope.cleanup(function(): (any, error?)
        local released, err = db:release()
        cleanup_failed = cleanup_failed or err ~= nil
        return released, err
    end, primary, "workflow database release failed")
    if primary and (cleanup_failed or committed) then return committed_error.new(primary) end
    return primary
end

local function write_attempt(workflow_id: string, items: any, actor: any, from_commands: boolean,
        runtime_policy: any, history_action: string?): (any?, error?)
    local db, db_err = store.open_db()
    if db_err then return nil, db_err end
    if not db then return nil, errors.new({message = "workflow database unavailable", kind = errors.INTERNAL, retryable = false}) end
    local tx, tx_err = db:begin()
    if tx_err then return nil, finish(db, nil, errors.wrap(tx_err, "workflow begin failed"), false) end
    local function abort(err: error?): (any?, error?)
        return nil, finish(db, tx, err, false)
    end

    local lock_err = store.lock_history(tx, workflow_id)
    if lock_err then return abort(lock_err) end
    local tracker, history_err = store.read_history(tx, workflow_id)
    if history_err then return abort(history_err) end
    local entry: any = nil
    if history_action == "undo" then
        entry = undo.take_undo(tracker)
        if not entry then return abort(errors.new({message = "nothing to undo", kind = errors.INVALID, retryable = false})) end
        items = entry.inverse
    elseif history_action == "redo" then
        entry = undo.take_redo(tracker)
        if not entry then return abort(errors.new({message = "nothing to redo", kind = errors.INVALID, retryable = false})) end
        items = entry.forward
    end

    local pre_state, rerr = store.read_state(tx, workflow_id)
    if rerr then return abort(rerr) end
    local published, published_err = store.latest_published_interface(tx, workflow_id)
    if published_err then return abort(published_err) end
    if type(published) == "table" and type((published :: any).interface) == "table" then
        pre_state._published_interface = true
    end

    local events, verr = workflow_state.pipeline(items, pre_state, from_commands,
        { command_bytes = runtime_policy.command_bytes })
    if verr then
        if type(verr) ~= "string" then return abort(verr) end
        return abort(errors.new({ message = verr, kind = errors.INVALID, retryable = false,
            details = { reason = "invalid_command_batch" } }))
    end

    -- Total document size cap (apply-side, same limit publish enforces): fold the
    -- batch onto a copy and reject before writing if the result exceeds the cap.
    if #(events :: { any }) > 0 then
        local folded = seed(copy_tree(pre_state))
        for _, e in ipairs(events :: { any }) do workflow_state.apply_event(folded, tostring(e.type or ""), e.body) end
        local doc_cap = runtime_policy.document_bytes
        if encoded_size(M.build(folded, 0)) > doc_cap then
            return abort(errors.new({message = "document_too_large: the workflow document exceeds the " .. tostring(doc_cap) .. "-byte cap",
                kind = errors.INVALID, retryable = false, details = {reason = "document_too_large"}}))
        end
    end

    local head, herr = store.head_seq(tx, workflow_id)
    if herr then return abort(herr) end

    if #(events :: { any }) == 0 and not history_action then
        local cleanup_err = finish(db, tx, nil, false)
        if cleanup_err then return nil, cleanup_err end
        return { workflow_id = workflow_id, events = {}, head_seq = head, state = M.build(pre_state, head),
            pre_state = pre_state, can_undo = undo.can_undo(tracker), can_redo = undo.can_redo(tracker) }, nil
    end

    local stored: { any } = {}
    for _, e in ipairs(events :: { any }) do
        head = head + 1
        e.actor = actor
        local aerr = store.append_event(tx, workflow_id, head, tostring(e.type or ""), e.body, actor)
        if aerr then return abort(aerr) end
        local perr = store.project_event(tx, workflow_id, e, head)
        if perr then return abort(errors.wrap(perr, "workflow projection failed")) end
        stored[#stored + 1] = { seq = head, type = e.type, body = e.body }
    end

    if history_action == "undo" then
        undo.finish_undo(tracker, entry)
    elseif history_action == "redo" then
        undo.finish_redo(tracker, entry)
    else
        local forward: { any } = {}
        for _, event in ipairs(events :: { any }) do
            forward[#forward + 1] = { type = event.type, body = event.body }
        end
        undo.record(tracker, forward, workflow_inverse.build_inverse(pre_state, events))
    end
    local save_err = store.write_history(tx, workflow_id, tracker)
    if save_err then return abort(save_err) end

    local _, commit_err = tx:commit()
    -- SQL commit consumes the transaction even when it returns an error.
    if commit_err then return nil, finish(db, nil, errors.wrap(commit_err, "workflow commit failed"), false) end

    local post, prerr = store.read_state(db, workflow_id)
    local completion_err = finish(db, nil, prerr, true)
    if completion_err then return nil, completion_err end
    return {
        workflow_id = workflow_id,
        events = stored,
        head_seq = head,
        state = M.build(post, head),
        pre_state = pre_state,
        can_undo = undo.can_undo(tracker), can_redo = undo.can_redo(tracker),
    }, nil
end

local function write(workflow_id: string, items: any, actor: any, from_commands: boolean, history_action: string?): (any?, error?)
    if not is_str(workflow_id) then return nil, errors.new({message = "workflow id required", kind = errors.INVALID, retryable = false}) end
    local runtime_policy, policy_err = policy.policy()
    if policy_err or not runtime_policy then return nil, policy_err end
    local result, err = write_attempt(workflow_id, items, actor, from_commands, runtime_policy, history_action)
    if err and errors.is(err, errors.CONFLICT) and err:retryable() == true then
        return nil, errors.new({ message = "workflow changed since you opened it, reload and retry",
            kind = errors.CONFLICT, retryable = true, details = err:details() })
    end
    return result, err
end

-- apply(workflow_id, commands, actor) -> (result, err). The command entry point.
-- result = { events (with seq), head_seq, state, pre_state }.
function M.apply(workflow_id: string, commands: any, actor: any): (any?, any?)
    return write(workflow_id, commands, actor, true)
end

-- apply_events(workflow_id, events, actor) -> (result, err). Applies already-formed
-- past-tense events (undo/redo replay). Same validation and transaction path.
function M.apply_events(workflow_id: string, events: any, actor: any): (any?, any?)
    return write(workflow_id, events, actor, false)
end

function M.undo(workflow_id: string, actor: any): (any?, any?)
    return write(workflow_id, {}, actor, false, "undo")
end

function M.redo(workflow_id: string, actor: any): (any?, any?)
    return write(workflow_id, {}, actor, false, "redo")
end

-- ─── DB-backed reads ─────────────────────────────────────────────────────

function M.state(workflow_id: string): (any?, any?)
    if not is_str(workflow_id) then return nil, errors.new({message = "workflow id required", kind = errors.INVALID, retryable = false}) end
    local db, db_err = store.open_db()
    if not db then return nil, db_err end
    local raw, rerr = store.read_state(db, workflow_id)
    if rerr then return nil, finish(db, nil, rerr, false) end
    local snapshot = M.build(raw, (raw :: any).head_seq)
    local tracker, history_err = store.read_history(db, workflow_id)
    if history_err then return nil, finish(db, nil, history_err, false) end
    snapshot.can_undo = undo.can_undo(tracker)
    snapshot.can_redo = undo.can_redo(tracker)
    snapshot.workflow_id = workflow_id
    local _, decorate_err = store.decorate_snapshot(db, snapshot)
    if decorate_err then return nil, finish(db, nil, decorate_err, false) end
    local release_err = finish(db, nil, nil, false)
    if release_err then return nil, release_err end
    return snapshot, nil
end

function M.events(workflow_id: string, from_seq: any, opts: any?): (any?, error?)
    if not is_str(workflow_id) then return nil, errors.new({message = "workflow id required", kind = errors.INVALID, retryable = false}) end
    opts = type(opts) == "table" and opts or {}
    local limit = math.max(1, math.min(500, tonumber((opts :: any).limit) or 500))
    return store.list_events(workflow_id, from_seq, limit)
end

local function query_entity(workflow_id: string, options: any, fn: (any, string, any) -> (any?, error?)): (any?, error?)
    if not is_str(workflow_id) then return nil, errors.new({message = "workflow id required", kind = errors.INVALID, retryable = false}) end
    local db, db_err = store.open_db()
    if not db then return nil, db_err end
    local rows, err = fn(db, workflow_id, options)
    local completed_err = finish(db, nil, err, false)
    if completed_err then return nil, completed_err end
    return rows, nil
end

function M.nodes(workflow_id: string, options: any): (any?, error?)
    return query_entity(workflow_id, options, store.list_nodes)
end

function M.edges(workflow_id: string, options: any): (any?, error?)
    return query_entity(workflow_id, options, store.list_edges)
end

function M.notes(workflow_id: string, options: any): (any?, error?)
    return query_entity(workflow_id, options, store.list_notes)
end

function M.purge(workflow_id: string): (boolean, error?)
    if not is_str(workflow_id) then return false, (errors.new({ message = "workflow id required",
        kind = errors.INVALID, retryable = false }) :: error) end
    local purged, err = store.purge(workflow_id)
    return purged == true, err
end

return M
