-- Last-admin guard: removing or downgrading the sole admin of a component via a
-- direct (non-HTTP) service call must be rejected at the domain layer.

local test = require("test")
local uuid = require("uuid")
local contract = require("contract")
local security = require("security")

local COMPONENT_SERVICE = "kickside.component:component_service"
local REGISTER = "register"
local GRANT_SUBTREE = "grant_subtree"
local REVOKE_SUBTREE = "revoke_subtree"

local ACCESS = { READ = 1, WRITE = 2, DELETE = 4, ADMIN = 8, FULL = 15 }

local function define_tests()
    test.describe("Last-admin guard at domain layer", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner = "owner-" .. suffix
        local impl = "kickside.test:last_admin"

        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function run_as(user_id, groups, target, args)
            local actor = security.new_actor(user_id, { security_groups = groups or {} })
            local svc, cerr = contract.get(COMPONENT_SERVICE)
            if cerr or not svc then error("component_service unavailable: " .. tostring(cerr)) end
            local inst, oerr = (svc :: any):with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            return inst[target](inst, args)
        end

        local function as_owner(target, args)
            return run_as(owner, {}, target, args)
        end

        local function new_component()
            local res, err = as_owner(REGISTER, { impl_id = impl, meta = { label = "guard-test" } })
            if err then error("register failed: " .. tostring(err)) end
            if not res or not res.success then
                local detail = type(res) == "table" and (res :: any).error or nil
                error("register not success: " .. tostring(detail))
            end
            return res.component_id
        end

        -- TDD: these two cases prove the guard works at the domain layer (not just HTTP).
        -- Before the fix they pass (no guard → revoke/downgrade succeeds where it should
        -- not), so they deliberately fail to expose the absent enforcement.

        test.it("revoke_subtree on the sole admin is rejected at the domain layer", function()
            local cid = new_component()
            local res = as_owner(REVOKE_SUBTREE, {
                root_component_id = cid,
                subject = { subject_id = owner, subject_type = "user" },
            })
            test.is_false(res.success == true, "domain layer must reject last-admin revoke")
            test.contains(tostring(res.error or ""), "admin")
        end)

        test.it("grant_subtree downgrading the sole admin is rejected at the domain layer", function()
            local cid = new_component()
            local res = as_owner(GRANT_SUBTREE, {
                root_component_id = cid,
                subject = { subject_id = owner, subject_type = "user" },
                access_mask = ACCESS.READ,
            })
            test.is_false(res.success == true, "domain layer must reject last-admin downgrade")
            test.contains(tostring(res.error or ""), "admin")
        end)

        -- Positive cases: the guard must not block when a second admin exists.

        test.it("revoke_subtree succeeds when a second admin exists", function()
            local cid = new_component()
            local second = "admin2-" .. suffix
            local g = as_owner(GRANT_SUBTREE, {
                root_component_id = cid,
                subject = { subject_id = second, subject_type = "user" },
                access_mask = ACCESS.FULL,
            })
            test.is_true(g.success, "grant second admin: " .. tostring(g.error))

            local res = run_as(second, {}, REVOKE_SUBTREE, {
                root_component_id = cid,
                subject = { subject_id = owner, subject_type = "user" },
            })
            test.is_true(res.success == true, "revoke allowed when another admin exists: " .. tostring(res.error))
        end)

        test.it("grant_subtree downgrade succeeds when a second admin exists", function()
            local cid = new_component()
            local second = "admin3-" .. suffix
            local g = as_owner(GRANT_SUBTREE, {
                root_component_id = cid,
                subject = { subject_id = second, subject_type = "user" },
                access_mask = ACCESS.FULL,
            })
            test.is_true(g.success, "grant second admin: " .. tostring(g.error))

            local res = run_as(second, {}, GRANT_SUBTREE, {
                root_component_id = cid,
                subject = { subject_id = owner, subject_type = "user" },
                access_mask = ACCESS.READ,
            })
            test.is_true(res.success == true, "downgrade allowed when another admin exists: " .. tostring(res.error))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
