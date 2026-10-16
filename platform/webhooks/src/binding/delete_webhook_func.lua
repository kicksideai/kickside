local ctx = require("ctx")
local repo = require("webhook_repo")

local function handle()
    local component_id, ctx_err = ctx.get("component_id")
    if type(component_id) ~= "string" or component_id == "" then
        return { success = false, error = "no component context: " .. tostring(ctx_err) }
    end
    local ok, err = repo.delete_row(component_id)
    if not ok then return { success = false, error = tostring(err or "delete failed") } end
    return { success = true }
end

return { handle = handle }
