-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local production_contract = require("contract")
local production_registry = require("registry")
local job_types = require("job_types")

type CapacitySettings = {namespace: string, global_limit_key: string, concurrency_key_limit_key: string}
type Descriptor = {group: string, settings: CapacitySettings}
type Limits = {global_limit: integer, concurrency_key_limit: integer}

local function new(runtime: {contract: any?, registry: any?}): table
    local contract = runtime.contract or production_contract
    local registry = runtime.registry or production_registry

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

    local function parse(value: any): (Descriptor?, error?)
        if value == nil then return nil, nil end
        if type(value) ~= "table" then return nil, invalid("worker metadata must be an object") end
        local raw = value :: any
        if raw.job_capacity == nil and raw.job_capacity_settings == nil then return nil, nil end
        local group, group_err = string_field(raw.job_capacity, M.META)
        if group_err then return nil, group_err end
        if type(raw.job_capacity_settings) ~= "table" then return nil, invalid("meta.job_capacity_settings is required") end
        local settings = raw.job_capacity_settings :: any
        local namespace, namespace_err = string_field(settings.namespace, "meta.job_capacity_settings.namespace")
        if namespace_err then return nil, namespace_err end
        local global_key, global_key_err = string_field(settings.global_limit_key, "meta.job_capacity_settings.global_limit_key")
        if global_key_err then return nil, global_key_err end
        local key_key, key_key_err = string_field(settings.concurrency_key_limit_key,
            "meta.job_capacity_settings.concurrency_key_limit_key")
        if key_key_err then return nil, key_key_err end
        return { group = group, settings = { namespace = namespace, global_limit_key = global_key,
            concurrency_key_limit_key = key_key } }, nil
    end

    -- Missing workers remain unconfigured because dispatch owns target validation.
    function M.descriptor(worker_ref: any): (Descriptor?, error?)
        local reference = job_types.worker_reference(worker_ref)
        if not reference or reference.worker_ref == job_types.WAKE_CONTINUATION_TYPE then return nil, nil end
        local entry, lookup_err = registry.get(reference.target_id)
        if lookup_err then
            if errors.is(lookup_err, errors.NOT_FOUND) then return nil, nil end
            return nil, errors.wrap(lookup_err, "job capacity worker lookup failed: " .. reference.target_id)
        end
        if not entry then return nil, nil end
        local meta = entry_meta(entry)
        return parse(meta)
    end

    function M.admit(worker_ref: any, concurrency_key: any): (Descriptor?, error?)
        local descriptor, descriptor_err = M.descriptor(worker_ref)
        if descriptor_err or not descriptor then return descriptor, descriptor_err end
        if type(concurrency_key) ~= "string" or concurrency_key == "" then
            return nil, invalid("workers declaring " .. M.META .. " require concurrency_key")
        end
        return descriptor, nil
    end

    local function same_settings(left: Descriptor, right: Descriptor): boolean
        return left.group == right.group and left.settings.namespace == right.settings.namespace
            and left.settings.global_limit_key == right.settings.global_limit_key
            and left.settings.concurrency_key_limit_key == right.settings.concurrency_key_limit_key
    end

    -- group(job) verifies that all entries in a group name the same Settings values.
    function M.group(job: any): (Descriptor?, error?)
        if type(job) ~= "table" then return nil, nil end
        local worker_ref = (job :: any).worker_ref or (job :: any).job_type
        local descriptor, descriptor_err = M.admit(worker_ref, (job :: any).concurrency_key)
        if descriptor_err then return nil, descriptor_err end
        if not descriptor then
            if job.capacity_group ~= nil then return nil, invalid("admitted worker no longer declares capacity") end
            return nil, nil
        end
        local stored_group = (job :: any).capacity_group
        if stored_group ~= nil and (type(stored_group) ~= "string" or stored_group == "") then
            return nil, invalid("admitted group is malformed")
        end
        if stored_group ~= nil and descriptor.group ~= stored_group then
            return nil, invalid("declaration does not match admitted group " .. tostring((job :: any).capacity_group))
        end
        local entries, find_err = registry.find({ [M.META] = descriptor.group })
        if find_err then return nil, errors.wrap(find_err, "job capacity group lookup failed: " .. descriptor.group) end
        for _, entry in ipairs(entries or {}) do
            local meta = entry_meta(entry)
            local member, member_err = parse(meta)
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
    function M.limits(descriptor: Descriptor): (Limits?, error?)
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

    -- A claim/backlog operation observes one declaration catalog and reads each
    -- active group's live limits once. Nothing is retained between operations.
    function M.snapshot(): table
        local entries: { [string]: table }? = nil
        local declarations: { [string]: Descriptor | boolean } = {}
        local validated: { [string]: boolean } = {}
        local resolved_limits: { [string]: Limits } = {}
        local snapshot: table = {}
        local function load(): error?
            if entries ~= nil then return nil end
            local found, err = registry.find({ ["~" .. M.META] = ".+" })
            if err then return errors.wrap(err, "job capacity catalog lookup failed") end
            entries = {}
            for _, entry in ipairs(found or {}) do
                local meta = entry_meta(entry)
                local id = tostring(entry.id)
                if not meta or type(meta.job_capacity) ~= "string" or id == "" or id == "nil" then
                    return invalid("catalog entry is malformed")
                end
                entries[id] = meta
            end
            return nil
        end
        function snapshot.catalog(): ({ [string]: string }?, error?)
            local err = load()
            if err then return nil, err end
            local catalog: { [string]: string } = {}
            for id, meta in pairs(entries) do catalog[id] = meta.job_capacity end
            return catalog, nil
        end
        function snapshot.descriptor(worker: any): (Descriptor?, error?)
            local err = load()
            if err then return nil, err end
            local reference = job_types.worker_reference(worker)
            if not reference then return nil, nil end
            worker = reference.target_id
            local cached = declarations[worker]
            if cached == false then return nil, nil end
            if cached ~= nil then return cached :: Descriptor, nil end
            local descriptor: Descriptor? = nil
            local descriptor_err: error? = nil
            if entries[worker] then
                descriptor, descriptor_err = parse(entries[worker])
            else
                descriptor, descriptor_err = M.descriptor(worker)
                if descriptor and not descriptor_err then
                    return nil, unavailable("job capacity declarations changed during the operation", nil)
                end
            end
            if descriptor_err then return nil, descriptor_err end
            declarations[worker] = descriptor or false
            return descriptor, nil
        end
        function snapshot.group(job: any): (Descriptor?, error?)
            local descriptor, err = snapshot.descriptor(job.worker_ref or job.job_type)
            if err then return nil, err end
            if not descriptor then
                if job.capacity_group ~= nil then return nil, invalid("admitted worker no longer declares capacity") end
                return nil, nil
            end
            if type(job.concurrency_key) ~= "string" or job.concurrency_key == "" then
                return nil, invalid("workers declaring " .. M.META .. " require concurrency_key")
            end
            if job.capacity_group ~= nil and job.capacity_group ~= descriptor.group then
                return nil, invalid("declaration does not match admitted group " .. tostring(job.capacity_group))
            end
            if not validated[descriptor.group] then
                for id, meta in pairs(entries) do
                    if meta.job_capacity == descriptor.group then
                        local member, member_err = snapshot.descriptor(id)
                        if member_err then return nil, member_err end
                        if not same_settings(descriptor, member) then
                            return nil, invalid("group " .. descriptor.group .. " has inconsistent settings")
                        end
                    end
                end
                validated[descriptor.group] = true
            end
            return descriptor, nil
        end
        function snapshot.limits(descriptor: Descriptor): (Limits?, error?)
            if resolved_limits[descriptor.group] then return resolved_limits[descriptor.group], nil end
            local value, err = M.limits(descriptor)
            if err then return nil, err end
            resolved_limits[descriptor.group] = value
            return value, nil
        end
        return snapshot
    end

    M.new = new
    return M
end

return new({})
