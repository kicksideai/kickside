-- Coordinates the two durable writes made by a skill refinement: public component
-- metadata and the skill's immutable version event. These stores are owned behind
-- separate contracts and expose no shared transaction, so a database transaction
-- here would be fake atomicity.
--
-- Metadata is written first because component.set_meta has a deterministic inverse;
-- an appended thread event does not. The append boundary accepts an exact replay of
-- its durable version key and rejects a same-key/different-body collision.

local M = {}
local errors = require("errors")

type Collaborators = {
    get_meta: any,
    set_meta: any,
    append: any,
}

local function restoration(current_meta: any, desired: any): (any, { string })
    local fields: { [string]: any } = {}
    local delete_keys: { string } = {}
    current_meta = type(current_meta) == "table" and current_meta or {}

    for key, _ in pairs(desired :: { [string]: any }) do
        local previous = (current_meta :: { [string]: any })[key]
        if previous == nil then
            table.insert(delete_keys, key)
        else
            fields[key] = previous
        end
    end
    table.sort(delete_keys)
    return fields, delete_keys
end

function M.apply(skill_id: string, desired: any, collaborators: Collaborators): (boolean, error?)
    -- Snapshot before either durable write. Besides making rollback exact, this
    -- proves the component still exists and is readable before the event is tried.
    local current_meta, snapshot_err = collaborators.get_meta(skill_id)
    if snapshot_err or type(current_meta) ~= "table" then
        local cause = errors.wrap(snapshot_err or errors.new({ kind = errors.INTERNAL, message = "invalid metadata snapshot" }), "component metadata preflight failed")
        return false, errors.new({ message = "component metadata preflight failed: " .. tostring(cause),
            kind = cause:kind(), retryable = cause:retryable(), details = cause:details() })
    end
    local restore_fields, delete_keys = restoration(current_meta, desired)

    local meta_ok, meta_err = collaborators.set_meta(skill_id, desired)
    if meta_ok ~= true then
        local cause = errors.wrap(meta_err or errors.new({ kind = errors.INTERNAL, message = "metadata update fails" }), "component metadata update failed")
        return false, errors.new({ message = "component metadata update failed: " .. tostring(cause),
            kind = cause:kind(), retryable = cause:retryable(), details = cause:details() })
    end

    local append_err = collaborators.append()
    if not append_err then return true, nil end

    local rollback_ok, rollback_err = collaborators.set_meta(skill_id, restore_fields, {
        delete_keys = delete_keys,
    })
    if rollback_ok ~= true then
        local message = "append updated failed: " .. tostring(append_err)
            .. "; component metadata rollback failed: " .. tostring(rollback_err or "unknown error")
        local cause = errors.wrap(append_err, "append updated failed")
        return false, errors.new({ message = message, kind = cause:kind(),
            retryable = cause:retryable(), details = cause:details() })
    end
    if type(append_err) == "userdata" then return false, append_err end
    local cause = errors.wrap(append_err, "append updated failed")
    return false, errors.new({ message = "append updated failed: " .. tostring(cause) .. "; component metadata rolled back",
        kind = cause:kind(), retryable = cause:retryable(), details = cause:details() })
end

return M
