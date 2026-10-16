-- Orphan adoption: a component that only framework maintenance actors hold
-- access to is adopted by an instance operator through the component service.
-- The adopter gains full access and becomes its execution principal, the
-- adoption is recorded in the component identity audit with the prior access
-- list, and normal access applies afterwards. Owned components and callers
-- without the adopt capability are refused.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local contract = require("contract")
local security = require("security")
local registry = require("registry")

local COMPONENT_SERVICE = "kickside.component:component_service"
local IMPL = "kickside.test:adopt"
local MAINTENANCE = "system:kickside.jobs"

local function policy(id: string): any
    local p, err = security.policy(id)
    if err or not p then error("policy " .. id .. " unavailable: " .. tostring(err)) end
    return p
end

-- The operator scope allows every action, as app.security:admin's root policy does.
local function operator_scope(): any
    return security.new_scope({ policy("app:test_scope_policy") })
end

-- A member scope carries runtime plumbing only, without component.adopt.
local function member_scope(): any
    return security.new_scope({ policy("app:runtime_meta_base_policy") })
end

local function service(actor_id: string, scope: any): any
    local def, def_err = contract.get(COMPONENT_SERVICE)
    if def_err or not def then error("component_service unavailable: " .. tostring(def_err)) end
    local svc, open_err = def:with_actor(security.new_actor(actor_id, { security_groups = {} }))
        :with_scope(scope):open()
    if open_err or not svc then error("component_service open failed: " .. tostring(open_err)) end
    return svc
end

local function register_as(actor_id: string): string
    local created, err = service(actor_id, operator_scope()):register({ impl_id = IMPL })
    if err then error("register: " .. tostring(err)) end
    if not created.success then error("register refused: " .. tostring(created.error)) end
    return created.component_id
end

local function query(text: string, args: { any }): { any }
    local d, err = sql.get("app:db")
    if err or not d then error(tostring(err)) end
    local rows, q_err = d:query(text, args)
    d:release()
    if q_err then error(tostring(q_err)) end
    return rows or {}
end

local function grants(component_id: string): { [string]: integer }
    local out: { [string]: integer } = {}
    for _, row in ipairs(query("SELECT subject_type, subject_id, access_mask FROM kickside_component_access"
        .. " WHERE component_id = $1", { component_id })) do
        out[tostring(row.subject_type) .. ":" .. tostring(row.subject_id)] = math.floor(tonumber(row.access_mask) or 0)
    end
    return out
end

local function adoption_audits(component_id: string): { any }
    return query("SELECT identity_generation, request_id, record_json, created_at FROM kickside_execution_identity_audit"
        .. " WHERE component_id = $1 AND request_id LIKE 'adopt:%'", { component_id })
end

local function define_tests()
    test.describe("Component orphan adoption", function()
        test.it("lets an operator adopt an orphan, then read and delete it through the normal path", function()
            local orphan = register_as(MAINTENANCE)
            local admin = "operator-" .. uuid.v4():sub(1, 8)
            local svc = service(admin, operator_scope())

            local before = svc:get_access_context({ component_id = orphan, access_mask = 1, include_context = false })
            test.eq(before.success, false)

            local adopted, adopt_err = svc:adopt({ component_id = orphan })
            test.is_nil(adopt_err, tostring(adopt_err))
            test.is_true(adopted.success, tostring(adopted.error))
            test.eq(adopted.component_id, orphan)
            test.eq(grants(orphan)["user:" .. admin], 15)

            local readable = svc:get_access_context({ component_id = orphan, access_mask = 1, include_context = false })
            test.is_true(readable.success, tostring(readable.error))
            local got = svc:get({ component_id = orphan })
            test.is_true(got.success, tostring(got.error))

            local deleted, delete_err = svc:delete({ component_id = orphan })
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true(deleted.success, tostring(deleted.error))
            test.eq(#query("SELECT component_id FROM kickside_components WHERE component_id = $1", { orphan }), 0)
        end)

        test.it("records who adopted which component, when, and its prior access list", function()
            local orphan = register_as(MAINTENANCE)
            local admin = "operator-" .. uuid.v4():sub(1, 8)
            local adopted = service(admin, operator_scope()):adopt({ component_id = orphan })
            test.is_true(adopted.success, tostring(adopted.error))

            local audits = adoption_audits(orphan)
            test.eq(#audits, 1)
            local record, decode_err = json.decode(tostring(audits[1].record_json))
            test.is_nil(decode_err)
            test.eq(record.outcome, "adopted")
            test.eq(record.authorizer, "user:" .. admin)
            test.eq(record.new_principal, "user:" .. admin)
            test.eq(record.component_id, orphan)
            test.not_nil(audits[1].created_at)
            test.eq(#record.prior_access, 1)
            test.eq(record.prior_access[1].subject_type, "user")
            test.eq(record.prior_access[1].subject_id, MAINTENANCE)
            test.eq(record.prior_access[1].access_mask, 15)
            test.eq(tonumber(audits[1].identity_generation), tonumber(adopted.identity_generation))

            local owner = query("SELECT value FROM kickside_component_meta WHERE component_id = $1 AND key = 'owner'", { orphan })
            test.eq(owner[1] and owner[1].value, admin)
        end)

        test.it("refuses to adopt a component a principal owns", function()
            local owner = "owner-" .. uuid.v4():sub(1, 8)
            local owned = register_as(owner)
            local admin = "operator-" .. uuid.v4():sub(1, 8)
            local refused, call_err = service(admin, operator_scope()):adopt({ component_id = owned })
            test.is_nil(call_err, tostring(call_err))
            test.eq(refused.success, false)
            test.eq(refused.kind, errors.CONFLICT, tostring(refused.error))
            test.is_nil(grants(owned)["user:" .. admin])
            test.eq(#adoption_audits(owned), 0)
        end)

        test.it("refuses to adopt an orphan placed under a principal-owned parent", function()
            local owner = "owner-" .. uuid.v4():sub(1, 8)
            local parent = register_as(owner)
            local shared = service(owner, operator_scope()):grant_subtree({ root_component_id = parent,
                subject = { subject_id = MAINTENANCE, subject_type = "user" }, access_mask = 3 })
            test.is_true(shared.success, tostring(shared.error))
            local child, child_err = service(MAINTENANCE, operator_scope()):register({ impl_id = IMPL, parent_id = parent })
            test.is_nil(child_err)
            test.is_true(child.success, tostring(child.error))
            local admin = "operator-" .. uuid.v4():sub(1, 8)
            local refused = service(admin, operator_scope()):adopt({ component_id = child.component_id })
            test.eq(refused.success, false)
            test.eq(refused.kind, errors.CONFLICT, tostring(refused.error))
        end)

        test.it("refuses a caller without the adopt capability", function()
            local orphan = register_as(MAINTENANCE)
            local member = "member-" .. uuid.v4():sub(1, 8)
            local refused, call_err = service(member, member_scope()):adopt({ component_id = orphan })
            test.is_nil(call_err, tostring(call_err))
            test.eq(refused.success, false)
            test.eq(refused.kind, errors.PERMISSION_DENIED, tostring(refused.error))
            test.is_nil(grants(orphan)["user:" .. member])
            test.eq(#adoption_audits(orphan), 0)
        end)

        test.it("keeps the adopt endpoint outside the member endpoint policy", function()
            local member_policy = policy("kickside.contract.http:user_endpoint_access")
            local endpoint = "kickside.component.api:adopt_component.endpoint"
            local entry, entry_err = registry.get(endpoint)
            test.is_nil(entry_err, tostring(entry_err))
            test.eq(entry.kind, "http.endpoint")
            test.eq(member_policy:evaluate(security.new_actor("module-member", {}), "access", endpoint, nil), "undefined")
        end)

        test.it("refuses a framework maintenance actor as adopter", function()
            local orphan = register_as(MAINTENANCE)
            local refused = service("system:kickside.other", operator_scope()):adopt({ component_id = orphan })
            test.eq(refused.success, false)
            test.eq(refused.kind, errors.PERMISSION_DENIED, tostring(refused.error))
            test.eq(#adoption_audits(orphan), 0)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
