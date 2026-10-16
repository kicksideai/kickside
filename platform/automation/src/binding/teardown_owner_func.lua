local automations_lib = require("automations_lib")

local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- The automation that declared ownership of a resource cannot outlive it: it goes
-- down through the shared delete dispatch, and its failure is reported so a
-- partial teardown is never mistaken for a clean one.
function M.teardown_owner(args: any): (any, any?)
    args = type(args) == "table" and args or {}
    local resource_kind = trim(args.resource_kind)
    local resource_id = trim(args.resource_id)
    if resource_kind == "" or resource_id == "" then
        return { found = false, owner_ids = {}, error = "resource_kind and resource_id are required" }, nil
    end

    local owner_id, find_err = automations_lib.find_owner_by_resource(resource_kind, resource_id)
    if find_err then
        return { found = false, owner_ids = {}, error = tostring(find_err) }, nil
    end
    if owner_id == nil or owner_id == "" then
        return { found = false, owner_ids = {} }, nil
    end
    local owner_ids = { owner_id }

    local results: { any } = {}
    local failures: { string } = {}
    for _, owner_id in ipairs(owner_ids) do
        local result, delete_err = automations_lib.delete_automation(owner_id, args.options)
        if delete_err then
            failures[#failures + 1] = tostring(owner_id) .. ": " .. tostring(delete_err)
        else
            results[#results + 1] = result
        end
    end
    if #failures > 0 then
        return {
            found = true,
            owner_ids = owner_ids,
            results = results,
            error = table.concat(failures, "; "),
        }, nil
    end

    return {
        found = true,
        owner_ids = owner_ids,
        results = results,
    }, nil
end

return M
