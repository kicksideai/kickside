local test = require("test")
local registry = require("registry")
local security = require("security")
local consts = require("user_consts")

local MODULE_PREFIX = "kickside.users"

type EntryMeta = {
    type: string?,
    target_db: string?,
    db_id: string?,
}

type RegistryEntry = {
    id: string?,
    kind: string?,
    meta: EntryMeta?,
}

type RequirementTarget = { entry: string?, path: string? }
type RequirementEntry = { targets: { RequirementTarget }? }
type TokenStorageEntry = {
    database: string?,
    lifecycle: { depends_on: { string }? }?,
}
type ContractMethod = { name: string? }
type ContractDefinition = { methods: { ContractMethod }? }
type ProvisioningMethods = { complete_passwordless_user: string? }
type ContractBinding = {
    contracts: { { contract: string?, methods: ProvisioningMethods? } }?,
}
type PolicyEntry = { policy: { resources: any }? }
type SecuredFunction = { security: { policies: { string }? }? }

local function trim(value): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function module_migrations(): { RegistryEntry }
    local all, err = registry.find({})
    test.is_nil(err)
    local out: { RegistryEntry } = {}
    for _, raw_entry in ipairs(all or {}) do
        local entry = raw_entry :: RegistryEntry
        local id = trim(entry.id)
        local meta = entry.meta or {}
        if id:sub(1, #MODULE_PREFIX) == MODULE_PREFIX
            and trim(entry.kind) == "function.lua"
            and trim(meta.type) == "migration" then
            out[#out + 1] = entry
        end
    end
    return out
end

local function define_tests()
    test.describe("kickside users packaging", function()
        test.it("R5-RELEASE-HARNESS-COVERAGE standalone harness owns its latest test dependency", function()
            local dependency, err = registry.get("app:dep.wippy.test")
            test.is_nil(err)
            test.not_nil(dependency)
            test.eq(dependency.data.component, "wippy/test")
            test.eq(dependency.data.version, "*")
        end)
        test.it("requires the Security version that provides the public live resolver", function()
            local dependency, err = registry.get("kickside.users:dep.kickside.security")
            test.is_nil(err)
            test.not_nil(dependency)
            test.eq(dependency.data.component, "kickside/security")
            test.eq(dependency.data.version, ">=0.2.13")
        end)
        test.it("routes one target_db through every persistence surface", function()
            local requirement = registry.get("kickside.users:target_db")
            test.not_nil(requirement)

            local targets: { [string]: { [string]: boolean } } = {}
            local requirement_data = ((requirement :: { data: RequirementEntry? }).data
                or (requirement :: RequirementEntry))
            for _, target in ipairs(requirement_data.targets or {}) do
                local id = tostring(target.entry)
                targets[id] = targets[id] or {}
                targets[id][tostring(target.path)] = true
            end

            for _, id in ipairs({
                "kickside.users.migrations:01_create_app_user_tables",
                "kickside.users.migrations:02_init_admin_user",
                "kickside.users.migrations:03_create_token_store_table",
                "kickside.users.migrations:04_create_user_sessions",
                "kickside.users.migrations:09_profile",
                "kickside.users.migrations:10_canonical_email_grants",
                "kickside.users.migrations:11_group_enrollments",
                "kickside.users.migrations:12_delegation_epochs",
                "kickside.users.migrations:13_bot_accounts",
                "kickside.users.migrations:14_bot_lifecycle_audit",
            }) do
                test.eq(targets[id][".meta.target_db"], true)
            end
            test.eq(targets["kickside.users.env:database_resource"][".default"], true)
            test.eq(targets["kickside.users.profile:db_config"][".meta.db_id"], true)
            test.eq(targets["kickside.users.security:token_storage"][".database"], true)
            test.eq(targets["kickside.users.security:token_storage"][".lifecycle.depends_on +="], true)
            test.eq(targets["kickside.users.security:login_db_access"][".policy.resources +="], true)

            local profile_config = registry.get("kickside.users.profile:db_config")
            local db_id = trim(((profile_config :: RegistryEntry).meta or {}).db_id)
            test.eq(consts.get_db_resource(), db_id)
            test.eq(consts.get_config().database_resource, db_id)
        end)

        test.it("binds migrations, repositories, and token storage to the same live database", function()
            local profile_config = registry.get("kickside.users.profile:db_config")
            local token_storage = registry.get("kickside.users.security:token_storage")
            test.not_nil(profile_config)
            test.not_nil(token_storage)

            local db_id = trim(((profile_config :: RegistryEntry).meta or {}).db_id)
            test.is_true(db_id ~= "")
            local db_entry, db_err = registry.get(db_id)
            test.is_nil(db_err, tostring(db_err))
            test.not_nil(db_entry)

            local token_data = ((token_storage :: { data: TokenStorageEntry? }).data
                or (token_storage :: TokenStorageEntry))
            test.eq(trim(token_data.database), db_id)
            local depends_on = token_data.lifecycle and token_data.lifecycle.depends_on or {}
            local found = false
            for _, dependency in ipairs(depends_on) do
                if trim(dependency) == db_id then found = true end
            end
            test.is_true(found, "token storage lifecycle must wait for the injected database")

            local login_db_access = registry.get("kickside.users.security:login_db_access")
            test.not_nil(login_db_access)
            local policy_data = ((login_db_access :: { data: PolicyEntry? }).data
                or (login_db_access :: PolicyEntry))
            local db_allowed = false
            for _, resource in ipairs((policy_data.policy and policy_data.policy.resources) or {}) do
                if trim(resource) == db_id then db_allowed = true end
            end
            test.is_true(db_allowed, "login DB grant must use the injected users database")

            local migrations = module_migrations()
            -- Every declared migration binds to the injected database.
            test.eq(#migrations, 10)
            for _, migration in ipairs(migrations) do
                test.eq(trim((migration.meta or {}).target_db), db_id)
            end
        end)

        test.it("wires session revocation end to end", function()
            local router_req = registry.get("kickside.users:api_router")
            test.not_nil(router_req)
            local router_data = ((router_req :: { data: RequirementEntry? }).data
                or (router_req :: RequirementEntry))
            local routed = false
            for _, target in ipairs(router_data.targets or {}) do
                if trim(target.entry) == "kickside.users.api:logout.endpoint"
                    and trim(target.path) == ".meta.router" then
                    routed = true
                end
            end
            test.is_true(routed, "logout endpoint must take its router from the host requirement")

            local endpoint = registry.get("kickside.users.api:logout.endpoint")
            test.not_nil(endpoint)

            local access = registry.get("kickside.contract.http:user_endpoint_access")
            test.not_nil(access)
            local access_data: any = access.data or access
            test.eq(access_data.policy.actions, "access")
            test.is_nil(access_data.policy.conditions)
            local member_entry, member_entry_err = registry.get("kickside.users.security:users_endpoint_access")
            test.is_nil(member_entry_err)
            test.not_nil(member_entry)
            local actor = security.new_actor("module-member", {})
            local baseline, baseline_err = security.policy("kickside.contract.http:user_endpoint_access")
            test.is_nil(baseline_err)
            test.not_nil(baseline)
            test.eq(baseline:evaluate(actor, "access", "kickside.core.threads.api:create_thread.endpoint"), "allow")
            test.eq(baseline:evaluate(actor, "access", "kickside.users.api:logout.endpoint"), "undefined")
            test.eq(baseline:evaluate(actor, "access", "unrelated.module:read.endpoint"), "undefined")
            local member, member_err = security.policy("kickside.users.security:users_endpoint_access")
            test.is_nil(member_err)
            test.not_nil(member)
            test.eq(member:evaluate(actor, "access", "kickside.users.api:logout.endpoint"), "allow")
            test.eq(member:evaluate(actor, "access", "unrelated.module:read.endpoint"), "undefined")
            test.eq(member:evaluate(actor, "funcs.call", "kickside.users.api:logout.endpoint"), "undefined")

            -- The revoker operates only through the injected users database. It no
            -- longer receives bearer-token-store authority because revocation is an
            -- atomic SQL delete by the non-bearer token key.
            local revoker = registry.get("kickside.users.persist:session_revoker")
            test.not_nil(revoker)
            local revoker_data = ((revoker :: { data: SecuredFunction? }).data
                or (revoker :: SecuredFunction))
            local has_db_policy = false
            local has_legacy_revoke_policy = false
            for _, policy_id in ipairs((revoker_data.security and revoker_data.security.policies) or {}) do
                if trim(policy_id) == "kickside.users.security:login_db_access" then
                    has_db_policy = true
                end
                if trim(policy_id) == "kickside.users.security:session_revoke" then
                    has_legacy_revoke_policy = true
                end
            end
            test.is_true(has_db_policy, "session revoker must hold the users DB policy")
            test.is_false(has_legacy_revoke_policy,
                "session revoker must not retain obsolete bearer-token revoke authority")
        end)

        test.it("resolves runtime persistence through the environment selector without the retired config entry", function()
            local retired, err = registry.get("kickside.users:db_config")
            test.is_nil(retired)
            test.is_true(errors.is(err, errors.NOT_FOUND))
            local profile, profile_err = registry.get("kickside.users.profile:db_config")
            test.is_nil(profile_err)
            test.not_nil(profile)
            local configured = trim(((profile :: RegistryEntry).meta or {}).db_id)
            test.is_true(configured ~= "")
            test.eq(consts.get_db_resource(), configured)
            test.eq(consts.get_config().database_resource, configured)
        end)

        test.it("binds the environment database selector to the same injected database", function()
            local selector = registry.get("kickside.users.env:database_resource")
            local profile_config = registry.get("kickside.users.profile:db_config")
            test.not_nil(selector)
            test.not_nil(profile_config)
            local selector_data: any = (selector :: any).data or {}
            test.eq(trim(selector_data.default), trim(((profile_config :: RegistryEntry).meta or {}).db_id))
        end)

        test.it("owns the login policy bundle and injects only the host role resource", function()
            local requirement = registry.get("kickside.users:login_role_resource")
            local role_policy = registry.get("kickside.users.security:login_role_resolve")
            local login = registry.get("kickside.users.api:login")
            test.not_nil(requirement)
            test.not_nil(role_policy)
            test.not_nil(login)

            local requirement_data = ((requirement :: { data: RequirementEntry? }).data
                or (requirement :: RequirementEntry))
            test.eq(#(requirement_data.targets or {}), 1)
            test.eq(requirement_data.targets[1].entry, "kickside.users.security:login_role_resolve")
            test.eq(requirement_data.targets[1].path, ".policy.resources +=")

            local policy_data = ((role_policy :: { data: PolicyEntry? }).data
                or (role_policy :: PolicyEntry))
            local role_allowed = false
            for _, resource in ipairs((policy_data.policy and policy_data.policy.resources) or {}) do
                if trim(resource) == "app.security:*" then role_allowed = true end
            end
            test.is_true(role_allowed)

            local login_data = ((login :: { data: SecuredFunction? }).data
                or (login :: SecuredFunction))
            local policies = (login_data.security and login_data.security.policies) or {}
            test.eq(#policies, 9)
            local compose = registry.get("kickside.users.security:login_scope_compose")
            test.not_nil(compose)
            local compose_data: any = compose.data or compose
            test.eq(compose_data.policy.actions, "security.scope.create")
            test.eq(compose_data.policy.resources, "custom")
            local has_compose = false
            for _, policy_id in ipairs(policies) do
                if policy_id == "kickside.users.security:login_scope_compose" then has_compose = true end
                test.is_true(policy_id:sub(1, #"kickside.users.security:") == "kickside.users.security:"
                    or policy_id == "kickside.users.security:resolve_scope_groups")
                test.is_true(policy_id:sub(1, #"app.security:login.") ~= "app.security:login.")
            end
            test.is_true(has_compose)
            for _, required in ipairs({"kickside.users.security:session_group_policy_read",
                "kickside.users.security:resolve_scope_groups"}) do
                local found = false
                for _, id in ipairs(policies) do if id == required then found = true end end
                test.is_true(found, required)
                local declaration = registry.get(required)
                test.is_true(declaration.meta.service_only)
                test.is_true(declaration.meta.private)
            end
        end)

        test.it("registers account removal as a durable lifecycle cleanup", function()
            local cleanup = registry.get("kickside.users.persist:delete_principal")
            test.not_nil(cleanup)
            test.eq(trim(((cleanup :: RegistryEntry).meta or {}).type), "kickside.lifecycle.principal_cleanup")
        end)

        test.it("publishes and binds the atomic SSO provisioning completion method", function()
            local definition = registry.get("kickside.users:user_provisioning")
            local binding = registry.get("kickside.users:provisioning_binding")
            local implementation = registry.get("kickside.users.provisioning:provisioning_complete_passwordless_user")
            test.not_nil(definition)
            test.not_nil(binding)
            test.not_nil(implementation)

            local declared = false
            local definition_data = ((definition :: { data: ContractDefinition? }).data
                or (definition :: ContractDefinition))
            for _, method in ipairs(definition_data.methods or {}) do
                if method.name == "complete_passwordless_user" then declared = true end
            end
            test.is_true(declared)

            local binding_data = ((binding :: { data: ContractBinding? }).data
                or (binding :: ContractBinding))
            local target: string? = nil
            for _, contract_binding in ipairs(binding_data.contracts or {}) do
                if contract_binding.contract == "kickside.users:user_provisioning" then
                    target = contract_binding.methods and contract_binding.methods.complete_passwordless_user or nil
                end
            end
            test.eq(target, "kickside.users.provisioning:provisioning_complete_passwordless_user")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
