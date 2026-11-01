-- component.fence: a consumer's write to a component's backing data lands only
-- while the component exists and is not being deleted. Once a delete passes its
-- preflight, the fence refuses every write, including one that lands while the
-- kind's deletable cleanup runs; a cleanup that fails lets the component live on.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local contract = require("contract")
local component = require("component")
local teardown = require("teardown")
local funcs = require("funcs")

local DB = "app:db"
local COMPONENT_SERVICE = "kickside.component:component_service"
local PLAIN_IMPL = "app:deletable_ok_binding"
local FENCED_IMPL = "app:deletable_fenced_binding"
local FAILING_IMPL = "app:deletable_failing_binding"
local PAGED_IMPL = "app:deletable_paged_binding"

local function define_tests()
    test.describe("component fence", function()
        local owner_id = "fence-owner-" .. uuid.v4():sub(1, 8)

        local function service()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            local actor = security.new_actor(owner_id, { security_groups = {} })
            local svc, gerr = contract.get(COMPONENT_SERVICE)
            if gerr or not svc then error("component_service unavailable: " .. tostring(gerr)) end
            local inst, oerr = svc:with_actor(actor):with_scope(security.new_scope({ pol })):open()
            if oerr or not inst then error("open component_service failed: " .. tostring(oerr)) end
            return inst
        end

        local function register(impl: string): string
            local res, err = service():register({ impl_id = impl, meta = { label = "fence" } })
            if err or not res or not res.component_id then
                error("register failed: " .. tostring(err or (res and (res :: any).error)))
            end
            return tostring(res.component_id)
        end

        -- The fence's answer inside a transaction on db_id.
        local function fence(component_id: string, db_id: string?): error?
            local db, err = sql.get(DB)
            if err or not db then error("db connect failed: " .. tostring(err)) end
            local tx = db:begin()
            local fence_err = component.fence(tx, component_id, db_id or DB)
            tx:rollback()
            db:release()
            return fence_err
        end

        local function exists(cid: string): boolean
            local db, err = sql.get(DB)
            if err or not db then error("db connect failed: " .. tostring(err)) end
            local rows = sql.builder.select("component_id"):from("kickside_components")
                :where("component_id = ?", cid):run_with(db):query()
            db:release()
            return rows ~= nil and #rows > 0
        end

        test.it("admits a write to a live component", function()
            test.is_nil(fence(register(PLAIN_IMPL)))
        end)

        test.it("refuses a write to a component that does not exist as NOT_FOUND", function()
            local missing_id = uuid.v7()
            local err = fence(missing_id)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.NOT_FOUND), tostring(err))
        end)

        test.it("refuses a transaction on another database than the component's", function()
            local err = fence(register(PLAIN_IMPL), "app:other_db")
            test.not_nil(err)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
        end)

        test.it("refuses a write that lands while the deletable cleanup runs, then after the delete", function()
            local cid = register(FENCED_IMPL)
            local res, err = service():delete({ component_id = cid })
            test.is_nil(err)
            test.is_true((res :: any).success == true, tostring((res :: any).error))
            test.is_false(exists(cid))
            test.is_true(errors.is(fence(cid), errors.NOT_FOUND))
        end)

        test.it("refuses it on the trusted system delete as well", function()
            local cid = register(FENCED_IMPL)
            local ok, err = component.system_delete(cid, nil)
            test.is_nil(err)
            test.is_true(ok)
            test.is_false(exists(cid))
        end)

        test.it("keeps retention from entering cleanup while the request holds its lease", function()
            local cid = register("app:deletable_retention_binding")
            local result, err = service():delete({ component_id = cid })
            test.is_nil(err, tostring(err))
            test.is_true(result.success, tostring(result.error))
            test.is_true(result.deleted)
            test.is_false(exists(cid))
            test.is_true(errors.is(fence(cid), errors.NOT_FOUND))
        end)

        local function stored(cid: string): any
            local db = assert(sql.get(DB))
            local rows, err = db:query("SELECT deleting_at,lease_token,lease_until FROM kickside_components WHERE component_id=$1", {cid})
            db:release()
            if err then error(tostring(err)) end
            return rows[1]
        end

        local function expire(cid: string)
            local db = assert(sql.get(DB))
            local _, err = db:execute("UPDATE kickside_components SET lease_until='2000-01-01T00:00:00Z' WHERE component_id=$1", {cid})
            db:release()
            test.is_nil(err, tostring(err))
        end

        test.it("returns in_progress to a competing request and skips its live lease in retention", function()
            local cid = register(PLAIN_IMPL)
            local ok, step, err, owns, token = teardown.begin_delete(cid)
            test.is_true(ok, tostring(step) .. ": " .. tostring(err))
            test.is_true(owns)
            test.not_nil(token)
            local original = stored(cid)
            test.eq(original.lease_token, token)
            test.not_nil(original.lease_until)
            local response, call_err = service():delete({component_id = cid})
            test.is_nil(call_err)
            test.is_true(response.success, tostring(response.error))
            test.is_true(response.in_progress)
            test.is_false(response.deleted)
            local busy, busy_step, busy_err = teardown.begin_delete(cid)
            test.is_false(busy)
            test.eq(busy_step, "busy")
            test.is_nil(busy_err)
            local result, sweep_err = funcs.call("kickside.component:retention", {
                change = {kind = "pin_advanced", owner_locator = {kind = "component", id = cid}},
            })
            test.is_nil(sweep_err)
            test.is_true(result.success, tostring(result.error))
            test.eq(result.deleted, 0)
            test.is_false(result.needs_continue)
            test.eq(stored(cid).lease_token, token)
            local deleted, delete_step, delete_err = teardown.unregister(cid, nil, token)
            test.is_nil(delete_step, tostring(delete_err))
            test.is_true(deleted.deleted)
        end)

        test.it("reclaims an expired lease and fences the stale owner's unregister and abandon", function()
            local cid = register(PLAIN_IMPL)
            local _, _, _, _, stale = teardown.begin_delete(cid)
            local marked = stored(cid).deleting_at
            expire(cid)
            local ok, step, err, owns, token = teardown.begin_delete(cid)
            test.is_true(ok, tostring(step) .. ": " .. tostring(err))
            test.is_false(owns)
            test.is_true(token ~= stale)
            test.eq(stored(cid).deleting_at, marked)
            local deleted, delete_step, delete_err = teardown.unregister(cid, nil, stale :: string)
            test.is_nil(deleted)
            test.eq(delete_step, "delete")
            test.is_true(errors.is(delete_err, errors.CONFLICT))
            test.eq(delete_err:details().code, "LEASE_LOST")
            local abandon_err = teardown.abandon_delete(cid, stale :: string)
            test.is_true(errors.is(abandon_err, errors.CONFLICT))
            test.eq(abandon_err:details().code, "LEASE_LOST")
            local release_err = teardown.release_delete(cid, stale :: string)
            test.is_true(errors.is(release_err, errors.CONFLICT))
            test.eq(release_err:details().code, "LEASE_LOST")
            test.eq(stored(cid).lease_token, token)
            test.eq(stored(cid).deleting_at, marked)
            test.is_nil(teardown.abandon_delete(cid, token))
            local row = stored(cid)
            test.is_nil(row.deleting_at)
            test.is_nil(row.lease_token)
            test.is_nil(row.lease_until)
            test.is_nil(fence(cid))
            local deleted, delete_err = component.system_delete(cid)
            test.is_true(deleted)
            test.is_nil(delete_err)
        end)

        test.it("refuses unregister before the delete fence commits", function()
            local cid = register(PLAIN_IMPL)
            local result, step, err = teardown.unregister(cid, nil, "unclaimed")
            test.is_nil(result)
            test.eq(step, "delete")
            test.is_true(errors.is(err, errors.CONFLICT), tostring(err))
            test.is_true(exists(cid))
            test.is_nil(fence(cid))
        end)

        test.it("admits writes again when the cleanup fails and the component lives on", function()
            local cid = register(FAILING_IMPL)
            local res, err = service():delete({ component_id = cid })
            test.is_nil(err)
            test.is_false((res :: any).success == true)
            test.is_true(exists(cid))
            test.is_nil(fence(cid))
        end)

        for _, path in ipairs({ "gated", "system" }) do
            test.it("retains the inherited fence after a failed cleanup retry on " .. path .. " delete", function()
                local cid = register(FAILING_IMPL)
                local ok, failure = pcall(function()
                    local marked, step, mark_err, owns_fence = teardown.begin_delete(cid, nil, nil)
                    test.is_true(marked, tostring(step) .. ": " .. tostring(mark_err))
                    test.is_true(owns_fence)
                    expire(cid)
                    local db, open_err = sql.get(DB)
                    test.is_nil(open_err, tostring(open_err))
                    db = assert(db)
                    local before, before_err = db:query("SELECT deleting_at FROM kickside_components WHERE component_id=$1", { cid })
                    db:release()
                    test.is_nil(before_err, tostring(before_err))
                    test.not_nil(before[1].deleting_at)
                    local retry_err: any = nil
                    if path == "gated" then
                        local result, call_err = service():delete({ component_id = cid })
                        test.is_nil(call_err, tostring(call_err))
                        test.is_true(result.success, tostring(result.error))
                        test.is_true(result.cleanup_pending)
                        test.is_true(result.in_progress)
                        test.is_false(result.deleted)
                        retry_err = result.details
                    else
                        local deleted, err = component.system_delete(cid)
                        test.is_false(deleted)
                        test.is_true(teardown.cleanup_pending(err), tostring(err))
                        test.is_true(errors.is(err, errors.CONFLICT), tostring(err))
                        retry_err = err:details()
                    end
                    test.eq(retry_err.wait_for, "cleanup_retry")
                    test.not_nil(retry_err.cause)
                    db, open_err = sql.get(DB)
                    test.is_nil(open_err, tostring(open_err))
                    db = assert(db)
                    local after, after_err = db:query("SELECT deleting_at FROM kickside_components WHERE component_id=$1", { cid })
                    db:release()
                    test.is_nil(after_err, tostring(after_err))
                    test.eq(after[1].deleting_at, before[1].deleting_at)
                    test.is_true(errors.is(fence(cid), errors.NOT_FOUND))
                    test.is_true(exists(cid))
                end)
                local cleanup_db, cleanup_open_err = sql.get(DB)
                test.is_nil(cleanup_open_err, tostring(cleanup_open_err))
                cleanup_db = assert(cleanup_db)
                local _, cleanup_update_err = cleanup_db:execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2", { PLAIN_IMPL, cid })
                cleanup_db:release()
                test.is_nil(cleanup_update_err, tostring(cleanup_update_err))
                local _, cleanup_err = component.system_delete(cid)
                test.is_nil(cleanup_err, tostring(cleanup_err))
                if not ok then error(failure) end
            end)
        end

        test.it("resumes a legacy delete mark without a lease on the existing retention slot", function()
            local cid = register(PLAIN_IMPL)
            local marked, step, mark_err = teardown.begin_delete(cid, nil, nil)
            test.is_true(marked, tostring(step) .. ": " .. tostring(mark_err))
            local db = assert(sql.get(DB))
            local _, legacy_err = db:execute("UPDATE kickside_components SET lease_token=NULL,lease_until=NULL WHERE component_id=$1", {cid})
            db:release()
            test.is_nil(legacy_err)
            test.is_true(errors.is(fence(cid), errors.NOT_FOUND))
            local result, call_err = funcs.new():call("kickside.component:retention", {})
            local remained = exists(cid)
            if remained then component.system_delete(cid) end
            test.is_nil(call_err, tostring(call_err))
            test.is_true(result.success, tostring(result.error))
            test.is_false(remained, "retention must resume a fenced delete after a crash")
        end)

        test.it("resumes the released owner beyond the first pending-delete page", function()
            local ids: { string } = {}
            for _ = 1, 51 do
                local id = register(PLAIN_IMPL)
                ids[#ids + 1] = id
                local marked, step, err = teardown.begin_delete(id, nil, nil)
                test.is_true(marked, tostring(step) .. ": " .. tostring(err))
                expire(id)
            end
            local ok, failure = pcall(function()
                local result, err = funcs.new():call("kickside.component:retention", {
                    change = { kind = "lease_released", owner_locator = { kind = "automation", id = ids[51] } } })
                test.is_nil(err, tostring(err))
                test.is_true(result.success, tostring(result.error))
                test.eq(result.deleted, 1)
                test.is_false(result.needs_continue)
                test.is_false(exists(ids[51]))
                test.is_true(exists(ids[1]), "a directed wake must not consume another owner's page")
            end)
            funcs.new():call("kickside.component:retention", {})
            if not ok then error(failure) end
        end)

        for _, mode in ipairs({ "destination_retirement", "other_operation", "eligibility", "lease_release", "unclassified" }) do
            test.it("keeps non-progress cleanup blocked without continuation: " .. mode, function()
                local result, create_err = service():register({ impl_id = "app:deletable_blocked_binding",
                    private_context = { blocker = mode } })
                test.is_nil(create_err, tostring(create_err))
                local cid = tostring(result.component_id)
                local ok, failure = pcall(function()
                    local deleted, delete_err = service():delete({ component_id = cid })
                    test.is_nil(delete_err, tostring(delete_err))
                    test.is_true(deleted.cleanup_pending)
                    for _ = 1, 2 do
                        local pass, pass_err = funcs.new():call("kickside.component:retention", {
                            change = { kind = "blocked_cleanup", owner_locator = { kind = "component", id = cid } } })
                        test.is_nil(pass_err, tostring(pass_err))
                        test.is_true(pass.success, tostring(pass.error))
                        test.eq(pass.deleted, 0)
                        test.is_true(exists(cid))
                        test.is_false(pass.needs_continue, "unchanged blocked work requests immediate continuation")
                        test.eq(#pass.blocked, 1)
                        test.eq(pass.blocked[1].component_id, cid)
                        test.is_true(errors.is(pass.blocked[1].error, errors.CONFLICT))
                        local details = pass.blocked[1].error:details()
                        test.is_true(details.cleanup_pending)
                    end
                end)
                local db, open_err = sql.get(DB)
                test.is_nil(open_err, tostring(open_err))
                db = assert(db)
                local _, update_err = db:execute("UPDATE kickside_components SET impl_id=$1 WHERE component_id=$2", { PLAIN_IMPL, cid })
                db:release()
                test.is_nil(update_err, tostring(update_err))
                local _, cleanup_err = component.system_delete(cid)
                test.is_nil(cleanup_err, tostring(cleanup_err))
                if not ok then error(failure) end
            end)
        end

        test.it("keeps the fence until a paged kind cleanup finishes after retry", function()
            local cid = register(PAGED_IMPL)
            local db, open_err = sql.get(DB)
            test.is_nil(open_err, tostring(open_err))
            db = assert(db)
            local _, create_err = db:execute([[CREATE TABLE IF NOT EXISTS paged_cleanup_rows
                (component_id TEXT NOT NULL, row_id INTEGER NOT NULL, PRIMARY KEY(component_id,row_id))]])
            test.is_nil(create_err, tostring(create_err))
            for i = 1, 3 do
                local _, insert_err = db:execute(
                    "INSERT INTO paged_cleanup_rows(component_id,row_id) VALUES ($1,$2)", { cid, i })
                test.is_nil(insert_err, tostring(insert_err))
            end
            db:release()
            local first, delete_err = service():delete({ component_id = cid })
            local interim_fence = fence(cid)
            local row = stored(cid)
            test.not_nil(row.deleting_at)
            test.is_nil(row.lease_token)
            test.is_nil(row.lease_until)
            local retried, retry_err = funcs.new():call("kickside.component:retention", {})
            db, open_err = sql.get(DB)
            test.is_nil(open_err, tostring(open_err))
            db = assert(db)
            local remaining, read_err = db:query(
                "SELECT row_id FROM paged_cleanup_rows WHERE component_id=$1", { cid })
            db:release()
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true(first.success, tostring(first.error))
            test.is_true(first.in_progress)
            test.eq(first.status, "in_progress")
            test.is_false(first.deleted)
            test.is_true(first.cleanup_pending)
            test.is_true(errors.is(interim_fence, errors.NOT_FOUND), tostring(interim_fence))
            test.is_nil(retry_err, tostring(retry_err))
            test.is_true(retried.success, tostring(retried.error))
            test.is_nil(read_err, tostring(read_err))
            test.eq(#remaining, 0)
            test.is_false(exists(cid))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
