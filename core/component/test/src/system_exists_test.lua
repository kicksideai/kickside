-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local uuid = require("uuid")

local function execute(statement, args)
    local db = assert(sql.get("app:db"))
    local result, err = db:execute(statement, args)
    db:release()
    assert(not err, tostring(err))
    return result
end

return {run = test.run_cases(function()
    test.describe("Component-owned existence read", function()
        local id
        test.before_each(function()
            id = uuid.v4()
            execute("INSERT INTO kickside_components (component_id,impl_id,private_context) VALUES ($1,$2,$3)",
                {id, "app:exists_fixture", '{"secret":"not returned"}'})
        end)
        test.after_each(function()
            execute("DELETE FROM kickside_components WHERE component_id=$1", {id})
        end)
        test.it("returns only presence under owner authority while the caller's database denial remains", function()
            local actor = assert(security.new_actor("existence-client"))
            local scope = assert(security.new_scope({assert(security.policy("app:system_exists_owner_call")),
                assert(security.policy("app:system_exists_db_deny"))}))
            local client = assert(funcs.new()):with_actor(actor):with_scope(scope)
            local present, present_err = client:call("kickside.component.system:exists", id)
            test.is_nil(present_err)
            test.is_true(present)
            local absent, absent_err = client:call("kickside.component.system:exists", uuid.v4())
            test.is_nil(absent_err)
            test.is_false(absent)
            test.eq(scope:evaluate(actor, "db.get", "app:db"), "deny")
        end)
        test.it("direct reader dispatch grants no database access and denied owner dispatch stays denied", function()
            local actor = assert(security.new_actor("existence-client"))
            local scope = assert(security.new_scope({assert(security.policy("app:system_exists_leaf_call")),
                assert(security.policy("app:system_exists_config_read")),
                assert(security.policy("app:system_exists_db_deny")),
                assert(security.policy("app:system_exists_owner_deny"))}))
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.component.system:read_exists"), "allow")
            local client = assert(funcs.new()):with_actor(actor):with_scope(scope)
            local _, read_err = client:call("kickside.component.system:read_exists", id)
            test.is_true(errors.is(read_err, errors.PERMISSION_DENIED), tostring(read_err))
            test.contains(tostring(read_err), "app:db")
            local _, owner_err = client:call("app:system_exists_client", id)
            test.is_true(errors.is(owner_err, errors.PERMISSION_DENIED), tostring(owner_err))
        end)
    end)
end)}
