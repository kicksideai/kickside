-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")
local identity = require("test_identity")

local confinement = test.run_cases(function()
    test.describe("Inbox addressed credential boundaries", function()
        test.it("refuses confined list, get, badge and resolve while preserving ordinary reads", function()
            local id = "recipient-" .. uuid.v4()
            identity.ensure_user(id)
            local scope = assert(security.new_scope({ assert(security.policy("app:addressed_runtime")),
                assert(security.policy("app:addressed_send")) }))
            local ordinary = funcs.new():with_actor(assert(security.new_actor(id, { security_groups = { "app:user" } }))):with_scope(scope)
            local item = assert(ordinary:call("app:addressed_probe", { params = {
                id = uuid.v4(), item_type = "addressed_review", title = "Review",
                recipient = { kind = "user", id = id } } }))
            assert(ordinary:call("app:inbox_catchup_probe", {}))
            test.not_nil(assert(ordinary:call("app:inbox_read_probe", { id = item.id })))
            test.eq(assert(ordinary:call("kickside.inbox:badge_count", {})), 1)
            for _, prefixes in ipairs({ {}, { "/allowed/" } }) do
                local actor = assert(security.new_actor(id, { security_groups = { "app:user" }, access_filter = { prefixes = prefixes } }))
                local confined = funcs.new():with_actor(actor):with_scope(scope)
                for _, request in ipairs({
                    { "kickside.inbox.persist:addressed_read", {} },
                    { "kickside.inbox.persist:addressed_read", { id = item.id } },
                    { "app:inbox_read_probe", { list = true } },
                    { "app:inbox_read_probe", { id = item.id } },
                    { "kickside.inbox:badge_count", {} },
                    { "app:addressed_probe", { operation = "resolve", id = item.id } },
                }) do
                    local result, err = confined:call(request[1], request[2])
                    test.is_nil(result, request[1])
                    test.is_true(errors.is(err, errors.PERMISSION_DENIED), request[1] .. ": " .. tostring(err))
                    test.is_true(tostring(err):find("a confined identity cannot widen a component read", 1, true) ~= nil)
                end
            end
            local policies = { assert(security.policy("app:addressed_member_probe")), assert(security.policy("app:addressed_app_db")), assert(security.policy("app:addressed_contract_context")) }
            for _, module in ipairs({ "inbox", "component", "core", "users", "contract" }) do
                policies[#policies + 1] = assert(security.policy("kickside." .. module .. ".security:module_access"))
                policies[#policies + 1] = assert(security.policy("kickside." .. module .. ".security:module_runtime"))
            end
            local member = funcs.new():with_actor(assert(security.new_actor(id, { security_groups = { "app:user" } })))
                :with_scope(assert(security.new_scope(policies)))
            test.eq(assert(member:call("app:inbox_read_probe", { id = item.id })).status, "pending")
            test.eq(assert(member:call("kickside.inbox:badge_count", {})), 1)
            test.eq(assert(ordinary:call("app:inbox_read_probe", { id = item.id })).status, "pending")
            test.eq(assert(ordinary:call("app:addressed_probe", { operation = "resolve", id = item.id })).status, "dismissed")
        end)
    end)
end)
local notifications = test.run_cases(function()
    test.describe("Inbox notification authority", function()
        test.it("refuses member calls to notification entry points", function()
            local policy = assert(security.policy("kickside.inbox.security:module_runtime"))
            local scope = assert(security.new_scope({ policy }))
            local member = funcs.new():with_actor(assert(security.new_actor("member-" .. uuid.v4(), {}))):with_scope(scope)
            for _, entry in ipairs({ "kickside.inbox.persist:notify_addressed", "kickside.inbox.persist:notify_addressed_job",
                "kickside.inbox.persist:projection_committed", "kickside.inbox.persist:publish_summary" }) do
                test.eq(policy:evaluate(assert(security.new_actor("member", {})), "funcs.call", entry, nil), "undefined", entry)
                local result, err = member:call(entry, { recipient = { kind = "user", id = "other" },
                    payload = { recipient = { kind = "user", id = "other" } } })
                test.is_nil(result, entry)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), entry .. ": " .. tostring(err))
            end
        end)
    end)
end)
return { run = confinement, notifications = notifications }
