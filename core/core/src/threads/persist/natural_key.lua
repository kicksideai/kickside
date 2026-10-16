local crypto = require("crypto")
local json = require("json")
local sql = require("sql")
local writer = require("threads_writer")

local M = {}
local NS = "kickside.thread"

function M.key(class: string, ref: string): table
    local encoded = "kickside.thread.key/v2;" .. tostring(#class) .. ":" .. class .. tostring(#ref) .. ":" .. ref
    return { class = class, ref = ref, digest = crypto.hmac.sha256(NS, encoded) }
end

function M.legacy_id(key: table): string
    local hex = crypto.hmac.sha256(NS, key.class .. ":" .. key.ref)
    return string.format("%s-%s-%s-%s-%s", hex:sub(1,8), hex:sub(9,12),
        "5" .. hex:sub(14,16), hex:sub(17,20), hex:sub(21,32))
end

function M.v8_id(key: table): string
    local hex = key.digest
    local variant = string.format("%x", (tonumber(hex:sub(17,17),16) :: number) % 4 + 8)
    return string.format("%s-%s-%s-%s-%s", hex:sub(1,8), hex:sub(9,12),
        "8" .. hex:sub(14,16), variant .. hex:sub(18,20), hex:sub(21,32))
end

function M.conflict(reason: string): error
    return (errors.new({ message = "thread natural key integrity conflict: " .. reason,
        kind = errors.CONFLICT, details = { reason = reason } }) :: error)
end

local function persistence_error(cause: error): error
    return errors.wrap(cause, "thread natural key persistence")
end

-- Only computed hex enters the SQL literal; tuple bytes remain parameters.
local function digest_sql(key: table, dbtype: string): string
    local hex = M.key(key.class, key.ref).digest
    if dbtype == sql.type.POSTGRES then return "decode('" .. hex .. "','hex')" end
    return "X'" .. hex .. "'"
end

local function matches(row: table, key: table): boolean
    return row.key_class == key.class and row.key_ref == key.ref
end

function M.lookup(executor: any, dbtype: string, key: table): (table?, error?)
    local rows, err = executor:query([[SELECT k.key_class,k.key_ref,k.thread_id,k.origin,k.ready,
        t.*,c.component_id AS backing_id FROM kickside_thread_natural_key k
        LEFT JOIN kickside_thread t ON t.id=k.thread_id
        LEFT JOIN kickside_components c ON c.component_id=t.id WHERE k.key_digest=]] .. digest_sql(key,dbtype))
    if err then return nil, persistence_error(err) end
    local row = rows and rows[1]
    if not row then return nil, nil end
    if not matches(row,key) then return nil, M.conflict("natural_key_digest_collision") end
    if tostring(row.id) ~= tostring(row.thread_id) or tostring(row.component_id) ~= tostring(row.thread_id)
        or tostring(row.backing_id) ~= tostring(row.thread_id) then
        return nil, M.conflict("natural_key_thread_integrity")
    end
    return row, nil
end

function M.bind(tx: any, dbtype: string, key: table, id: string, origin: string, ready: boolean): error?
    local _, err = tx:execute([[INSERT INTO kickside_thread_natural_key
        (key_digest,key_class,key_ref,thread_id,origin,ready) VALUES (]] .. digest_sql(key,dbtype)
        .. [[,$1,$2,$3,$4,$5) ON CONFLICT DO NOTHING]],
        {key.class,key.ref,id,origin,dbtype == sql.type.SQLITE and (ready and 1 or 0) or ready})
    if err then return persistence_error(err) end
    local row, read_err = M.lookup(tx,dbtype,key)
    if read_err then return read_err end
    if not row or tostring(row.thread_id) ~= id then return M.conflict("natural_key_binding_collision") end
    return nil
end

-- The caller owns a write-first transaction and locks the candidate before probing.
-- Existing bindings are checked in place; unbound legacy tuples require the
-- pre-update manual binding procedure.
function M.capture(tx: any, dbtype: string, id: string, required: boolean?): (table?, error?)
    local mapped, mapped_err = tx:query("SELECT key_class,key_ref FROM kickside_thread_natural_key WHERE thread_id=$1",{id})
    if mapped_err then return nil, persistence_error(mapped_err) end
    if mapped and mapped[1] then
        local key = M.key(mapped[1].key_class,mapped[1].key_ref)
        local canonical, canonical_err = M.lookup(tx,dbtype,key)
        if canonical_err then return nil, canonical_err end
        if not canonical or tostring(canonical.thread_id) ~= id then return nil, M.conflict("natural_key_binding_collision") end
        return key, nil
    end
    local rows, err = tx:query([[SELECT t.id,t.thread_class,t.attrs,t.component_id,c.component_id AS backing_id
        FROM kickside_thread t LEFT JOIN kickside_components c ON c.component_id=t.id WHERE t.id=$1]],{id})
    if err then return nil, persistence_error(err) end
    local row = rows and rows[1]
    if not row then return nil, nil end
    local attrs, decode_err = json.decode(row.attrs)
    if decode_err then return nil, persistence_error(decode_err) end
    local key: table? = nil
    if type(attrs) == "table" and type(attrs.external_ref) == "string" and attrs.external_ref ~= "" then
        key = M.key(row.thread_class,attrs.external_ref)
    end
    if not key or M.legacy_id(key) ~= id then
        if required then return nil, M.conflict("legacy_natural_key_unverifiable") end
        return nil, nil
    end
    if tostring(row.component_id) ~= id or tostring(row.backing_id) ~= id then
        return nil, M.conflict("legacy_natural_key_component_integrity")
    end
    return nil, M.conflict("legacy_natural_key_manual_adoption_required")
end

function M.lock(tx: any, dbtype: string, id: string): error?
    if dbtype ~= sql.type.SQLITE then return writer.lock_threads_tx(tx,dbtype,{id}) end
    local _, err = tx:execute([[INSERT INTO kickside_thread_natural_key
        (key_digest,key_class,key_ref,thread_id,origin,ready)
        SELECT key_digest,key_class,key_ref,thread_id,origin,ready FROM kickside_thread_natural_key WHERE 1=0]])
    if err then return persistence_error(err) end
    return nil
end

function M.transient(err: any): boolean
    return errors.is(err, errors.CONFLICT) and err:retryable() == true
end

function M.resolve(db: sql.DB, key: table): (table?, error?)
    local dbtype, type_err = db:type()
    if type_err then return nil, persistence_error(type_err) end
    local mapped, lookup_err = M.lookup(db,dbtype,key)
    if lookup_err or mapped then return mapped, lookup_err end
    local legacy = M.legacy_id(key)
    local rows, binding_err = db:query("SELECT key_digest FROM kickside_thread_natural_key WHERE thread_id=$1", {legacy})
    if binding_err then return nil, persistence_error(binding_err) end
    if rows and rows[1] then return {allocate_id=M.v8_id(key),origin="v2"}, nil end
    return {allocate_id=legacy,origin="legacy"}, nil
end

function M.mark_ready(db: sql.DB, id: string): error?
    local dbtype, type_err = db:type()
    if type_err then return persistence_error(type_err) end
    local result, err = db:execute("UPDATE kickside_thread_natural_key SET ready=$1 WHERE thread_id=$2",
        {dbtype == sql.type.SQLITE and 1 or true,id})
    if err then return persistence_error(err) end
    if not result or tonumber(result.rows_affected) ~= 1 then return M.conflict("natural_key_binding_missing") end
    return nil
end

return M
