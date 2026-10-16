local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local security = require("security")
local contract = require("contract")

local function service(owner: string): any
    local policy, policy_err = security.policy("app:test_scope_policy")
    if policy_err then error(tostring(policy_err)) end
    local definition, definition_err = contract.get("kickside.component:component_service")
    if definition_err then error(tostring(definition_err)) end
    local instance, open_err = definition:with_actor(security.new_actor(owner, { security_groups = {} }))
        :with_scope(security.new_scope({ policy })):open()
    if open_err then error(tostring(open_err)) end
    return instance
end

local function stored(id: string): any
    local db, db_err = sql.get("app:db")
    if db_err then error(tostring(db_err)) end
    local rows, read_err = db:query("SELECT private_context FROM kickside_components WHERE component_id=$1", { id })
    db:release()
    if read_err then error(tostring(read_err)) end
    return assert(json.decode(rows[1].private_context))
end

local function define_tests()
    test.describe("component portable contract", function()
        test.it("exports a secret-free shell and imports only locally declared slots under the new owner", function()
            local owner, recipient = "portable-" .. uuid.v7(), "recipient-" .. uuid.v7()
            local source_service, recipient_service = service(owner), service(recipient)
            local source = source_service:register({ impl_id = "app:audit_portable_kind",
                private_context = { prompt = "hello", settings = { api_key = "nested-secret", region = "eu" },
                    api_key = "top-secret", source_id = "old-source", excluded = "private-value" },
                meta = { title = "Portable", internal_flag = "private-flag" } })
            test.is_true(source.success, source.error)
            local refused_export = recipient_service:export({ component_id = source.component_id })
            test.is_false(refused_export.success)
            test.eq(refused_export.kind, errors.PERMISSION_DENIED)
            local exported = source_service:export({ component_id = source.component_id })
            test.is_true(exported.success, exported.error)
            local shell = assert(json.decode(exported.shell))
            test.is_nil(shell.context.api_key)
            test.is_nil(shell.context.settings.api_key)
            test.eq(shell.context.settings.region, "eu")
            test.is_nil(shell.context.excluded)
            test.is_nil(shell.context.source_id)
            test.is_nil(shell.meta.owner)
            test.is_nil(shell.meta.internal_flag)
            test.eq(stored(source.component_id).api_key, "top-secret")

            shell.context.excluded = "injected-value"
            shell.context.settings.api_key = "injected-secret"
            shell.slots = { { key = "arbitrary", kind = "component_ref", path = "/arbitrary" } }
            local encoded = assert(json.encode(shell))
            local rejected = recipient_service:import({ shell = encoded,
                slot_values = { api_key = "new-secret", arbitrary = "foreign" } })
            test.is_false(rejected.success)
            test.eq(rejected.kind, errors.INVALID)
            local imported = recipient_service:import({ shell = encoded,
                slot_values = { api_key = "new-secret", source_id = "old-source" },
                id_map = { components = { ["old-source"] = "new-source" } } })
            test.is_true(imported.success, imported.error)
            local context = stored(imported.component_id)
            test.eq(context.api_key, "new-secret")
            test.eq(context.source_id, "new-source")
            test.eq(context.prompt, "hello")
            test.is_nil(context.excluded)
            test.is_nil(context.settings.api_key)
            local grants = recipient_service:list_access({ component_id = imported.component_id })
            test.is_true(grants.success, grants.error)
            test.eq(grants.owner, recipient)
            test.eq(#grants.access, 1)
            test.eq(grants.access[1].subject_id, recipient)
            test.eq(grants.access[1].access_mask, 15)
            local former_owner = source_service:get({ component_id = imported.component_id })
            test.is_false(former_owner.success)
            test.eq(former_owner.kind, errors.PERMISSION_DENIED)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
