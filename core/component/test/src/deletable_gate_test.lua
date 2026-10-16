-- A component whose kind DECLARES the deletable contract but whose delete binding
-- cannot be opened must not be silently unregistered. The declared deletable never ran,
-- so its backing data was never released; releasing the component row would orphan it.
-- Teardown must tell "declares a deletable that fails to open" apart from "declares no
-- deletable at all": the first fails the delete and keeps the row, the second unregisters.
--
-- The harness binding app:deletable_unopenable_binding declares kickside.contract:deletable
-- with a delete method pointing at a function id that does not resolve, so the contract is
-- declared but the binding cannot be opened.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"
local UNOPENABLE_IMPL = "app:deletable_unopenable_binding"
local OPENABLE_IMPL = "app:deletable_ok_binding"

local CLEANUP_CTL = "deletable_ok_ctl"

local function define_tests()
    test.describe("Teardown declared-deletable open gate", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner_id = "deletable-gate-owner-" .. suffix

        local function scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function service()
            local actor = security.new_actor(owner_id, { security_groups = {} })
            local svc, gerr = contract.get(COMPONENT_SERVICE)
            if gerr or not svc then error("component_service unavailable: " .. tostring(gerr)) end
            local inst, oerr = svc:with_actor(actor):with_scope(scope()):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            return inst
        end

        local function register(impl, parent_id: string?)
            local res, err = service():register({ impl_id = impl, parent_id = parent_id, meta = { label = "gate" } })
            if err or not res or not res.component_id then
                error("register failed: " .. tostring(err or (res and (res :: any).error)))
            end
            return res.component_id
        end

        local function exists(cid)
            local db, err = sql.get(DB)
            if err or not db then error("db connect failed: " .. tostring(err)) end
            local rows = sql.builder.select("component_id"):from("kickside_components")
                :where("component_id = ?", cid):run_with(db):query()
            db:release()
            return rows ~= nil and #rows > 0
        end

        local function cleanup_calls(): number
            local db, err = sql.get(DB)
            if err or not db then error("db connect failed: " .. tostring(err)) end
            local count_rows = db:query("SELECT COUNT(*) AS count FROM " .. CLEANUP_CTL)
            local calls = count_rows and count_rows[1] and tonumber(count_rows[1].count) or 0
            db:release()
            return calls
        end

        test.it("fails the delete and keeps the row when a declared deletable cannot be opened", function()
            local cid = register(UNOPENABLE_IMPL)
            test.is_true(exists(cid))

            local res, err = service():delete({ component_id = cid })
            test.is_nil(err)
            test.is_false((res :: any).success)

            -- The declared-but-unopenable deletable never released its side data, so the
            -- component row must survive rather than becoming an orphan tombstone.
            test.is_true(exists(cid))
        end)

        test.it("deletes the component when a declared deletable opens and cleans up", function()
            local cid = register(OPENABLE_IMPL)
            test.is_true(exists(cid))

            local res, err = service():delete({ component_id = cid })
            test.is_nil(err)
            test.is_true((res :: any).success, tostring((res :: any).error))

            -- The declared deletable ran its cleanup, so the row is fully released.
            test.is_false(exists(cid))
        end)

        test.it("rejects child-policy conflicts before the deletable mutates side data", function()
            local parent = register(OPENABLE_IMPL)
            local child = register(OPENABLE_IMPL, parent)
            local before = cleanup_calls()

            local res, err = service():delete({ component_id = parent })
            test.is_nil(err)
            test.is_false((res :: any).success)
            test.contains(tostring((res :: any).error), "child components")

            test.eq(cleanup_calls(), before)
            test.is_true(exists(parent))
            test.is_true(exists(child))

            -- Prove the component remains fully deletable once the caller resolves the
            -- deterministic blocker; the preflight is not a tombstone or hidden state.
            local retried, retry_err = service():delete({
                component_id = parent,
                child_policy = "reparent_root",
            })
            test.is_nil(retry_err)
            test.is_true((retried :: any).success, tostring((retried :: any).error))
            test.eq(cleanup_calls(), before + 1)
            test.is_false(exists(parent))
            test.is_true(exists(child))

            local child_deleted, child_err = service():delete({ component_id = child })
            test.is_nil(child_err)
            test.is_true((child_deleted :: any).success, tostring((child_deleted :: any).error))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
