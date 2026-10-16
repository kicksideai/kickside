-- Public metadata writes share the caller's component transaction.
local sql = require("sql")
local registry = require("registry")
local time = require("time")
local uuid = require("uuid")
local json = require("json")
local component_types = require("component_types")
local error_envelope = require("error_envelope")
type Executor = sql.DB | sql.Transaction

local function validate_public_meta_key(key: any): error?
    if type(key) ~= "string" or key == "" then
        return (errors.new({ message = "component public metadata key must be a non-empty string", kind = errors.INVALID }) :: error)
    end
    local lowered = string.lower(key)
    if component_types.FORBIDDEN_PUBLIC_META_KEYS[lowered] then
        return (errors.new({
            message = "component public metadata cannot store private/config key: " .. key,
            kind = errors.INVALID,
        }) :: error)
    end
    local owners, owner_err = registry.find({[".kind"] = "registry.entry",
        ["meta.type"] = "kickside.component.owned_meta_key", ["meta.key"] = key})
    if owner_err then return owner_err end
    if owners and #owners > 0 then
        return (errors.new({kind = errors.INVALID, retryable = false,
            message = "component metadata key belongs to its declared owner: " .. key,
            details = {code = "component_meta_owner_required"}}) :: error)
    end
    return nil
end

local function encode_public_meta_value(key: any, value: any): (string?, error?)
    if value == nil then
        return nil, (errors.new({ message = "metadata value is required: " .. tostring(key), kind = errors.INVALID }) :: error)
    end
    if type(value) == "string" then
        return value, nil
    end
    if type(value) == "table" then
        local encoded, err = json.encode(value)
        if err then
            return nil, error_envelope.wrap(err, "set_meta encode '" .. tostring(key) .. "'", {})
        end
        return encoded, nil
    end
    return tostring(value), nil
end

-- Stamp the parent component's updated_at within the same tx.
local function touch_component(tx: Executor, component_id: string, now_ts: string): error?
    local _, err = sql.builder.update(component_types.TABLES.COMPONENTS)
        :set("updated_at", now_ts)
        :where("component_id = ?", component_id)
        :run_with(tx):exec()
    if err then
        return (errors.wrap(err, "failed to update component timestamp") :: error)
    end
    return nil
end

-- Lock a component's row for the rest of the transaction. SQLite serializes
-- every transaction on its one connection and needs no row lock.
local function lock_component_tx(tx: Executor, component_id: string): error?
    local result, err = sql.builder.update(component_types.TABLES.COMPONENTS)
        :set("updated_at", sql.builder.expr("updated_at"))
        :where("component_id = ?", component_id):run_with(tx):exec()
    if err then
        return (errors.wrap(err, "failed to lock component") :: error)
    end
    if result.rows_affected == 0 then
        return (errors.new({ message = "component not found", kind = errors.NOT_FOUND }) :: error)
    end
    return nil
end

local function set_public_meta(tx: Executor, component_id: string?, fields: any, delete_keys: any?): ({ any }?, boolean, error?)
    if type(component_id) ~= "string" or component_id == "" then
        return nil, false, (errors.new({ message = "component ID is required", kind = errors.INVALID }) :: error)
    end
    if type(fields) ~= "table" then
        return nil, false, (errors.new({ message = "fields table is required", kind = errors.INVALID }) :: error)
    end

    -- Every writer of a component's public meta takes the component row before
    -- any of its meta rows (the touch below re-locks it), so two writers of one
    -- component queue on the component row instead of crossing on meta rows.
    local lock_err = lock_component_tx(tx, component_id)
    if lock_err then return nil, false, lock_err end

    local now_ts = time.now():utc():format_rfc3339()
    local results: { any } = {}
    local changed = false

    if delete_keys ~= nil then
        if type(delete_keys) ~= "table" then
            return nil, false, (errors.new({ message = "delete_keys must be an array", kind = errors.INVALID }) :: error)
        end
        for _, key in ipairs(delete_keys :: { any }) do
            local meta_key_err = validate_public_meta_key(key)
            if meta_key_err then return nil, false, meta_key_err end
            local result, err = sql.builder.delete(component_types.TABLES.META)
                :where("component_id = ?", component_id)
                :where("key = ?", key)
                :run_with(tx):exec()
            if err then
                return nil, false, (errors.wrap(err, "failed to delete metadata") :: error)
            end
            if result.rows_affected and result.rows_affected > 0 then
                changed = true
                results[#results + 1] = {
                    component_id = component_id,
                    key = key,
                    deleted = true,
                    changes_made = true,
                }
            end
        end
    end

    local keys: { string } = {}
    local values: { string } = {}
    for key, value in pairs(fields :: { [any]: any }) do
        local meta_key_err = validate_public_meta_key(key)
        if meta_key_err then return nil, false, meta_key_err end
        local encoded, encode_err = encode_public_meta_value(key, value)
        if encode_err then return nil, false, encode_err end
        keys[#keys + 1] = key
        values[#values + 1] = encoded :: string
    end
    for offset = 1, #keys, 100 do
        local insert = sql.builder.insert(component_types.TABLES.META)
            :columns("meta_id", "component_id", "key", "value", "created_at", "updated_at")
        for index = offset, math.min(#keys, offset + 99) do
            insert = insert:values(uuid.v7(), component_id, keys[index], values[index], now_ts, now_ts)
        end
        local _, write_err = insert
            :suffix("ON CONFLICT (component_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at")
            :run_with(tx):exec()
        if write_err then
            return nil, false, (errors.wrap(write_err, "failed to write metadata") :: error)
        end
        for index = offset, math.min(#keys, offset + 99) do
            changed = true
            results[#results + 1] = {
                component_id = component_id, key = keys[index], value = values[index], changes_made = true,
            }
        end
    end

    if changed then
        local touch_err = touch_component(tx, component_id, now_ts)
        if touch_err then
            return nil, false, touch_err
        end
    end

    return results, changed, nil
end

local function public_meta_tx(tx: Executor, component_id: string?, lock: boolean?): ({ [string]: string }?, error?)
    if not component_id or component_id == "" then
        return nil, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end
    if lock == true then
        local lock_err = lock_component_tx(tx, component_id :: string)
        if lock_err then return nil, lock_err end
    end
    local rows, err = sql.builder.select("key", "value")
        :from(component_types.TABLES.META)
        :where("component_id = ?", component_id)
        :order_by("key ASC")
        :run_with(tx):query()
    if err then
        return nil, (errors.wrap(err, "failed to read component metadata") :: error)
    end

    local out: { [string]: string } = {}
    for _, row in ipairs(rows or {}) do
        if type(row.key) == "string" and row.key ~= "" then
            out[row.key] = row.value
        end
    end
    return out, nil
end

local function raise_meta_floor(tx: Executor, component_id: string, key: string, value: any): (integer?, error?)
    if type(component_id) ~= "string" or component_id == "" or type(key) ~= "string" or key == "" then
        return nil, (errors.new({kind = errors.INVALID, retryable = false,
            message = "component ID and metadata key are required",
            details = {code = "component_meta_floor_identity_required"}}) :: error)
    end
    if type(value) ~= "number" or value < 0 or value == math.huge or value ~= math.floor(value) then
        return nil, (errors.new({kind = errors.INVALID, retryable = false,
            message = "metadata floor requires a nonnegative finite integer",
            details = {code = "component_meta_floor_invalid"}}) :: error)
    end
    local lock_err = lock_component_tx(tx, component_id)
    if lock_err then return nil, lock_err end
    local metadata, read_err = public_meta_tx(tx, component_id)
    if read_err then return nil, read_err end
    local stored = metadata and metadata[key]
    local previous = stored ~= nil and tonumber(stored) or nil
    if stored ~= nil and (previous == nil or previous < 0 or previous == math.huge or previous ~= math.floor(previous)) then
        return nil, (errors.new({kind = errors.INTERNAL, retryable = false,
            message = "stored metadata floor is invalid: " .. key,
            details = {code = "component_meta_floor_corrupt"}}) :: error)
    end
    local floor = math.max(previous or 0, value)
    if previous == floor then return floor :: integer, nil end
    local now = time.now():utc():format_rfc3339()
    local _, write_err = sql.builder.insert(component_types.TABLES.META)
        :set_map({meta_id = uuid.v7(), component_id = component_id, key = key,
            value = tostring(floor), created_at = now, updated_at = now})
        :suffix("ON CONFLICT (component_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at")
        :run_with(tx):exec()
    if write_err then return nil, write_err end
    return floor :: integer, nil
end

-- SET_META payload: { component_id, fields, delete_keys? }. Public metadata and
-- private context commands share the caller's transaction when they are sent in
-- one update batch. This is the atomic seam for edits that span both projections.
local function set_meta(tx: Executor, _db: Executor, command: component_types.Command): (component_types.CommandResult?, error?)
    local payload = command.payload or {}
    local component_id = payload.component_id
    if type(component_id) ~= "string" or component_id == "" then
        return nil, (errors.new({ message = "component ID is required", kind = errors.INVALID }) :: error)
    end
    local results, changed, err = set_public_meta(
        tx,
        component_id,
        payload.fields,
        payload.delete_keys
    )
    if err then return nil, err end
    return {
        component_id = component_id,
        changes_made = changed,
        results = results or {},
    }, nil
end

return {
    raise_meta_floor = raise_meta_floor,
    validate_public_meta_key = validate_public_meta_key,
    encode_public_meta_value = encode_public_meta_value,
    set_public_meta = set_public_meta,
    public_meta_tx = public_meta_tx,
    lock_component_tx = lock_component_tx,
    set_meta = set_meta,
}
