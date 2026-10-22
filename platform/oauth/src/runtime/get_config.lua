local component = require("component")
local repo = require("repo")
local oauth_types = require("oauth_types")

local function handle(args: any): (oauth_types.ProviderConfig?, error?)
    local id = type(args) == "table" and args.component_id or nil
    if type(id) ~= "string" or id == "" then
        return nil, errors.new({kind=errors.INVALID, message="component_id is required"})
    end
    local _, access_err = component.validate_access(id, component.ACCESS.READ)
    if access_err then return nil, access_err end
    return repo.get_provider_config(id)
end

return {handle=handle}
