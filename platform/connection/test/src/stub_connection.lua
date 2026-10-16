-- Stub per-provider connection binding handlers for the harness.
--
-- In the live app each provider plugin (jira, confluence, discord, …)
-- implements kickside.connection:connection. The connection module under test
-- only owns the registry that resolves a provider name to such a binding and
-- delegates to it. These stubs stand in for the plugins so the registry suites
-- can register/find/delete connections without any live provider.

local ctx = require("ctx")

local M = {}

type StatusResult = { success: boolean?, status: string?, error: string? }
type SimpleResult = { success: boolean }
type ResourceResult = { resources: { any } }

function M.get_status(args: any): (StatusResult?, string?)
    local component_id = ctx.get("component_id")
    if not component_id or component_id == "" then
        return nil, "component_id not in scope"
    end
    return { success = true, status = "connected" }, nil
end

function M.test_connection(args: any): (SimpleResult, nil)
    return { success = true }, nil
end

function M.discover_resources(args: any): (ResourceResult, nil)
    return { resources = {} }, nil
end

-- deletable contract: the component service delegates plugin-side cleanup here
-- before unregistering the component. A stub provider has no external state.
function M.delete(args: any): (SimpleResult, nil)
    return { success = true }, nil
end

return M
