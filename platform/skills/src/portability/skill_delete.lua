-- Skill's kickside.contract:deletable adapter. By canon a skill's history IS its
-- component's primary thread (thread_id == skill_id), reaped by the component-driven
-- delete cascade (teardown purges the primary thread). So the only separate data this
-- deletable owns is the skill's bundle of file bytes. delete_component on a skill
-- cascades cleanly.

local ctx = require("ctx")
local bundle_store = require("bundle_store")

local function handle(request_dto)
    local component_id, err = ctx.get("component_id")
    if err or not component_id then
        return { success = false, error = "no component context" }
    end
    local remove_err = bundle_store.remove(tostring(component_id))
    if remove_err then return { success = false, error = "bundle: " .. tostring(remove_err) } end
    return { success = true }
end

return { handle = handle }
