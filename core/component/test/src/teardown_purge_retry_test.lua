-- Delete ordering law: the component row and a durable thread-reap pointer
-- commit together. A failed post-delete purge leaves the pointer for the
-- existing retention tick, and never leaves a live component with lost state.
--
-- The harness threads stub (kickside.core:threads) fails purge for a component registered
-- in the thread_purge_ctl control table.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local funcs = require("funcs")
local component = require("component")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"
local CTL = "thread_purge_ctl"

local function define_tests()
    test.describe("Teardown primary-thread purge failure", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner_id = "purge-owner-" .. suffix
        local impl = "kickside.test:purge_retry"

        local function scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function register(label)
            local actor = security.new_actor(owner_id, { security_groups = {} })
            local svc, gerr = contract.get(COMPONENT_SERVICE)
            if gerr or not svc then error("component_service unavailable: " .. tostring(gerr)) end
            local inst, oerr = svc:with_actor(actor):with_scope(scope()):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            local res, err = inst:register({ impl_id = impl, meta = { label = label } })
            if err or not res or not res.component_id then
                error("register failed: " .. tostring(err or (res and (res :: any).error)))
            end
            return res.component_id
        end

        local function ctl_db()
            local db, err = sql.get(DB)
            if err or not db then error("db connect failed: " .. tostring(err)) end
            db:execute("CREATE TABLE IF NOT EXISTS " .. CTL ..
                " (component_id TEXT PRIMARY KEY, fail INTEGER NOT NULL DEFAULT 0, calls INTEGER NOT NULL DEFAULT 0)")
            return db
        end

        local function set_fail(cid, fail)
            local db = ctl_db()
            db:execute("INSERT INTO " .. CTL .. " (component_id, fail, calls) VALUES ($1, $2, 0) " ..
                "ON CONFLICT(component_id) DO UPDATE SET fail = $2", { cid, fail })
            db:release()
        end

        local function purge_calls(cid)
            local db = ctl_db()
            local rows = db:query("SELECT calls FROM " .. CTL .. " WHERE component_id = $1", { cid })
            db:release()
            return rows and rows[1] and tonumber(rows[1].calls) or 0
        end

        local function exists(cid)
            local db, err = sql.get(DB)
            if err or not db then error("db connect failed: " .. tostring(err)) end
            local rows = sql.builder.select("component_id"):from("kickside_components")
                :where("component_id = ?", cid):run_with(db):query()
            db:release()
            return rows ~= nil and #rows > 0
        end

        local function pending_reap(cid)
            local db = ctl_db()
            local rows, err = db:query("SELECT component_id FROM kickside_component_thread_reap WHERE component_id=$1", { cid })
            db:release()
            test.is_nil(err, tostring(err))
            return rows and #rows or 0
        end

        test.it("releases the component even when the thread reap fails, surfacing the reap error", function()
            local cid = register("thread-leak")
            test.is_true(exists(cid))

            -- Purge fails AFTER the release: the row is gone (the release stands),
            -- the reap was attempted once, and the reap error rides the result for
            -- the caller's log -- never a live component with destroyed state.
            set_fail(cid, 1)
            local ok, err = component.system_delete(cid)
            test.is_true(ok)
            test.is_true(err ~= nil)
            test.eq(purge_calls(cid), 1)
            test.is_false(exists(cid))
            test.eq(pending_reap(cid), 1, "a failed post-delete reap needs a durable retry pointer")

            local blocked, blocked_err = funcs.new():call("kickside.component:retention", {})
            test.is_nil(blocked_err, tostring(blocked_err))
            test.is_false(blocked.success, "the owner tick must surface a failed retry")
            test.eq(pending_reap(cid), 1)

            set_fail(cid, 0)
            local reaped, reap_err = funcs.new():call("kickside.component:retention", {})
            test.is_nil(reap_err, tostring(reap_err))
            test.is_true(reaped.success, tostring(reaped.error))
            test.is_true(reaped.deleted >= 1)
            test.eq(purge_calls(cid), 3)
            test.eq(pending_reap(cid), 0)
        end)

        test.it("continues bounded reaps and retains blocked outcomes", function()
            for _, mode in ipairs({ 3, 4 }) do
                local cid = register("thread-bounded")
                set_fail(cid, mode)
                local ok, err = component.system_delete(cid)
                test.is_true(ok)
                test.is_true(errors.is(err, errors.CONFLICT))
                test.eq(pending_reap(cid), 1)
                local result, call_err = funcs.new():call("kickside.component:retention", {})
                test.is_nil(call_err, tostring(call_err))
                test.is_true(result.success, tostring(result.error))
                test.eq(result.needs_continue, mode == 3)
                test.eq(#result.blocked, mode == 4 and 1 or 0)
                test.eq(pending_reap(cid), 1)
                set_fail(cid, 0)
                result, call_err = funcs.new():call("kickside.component:retention", {})
                test.is_nil(call_err, tostring(call_err))
                test.is_true(result.success, tostring(result.error))
                test.eq(pending_reap(cid), 0)
            end
        end)

        test.it("releases and reaps cleanly when purge succeeds", function()
            local cid = register("thread-clean")
            set_fail(cid, 0)
            local ok, err = component.system_delete(cid)
            test.is_true(ok)
            test.is_nil(err)
            test.eq(purge_calls(cid), 1)
            test.is_false(exists(cid))
            test.eq(pending_reap(cid), 0)
        end)

        test.it("a failed reap does not block a later retry pointer in the same batch", function()
            local blocked_id = register("thread-blocked")
            local recovered_id = register("thread-recovered")
            set_fail(blocked_id, 1)
            set_fail(recovered_id, 1)
            test.is_true(select(1, component.system_delete(blocked_id)))
            test.is_true(select(1, component.system_delete(recovered_id)))
            test.eq(pending_reap(blocked_id), 1)
            test.eq(pending_reap(recovered_id), 1)

            set_fail(recovered_id, 0)
            local result, call_err = funcs.new():call("kickside.component:retention", {})
            test.is_nil(call_err, tostring(call_err))
            test.is_false(result.success)
            test.eq(pending_reap(blocked_id), 1)
            test.eq(pending_reap(recovered_id), 0)

            set_fail(blocked_id, 0)
            result, call_err = funcs.new():call("kickside.component:retention", {})
            test.is_nil(call_err, tostring(call_err))
            test.is_true(result.success, tostring(result.error))
            test.eq(pending_reap(blocked_id), 0)
        end)

        test.it("keeps the retry pointer when purge returns no deletion proof", function()
            local cid = register("thread-no-proof")
            set_fail(cid, 2)
            local ok, err = component.system_delete(cid)
            test.is_true(ok)
            test.not_nil(err)
            test.is_false(exists(cid))
            test.eq(pending_reap(cid), 1)
            set_fail(cid, 0)
            local result, call_err = funcs.new():call("kickside.component:retention", {})
            test.is_nil(call_err, tostring(call_err))
            test.is_true(result.success, tostring(result.error))
            test.eq(pending_reap(cid), 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
