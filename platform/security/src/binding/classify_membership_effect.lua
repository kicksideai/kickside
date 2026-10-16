local registry = require("registry")
local security = require("security")
local policy_groups = require("policy_groups")
local error_envelope = require("error_envelope")

local function invalid(message, field)
    return nil, errors.new({kind = errors.INVALID, message = message, retryable = false,
        details = {code = "membership_change_invalid", field = field}})
end

local function groups(value, field)
    if type(value) ~= "table" then return invalid("groups must be an array", field) end
    local selected = {}
    for _, id in ipairs(value) do
        if type(id) ~= "string" or id == "" then return invalid("group id is required", field) end
        selected[id] = true
    end
    return selected, nil
end

local function new(dependencies: {fingerprint: ((any) -> (any?, error?))}?): any
    local fingerprint = dependencies and dependencies.fingerprint or policy_groups.fingerprint

    local function classify(args)
        if not security.can("funcs.call", "kickside.security.binding:classify_membership_effect") then
            return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "membership classification requires runtime authority"})
        end
        if type(args) ~= "table" then return invalid("membership change is required", "change") end
        local before, before_err = groups(args.before_groups, "before_groups")
        if before_err then return nil, before_err end
        local after, after_err = groups(args.after_groups, "after_groups")
        if after_err then return nil, after_err end
        local snapshot, snapshot_err = registry.snapshot()
        if snapshot_err or not snapshot then
            return nil, errors.new({kind = errors.UNAVAILABLE, message = tostring(snapshot_err or "registry snapshot unavailable")})
        end
        local revision = tostring(snapshot:version():id())
        local old, new = {}, {}
        -- Native group bindings include Security's projected compositions. Compare
        -- policy bytes, so duplicate bindings do not make a redundant grant a loss.
        for _, entry in ipairs(snapshot:find({[".kind"] = "security.policy"})) do
            local was, becomes = false, false
            for _, id in ipairs(entry.data.groups or {}) do
                was = was or before[id] == true
                becomes = becomes or after[id] == true
            end
            if was or becomes then
                local policy, policy_err = fingerprint(entry.data.policy)
                if policy_err then
                    return nil, (errors.new({kind = errors.UNAVAILABLE, message = policy_err:message(),
                        retryable = policy_err:retryable(), details = {cause = error_envelope.encode(policy_err)} :: { [string]: any }}) :: error)
                end
                if was then old[policy.digest] = policy end
                if becomes then new[policy.digest] = policy end
            end
        end
        local change = policy_groups.compare(old, new)
        -- Membership also supplies component ACL authority. Removing a group
        -- reduces that authority even when its native grants are redundant.
        for id in pairs(before) do
            if not after[id] then change.changed, change.reduced = true, true end
        end
        for id in pairs(after) do
            if not before[id] then change.changed = true end
        end
        return {effect = change.reduced and "reduction" or (change.changed and "allow_only" or "unchanged"),
            revision = revision}, nil
    end

    return {classify = classify}
end

local default = new()
default.new = new
return default
