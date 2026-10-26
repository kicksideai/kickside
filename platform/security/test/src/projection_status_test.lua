-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local security = require("security")
local funcs = require("funcs")
local projection = require("scope_projection")

local function read(allowed)
    local actor = assert(security.new_actor("projection-status-admin", {security_groups = {"app.security:user"}}))
    local policy = assert(security.policy("app.security:test_admin"))
    local policies = {policy}
    if not allowed then
        policies[#policies + 1] = assert(security.policy("app:projection_status_deny"))
    end
    local scope = assert(security.new_scope(policies))
    return funcs.new():with_actor(actor):with_scope(scope):call("app:projection_status_probe")
end

local function define_tests()
    test.describe("security projection status", function()
        test.it("reports stale and current revisions without actualizing them", function()
            local original = assert(registry.current_version())
            local ok, failure = pcall(function()
                test.not_nil(assert(projection.materialize({"app.security:user"})))
                local result = assert(read(true))
                test.eq(result.status, 200)
                test.is_true(result.body.current)
                local changes = assert(registry.snapshot()):changes()
                changes:create({id = "app:projection_status_policy", kind = "security.policy",
                    data = {groups = {"app.security:user"}, policy = {actions = "read", resources = "example:*", effect = "allow"}}})
                test.not_nil(assert(changes:apply()))
                local before = assert(registry.current_version()):id()
                result = assert(read(true))
                test.eq(result.status, 200)
                test.is_false(result.body.current)
                test.eq(assert(registry.current_version()):id(), before)
                test.not_nil(assert(projection.reconcile()))
                result = assert(read(true))
                test.eq(result.status, 200)
                test.is_true(result.body.current)
            end)
            test.not_nil(assert(registry.apply_version(original)))
            if not ok then error(failure) end
        end)
        test.it("requires endpoint access", function()
            local result, err = read(false)
            test.is_nil(err)
            test.eq(result.status, 403)
            test.is_false(result.body.success)
        end)
    end)
end

return test.run_cases(define_tests)
