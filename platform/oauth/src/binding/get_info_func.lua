local ctx = require("ctx")
local oauth_read_repo = require("oauth_read_repo")
local oauth_types = require("oauth_types")
local time = require("time")

local function handle(request_dto)
    -- Get component ID from context
    local component_id, err = ctx.get("component_id")
    if err then
        return {
            error = "No component context: " .. err
        }
    end
    if type(component_id) ~= "string" or component_id == "" then
        return {
            error = "No component context: component_id is required"
        }
    end

    -- Read only metadata here; listing/management surfaces must not decrypt
    -- tokens or provider-private OAuth payloads.
    local connection, err = oauth_read_repo.get_connection_metadata(component_id)
    if err then
        return {
            error = "Failed to get connection info: " .. err
        }
    end

    return oauth_types.public_info_from_metadata(connection, nil, time.now():unix())
end

return { handle = handle }
