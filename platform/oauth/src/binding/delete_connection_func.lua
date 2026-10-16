local ctx = require("ctx")
local oauth_repo = require("oauth_repo")
local refresh_schedule = require("refresh_schedule")

local function handle(request_dto)
    -- Get component ID from context
    local component_id, err = ctx.get("component_id")
    if err then
        return {
            success = false,
            error = "No component context: " .. err
        }
    end
    if type(component_id) ~= "string" or component_id == "" then
        return {
            success = false,
            error = "No component context: component_id is required"
        }
    end

    local _, cancel_err = refresh_schedule.cancel(component_id)
    if cancel_err then return { success = false, error = tostring(cancel_err) } end

    -- Delete the OAuth connection and all its data
    local delete_result, delete_err = oauth_repo.delete_connection(component_id)
    if delete_err then
        return {
            success = false,
            error = "Failed to delete OAuth connection: " .. delete_err
        }
    end

    -- Return success according to deletable contract
    return {
        success = true
    }
end

return { handle = handle }
