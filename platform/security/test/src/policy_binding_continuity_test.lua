local scope_writer = require("scope_writer")
local trigger_reconcile = require("trigger_reconcile")
local test = require("test")
local registry = require("registry")
local security = require("security")
local scopes = require("scope_store")
local projection = require("scope_projection")
local source_scope = require("source_scope")

local function define_tests()
    test.describe("source policy identity continuity", function()
        local projector
        test.before_all(function() projector = scope_writer.start_projector() end)
        test.after_all(function() scope_writer.stop_projector(projector) end)

        for _, count in ipairs({1, 2, 5, 50, 300}) do
            test.it("preserves exactly " .. count .. " selected source IDs while native compatibility bindings remain", function()
                local original = assert(registry.current_version())
                local slug = "source_identity_" .. count
                local ids, selected = {}, {}
                local changes = assert(registry.snapshot()):changes()
                for i = 1, count do
                    local id = "app:source_identity_" .. count .. "_" .. i
                    ids[#ids + 1] = id
                    selected[id] = true
                    changes:create({id = id, kind = "security.policy", data = {policy = {
                        actions = "read", resources = "record:" .. i, effect = "allow"}}})
                end
                test.not_nil(assert(changes:apply()))
                local ok, failure = pcall(function()
                    test.not_nil(assert(scopes.upsert({slug = slug, policies = ids})))
                    test.not_nil(assert(trigger_reconcile.trigger()))
                    local scope = assert(source_scope.resolve("kickside.security.scopes:" .. slug))
                    test.eq(#scope:policies(), count)
                    for _, policy in ipairs(scope:policies()) do test.is_true(selected[policy:id()]) end
                    test.eq(scope:evaluate(security.new_actor("member"), "read", "record:1"), "allow")
                    test.eq(scope:evaluate(security.new_actor("member"), "read", "record:outside"), "undefined")

                end)
                test.is_true(assert(scopes.delete(slug)))
                test.is_true(assert(registry.apply_version(original)))
                if not ok then error(failure) end
            end)
        end
        test.it("keeps a selected source identity through native rule replacement", function()
            local original = assert(registry.current_version())
            local id, group = "app:source_identity_replacement", "app:source_identity_native"
            for _, resource in ipairs({"record:before", "record:after"}) do
                local changes = assert(registry.snapshot()):changes()
                local entry = {id = id, kind = "security.policy", data = {groups = {group},
                    policy = {actions = "read", resources = resource, effect = "allow"}}}
                if resource == "record:before" then changes:create(entry) else changes:update(entry) end
                test.not_nil(assert(changes:apply()))
                local scope = assert(source_scope.resolve(group))
                test.eq(scope:policies()[1]:id(), id)
                test.eq(scope:evaluate(security.new_actor("member"), "read", resource), "allow")
                if resource == "record:after" then
                    test.eq(scope:evaluate(security.new_actor("member"), "read", "record:before"), "undefined")
                end
            end
            test.is_true(assert(registry.apply_version(original)))
        end)
    end)
end
return {run = test.run_cases(define_tests)}
