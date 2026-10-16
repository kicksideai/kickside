local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local contract = require("contract")
local security = require("security")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"

local function open_service(actor_id: string, policies: { string }, groups: { string }?): any
    local scope_policies: { any } = {}
    for _, id in ipairs(policies) do
        local policy, err = security.policy(id)
        if not policy then error("policy missing: " .. id .. ": " .. tostring(err)) end
        scope_policies[#scope_policies + 1] = policy
    end
    for _, id in ipairs(groups or {}) do
        local group, group_err = security.named_scope(id)
        if not group then error("policy group missing: " .. id .. ": " .. tostring(group_err)) end
        for _, policy in ipairs(group:policies()) do
            scope_policies[#scope_policies + 1] = policy
        end
    end
    local svc, err = contract.get(COMPONENT_SERVICE)
    if err or not svc then error("component_service unavailable: " .. tostring(err)) end
    local inst, open_err = svc:with_actor(security.new_actor(actor_id, { security_groups = {} }))
        :with_scope(security.new_scope(scope_policies)):open()
    if open_err or not inst then error("open failed: " .. tostring(open_err)) end
    return inst
end

local function meta_value(component_id: string, key: string): any
    local d, e = sql.get(DB)
    if e then error("db connect failed: " .. tostring(e)) end
    local rows = sql.builder.select("value"):from("kickside_component_meta")
        :where("component_id = ?", component_id)
        :where("key = ?", key):run_with(d):query()
    d:release()
    return rows and rows[1] and rows[1].value or nil
end

local function define_tests()
    test.describe("Component runtime meta write scope", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner = open_service("owner-" .. suffix, { "app:test_scope_policy" })
        local writer = open_service("writer-" .. suffix, { "app:runtime_meta_base_policy", "app:runtime_meta_connection_policy" })

        local function register(meta: any, impl_id: string?): string
            local reg = owner:register({ impl_id = impl_id or "kickside.test:runtime_meta", meta = meta })
            test.is_true(reg.success, "register fails: " .. tostring(reg.error))
            return reg.component_id
        end

        local implementation_writer = open_service("impl-writer-" .. suffix,
            { "app:runtime_meta_base_policy", "app:runtime_meta_impl_policy" })

        test.it("authorizes the stored implementation without requiring legacy public attributes", function()
            local id = register({ title = "Existing component", impl_id = "public override" })
            local result = implementation_writer:set_meta({ component_id = id,
                fields = { health_state = "ready" }, trusted_runtime = true })
            test.is_true(result.success, tostring(result.error))
            test.eq(meta_value(id, "health_state"), "ready")
            test.eq(meta_value(id, "impl_id"), "public override")
        end)

        test.it("ignores public implementation claims when authorizing a different stored kind", function()
            local id = register({ impl_id = "kickside.test:runtime_meta" }, "kickside.test:other_runtime_meta")
            local result = implementation_writer:set_meta({ component_id = id,
                fields = { health_state = "ready" }, trusted_runtime = true })
            test.is_false(result.success)
            test.is_nil(meta_value(id, "health_state"))
        end)

        for _, runtime in ipairs({
            { name = "channel hub", impl_id = "kickside.channel.responder:channel_responder",
                groups = { "kickside.channel.service:hub_execution" }, policies = {} },
            { name = "workflow completion", impl_id = "kickside.workflows:workflow_kind",
                groups = {}, policies = { "kickside.workflows.security:completion_public_meta" } },
        }) do
            test.it("admits an existing " .. runtime.name .. " target without public classification fields", function()
                local policies = { "app:runtime_meta_base_policy" }
                for _, policy in ipairs(runtime.policies) do policies[#policies + 1] = policy end
                local runtime_writer = open_service(runtime.name .. "-writer-" .. suffix, policies, runtime.groups)
                local target = register({ title = "Existing target" }, runtime.impl_id)
                local result = runtime_writer:set_meta({ component_id = target,
                    fields = { health_state = "ready" }, trusted_runtime = true })
                test.is_true(result.success, tostring(result.error))
                test.eq(meta_value(target, "health_state"), "ready")
            end)

            test.it("denies the " .. runtime.name .. " grant on another stored implementation", function()
                local policies = { "app:runtime_meta_base_policy" }
                for _, policy in ipairs(runtime.policies) do policies[#policies + 1] = policy end
                local runtime_writer = open_service(runtime.name .. "-writer-" .. suffix, policies, runtime.groups)
                local target = register({ impl_id = runtime.impl_id, class = "flow" })
                local result = runtime_writer:set_meta({ component_id = target,
                    fields = { health_state = "ready" }, trusted_runtime = true })
                test.is_false(result.success)
                test.is_nil(meta_value(target, "health_state"))
            end)
        end

        test.it("retains channel hub access to its execution plumbing", function()
            local scope, scope_err = security.named_scope("kickside.channel.service:hub_execution")
            test.is_nil(scope_err)
            test.eq(scope:evaluate(security.actor(), "db.get", "app:db", {}), "allow")
            test.eq(scope:evaluate(security.actor(), "security.actor.create", "runtime-actor", {}), "allow")
        end)

        test.it("writes the runtime meta of a component the policy attributes admit", function()
            local id = register({ class = "connection", provider = "gateway-test" }, "kickside.test:gateway_connection")
            local result = writer:set_meta({ component_id = id, fields = { health_state = "ready" }, trusted_runtime = true })
            test.is_true(result.success, "write is denied: " .. tostring(result.error))
            test.eq(meta_value(id, "health_state"), "ready")
        end)

        test.it("uses declared identity after an owner replaces public identity fields", function()
            local id = register({}, "kickside.test:gateway_connection")
            local changed = owner:set_meta({ component_id = id,
                fields = { class = "automation", provider = "other", region = "public" } })
            test.is_true(changed.success, tostring(changed.error))
            local result = writer:set_meta({ component_id = id,
                fields = { health_state = "ready" }, trusted_runtime = true })
            test.is_true(result.success, tostring(result.error))
            test.eq(meta_value(id, "provider"), "other")
            test.eq(meta_value(id, "health_state"), "ready")
        end)

        test.it("denies owner-written class provider and arbitrary grant claims", function()
            for _, impl in ipairs({ "kickside.test:runtime_meta", "kickside.test:other_connection", "kickside.test:other_region" }) do
                local id = register({}, impl)
                local changed = owner:set_meta({ component_id = id,
                    fields = { class = "connection", provider = "gateway-test", region = "trusted" } })
                test.is_true(changed.success, tostring(changed.error))
                local result = writer:set_meta({ component_id = id,
                    fields = { health_state = "ready" }, trusted_runtime = true })
                test.is_false(result.success)
                test.is_nil(meta_value(id, "health_state"))
            end
        end)

        test.it("denies the runtime meta write of a component outside the policy attributes", function()
            local other_provider = register({ class = "connection", provider = "other" })
            local other_class = register({ class = "automation", provider = "gateway-test" })
            for _, id in ipairs({ other_provider, other_class }) do
                local result = writer:set_meta({ component_id = id, fields = { health_state = "ready" }, trusted_runtime = true })
                test.is_false(result.success)
                test.is_nil(meta_value(id, "health_state"))
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
