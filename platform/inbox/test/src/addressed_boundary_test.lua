-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local uuid = require("uuid")
local identity = require("test_identity")
local sql = require("sql")
local component = require("component")

local confinement = test.run_cases(function()
    test.describe("Inbox addressed credential boundaries", function()
        test.it("preserves confined personal operations and excludes addressed items", function()
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
            local personal = assert(ordinary:call("app:addressed_probe", { params = {
                id = uuid.v4(), item_type = "notice", title = "Personal" } }))
            assert(ordinary:call("app:inbox_catchup_probe", {}))
            local db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT path FROM kickside_components WHERE component_id=$1",
                { component.singleton_component_id(id, "kickside.inbox") }))
            db:release()
            test.eq(#rows, 1)
            local confined = funcs.new():with_actor(assert(security.new_actor(id, {
                security_groups = { "app:user" }, access_filter = { prefixes = { tostring(rows[1].path) } }
            }))):with_scope(scope)
            for _, request in ipairs({
                { "kickside.inbox.persist:addressed_read", {} },
                { "kickside.inbox.persist:addressed_read", { id = item.id } },
            }) do
                local result, err = confined:call(request[1], request[2])
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            end
            local listed = assert(confined:call("app:inbox_read_probe", { list = true }))
            test.eq(#listed.items, 1)
            test.eq(listed.items[1].id, personal.id)
            test.eq(listed.counts.pending_count, 1)
            test.eq(assert(confined:call("kickside.inbox:badge_count", {})), 1)
            test.not_nil(assert(confined:call("app:inbox_read_probe", { id = personal.id })))
            local hidden, hidden_err = confined:call("app:inbox_read_probe", { id = item.id })
            test.is_nil(hidden)
            test.is_nil(hidden_err)
            local resolved, resolve_err = confined:call("app:addressed_probe", { operation = "resolve", id = personal.id })
            test.is_nil(resolve_err, tostring(resolve_err))
            test.eq(resolved.status, "dismissed")
            test.is_true(assert(confined:call("app:addressed_probe", { operation = "delete", id = personal.id })))
            test.eq(assert(ordinary:call("kickside.inbox:badge_count", {})), 1)
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
        test.it("does not accept recipient-directed deletion from a member", function()
            local owner_id, member_id = "owner-" .. uuid.v4(), "member-" .. uuid.v4()
            identity.ensure_user(owner_id)
            identity.ensure_user(member_id)
            local scope = assert(security.new_scope({ assert(security.policy("app:addressed_runtime")),
                assert(security.policy("app:addressed_send")) }))
            local owner = funcs.new():with_actor(assert(security.new_actor(owner_id, { security_groups = { "app:user" } }))):with_scope(scope)
            local item = assert(owner:call("app:addressed_probe", { params = { id = uuid.v4(),
                item_type = "addressed_review", title = "Review", recipient = { kind = "user", id = owner_id } } }))
            assert(owner:call("app:inbox_catchup_probe", {}))
            local policies = { assert(security.policy("app:addressed_app_db")), assert(security.policy("app:addressed_contract_context")) }
            for _, module in ipairs({ "inbox", "component", "core", "users", "contract" }) do
                policies[#policies + 1] = assert(security.policy("kickside." .. module .. ".security:module_access"))
                policies[#policies + 1] = assert(security.policy("kickside." .. module .. ".security:module_runtime"))
            end
            local member = funcs.new():with_actor(assert(security.new_actor(member_id, {})))
                :with_scope(assert(security.new_scope(policies)))
            for _, id in ipairs({ item.id, uuid.v4() }) do
                local removed, err = member:call("kickside.inbox.persist:addressed_delete", { id = id },
                    { kind = "user", id = owner_id })
                test.is_nil(err, tostring(err))
                test.is_false(removed)
            end
            assert(owner:call("app:inbox_catchup_probe", {}))
            test.not_nil(assert(owner:call("app:inbox_read_probe", { id = item.id })))
            test.is_true(assert(owner:call("app:addressed_probe", { operation = "delete", id = item.id })))
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
