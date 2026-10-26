local test = require("test")
local policy_groups = require("policy_groups")
local consts = require("security_consts")
local canonical_json = require("canonical_json")

local SOURCE = "app:retained_source"
local BINDING = consts.CUSTOM_SCOPE_NS .. ".bindings:6170703a72657461696e65645f736f75726365"

local function source(resource)
    return {id = SOURCE, kind = "security.policy", meta = {}, data = {groups = {},
        policy = {actions = "access", resources = resource, effect = "allow"}}}
end

local function binding()
    return {id = BINDING, kind = "security.policy", meta = {private = true,
        managed_by = consts.MANAGED_BY, scope_projection_policy = SOURCE},
        data = {groups = {"app:previous_group"},
            policy = {actions = "access", resources = "app:previous_resource", effect = "allow"}}}
end

local function projected(entries, id)
    for _, entry in ipairs(entries) do
        if entry.id == id then return entry end
    end
    error("projected entry is missing " .. id)
end

local function plan(entries)
    local result, err = policy_groups.plan({}, {}, {find = function() return entries end})
    test.is_nil(err)
    test.not_nil(result)
    return result
end

local function define_tests()
    test.describe("captured projected policy continuity", function()
        test.it("retains a covering bundle instead of several equivalent fragments", function()
            local entries = {{id = "app:a_bundle", kind = "security.policy", meta = {}, data = {
                policy = {actions = {"read", "write"}, resources = {"left", "right"}, effect = "allow"}}}}
            for _, action in ipairs({"read", "write"}) do
                for _, resource in ipairs({"left", "right"}) do
                    entries[#entries + 1] = {id = "app:fragment_" .. action .. "_" .. resource,
                        kind = "security.policy", meta = {}, data = {
                            policy = {actions = action, resources = resource, effect = "allow"}}}
                end
            end
            local ids, effective = {}, {}
            for _, item in ipairs(entries) do ids[#ids + 1] = item.id; effective[item.id] = true end
            local result, err = policy_groups.plan({["app:composed_group"] = ids},
                {["app:composed_group"] = effective}, {find = function() return entries end})
            test.is_nil(err)
            local assigned = {}
            for _, item in ipairs(result.creates) do
                if item.meta.scope_projection_policy and #item.data.groups > 0 then
                    assigned[#assigned + 1] = item.meta.scope_projection_policy
                end
            end
            test.eq(#assigned, 1)
            test.eq(assigned[1], "app:a_bundle")
        end)
        test.it("projects covering grants once while retaining captured policy identities", function()
            local entries, ids, effective = {}, {}, {}
            for index = 1, 300 do
                local id = "app:covered_" .. index
                entries[#entries + 1] = {id = id, kind = "security.policy", meta = {}, data = {
                    policy = {actions = "registry.get", resources = "app:resource_" .. index, effect = "allow"}}}
                ids[#ids + 1] = id
                effective[id] = true
            end
            entries[#entries + 1] = {id = SOURCE, kind = "security.policy", meta = {}, data = {
                policy = {actions = "registry.get", resources = "*", effect = "allow"}}}
            ids[#ids + 1] = SOURCE
            effective[SOURCE] = true
            local captured = binding()
            captured.meta.scope_projection_policy = "app:covered_1"
            captured.id = consts.CUSTOM_SCOPE_NS .. ".bindings:6170703a636f76657265645f31"
            entries[#entries + 1] = captured
            local result, err = policy_groups.plan({["app:composed_group"] = ids},
                {["app:composed_group"] = effective}, {find = function() return entries end})
            test.is_nil(err)
            test.eq(#result.deletes, 0)
            local assigned, retained = 0, nil
            for _, list in ipairs({result.creates, result.updates}) do
                for _, item in ipairs(list) do
                    if item.meta.scope_projection_policy then
                        assigned = assigned + #item.data.groups
                        if item.id == captured.id then retained = item end
                    end
                end
            end
            test.eq(assigned, 1)
            test.not_nil(retained)
            test.eq(#retained.data.groups, 0)
            test.eq(retained.data.policy.resources, "app:resource_1")
        end)
        test.it("omits redundant direct-group copies when a projected covering grant remains", function()
            local native = source("app:current_resource")
            native.data.groups = {"app:native_group"}
            local covering = {id = "app:covering_source", kind = "security.policy", meta = {}, data = {
                policy = {actions = "access", resources = "*", effect = "allow"}}}
            local captured = binding()
            captured.data.groups = {"app:native_group", "app:composed_group"}
            local result, err = policy_groups.plan(
                {["app:native_group"] = {SOURCE, covering.id}, ["app:composed_group"] = {SOURCE}},
                {["app:native_group"] = {[SOURCE] = true, [covering.id] = true}, ["app:composed_group"] = {[SOURCE] = true}},
                {find = function() return {native, captured, covering} end})
            test.is_nil(err)
            test.eq(#result.deletes, 0)
            local updated
            for _, item in ipairs(result.updates) do
                if item.id == BINDING then updated = item end
            end
            test.not_nil(updated)
            test.eq(#updated.data.groups, 1)
            test.eq(updated.data.groups[1], "app:composed_group")
            test.eq(updated.data.policy.resources, "app:current_resource")
            test.eq(updated.meta.scope_projection_policy, SOURCE)
        end)
        test.it("retains an unassigned binding with the current source rules and no group membership", function()
            local result = plan({source("app:current_resource"), binding()})
            test.eq(#result.deletes, 0)
            test.eq(#result.creates, 0)
            test.eq(#result.updates, 1)
            local updated = result.updates[1]
            test.eq(updated.id, BINDING)
            test.eq(updated.meta.scope_projection_policy, SOURCE)
            test.eq(#updated.data.groups, 0)
            test.eq(updated.data.policy.resources, "app:current_resource")
            test.eq(updated.data.policy.actions, "access")
            test.eq(updated.data.policy.effect, "allow")
            local again = plan({source("app:current_resource"), updated})
            test.eq(#again.creates, 0)
            test.eq(#again.updates, 0)
            test.eq(#again.deletes, 0)
        end)
        test.it("does not create bindings for sources with no previous capture or assignment", function()
            local result = plan({source("app:current_resource")})
            test.eq(#result.creates, 0)
            test.eq(#result.updates, 0)
            test.eq(#result.deletes, 0)
        end)
        test.it("keeps a nested projected binding unchanged but distinguishes an empty object from an array", function()
            local native = source("app:current_resource")
            native.data.policy.actions = {"access", "registry.get"}
            native.data.policy.resources = {"app:current_resource", "app:other_resource"}
            local group = "app:shape_group"
            local scopes, effective = {[group] = {SOURCE}}, {[group] = {[SOURCE] = true}}
            local created, created_err = policy_groups.plan(scopes, effective, {find = function() return {native} end})
            test.is_nil(created_err)
            test.eq(#created.creates, 2)

            local unchanged, unchanged_err = policy_groups.plan(scopes, effective, {find = function() return {
                native, created.creates[1], created.creates[2],
            } end})
            test.is_nil(unchanged_err)
            test.eq(#unchanged.creates, 0)
            test.eq(#unchanged.updates, 0)
            test.eq(#unchanged.deletes, 0)

            local metadata = created.creates[1].meta.scope_metadata and created.creates[1] or created.creates[2]
            local binding = metadata == created.creates[1] and created.creates[2] or created.creates[1]
            local wrong_shape = {
                id = metadata.id, kind = metadata.kind,
                meta = {private = true, managed_by = consts.MANAGED_BY, scope_metadata = true,
                    scope_projection_effective = {}},
                data = metadata.data,
            }
            local corrected, corrected_err = policy_groups.plan(scopes, effective, {find = function() return {
                native, wrong_shape, binding,
            } end})
            test.is_nil(corrected_err)
            test.eq(#corrected.creates, 0)
            test.eq(#corrected.updates, 1)
            test.eq(corrected.updates[1].id, metadata.id)
        end)
        test.it("retains canonical errors for a projected binding beyond the hash wrapper depth", function()
            local native = source("app:deep_resource")
            local nested = {}
            local cursor = nested
            -- Lower the codec limit for this focused boundary test. Standalone
            -- policy hashing accepts this shape, but the {meta, data} wrapper
            -- must retain the depth error during projected-entry comparison.
            for _ = 1, 5 do
                cursor.value = {}
                cursor = cursor.value
            end
            native.data.policy.extra = nested
            local group = "app:deep_group"
            local scopes, effective = {[group] = {SOURCE}}, {[group] = {[SOURCE] = true}}
            local original_limit = canonical_json.MAX_DEPTH
            canonical_json.MAX_DEPTH = 8
            local ok, created, created_err, result, plan_err = pcall(function()
                local first, first_err = policy_groups.plan(scopes, effective, {find = function() return {native} end})
                if first_err then return first, first_err end
                local binding_entry = projected(first.creates,
                    consts.CUSTOM_SCOPE_NS .. ".bindings:6170703a72657461696e65645f736f75726365")
                local metadata = first.creates[1] == binding_entry and first.creates[2] or first.creates[1]
                local second, second_err = policy_groups.plan(scopes, effective, {find = function() return {
                    native, metadata, binding_entry,
                } end})
                return first, first_err, second, second_err
            end)
            canonical_json.MAX_DEPTH = original_limit
            test.is_true(ok, tostring(created))
            test.is_nil(created_err)
            test.is_nil(result)
            test.not_nil(plan_err)
        end)
        test.it("does not treat metatable-provided projected metadata as canonical data", function()
            local native = source("app:current_resource")
            local group = "app:metatable_group"
            local scopes, effective = {[group] = {SOURCE}}, {[group] = {[SOURCE] = true}}
            local created, created_err = policy_groups.plan(scopes, effective, {find = function() return {native} end})
            test.is_nil(created_err)
            local binding_entry = projected(created.creates,
                consts.CUSTOM_SCOPE_NS .. ".bindings:6170703a72657461696e65645f736f75726365")
            local metadata = created.creates[1] == binding_entry and created.creates[2] or created.creates[1]
            binding_entry.meta = setmetatable({private = true, managed_by = consts.MANAGED_BY}, {
                __index = {scope_projection_policy = SOURCE},
            })
            local result, plan_err = policy_groups.plan(scopes, effective, {find = function() return {
                native, metadata, binding_entry,
            } end})
            test.is_nil(plan_err)
            test.eq(#result.creates, 0)
            test.eq(#result.updates, 1)
            test.eq(result.updates[1].id, binding_entry.id)
        end)
        test.it("withdraws a binding when its source policy no longer exists", function()
            local result = plan({binding()})
            test.eq(#result.creates, 0)
            test.eq(#result.updates, 0)
            test.eq(#result.deletes, 1)
            test.eq(result.deletes[1], BINDING)
        end)
    end)
end
return {run = test.run_cases(define_tests)}
