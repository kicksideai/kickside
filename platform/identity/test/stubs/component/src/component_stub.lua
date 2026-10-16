-- Minimal kickside.component:component stand-in for the identity harness. The
-- link service only needs list_for_subject to enumerate a user's accessible
-- agents. By default the harness seeds no agents, so the user's set is empty
-- (greeter is always allowed without a component call, and any other agent is
-- rejected); a test that needs a real owned agent seeds one via M._seed and
-- clears it via M._reset.
local M = {}

local owned: { [string]: { string } } = {}

-- Grants subject_id an owned agent component_id, so list_for_subject(subject_id,
-- ...) resolves it -- the seam link_service_test uses to prove user_can_access_agent
-- resolves the same component from both the prefixed and bare agent_id form.
function M._seed(subject_id: string, component_id: string)
    local ids = owned[subject_id] or {}
    ids[#ids + 1] = component_id
    owned[subject_id] = ids
end

function M._reset()
    owned = {}
end

function M.list_for_subject(subject_id: string, _filter: any): (any, any)
    local ids = owned[subject_id]
    if not ids then return {}, nil end
    local rows = {}
    for _, component_id in ipairs(ids) do
        rows[#rows + 1] = { component_id = component_id }
    end
    return rows, nil
end

return M
