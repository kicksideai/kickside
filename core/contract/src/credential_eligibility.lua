local registry = require("registry")
local funcs = require("funcs")
local M = {}

function M.new(dependencies)
    local entries, calls = dependencies.registry, dependencies.funcs
    local function invoke(target, identifier, boundary)
        local eligible, err = calls.call(target, {identifier = identifier})
        if err then return nil, err end
        if eligible ~= true then
            return nil, errors.new({kind = errors.INTERNAL, retryable = false,
                message = boundary .. " returns an invalid result"})
        end
        return true, nil
    end
    return {check = function(config_id, identifier)
        local config, config_err = entries.get(config_id)
        if config_err then return nil, config_err end
        local target = config.meta.credential_eligibility
        local hosts, host_err = entries.find({[".id"] = "kickside.contract:host_credential_eligibility"})
        if host_err then return nil, host_err end
        local guarded = #hosts > 0 and hosts[1].meta.credential_eligibility ~= ""
        if guarded then
            local eligible, err = invoke("kickside.contract:host_credential_eligibility", identifier, "host credential eligibility")
            if not eligible then return nil, err end
        end
        if target == nil or target == "" then return true, nil, guarded end
        local eligible, err = invoke(target, identifier, "credential eligibility guard")
        if not eligible then return nil, err end
        return true, nil, true
    end}
end

M.check = M.new({registry = registry, funcs = funcs}).check
return M
