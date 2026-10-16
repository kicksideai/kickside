local automations_lib = require("automations_lib")

-- runtime_reader contract surface: the authority an event-driven runtime (a
-- gateway hub/worker) asks for installed automations together with their
-- engine-owned execution identity ({ actor_id, actor_context }), so it can
-- reconstruct that identity and run each automation as its installer.
-- Thin delegation to automations_lib.list_runtime/get_runtime; opened without an
-- actor for a trusted system read, or with_actor for an access-scoped read.
local M = {}

function M.list_runtime(args: any): any
    local list, err = automations_lib.list_runtime(type(args) == "table" and args or {})
    if err then return { success = false, error = tostring(err) } end
    return { success = true, automations = list or {} }
end

function M.get_runtime(args: any): any
    local item, err = automations_lib.get_runtime(type(args) == "table" and args or {})
    if err then return { success = false, error = tostring(err) } end
    return { success = true, automation = item }
end

return M
