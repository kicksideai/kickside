local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local contract = require("contract")
local security = require("security")

local function cases()
    test.describe("Subtree binding subject normalization", function()
        local owner = "subject-owner-" .. uuid.v4()

        local function call(method, request)
            local policy, policy_err = security.policy("app:test_scope_policy")
            if not policy then error(tostring(policy_err)) end
            local service, service_err = contract.get("kickside.component:component_service")
            if not service then error(tostring(service_err)) end
            local instance, open_err = (service :: any)
                :with_actor(security.new_actor(owner, { security_groups = {} }))
                :with_scope(security.new_scope({ policy })):open()
            if not instance then error(tostring(open_err)) end
            local result, err = instance[method](instance, request)
            test.is_nil(err)
            test.not_nil(result)
            return result
        end

        local function root()
            local result = call("register", { impl_id = "kickside.test:subject", meta = {} })
            test.eq(result.success, true, tostring(result.error))
            return result.component_id
        end

        local function grants(component_id)
            local db, db_err = sql.get("app:db")
            if not db then error(tostring(db_err)) end
            local rows, query_err = db:query(
                "SELECT subject_id, subject_type, access_mask FROM kickside_component_access WHERE component_id = $1 AND subject_id <> $2",
                { component_id, owner })
            db:release()
            if query_err then error(tostring(query_err)) end
            return rows
        end

        local failures = {
            { name = "absent subject", field = "subject", message = "subject must be a table with subject_id" },
            { name = "string subject", subject = "member", field = "subject", message = "subject must be a table with subject_id" },
            { name = "absent ID", subject = { subject_type = "user" }, field = "subject.subject_id", message = "subject must contain a non-empty subject_id" },
            { name = "empty ID", subject = { subject_id = "", subject_type = "user" }, field = "subject.subject_id", message = "subject must contain a non-empty subject_id" },
            { name = "numeric ID", subject = { subject_id = 42, subject_type = "user" }, field = "subject.subject_id", message = "subject must contain a non-empty subject_id" },
            { name = "absent type", subject = { subject_id = "member" }, message = "subject_type is required: one of user, group, service" },
            { name = "empty type", subject = { subject_id = "member", subject_type = "" }, message = "subject_type is required: one of user, group, service" },
            { name = "unsupported type", subject = { subject_id = "member", subject_type = "agent" }, message = "subject_type must be one of user, group, service" },
            { name = "unresolved email", subject = { subject_id = "unknown@northwind.example", subject_type = "user" }, message = "share subject does not exist" },
            { name = "missing directory identity", subject = { subject_id = "missing@northwind.example", subject_type = "user" }, message = "principal directory returns no user identity", kind = errors.UNAVAILABLE },
            { name = "directory failure", subject = { subject_id = "failure@northwind.example", subject_type = "user" }, message = "Northwind directory failure", kind = errors.UNAVAILABLE, code = "directory_dependency", field = "refs" },
        }

        for _, method in ipairs({ "grant_subtree", "revoke_subtree" }) do
            for _, failure in ipairs(failures) do
                test.it(method .. " preserves the envelope for " .. failure.name, function()
                    local component_id = root()
                    local result = call(method, { root_component_id = component_id, subject = failure.subject, access_mask = 1 })
                    test.eq(result.success, false)
                    test.eq(result.kind, failure.kind or errors.INVALID)
                    test.eq(result.error, failure.message)
                    if failure.field then
                        test.eq(result.retryable, false)
                        test.eq(result.details.code, failure.code or "component_share_subject_invalid")
                        test.eq(result.details.field, failure.field)
                    end
                    test.is_nil(result.affected)
                    test.is_nil(result.changes_made)
                    test.eq(#grants(component_id), 0)
                end)
            end
        end

        local identities = {
            { name = "UUID user", id = uuid.v4(), subject_type = "user" },
            { name = "opaque user", id = "opaque-member", subject_type = "user" },
            { name = "email user", id = "member@northwind.example", canonical_id = "northwind-member-id", subject_type = "user" },
            { name = "uppercase email user", id = "MEMBER@NORTHWIND.EXAMPLE", canonical_id = "northwind-member-id", subject_type = "user" },
            { name = "group with email-shaped ID", id = "failure@northwind.example", subject_type = "group" },
            { name = "service with email-shaped ID", id = "failure@northwind.example", subject_type = "service" },
        }
        for _, identity in ipairs(identities) do
            test.it("grant and revoke preserve " .. identity.name, function()
                local component_id = root()
                local subject = { subject_id = identity.id, subject_type = identity.subject_type }
                local granted = call("grant_subtree", { root_component_id = component_id, subject = subject, access_mask = 1 })
                test.eq(granted.success, true, tostring(granted.error))
                test.eq(granted.root_component_id, component_id)
                test.eq(granted.affected, 1)
                test.eq(granted.changes_made, true)
                test.is_nil(granted.error)
                test.is_nil(granted.kind)
                local rows = grants(component_id)
                test.eq(#rows, 1)
                test.eq(rows[1].subject_id, identity.canonical_id or identity.id)
                test.eq(rows[1].subject_type, identity.subject_type)
                test.eq(tonumber(rows[1].access_mask), 1)
                local revoked = call("revoke_subtree", { root_component_id = component_id, subject = subject })
                test.eq(revoked.success, true, tostring(revoked.error))
                test.eq(revoked.root_component_id, component_id)
                test.eq(revoked.affected, 1)
                test.eq(revoked.changes_made, true)
                test.is_nil(revoked.error)
                test.is_nil(revoked.kind)
                test.eq(#grants(component_id), 0)
            end)
        end
    end)
end

return { run = test.run_cases(cases) }
