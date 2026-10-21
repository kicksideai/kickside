local contract = require("contract")
local registry = require("registry")
local env = require("env")
local storage_types = require("storage_types")
local M = {}

function M.validate(args: any): any
    local value = type(args) == "table" and args.value or nil
    local function invalid(message: string): any return { valid = false, error = message } end
    if type(value) ~= "table" then return invalid("Storage policy must be an object") end
    for key in pairs(value) do
        if key ~= "mode" and key ~= "resource_id" and key ~= "prefix" then return invalid("Unknown storage policy field") end
    end
    if value.mode ~= "local" and value.mode ~= "s3" then return invalid("Choose local or S3 storage") end
    if type(value.resource_id) ~= "string" or type(value.prefix) ~= "string" then return invalid("Storage resource and prefix are required strings") end
    if #value.prefix == 0 or #value.prefix > 256 or value.prefix:sub(1, 1) == "/" or value.prefix:sub(-1) == "/"
        or value.prefix:find("[^%w_/%-%.]") or value.prefix:find("//", 1, true) then
        return invalid("Use a relative object prefix of 1–256 letters, numbers, slashes, dots, dashes, or underscores")
    end
    for segment in value.prefix:gmatch("[^/]+") do
        if segment == "." or segment == ".." then return invalid("Prefix cannot contain dot path segments") end
    end
    if value.mode == "s3" then
        local configured = env.get("kickside.uploads.env:storage_s3")
        if value.resource_id ~= configured then return invalid("Select the host-configured upload S3 resource") end
        local entry = registry.get(value.resource_id)
        if not entry or entry.kind ~= "cloudstorage.s3" then return invalid("Select a configured native S3 storage resource") end
    end
    return { valid = true }
end

function M.get(): (storage_types.Policy?, any?)
    local definition, contract_err = contract.get("kickside.settings:settings")
    if contract_err or not definition then return nil, contract_err or "Settings unavailable" end
    local settings, open_err = definition:open()
    if open_err or not settings then return nil, open_err or "Settings unavailable" end
    local result, get_err = settings:get({ namespace = "kickside.uploads.storage", key = "policy" })
    if get_err or not result or result.success ~= true then return nil, get_err or "Storage policy unavailable" end
    local checked = M.validate({ value = result.value })
    if not checked.valid then return nil, checked.error end
    return result.value, nil
end

-- Consumers read the owner's committed runtime projection. Only the controller
-- reads durable configuration and provisions native resources.
function M.current(): (storage_types.Policy?, any?)
    local entry, err = registry.get("kickside.uploads.storage.runtime:policy")
    if err or not entry or type(entry.data) ~= "table" then
        return nil, errors.new({ message = "Storage controller has not applied its configuration",
            kind = errors.UNAVAILABLE, retryable = true })
    end
    return entry.data, nil
end

return M
