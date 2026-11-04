local sql = require("sql")
local time = require("time")
local security = require("security")
local component_types = require("component_types")
local persisted_json = require("persisted_json")
local teardown = require("teardown")
local error_envelope = require("error_envelope")

local M = {}

local function continue_page(id: string, err: any): any?
    if type(err) ~= "userdata" or not errors.is(err, errors.CONFLICT) then return nil end
    local pending, continuation = teardown.cleanup_pending(err)
    if not pending or not continuation then return nil end
    return {success = true, component_id = id, deleted = false,
        rearm = time.now():utc():format_rfc3339(), discarded = err:details().discarded}
end

function M.run(input: any): (any?, error?)
    local id = type(input) == "table" and type(input.payload) == "table" and input.payload.component_id or nil
    if type(id) ~= "string" or id == "" then
        return nil, errors.new({message = "component deletion job requires component_id", kind = errors.INVALID, retryable = false})
    end
    local db, open_err = sql.get(component_types.db_id())
    if open_err then return nil, open_err end
    local rows, read_err = db:query("SELECT impl_id,private_context,deleting_at,delete_intent FROM kickside_components WHERE component_id=$1", {id})
    read_err = error_envelope.cleanup(function(): (any, error?) return db:release() end, read_err, "release component deletion database")
    if read_err then return nil, read_err end
    if type(rows) ~= "table" then
        return nil, errors.new({message = "component deletion read returns no rows", kind = errors.INTERNAL})
    end
    local row = rows[1]
    if row == nil then return {success = true, deleted = true} end
    if row.deleting_at == nil or row.delete_intent == nil then
        return nil, errors.new({message = "component deletion intent is absent", kind = errors.INVALID, retryable = false})
    end
    local intent, intent_err = persisted_json.decode_table(row.delete_intent, "component.delete_intent")
    if intent_err then return nil, intent_err end
    local context, context_err = persisted_json.decode_table(row.private_context, "component.private_context")
    if context_err then return nil, context_err end
    local declared, cleaned, cleanup_err, cleanup_result = teardown.run_deletable({impl_id = row.impl_id, private_context = context},
        security.actor(), security.scope(), id, intent.options)
    if declared and not cleaned then
        local continued = continue_page(id, cleanup_err)
        if continued then return continued end
        if type(cleanup_err) == "userdata" then return nil, cleanup_err end
        return nil, errors.new({message = "component cleanup failed: " .. tostring(cleanup_err), kind = errors.INTERNAL, retryable = true})
    end
    local result, step, unregister_err = teardown.unregister(id, intent.child_policy)
    if step then
        if step == "pending" or step == "purge" then
            local continued = continue_page(id, unregister_err)
            if continued then return continued end
        end
        return nil, unregister_err
    end
    return {success = true, component_id = id, deleted = result.deleted == true,
        discarded = type(cleanup_result) == "table" and cleanup_result.discarded or nil,
        thread_discarded = result.thread_discarded, thread_notified = result.thread_notified}
end

return M
