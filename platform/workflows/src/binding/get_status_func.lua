local ctx = require("ctx")
local store_state = require("store_state")

local function get_status()
    local meta = ctx.get("meta") or {}
    return {
        description = "workflow: " .. tostring((meta :: any).title or "untitled"),
        updated_at = store_state.now(),
    }
end

return { get_status = get_status }
