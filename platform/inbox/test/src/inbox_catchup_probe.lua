local contract = require("contract")
local security = require("security")
local component = require("component")

local addressed = require("addressed")

local M = {}

function M.run(input: any?): (any?, any?)
    local actor, scope = security.actor(), security.scope()
    if not actor or not scope then return nil, "authenticated actor and scope are required" end
    local thread_id = type(input) == "table" and input.component_id
        or component.singleton_component_id(tostring(actor:id()), "kickside.inbox")
    if not thread_id then return nil, "inbox thread id is unavailable" end
    local definition, definition_err = contract.get("kickside.core:threads")
    if definition_err or not definition then return nil, definition_err or "threads contract is unavailable" end
    local threads, open_err = (definition :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not threads then return nil, open_err or "threads contract did not open" end
    local result, catchup_err = { last_seq = 0, event_count = 0 }, nil
    if threads:find({ thread_id = thread_id }) then
    result, catchup_err = threads:catch_up_projection({
        thread_id = thread_id,
        kind = "kickside.inbox:items",
        projection_key = "default",
        cursor_key = "default",
        max_ticks = 1000,
    })
    end
    if catchup_err or type(result) ~= "table" then return nil, catchup_err or "catch-up returned no result" end
    local last_seq = tonumber(result.last_seq) or 0
    local event_count = tonumber(result.event_count) or 0
    if last_seq < event_count then
        return nil, "catch-up incomplete: last_seq=" .. tostring(last_seq)
            .. " event_count=" .. tostring(event_count)
            .. " reason=" .. tostring(result.reason)
            .. " error=" .. tostring(result.error)
            .. " skipped=" .. tostring(result.skipped)
            .. " stale=" .. tostring(result.stale)
    end
    local store_actor = assert(security.new_actor("system:kickside.inbox.addressed", {}))
    local store_scope = assert(security.new_scope({ assert(security.policy("app:addressed_runtime")) }))
    local store = assert(definition:with_actor(store_actor):with_scope(store_scope):open())
    local ids = addressed.group_inboxes() or {}
    ids[#ids + 1] = addressed.component_id({ kind = "user", id = actor:id() })
    for _, id in ipairs(ids) do
        if store:find({ thread_id = id }) then
            local _, private_err = store:catch_up_projection({ thread_id = id, kind = "kickside.inbox:items",
                projection_key = "default", cursor_key = "default", max_ticks = 1000 })
            if private_err then return nil, private_err end
        end
    end
    return result, nil
end

return M
