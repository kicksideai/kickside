-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local registry = require("registry")
local security = require("security")
local funcs = require("funcs")
local M = {}
local TYPE = "kickside.execution.maintenance_actor"
type Keys = {[string]: boolean}

function M.read_from(entries: any): (Keys?, error?)
    local declarations, find_err = entries.find({[".kind"] = "registry.entry", ["meta.type"] = TYPE})
    if find_err then return nil, find_err :: error end
    local keys: Keys = {}
    for _, entry in ipairs(declarations) do
        local key = entry.meta.actor_id
        if type(key) ~= "string" or not key:match("^system:[%w_.%-]+$") then
            return nil, errors.new({kind = errors.INVALID,
                message = "invalid maintenance actor declaration: " .. tostring(entry.id)})
        end
        keys[key] = true
    end
    return keys, nil
end

local function trusted_read(): (Keys?, error?)
    local policy, policy_err = security.policy("kickside.execution:maintenance_declarations_read")
    if policy_err then return nil, policy_err end
    local scope, scope_err = security.new_scope({policy})
    if scope_err then return nil, scope_err end
    local executor, executor_err = funcs.new()
    if executor_err then return nil, executor_err end
    local bound, bind_err = executor:with_scope(scope)
    if bind_err then return nil, bind_err end
    local keys, read_err = bound:call("kickside.execution:read_maintenance_actor")
    return keys :: Keys?, read_err
end

function M.new(entries: any): any
    local cached_version: string? = nil
    local keys: Keys = {}
    return {contains = function(actor_id: string): (boolean?, error?)
        local version, version_err = entries.current_version()
        if version_err then return nil, version_err :: error end
        local id = tostring(version:id())
        if cached_version ~= id then
            local next_keys, read_err = entries.read()
            if read_err then return nil, read_err :: error end
            keys, cached_version = next_keys, id
        end
        return keys[actor_id] == true, nil
    end}
end

function M.read(): (Keys?, error?)
    return M.read_from(registry)
end

M.contains = M.new({current_version = registry.current_version, read = trusted_read}).contains
return M
