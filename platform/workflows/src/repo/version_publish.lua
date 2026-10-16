-- Workflow-version publication folds the definition read model at its head sequence,
-- compiles it, and inserts an immutable snapshot with its compiled command stream and
-- frozen exact-id allowlist. Allocation and the non-projected version.published marker
-- are atomic; canonical_json.hash supplies the publication marker and returned digest.

local json = require("json")
local canonical_json = require("canonical_json")
local store = require("store")
local store_state = require("store_state")
local types = require("types")
local workflow = require("workflow")
local compiler = require("compiler")
local realtime = require("realtime")
local blocks = require("block_catalog")
local policy = require("policy")

type Map = { [string]: any }

local function new(dependencies: any?): any
local supplied = type(dependencies) == "table" and dependencies or {}
local block_catalog = supplied.block_catalog or blocks.catalog
local M = {}

local now = store_state.now

local function encode(v: any): (string?, error?)
    local out, err = json.encode(v)
    if err then return nil, errors.new({ kind = errors.INTERNAL, message = "encode workflow version: " .. tostring(err) }) end
    if not out then return nil, errors.new({ kind = errors.INTERNAL, message = "encode workflow version returned no JSON" }) end
    return out, nil
end

local function insert_version(tx: any, params: { any }): any?
    local rows, err = tx:query(
        "INSERT INTO " .. types.TABLES.VERSIONS ..
        " (workflow_id, version, def_seq, document, compiled_commands, allowlist, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING RETURNING version",
        params)
    if err then return err end
    if not rows or not rows[1] then
        return errors.new({ kind = errors.CONFLICT, retryable = true,
            message = "this workflow was published since it was read; reload it and publish again" })
    end
    return nil
end

-- The document is the full canvas snapshot (nodes/edges/notes/params/layout) so a
-- version is a faithful, diffable record; the compiler reads nodes/edges/params.
local function build_document(state: any): Map
    local s = type(state) == "table" and (state :: Map) or {}
    return {
        nodes = type(s.nodes) == "table" and s.nodes or {},
        edges = type(s.edges) == "table" and s.edges or {},
        notes = type(s.notes) == "table" and s.notes or {},
        layout = type(s.layout) == "table" and s.layout or {},
        params = type(s.params) == "table" and s.params or {},
    }
end

function M.build_document(state: any): Map
    return build_document(state)
end

-- compile_document(document, workflow_id, version) -> compile result. Exposed so the
-- run launcher / callers can re-derive the frozen artifact deterministically.
function M.compile_document(document: any, workflow_id: string, version: number, opts: any?): (Map?, error?)
    local o = type(opts) == "table" and (opts :: Map) or {}
    local catalog, catalog_err = block_catalog()
    if catalog_err then return nil, catalog_err end
    return compiler.compile(document, {
        workflow_id = workflow_id,
        version = version,
        blocks = catalog,
    })
end

-- Recheck the frozen source contract at launch. Every published Flow follows the
-- same rule; there is no version marker or bypass path.
function M.validate_published_config_requirements(document: any): ({ Map }?, error?)
    local doc = type(document) == "table" and (document :: Map) or {}
    local catalog, catalog_err = block_catalog()
    if catalog_err then return nil, catalog_err end
    return compiler.validate_config_requirements(doc, catalog), nil
end

-- compile_working(workflow_id) folds the current unpublished definition read model and
-- compiles it without allocating or inserting a workflow_versions row.
function M.compile_working(workflow_id: any): (Map?, error?)
    if type(workflow_id) ~= "string" or workflow_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "workflow id required" }) end
    local db, db_err = store.open_db()
    if not db then return nil, db_err end
    local raw, rerr = store.read_state(db, workflow_id)
    db:release()
    if rerr then return nil, rerr end
    local head = tonumber((raw :: Map).head_seq) or 0

    local document = build_document(workflow.build(raw, head))
    local compiled, cerr = M.compile_document(document, workflow_id, 0)
    if cerr then return nil, cerr end
    return { document = document, def_seq = head, compiled = compiled }, nil
end

-- publish(workflow_id, actor) -> (result, err). result on success:
-- { ok=true, version, def_seq, hash }. On a validation failure: { ok=false, errors }.
function M.publish(workflow_id: any, actor: any): (Map?, error?)
    if type(workflow_id) ~= "string" or workflow_id == "" then return nil, errors.new({ kind = errors.INVALID, message = "workflow id required" }) end
    local runtime_policy, policy_err = policy.policy()
    if policy_err or not runtime_policy then return nil, policy_err end

    -- The document is folded and compiled INSIDE the transaction at the
    -- transaction's own head, so no concurrent apply can slip between the fold
    -- and the marker: def_seq is the ACTUAL folded head and the document reflects
    -- everything <= def_seq and nothing after. A concurrent publish or edit that
    -- commits first returns its conflict to the caller.
    local db, db_err = store.open_db()
    if not db then return nil, db_err end
    local tx, tx_err = db:begin()
    if tx_err then db:release(); return nil, errors.wrap(tx_err, "begin failed") end
    local function abort(v: Map?, e: any?): (Map?, any?)
        tx:rollback(); db:release(); return v, e
    end

    local head, herr = store.head_seq(tx, workflow_id)
    if herr then return abort(nil, herr) end
    local raw, rerr = store.read_state(tx, workflow_id)
    if rerr then return abort(nil, rerr) end
    local document = build_document(workflow.build(raw, head))
    local doc_json, encode_err = encode(document)
    if encode_err then return abort(nil, encode_err) end
    if #doc_json > (runtime_policy :: any).document_bytes then
        return abort({ ok = false, errors = { { code = "document_too_large", message = "document exceeds the " .. tostring((runtime_policy :: any).document_bytes) .. "-byte cap" } } }, nil)
    end

    local prev_rows, qerr = tx:query("SELECT COALESCE(MAX(version), 0) AS v FROM " .. types.TABLES.VERSIONS .. " WHERE workflow_id = $1", { workflow_id })
    if qerr then return abort(nil, errors.wrap(qerr, "version read failed")) end
    local prev = 0
    if type(prev_rows) == "table" and prev_rows[1] then prev = tonumber((prev_rows[1] :: any).v) or 0 end
    local candidate = prev + 1

    local catalog, catalog_err = block_catalog()
    if catalog_err then return abort(nil, catalog_err) end
    local compiled = select(1, compiler.compile(document, {
        workflow_id = workflow_id,
        version = candidate,
        blocks = catalog,
    }))
    if not compiled or (compiled :: Map).ok ~= true then
        return abort({ ok = false, errors = (compiled :: Map) and (compiled :: Map).errors or {} }, nil)
    end

    doc_json, encode_err = encode(document)
    if encode_err then return abort(nil, encode_err) end
    if #doc_json > (runtime_policy :: any).document_bytes then
        return abort({ ok = false, errors = { { code = "document_too_large", message = "document exceeds the " .. tostring((runtime_policy :: any).document_bytes) .. "-byte cap" } } }, nil)
    end

    -- def_seq is the folded head; the marker at head+1 references it.
    local def_seq = head
    local document_hash, hash_err = canonical_json.hash(document)
    if hash_err then return abort(nil, errors.wrap(hash_err, "document hash failed")) end
    if type(document_hash) ~= "string" or document_hash == "" then
        return abort(nil, errors.new({ kind = errors.INTERNAL, message = "document hash failed: invalid sha256 digest" }))
    end
    local marker_seq = head + 1
    local marker_body = { version = candidate, def_seq = def_seq, hash = document_hash }
    local aerr = store.append_event(tx, workflow_id, marker_seq, types.EVENT.VERSION_PUBLISHED, marker_body, actor)
    if aerr then return abort(nil, aerr) end
    local perr = store.project_event(tx, workflow_id, {
        type = types.EVENT.VERSION_PUBLISHED,
        body = marker_body,
        actor = actor,
    }, marker_seq)
    if perr then return abort(nil, errors.wrap(perr, "marker projection failed")) end

    local commands_json, commands_err = encode((compiled :: Map).commands)
    if commands_err then return abort(nil, commands_err) end
    local allowlist_json, allowlist_err = encode((compiled :: Map).allowlist)
    if allowlist_err then return abort(nil, allowlist_err) end
    local ierr = insert_version(tx, {
            workflow_id, candidate, def_seq, doc_json,
            commands_json, allowlist_json,
            actor, now(),
        })
    if ierr then return abort(nil, errors.wrap(ierr, "version insert failed")) end

    local _, cerr = tx:commit()
    if cerr then return abort(nil, errors.wrap(cerr, "commit failed")) end
    db:release()

    -- Broadcast the publish marker on the workflow's realtime topic, the same
    -- path apply uses, so the canvas log records the publish live.
    local broadcast_err = realtime.broadcast(workflow_id, { {
        seq = marker_seq,
        type = types.EVENT.VERSION_PUBLISHED,
        body = marker_body,
    } })
    if broadcast_err then return nil, broadcast_err end
    return {
        ok = true,
        version = candidate,
        def_seq = def_seq,
        hash = document_hash,
        marker = { type = types.EVENT.VERSION_PUBLISHED, seq = marker_seq, body = marker_body },
    }, nil
end

return M
end

local default = new({ block_catalog = blocks.catalog })
default.new = new
return default
