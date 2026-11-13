-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local contract = require("contract")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local registry = require("registry")

return {run = test.run_cases(function()
    test.describe("Component-owned kind reader scope", function()
        local ids = {}
        local function caller(member, closed, actor, restricted)
            local policies = {assert(security.policy("app:kind_reader_runtime")),
                assert(security.policy("app:kind_reader_calls"))}
            if member and not restricted then
                policies[#policies + 1] = assert(security.policy("kickside.component.security:module_runtime"))
            end
            if closed then policies[#policies + 1] = assert(security.policy("app:kind_admission_grant")) end
            actor = actor or assert(security.new_actor(uuid.v4(), {security_groups = member and {"kickside.security.groups:members"} or {}}))
            local scope = assert(security.new_scope(policies))
            local client = assert(assert(contract.get("kickside.component:component_service"))
                :with_actor(actor):with_scope(scope):open())
            return client, actor, scope
        end
        local function success(result, err)
            test.is_nil(err)
            test.not_nil(result)
            if result and result.component_id then ids[#ids + 1] = result.component_id end
            test.is_true(result.success, tostring(result.error))
            return result
        end
        test.after_each(function()
            local db = assert(sql.get("app:db"))
            for _, id in ipairs(ids) do
                assert(db:execute("DELETE FROM kickside_job WHERE owner_kind='component' AND owner_id=$1", {id}))
                assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id}))
            end
            db:release()
            ids = {}
        end)
        for _, worker in ipairs({"delete_worker", "retention"}) do
            test.it("reads lifecycle declarations under " .. worker .. " entry authority", function()
                local entry = assert(registry.get("kickside.component:" .. worker))
                local policies = {}
                for _, id in ipairs(entry.data.security.policies) do
                    policies[#policies + 1] = assert(security.policy(id))
                end
                local scope = assert(security.new_scope(policies))
                local result, err = funcs.new():with_scope(scope):call("app:kind_reader_probe")
                test.is_nil(err)
                test.not_nil(result)
                test.eq(result.meta.mutation, "closed")
            end)
        end
        for _, member in ipairs({false, true}) do
            local who = member and "member" or "non-member administrator"
            for _, closed in ipairs({false, true}) do
                local kind = closed and "app:closed_kind" or "app:open_kind"
                test.it("admits " .. who .. " registration and all updates of " .. kind, function()
                    local client = caller(member, closed)
                    local created = success(client:register({impl_id = kind, private_context = {value = "original"}}))
                    local id = created.component_id
                    success(client:update({component_id = id, commands = {
                        {type = "SET_CONTEXT", payload = {private_context = {value = "set"}}},
                        {type = "PATCH_CONTEXT", payload = {patch = {value = "patched"}}},
                        {type = "SET_META", payload = {fields = {title = "updated"}}},
                    }}))
                    success(client:set_meta({component_id = id, fields = {title = "direct"}}))
                    success(client:set_placement({component_id = id, position = "z"}))
                    local db = assert(sql.get("app:db"))
                    local rows = assert(db:query("SELECT private_context,position FROM kickside_components WHERE component_id=$1", {id}))
                    local meta = assert(db:query("SELECT value FROM kickside_component_meta WHERE component_id=$1 AND key='title'", {id}))
                    db:release()
                    test.eq(assert(json.decode(rows[1].private_context)).value, "patched")
                    test.eq(rows[1].position, "z")
                    test.eq(meta[1].value, "direct")
                end)
            end
            for _, operation in ipairs({"SET_CONTEXT", "PATCH_CONTEXT", "SET_META", "set_meta", "set_placement", "delete"}) do
                test.it("admits " .. who .. " " .. operation .. " on an existing closed component", function()
                    local client, actor = caller(member, true)
                    local fixture_scope = assert(security.new_scope({
                        assert(security.policy("app:kind_member_runtime")),
                        assert(security.policy("app:kind_admission_grant")),
                    }))
                    local fixture = assert(assert(contract.get("kickside.component:component_service"))
                        :with_actor(actor):with_scope(fixture_scope):open())
                    local parent = success(fixture:register({impl_id = "app:open_kind"})).component_id
                    local id = success(fixture:register({impl_id = "app:closed_kind", parent_id = parent})).component_id
                    if operation == "delete" then
                        success(client:delete({component_id = parent, child_policy = "reparent_root"}))
                    elseif operation == "set_placement" then
                        success(client:set_placement({component_id = id, parent_id = false, position = "z"}))
                    elseif operation == "set_meta" then
                        success(client:set_meta({component_id = id, fields = {title = "changed"}}))
                    else
                        success(client:update({component_id = id, commands = {{type = operation,
                            payload = {private_context = {value = "set"}, patch = {value = "patched"},
                                fields = {title = "changed"}}}}}))
                    end
                end)
            end
            test.it("keeps attached reader authority outside the restricted " .. who .. " caller scope", function()
                local client, actor, scope = caller(member, true, nil, true)
                success(client:register({impl_id = "app:closed_kind"}))
                local result, err = funcs.new():with_actor(actor):with_scope(scope)
                    :call("app:kind_reader_probe")
                test.is_nil(result)
                test.not_nil(err)
            end)
        end
    end)
end)}
