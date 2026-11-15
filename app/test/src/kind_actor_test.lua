-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local contract = require("contract")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local component_ops = require("component_ops")
local execution_identity = require("execution_identity")
local scope_projection = require("scope_projection")

return {run = test.run_cases(function()
    test.describe("application member kind authority", function()
        local id
        test.before_all(function() test.not_nil((scope_projection.reconcile())) end)
        test.after_each(function()
            if id then
                local db = assert(sql.get(component_ops.db_id()))
                assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", {id}))
                assert(db:release())
                id = nil
            end
        end)
        for _, method in ipairs({"update", "set_meta", "set_placement"}) do
            test.it("checks member " .. method .. " and refuses system actor minting on a closed kind", function()
                local group = uuid.v4()
                local owner = assert(security.new_actor(uuid.v4(), {}))
                local client = assert(assert(contract.get("kickside.component:component_service")):with_actor(owner):open())
                local created, create_err = client:register({impl_id = "kickside.component:member_closed_kind",
                    private_context = {value = "original"},
                    additional_access = {{subject_type = "group", subject_id = group, access_mask = 2}}})
                test.is_nil(create_err)
                test.is_true(created.success, tostring(created.error))
                id = created.component_id
                local request = {component_id = id}
                if method == "update" then
                    request.commands = {{type = "PATCH_CONTEXT", payload = {patch = {value = "forged"}}}}
                elseif method == "set_meta" then request.fields = {title = "forged"}
                else request.position = "z" end
                local member = assert(security.new_actor(uuid.v4(), {security_groups = {group}}))
                local scope = assert(execution_identity.scope_from_groups({"app.security:user", "app.security:members"}))
                local minted, mint_err = funcs.new():with_actor(member):with_scope(scope):call("app:kind_actor_probe",
                    {method = method, request = request, mint_system = true})
                test.not_nil(mint_err)
                test.is_nil(minted)
                local result, err = funcs.new():with_actor(member):with_scope(scope):call("app:kind_actor_probe",
                    {method = method, request = request})
                test.is_nil(err)
                if method == "set_placement" then
                    test.is_true(result.success, tostring(result.error))
                else
                    test.is_false(result.success)
                    test.eq(result.kind, errors.PERMISSION_DENIED)
                    test.eq(result.details.code, "component_kind_mutation_denied")
                end
                local stored = assert(client:get({component_id = id}))
                test.is_true(stored.success)
                test.is_nil(stored.meta.title)
                test.eq(stored.position == "z", method == "set_placement")
                local db = assert(sql.get(component_ops.db_id()))
                local rows = assert(db:query("SELECT private_context, context_revision FROM kickside_components WHERE component_id=$1", {id}))
                assert(db:release())
                test.eq(assert(json.decode(rows[1].private_context)).value, "original")
                test.eq(tonumber(rows[1].context_revision), 0)
            end)
        end
    end)
end)}
