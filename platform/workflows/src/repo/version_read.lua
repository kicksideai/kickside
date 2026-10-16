-- Immutable workflow-version reads, source export, history listing, and revision diffing.
local json = require("json")
local types = require("types")
local store = require("store")
local mapping = require("mapping")

type Map = { [string]: any }
local M = {}

local function decode(raw: any): (any?, error?)
    if type(raw) == "table" then return raw, nil end
    if type(raw) ~= "string" or raw == "" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "decode workflow version: expected JSON" })
    end
    local out, err = json.decode(raw)
    if err then return nil, errors.new({ kind = errors.INTERNAL, message = "decode workflow version: " .. tostring(err) }) end
    if type(out) ~= "table" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "decode workflow version: expected an object or array" })
    end
    return out, nil
end

local function schema_properties(schema: any): Map
    local s = type(schema) == "table" and (schema :: Map) or {}
    return type(s.properties) == "table" and (s.properties :: Map) or {}
end

local function required_fields(schema: any): { [string]: boolean }
    local s = type(schema) == "table" and (schema :: Map) or {}
    local out: { [string]: boolean } = {}
    for _, field in ipairs(type(s.required) == "table" and (s.required :: { any }) or {}) do
        if type(field) == "string" and field ~= "" then out[field] = true end
    end
    return out
end

local function sorted_map_keys(values: any): { string }
    local out: { string } = {}
    if type(values) ~= "table" then return out end
    for key, _ in pairs(values :: Map) do
        if type(key) == "string" and key ~= "" then out[#out + 1] = key end
    end
    table.sort(out)
    return out
end

local copy_tree = mapping.copy_tree

local function same_tree(left: any, right: any): boolean
    if type(left) ~= type(right) then return false end
    if type(left) ~= "table" then return left == right end
    for key, value in pairs(left :: Map) do
        if not same_tree(value, (right :: Map)[key]) then return false end
    end
    for key, _ in pairs(right :: Map) do
        if (left :: Map)[key] == nil then return false end
    end
    return true
end

local function by_id(values: any): Map
    local out: Map = {}
    for _, raw in ipairs(type(values) == "table" and (values :: { any }) or {}) do
        local value = type(raw) == "table" and (raw :: Map) or {}
        local id = tostring(value.id or "")
        if id ~= "" then out[id] = value end
    end
    return out
end

local function graph_delta(before: any, after: any): Map
    local function one(kind: string): Map
        local prior = by_id(type(before) == "table" and ((before :: Map)[kind]) or {})
        local next_values = by_id(type(after) == "table" and ((after :: Map)[kind]) or {})
        local added: { any } = {}
        local removed: { any } = {}
        local changed: { any } = {}
        for id, value in pairs(next_values) do
            if prior[id] == nil then
                added[#added + 1] = copy_tree(value)
            elseif not same_tree(prior[id], value) then
                changed[#changed + 1] = { id = id, before = copy_tree(prior[id]), after = copy_tree(value) }
            end
        end
        for id, value in pairs(prior) do
            if next_values[id] == nil then removed[#removed + 1] = copy_tree(value) end
        end
        local function sort_id(values: { any })
            table.sort(values, function(a: any, b: any) return tostring((a :: Map).id or "") < tostring((b :: Map).id or "") end)
        end
        sort_id(added); sort_id(removed)
        table.sort(changed, function(a: any, b: any) return tostring((a :: Map).id) < tostring((b :: Map).id) end)
        return { added = added, removed = removed, changed = changed }
    end
    return { nodes = one("nodes"), edges = one("edges") }
end

local function type_signature(schema: any): string
    local s = type(schema) == "table" and (schema :: Map) or {}
    if type(s.type) == "string" then return s.type end
    if type(s.type) == "table" then
        local names: { string } = {}
        for _, value in ipairs(s.type :: { any }) do names[#names + 1] = tostring(value) end
        table.sort(names)
        return table.concat(names, "|")
    end
    return ""
end

local function append_change(changes: { Map }, face: string, kind: string, field: string): ()
    local message = face .. " field '" .. field .. "' " .. kind:gsub("_", " ")
    changes[#changes + 1] = { face = face, kind = kind, field = field, message = message }
end

-- compatibility_changes is a read-only comparison between immutable revisions.
-- It never gates publication or discovers consumers; callers can use the result
-- when explaining a version diff.
function M.compatibility_changes(previous: any, candidate: any): { Map }
    local prior = type(previous) == "table" and (previous :: Map) or {}
    local next_iface = type(candidate) == "table" and (candidate :: Map) or {}
    local changes: { Map } = {}

    local before_input = schema_properties(prior.input_schema)
    local after_input = schema_properties(next_iface.input_schema)
    local before_required = required_fields(prior.input_schema)
    local after_required = required_fields(next_iface.input_schema)
    for _, field in ipairs(sorted_map_keys(after_required)) do
        if not before_required[field] then append_change(changes, "start_input", "start_required_added", field) end
    end
    for _, field in ipairs(sorted_map_keys(before_input)) do
        local after = after_input[field]
        if after == nil then
            append_change(changes, "start_input", "start_field_removed", field)
        elseif type_signature(before_input[field]) ~= type_signature(after) then
            append_change(changes, "start_input", "start_field_retyped", field)
        end
    end

    local before_output = schema_properties(prior.output_schema)
    local after_output = schema_properties(next_iface.output_schema)
    for _, field in ipairs(sorted_map_keys(before_output)) do
        local after = after_output[field]
        if after == nil then
            append_change(changes, "finish_output", "finish_field_removed", field)
        elseif type_signature(before_output[field]) ~= type_signature(after) then
            append_change(changes, "finish_output", "finish_field_retyped", field)
        end
    end

    local before_error = schema_properties(prior.error_schema)
    local after_error = schema_properties(next_iface.error_schema)
    for _, field in ipairs(sorted_map_keys(before_error)) do
        if after_error[field] == nil then append_change(changes, "error", "error_field_removed", field) end
    end
    return changes
end

-- diff compares two immutable snapshots. Interface changes are descriptive only:
-- exact references keep every consumer on its selected revision, so publishing a
-- new revision never asks or rewrites existing consumers.
function M.diff(workflow_id: any, from_version: any, to_version: any): (Map?, any?)
    local from, ferr = M.get(workflow_id, from_version)
    if ferr then return nil, ferr end
    if not from then return nil, errors.new({ message = "from version not found", kind = errors.NOT_FOUND }) end
    local to, terr = M.get(workflow_id, to_version)
    if terr then return nil, terr end
    if not to then return nil, errors.new({ message = "to version not found", kind = errors.NOT_FOUND }) end
    local before, after = from :: Map, to :: Map
    return {
        from_version = before.version,
        to_version = after.version,
        interface = {
            before = copy_tree(before.interface),
            after = copy_tree(after.interface),
            changes = M.compatibility_changes(before.interface, after.interface),
        },
        graph = graph_delta(before.document, after.document),
    }, nil
end

-- list(workflow_id) -> ({ version rows without heavy blobs }, err), newest first.
function M.list(workflow_id: any): (any?, any?)
    if type(workflow_id) ~= "string" or workflow_id == "" then return nil, errors.new({ message = "workflow id required", kind = errors.INVALID }) end
    local db, db_err = store.open_db()
    if not db then return nil, db_err end
    local rows, err = db:query(
        "SELECT version, def_seq, created_by, created_at FROM " .. types.TABLES.VERSIONS ..
        " WHERE workflow_id = $1 ORDER BY version DESC", { workflow_id })
    db:release()
    if err then return nil, err end
    local out: { any } = {}
    for _, row in ipairs(rows or {}) do
        local r: any = row
        out[#out + 1] = {
            version = tonumber(r.version) or 0,
            def_seq = tonumber(r.def_seq) or 0,
            created_by = r.created_by,
            created_at = r.created_at,
        }
    end
    return out, nil
end

-- get(workflow_id, version) -> (full version row incl. document/commands/allowlist, err).
function M.get(workflow_id: any, version: any): (any?, any?)
    if type(workflow_id) ~= "string" or workflow_id == "" then return nil, errors.new({ message = "workflow id required", kind = errors.INVALID }) end
    local v = tonumber(version)
    if not v then return nil, errors.new({ message = "version required", kind = errors.INVALID }) end
    local db, db_err = store.open_db()
    if not db then return nil, db_err end
    local rows, err = db:query(
        "SELECT * FROM " .. types.TABLES.VERSIONS .. " WHERE workflow_id = $1 AND version = $2", { workflow_id, v })
    if err then db:release(); return nil, err end
    if type(rows) ~= "table" or not rows[1] then db:release(); return nil, nil end
    local r: any = rows[1]
    local document, document_err = decode(r.document)
    if document_err then db:release(); return nil, document_err end
    local commands, commands_err = decode(r.compiled_commands)
    if commands_err then db:release(); return nil, commands_err end
    local allowlist, allowlist_err = decode(r.allowlist)
    if allowlist_err then db:release(); return nil, allowlist_err end
    local _, decorate_err = store.decorate_snapshot(db, document)
    db:release()
    if decorate_err then return nil, decorate_err end
    local iface = store.interface_from_document(document)
    return {
        workflow_id = tostring(r.workflow_id or ""),
        version = tonumber(r.version) or 0,
        def_seq = tonumber(r.def_seq) or 0,
        document = document,
        compiled_commands = commands,
        allowlist = allowlist,
        created_by = r.created_by,
        created_at = r.created_at,
        interface = iface,
        input_schema = store.start_input_schema_from_document(document),
    }, nil
end

-- get_source(workflow_id, version?) -> published source document only. This is
-- intentionally separate from get(): get() serves run/debug internals and carries
-- compiled commands, while portability/read contracts must never even receive them.
function M.get_source(workflow_id: any, version: any?): (any?, any?)
    if type(workflow_id) ~= "string" or workflow_id == "" then return nil, errors.new({ message = "workflow id required", kind = errors.INVALID }) end
    local v = tonumber(version)
    local db, db_err = store.open_db()
    if not db then return nil, db_err end
    local rows: any
    local err: any
    if v and v > 0 then
        rows, err = db:query(
            "SELECT workflow_id, version, def_seq, document, created_by, created_at FROM " .. types.TABLES.VERSIONS ..
            " WHERE workflow_id = $1 AND version = $2", { workflow_id, math.floor(v) })
    else
        rows, err = db:query(
            "SELECT workflow_id, version, def_seq, document, created_by, created_at FROM " .. types.TABLES.VERSIONS ..
            " WHERE workflow_id = $1 ORDER BY version DESC LIMIT 1", { workflow_id })
    end
    if err then db:release(); return nil, err end
    if type(rows) ~= "table" or not rows[1] then db:release(); return nil, nil end
    local row: any = rows[1]
    local document, document_err = decode(row.document)
    if document_err then db:release(); return nil, document_err end
    local iface = store.interface_from_document(document)
    if type(iface) == "table" then
        (iface :: Map).version = tonumber(row.version) or 0
        (iface :: Map).def_seq = tonumber(row.def_seq) or 0
        (iface :: Map).created_at = row.created_at
    end
    db:release()
    return {
        workflow_id = tostring(row.workflow_id or ""),
        version = tonumber(row.version) or 0,
        def_seq = tonumber(row.def_seq) or 0,
        document = document,
        created_by = row.created_by,
        created_at = row.created_at,
        interface = iface,
    }, nil
end

-- head(workflow_id) -> (latest version number or 0, err).
function M.head(workflow_id: any): (number?, any?)
    if type(workflow_id) ~= "string" or workflow_id == "" then return nil, errors.new({ message = "workflow id required", kind = errors.INVALID }) end
    local db, db_err = store.open_db()
    if not db then return nil, db_err end
    local rows, err = db:query("SELECT COALESCE(MAX(version), 0) AS v FROM " .. types.TABLES.VERSIONS .. " WHERE workflow_id = $1", { workflow_id })
    db:release()
    if err then return nil, err end
    local v = 0
    if type(rows) == "table" and rows[1] then v = tonumber((rows[1] :: any).v) or 0 end
    return v, nil
end

return M
