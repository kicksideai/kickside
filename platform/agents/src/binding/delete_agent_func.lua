-- Deletable-contract implementation for user agents. An agent is a
-- self-contained component (model + prompt + traits live in its own row and
-- private_context) that owns no external resources, so there is nothing to tear
-- down here: the component service unregisters the row, access grants, and meta
-- after this returns. The hook exists so future agent-owned resources have a
-- cleanup point.
local function handle(request_dto: any): any
    return { success = true }
end

return { handle = handle }
