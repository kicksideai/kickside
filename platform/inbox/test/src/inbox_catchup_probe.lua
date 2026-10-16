local contract = require("contract")
local security = require("security")
local component = require("component")

local M = {}

function M.run(): (any?, any?)
    local actor, scope = security.actor(), security.scope()
    if not actor or not scope then return nil, "authenticated actor and scope are required" end
    local thread_id = component.singleton_component_id(tostring(actor:id()), "kickside.inbox")
    if not thread_id then return nil, "inbox thread id is unavailable" end
    local definition, definition_err = contract.get("kickside.core:threads")
    if definition_err or not definition then return nil, definition_err or "threads contract is unavailable" end
    local threads, open_err = (definition :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not threads then return nil, open_err or "threads contract did not open" end
    local result, catchup_err = threads:catch_up_projection({
        thread_id = thread_id,
        kind = "kickside.inbox:items",
        projection_key = "default",
        cursor_key = "default",
        max_ticks = 1000,
    })
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
    return result, nil
end

return M
