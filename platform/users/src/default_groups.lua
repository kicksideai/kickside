local contract = require("contract")
local registry = require("registry")

local M = {}

function M.resolve(group_id)
    local groups, seen = {}, {}
    local function append(id)
        if type(id) ~= "string" or id == "" then return nil, "default membership requires group_id" end
        if not seen[id] then seen[id] = true; groups[#groups + 1] = id end
        return true, nil
    end
    if type(group_id) == "string" and group_id ~= "" then append(group_id) end
    local entries, declaration_err = registry.find({[".kind"] = "registry.entry", ["meta.type"] = "kickside.users.default_membership"})
    if declaration_err then return nil, "default membership declarations unavailable: " .. tostring(declaration_err) end
    for _, entry in ipairs(entries or {}) do
        local declaration = entry.data or entry
        if declaration.new_users == true then
            local added, add_err = append(declaration.group_id)
            if not added then return nil, add_err end
        end
    end
    if #groups == 0 then return {}, nil end
    local definition, definition_err = contract.get("kickside.settings:settings")
    if definition_err or not definition then
        return nil, "default membership setting unavailable: " .. tostring(definition_err)
    end
    local settings, open_err = definition:open()
    if open_err or not settings then return nil, "default membership settings open failed: " .. tostring(open_err) end
    local result, read_err = settings:get({ namespace = "kickside.users", key = "join_default_group" })
    if read_err or not result or result.success ~= true or type(result.value) ~= "boolean" then
        return nil, "default membership setting read failed: " .. tostring(read_err or (result and result.error))
    end
    return result.value and groups or {}, nil
end

return M
