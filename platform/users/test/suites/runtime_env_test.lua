local test = require("test")
local env = require("env")
local funcs = require("funcs")
local security = require("security")
local registry = require("registry")
local user_repo = require("user_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local user_groups_repo = require("user_groups_repo")
local KEY = "kickside.users.env:database_resource"

local function call_as(user_id, input, include_module)
    local host, host_err = security.policy("app:runtime_env_host")
    test.is_nil(host_err)
    local policies = { host }
    if include_module then
        local policy, err = security.policy("kickside.users.security:users_runtime_read")
        test.is_nil(err)
        test.not_nil(policy)
        policies[#policies + 1] = policy
    end
    return funcs.new():with_actor(security.new_actor(user_id))
        :with_scope(security.new_scope(policies)):call("app:runtime_env_probe", input)
end

local function define_tests()
    local user_id, original
    test.describe("Users member database selector authority", function()
        test.before_all(function()
            local original_err
            original, original_err = env.get(KEY)
            if original_err then error(tostring(original_err)) end
            local user, err = user_repo.create({ email = "env-member@test.local", password = "Northwind-2026!", status = "active" })
            if err then error(tostring(err)) end
            user_id = user.user_id
            local _, group_err = user_groups_repo.assign_user_to_group(user_id, "app.security:user")
            if group_err then error(tostring(group_err)) end
        end)
        test.after_all(function()
            local restored, restore_err = env.set(KEY, original)
            if restore_err or not restored then error(tostring(restore_err)) end
            local _, delete_err = user_lifecycle_repo.delete(user_id)
            if delete_err then error(tostring(delete_err)) end
        end)
        test.it("reads real membership with only host data and module selector grants", function()
            local answer, err = call_as(user_id, { key = KEY, read_groups = true }, true)
            test.is_nil(err)
            test.eq(answer.resource, original)
            test.eq(#answer.groups, 1)
            test.eq(answer.groups[1], "app.security:user")
        end)
        test.it("reads the relocated selector value from its store", function()
            local ok, set_err = env.set(KEY, "host:relocated_users_database")
            test.is_nil(set_err)
            test.is_true(ok)
            local answer, err = call_as(user_id, { key = KEY }, true)
            local restored, restore_err = env.set(KEY, original)
            test.is_nil(restore_err)
            test.is_true(restored)
            test.is_nil(err)
            test.eq(answer.resource, "host:relocated_users_database")
        end)
        test.it("denies the selector when the module grant is absent", function()
            local answer, err = call_as(user_id, { key = KEY }, false)
            test.is_nil(answer)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
        end)
        test.it("does not grant administrator credentials or token settings", function()
            for _, key in ipairs({ "default_admin_email", "default_admin_password", "admin_group_id", "token_expiration" }) do
                local answer, err = call_as(user_id, { key = "kickside.users.env:" .. key }, true)
                test.is_nil(answer)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), key)
            end
        end)
        test.it("attaches the grant through the injected member scope", function()
            local entry, err = registry.get("kickside.users.security:users_runtime_read")
            test.is_nil(err)
            test.not_nil(entry)
            test.eq(entry.data.groups[1], "app.security:user")
            local scope, scope_err = security.named_scope("app.security:user")
            test.is_nil(scope_err)
            local actor = security.new_actor(user_id)
            test.eq(scope:evaluate(actor, "env.get", KEY), "allow")
            for _, key in ipairs({"default_admin_email", "default_admin_password", "admin_group_id", "token_expiration"}) do
                local module_scope = security.new_scope({assert(security.policy(tostring(entry.id)))})
                test.eq(module_scope:evaluate(actor, "env.get", "kickside.users.env:" .. key), "undefined")
            end
            local policies, read_err = registry.find({[".kind"] = "security.policy",
                ["meta.scope_projection_policy"] = tostring(entry.id)})
            test.is_nil(read_err)
            for _, policy in ipairs(policies) do
                test.is_true(policy.meta.private)
                test.eq(policy.meta.managed_by, "kickside.security.scopes")
                for _, group in ipairs(policy.data.groups) do
                    local composed = assert(security.named_scope(group))
                    test.eq(composed:evaluate(actor, "env.get", KEY), "allow")
                end
            end
        end)
    end)
end
return { run = test.run_cases(define_tests) }
