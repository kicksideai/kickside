-- thread_row: the one writer of a component's primary kickside_thread row (plus its
-- parent edge) on a caller-owned transaction. Two callers share it: the component
-- lifecycle, which writes the row of a thread-backed component inside the
-- component's registration transaction so both commit together, and thread_crud,
-- which attaches a thread to a component that already exists.

local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local clock = require("clock")
local consts = require("threads_consts")
local masks = require("core_types")
local autoinit = require("autoinit")
local normalize = require("threads_normalize")

local natural_key = require("natural_key")

local M = {}
local trim = normalize.trim

-- The conflict detail of a thread row that already exists under the id, as
-- opposed to a component registration that collides with an existing component.
M.THREAD_CONFLICT = "thread"

-- The row a thread-backed component carries: its class, its attrs as an encoded
-- JSON object, and the parent thread it hangs under (an edge is written only when
-- that parent thread exists).
type Row = {
    thread_class: string,
    attrs: string,
    parent_id: string?,
    natural_key: table?,
    key_origin: string?,
}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID }) :: error)
end

local function invalid_response(field: string): error
    return errors.new({message = "thread row dependency returns no valid " .. field .. " proof",
        kind = errors.INTERNAL, retryable = false, details = {code = "thread_row_response", field = field}})
end

-- check validates a row descriptor before it reaches the table.
function M.check(row: any): (Row?, error?)
    if type(row) ~= "table" then return nil, invalid("thread row must be an object") end
    local class = row.thread_class
    if type(class) ~= "string" or class == "" then return nil, invalid("thread row requires thread_class") end
    if #class > consts.LIMITS.THREAD_CLASS_MAX_LEN then
        return nil, invalid("thread_class is too long (max " .. tostring(consts.LIMITS.THREAD_CLASS_MAX_LEN) .. ")")
    end
    if type(row.attrs) ~= "string" then return nil, invalid("thread row attrs must be encoded JSON") end
    local decoded, decode_err = json.decode(row.attrs)
    if decode_err then return nil, errors.wrap(decode_err, "thread row attrs must be a JSON object") end
    if type(decoded) ~= "table" then return nil, invalid("thread row attrs must be a JSON object") end
    if row.parent_id ~= nil and (type(row.parent_id) ~= "string" or row.parent_id == "") then
        return nil, invalid("thread row parent_id must be a non-empty string")
    end
    return { thread_class = class, attrs = row.attrs, parent_id = row.parent_id,
        natural_key = row.natural_key, key_origin = row.key_origin }, nil
end

function M.declared_class(impl_id: string): (string?, error?)
    local declared, declaration_err = autoinit.thread_for_impl(impl_id)
    -- Unbacked kinds have no binding declaration; a descriptor can still supply one.
    if declaration_err and not errors.is(declaration_err, errors.NOT_FOUND) then return nil, declaration_err end
    if declared then return declared.class :: string end
    for _, kind in ipairs(autoinit.declared_kinds()) do
        if kind.component_impl_id == impl_id and type(kind.class) == "string" then
            return kind.class :: string
        end
    end
    return nil
end

function M.class_error(supplied: string, declared: string?): error?
    if declared and supplied ~= "" and supplied ~= declared then
        return (errors.new({ message = "thread_class must match the declaration: " .. declared,
            kind = errors.INVALID, details = { error_kind = "declaration" } }) :: error)
    end
    return nil
end

-- prepare_row resolves the thread row a component's primary thread carries: the
-- class (the kind's declared class unless the caller names the same one), the attrs
-- stamped with the owner principal (and the owning user in attrs.user_ids so thread
-- notifications address the audience), and the parent thread.
function M.prepare(params: table, impl_id: string, actor_id: string?, owner_principal: any?): (Row?, error?)
    local thread_class = trim(params.thread_class)
    local declared, declaration_err = M.declared_class(impl_id)
    if declaration_err then return nil, declaration_err end
    local mismatch = M.class_error(thread_class, declared)
    if mismatch then return nil, mismatch end
    if thread_class == "" then thread_class = declared or consts.DEFAULT_THREAD_CLASS end

    local attrs = type(params.attrs) == "table" and params.attrs or {}
    attrs.owner_principal = owner_principal
    local owner = trim(actor_id)
    if owner ~= "" and type(owner_principal) == "table"
        and owner_principal.kind == "user" and owner_principal.id == owner then
        local user_ids = attrs.user_ids
        if type(user_ids) ~= "table" then
            user_ids = {}
            attrs.user_ids = user_ids
        end
        normalize.append_unique_user_id(user_ids, owner)
    end
    local attrs_json, attrs_err = normalize.encode_attrs(attrs)
    if attrs_err then
        return nil, attrs_err
    end
    local parent_id = trim(params.parent_id)
    return M.check({
        thread_class = thread_class,
        attrs = attrs_json,
        parent_id = parent_id ~= "" and parent_id or nil,
    })
end

-- insert writes the thread row under thread_id (== its component id) and its parent
-- edge on tx. A row already present under that id is a CONFLICT.
function M.insert(tx: sql.Transaction, dbtype: string, thread_id: string, row: any): error?
    if type(thread_id) ~= "string" or thread_id == "" then return invalid("thread_id is required") end
    if dbtype == "" then return invalid("dbtype is required") end
    local checked, check_err = M.check(row)
    if check_err or not checked then return check_err end
    local now = clock.now(dbtype)

    local inserted, insert_err = sql.builder.insert("kickside_thread")
        :set_map({
            id = thread_id,
            thread_class = checked.thread_class,
            attrs = checked.attrs,
            state = masks.THREAD_STATE.OPEN,
            event_count = 0,
            last_event_ts = now,
            component_id = thread_id,
            created_at = now,
            updated_at = now,
        })
        :suffix("ON CONFLICT (id) DO NOTHING")
        :run_with(tx)
        :exec()
    if insert_err then return errors.wrap(insert_err, "failed to insert thread") end
    local count = type(inserted) == "table" and tonumber(inserted.rows_affected) or nil
    if count == 0 then
        return errors.new({message = "thread already exists", kind = errors.CONFLICT, retryable = false,
            details = {conflict = M.THREAD_CONFLICT, code = "thread_already_exists"}})
    end
    if count ~= 1 then return invalid_response("insert.rows_affected") end

    if checked.natural_key then
        local key = checked.natural_key
        if type(key.class) ~= "string" or type(key.ref) ~= "string"
            or key.digest ~= natural_key.key(key.class,key.ref).digest
            or (checked.key_origin ~= "legacy" and checked.key_origin ~= "v2")
            or thread_id ~= (checked.key_origin == "legacy" and natural_key.legacy_id(key) or natural_key.v8_id(key)) then
            return invalid("invalid natural key row descriptor")
        end
        local bind_err = natural_key.bind(tx,dbtype,key,thread_id,checked.key_origin :: string,false)
        if bind_err then return bind_err end
    end
    local parent_id = checked.parent_id
    if parent_id == nil then return nil end
    local parents, parent_err = tx:query("SELECT id FROM kickside_thread WHERE id = $1", { parent_id })
    if parent_err then return errors.wrap(parent_err, "failed to resolve parent thread") end
    if type(parents) ~= "table" then return invalid_response("parent.rows") end
    if #parents == 0 then return nil end
    local inserted_edge, edge_err = sql.builder.insert("kickside_thread_edge")
        :set_map({ id = uuid.v7(), from_thread_id = thread_id, to_thread_id = parent_id,
            edge_type = "parent", attrs = "{}", active = dbtype == sql.type.SQLITE and 1 or true,
            created_at = now, updated_at = now })
        :run_with(tx):exec()
    if edge_err then return errors.wrap(edge_err, "failed to insert parent edge") end
    if type(inserted_edge) ~= "table" or tonumber(inserted_edge.rows_affected) ~= 1 then
        return invalid_response("edge.rows_affected")
    end
    return nil
end

return M
