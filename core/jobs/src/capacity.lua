-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local contract = require("contract")
local registry = require("registry")

local M = {}

M.META = "meta.job_capacity"
local SETTINGS_CONTRACT = "kickside.settings:settings"

local function invalid(message: string): error
    return (errors.new({ message = "job capacity " .. message, kind = errors.INVALID, retryable = false }) :: error)
end

local function unavailable(message: string, cause: error?): error
    if cause then return errors.wrap(cause, message) end
    return (errors.new({ message = message, kind = errors.UNAVAILABLE, retryable = true }) :: error)
end

local function string_field(value: any, path: string): (string?, error?)
    if type(value) ~= "string" or value == "" then return nil, invalid(path .. " is required") end
    return value, nil
end

local function entry_meta(entry: any): table?
    if type(entry) ~= "table" then return nil end
    if type((entry :: any).meta) == "table" then return (entry :: any).meta end
    local data = (entry :: any).data
    if type(data) == "table" and type((data :: any).meta) == "table" then return (data :: any).meta end
    return nil
end

local function parse(value: any): (table?, error?)
    if value == nil then return nil, nil end
    if type(value) ~= "table" then return nil, invalid(M.META .. " must be an object") end
    local raw = value :: any
    local group, group_err = string_field(raw.group, M.META .. ".group")
    if group_err then return nil, group_err end
    if type(raw.settings) ~= "table" then return nil, invalid(M.META .. ".settings is required") end
    local settings = raw.settings :: any
    local namespace, namespace_err = string_field(settings.namespace, M.META .. ".settings.namespace")
    if namespace_err then return nil, namespace_err end
    local global_key, global_key_err = string_field(settings.global_limit_key, M.META .. ".settings.global_limit_key")
    if global_key_err then return nil, global_key_err end
    local key_key, key_key_err = string_field(settings.concurrency_key_limit_key,
        M.META .. ".settings.concurrency_key_limit_key")
    if key_key_err then return nil, key_key_err end
    return { group = group, settings = { namespace = namespace, global_limit_key = global_key,
        concurrency_key_limit_key = key_key } }, nil
end

-- Missing workers remain unconfigured because dispatch owns target validation.
function M.descriptor(worker_ref: any): (table?, error?)
    if type(worker_ref) ~= "string" or worker_ref == "" then return nil, nil end
    local entry, lookup_err = registry.get(worker_ref)
    if lookup_err then
        if errors.is(lookup_err, errors.NOT_FOUND) then return nil, nil end
        return nil, errors.wrap(lookup_err, "job capacity worker lookup failed: " .. worker_ref)
    end
    if not entry then return nil, nil end
    local meta = entry_meta(entry)
    return parse(meta and (meta :: any).job_capacity or nil)
end

function M.admit(worker_ref: any, concurrency_key: any): (table?, error?)
    local descriptor, descriptor_err = M.descriptor(worker_ref)
    if descriptor_err or not descriptor then return descriptor, descriptor_err end
    if type(concurrency_key) ~= "string" or concurrency_key == "" then
        return nil, invalid("workers declaring " .. M.META .. " require concurrency_key")
    end
    return descriptor, nil
end

local function same_settings(left: table, right: table): boolean
    return left.group == right.group and left.settings.namespace == right.settings.namespace
        and left.settings.global_limit_key == right.settings.global_limit_key
        and left.settings.concurrency_key_limit_key == right.settings.concurrency_key_limit_key
end

-- group(job) verifies that all entries in a group name the same Settings values.
function M.group(job: any): (table?, error?)
    if type(job) ~= "table" or type((job :: any).capacity_group) ~= "string"
        or (job :: any).capacity_group == "" then return nil, nil end
    local worker_ref = (job :: any).worker_ref or (job :: any).job_type
    local descriptor, descriptor_err = M.descriptor(worker_ref)
    if descriptor_err then return nil, descriptor_err end
    if not descriptor or descriptor.group ~= (job :: any).capacity_group then
        return nil, invalid("declaration does not match admitted group " .. tostring((job :: any).capacity_group))
    end
    local entries, find_err = registry.find({ [M.META .. ".group"] = descriptor.group })
    if find_err then return nil, errors.wrap(find_err, "job capacity group lookup failed: " .. descriptor.group) end
    for _, entry in ipairs(entries or {}) do
        local meta = entry_meta(entry)
        local member, member_err = parse(meta and (meta :: any).job_capacity or nil)
        if member_err then return nil, member_err end
        if member and member.group == descriptor.group and not same_settings(descriptor, member) then
            return nil, invalid("group " .. descriptor.group .. " has inconsistent settings")
        end
    end
    return descriptor, nil
end

local function integer(value: any, name: string): (integer?, error?)
    local number = tonumber(value)
    if not number or number ~= math.floor(number) or number < 1 or number > 1000000 then
        return nil, invalid(name .. " must be an integer in [1, 1000000]")
    end
    return math.floor(number) :: integer, nil
end

local function setting(instance: any, namespace: string, key: string): (integer?, error?)
    local response, read_err = instance:get({ namespace = namespace, key = key })
    if read_err then return nil, unavailable("job capacity setting read failed: " .. key, read_err) end
    if type(response) ~= "table" or (response :: any).success ~= true then
        return nil, unavailable("job capacity setting read failed: " .. key, nil)
    end
    return integer((response :: any).value, key)
end

-- A declared capacity never falls back when Settings is unavailable or malformed.
function M.limits(descriptor: table): (table?, error?)
    local definition, definition_err = contract.get(SETTINGS_CONTRACT)
    if definition_err or not definition then
        return nil, unavailable("job capacity Settings contract unavailable", definition_err)
    end
    local instance, open_err = definition:open()
    if open_err or not instance then
        return nil, unavailable("job capacity Settings contract open failed", open_err)
    end
    local settings = descriptor.settings
    local global_limit, global_err = setting(instance, settings.namespace, settings.global_limit_key)
    if global_err then return nil, global_err end
    local key_limit, key_err = setting(instance, settings.namespace, settings.concurrency_key_limit_key)
    if key_err then return nil, key_err end
    return { global_limit = global_limit, concurrency_key_limit = key_limit }, nil
end

return M
