-- Realtime broadcast for definition-plane edits. After a batch persists, its events
-- (each with seq) are pushed to every user holding READ on the workflow via the
-- component's grant-resolved fanout (component.notify_access). The topic is
-- workflow.<workflow_id>; clients optimistic-apply their own HTTP response and filter
-- WS deltas by seq. The audience comes from the workflow component's stored
-- grants; a refused delivery is returned to the writer after its commit.

local component = require("component")
local types = require("types")

local M = {}

function M.broadcast(workflow_id: string, events: any): error?
    if type(workflow_id) ~= "string" or workflow_id == "" then return nil end
    if type(events) ~= "table" or #events == 0 then return nil end
    local topic = types.REALTIME_TOPIC_PREFIX .. workflow_id
    local _, notify_err = component.notify_access(
        workflow_id,
        topic,
        { workflow_id = workflow_id, events = events },
        { access_mask = component.ACCESS.READ }
    )
    return notify_err
end

return M
